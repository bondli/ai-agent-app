import 'dotenv/config';
import logger from 'electron-log';
import { VoltAgent, Agent, VoltAgentExporter } from '@voltagent/core';
import { XSAIProvider } from '@voltagent/xsai';

import mcpConfig from './mcp';
import { calculatorTool, weatherTool, loggerTool } from './tools';
import KnowledgeBaseRetriever from './rag';
import myAgentHooks from './hooks';
import memoryStorage from './memory';

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
      instructions: '你是一个高效的助手，总是用中文做回答，只需直接给出简洁、明确的最终答案，不要输出任何推理过程、思维链、分析过程或解释。',
      llm: localProvider,
      model: process.env.MODEL_NAME || 'qwen3:0.6b',
      markdown: true,
      hooks: myAgentHooks,
      tools: [calculatorTool, weatherTool, loggerTool, ...allTools],
      retriever: new KnowledgeBaseRetriever(),
      memory: memoryStorage,
    });

    new VoltAgent({
      agents: {
        agent,
      },
      telemetryExporter,
    });

    if (typeof process.send === 'function') {
      logger.info('AI Agent Server is running on port 3141');
      process.send('AI Agent Server Ready');
    }

  } catch (error) {
    logger.error('=== AI Agent 启动失败 ===');
    logger.error('错误详情:', error);

    // 向父进程发送错误信息
    if (typeof process.send === 'function') {
      process.send(`AI Agent Server Error: ${error instanceof Error ? error.message : '未知错误'}`);
    }
    
    process.exit(1);
  }
})();