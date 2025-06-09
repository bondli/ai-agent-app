import 'dotenv/config';
import logger from 'electron-log';
import { VoltAgent, Agent } from '@voltagent/core';
import { XSAIProvider } from '@voltagent/xsai';

import mcpConfig from './mcp';
import { calculatorTool, weatherTool, loggerTool } from './tools';
import KnowledgeBaseRetriever from './rag';
import myAgentHooks from './hooks';

// 本地模型
const localProvider = new XSAIProvider({
  apiKey: process.env.MODEL_API_KEY || 'ollama',
  baseURL: process.env.MODEL_BASE_URL,
});

(async () => {
  const allTools = await mcpConfig.getTools();

  // Agent实例
  const agent = new Agent({
    name: 'my-agent',
    instructions: '你是一个高效的助手，总是用中文做回答，只需直接给出简洁、明确的最终答案，不要输出任何推理过程、思维链、分析过程或解释。',
    llm: localProvider,
    model: process.env.MODEL_NAME || 'qwen3:0.6b',
    markdown: true,
    hooks: myAgentHooks,
    tools: [calculatorTool, weatherTool, loggerTool, ...allTools],
    retriever: new KnowledgeBaseRetriever(),
  });

  // 初始化
  new VoltAgent({
    agents: {
      agent,
    },
  });

  if (typeof process.send === 'function') {
    logger.info('AI Agent Server is running on port 3141');
    process.send('AI Agent Server Ready');
  }
})();