import 'dotenv/config';
import logger from 'electron-log';
import { VoltAgent, Agent, VoltAgentExporter } from '@voltagent/core';
import { XSAIProvider } from '@voltagent/xsai';

import mcpConfig from './mcp';
import { calculatorTool, weatherTool, loggerTool } from './tools';
// import KnowledgeBaseRetriever from './rag';
import myAgentHooks from './hooks';
import memoryStorage from './memory';
import basicPrompt from './prompt';

// 本地模型
const localProvider = new XSAIProvider({
  apiKey: process.env.MODEL_API_KEY || 'ollama',
  baseURL: process.env.MODEL_BASE_URL,
});

// 云端遥测
const telemetryExporter = new VoltAgentExporter({
  publicKey: 'pk_96746bff74a2748e1f17a11d9f20473e',
  secretKey: 'sk_live_5a51ebabdf6732e5e0919382cf83d238b966800dcc9691a1fbab9c1e0c6ebf36',
  baseUrl: 'https://api.voltagent.dev',
});

(async () => {
  try {
    const allTools = await mcpConfig.getTools();

    const agent = new Agent({
      name: 'my-agent',
      instructions: basicPrompt(),
      // retriever: new KnowledgeBaseRetriever(),
      llm: localProvider,
      model: process.env.MODEL_NAME || 'qwen3:4b',
      markdown: true,
      hooks: myAgentHooks,
      tools: [calculatorTool, weatherTool, loggerTool, ...allTools],
      memory: memoryStorage, // 记忆自定义，这个不改将会导致electron打包之后会无法写入，从而无法启动服务
      parameters: {
        temperature: 0.7, // 稍微提高温度以获得更快的响应
        maxTokens: 2000, // 减少最大token数量以提高响应速度
        topP: 0.9, // 调整topP以平衡质量和速度
      },
    });

    new VoltAgent({
      agents: {
        agent,
      },
      telemetryExporter,
    });

    if (typeof process.send === 'function') {
      logger.info('[AI Agent Server] server is running on port 3141');
      process.send('server is ready');
    }

  } catch (error) {
    logger.error('[AI Agent Server] AI Agent Server start failed');
    logger.error('[AI Agent Server] error detail:', error);

    // 向父进程发送错误信息
    if (typeof process.send === 'function') {
      process.send(`[AI Agent Server] error: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
    
    process.exit(1);
  }
})();