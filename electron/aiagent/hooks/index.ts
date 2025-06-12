import {
  createHooks,
  type OnStartHookArgs, // Argument types for hooks
  type OnEndHookArgs,
  type OnToolStartHookArgs,
  type OnToolEndHookArgs,
  type OnHandoffHookArgs,
} from '@voltagent/core';

import logger from 'electron-log';

const isDevelopment = process.env.NODE_ENV === 'development';

// Define a collection of hooks using the helper
const myAgentHooks = createHooks({
  /**
   * Called before the agent starts processing a request.
   */
  onStart: async (args: OnStartHookArgs) => {
    const { agent, context } = args;
    if (isDevelopment) {
      logger.info(`[Hook] Agent ${agent.name} starting interaction at ${new Date().toISOString()}`);
      logger.info(`[Hook] Operation ID: ${context.operationId}`);
    }
    context.userContext.set('requestId', `req-${Date.now()}`);
    context.userContext.set('startTime', Date.now()); // 添加性能监控
  },

  /**
   * Called after the agent finishes processing a request, successfully or with an error.
   */
  onEnd: async (args: OnEndHookArgs) => {
    const { agent, output, error, context } = args;
    const requestId = context.userContext.get('requestId');
    const startTime = context.userContext.get('startTime');
    const processingTime = startTime ? Date.now() - startTime : 0;
    
    // 性能监控 - 记录处理时间
    if (processingTime > 5000) { // 只记录超过5秒的请求
      logger.warn(`[Hook] Agent ${agent.name} slow processing: ${processingTime}ms. RequestID: ${requestId}`);
    }
    
    if (error) {
      logger.error(`[Hook] Agent ${agent.name} finished with error:`, error.message);
      // 只在开发环境记录详细错误信息
      if (isDevelopment) {
        logger.error(`[Hook] Error Details:`, JSON.stringify(error, null, 2));
      }
    } else if (output && isDevelopment) {
      logger.info(`[Hook] Agent ${agent.name} finished successfully in ${processingTime}ms.`);
      // 只在开发环境记录详细输出信息
      if ("usage" in output && output.usage) {
        logger.info(`[Hook] Token Usage: ${output.usage.totalTokens}`);
      }
      if ("text" in output && output.text) {
        logger.info(`[Hook] Final text length: ${output.text.length}`);
      }
      if ("object" in output && output.object) {
        logger.info(`[Hook] Final object keys: ${Object.keys(output.object).join(", ")}`);
      }
    }
  },

  /**
   * Called just before a tool's execute function is called.
   */
  onToolStart: async (args: OnToolStartHookArgs) => {
    const { agent, tool, context } = args;
    if (isDevelopment) {
      logger.info(`[Hook] Agent ${agent.name} starting tool: ${tool.name}`);
      logger.info(`[Hook] Tool ${tool.name} description: ${tool.description}`);
    }
    // 工具性能监控
    context.userContext.set(`tool_${tool.name}_start`, Date.now());
  },

  /**
   * Called after a tool's execute function completes or throws.
   */
  onToolEnd: async (args: OnToolEndHookArgs) => {
    const { agent, tool, output, error, context } = args;
    const toolStartTime = context.userContext.get(`tool_${tool.name}_start`);
    const toolProcessingTime = toolStartTime ? Date.now() - toolStartTime : 0;
    
    if (error) {
      logger.error(`[Hook] Tool ${tool.name} failed with error:`, error.message);
      // 只在开发环境记录详细工具错误
      if (isDevelopment) {
        logger.error(`[Hook] Tool Error Details:`, JSON.stringify(error, null, 2));
      }
    } else {
      // 记录工具执行时间，但减少详细输出
      if (toolProcessingTime > 1000) { // 只记录超过1秒的工具调用
        logger.warn(`[Hook] Tool ${tool.name} slow execution: ${toolProcessingTime}ms`);
      }
      if (isDevelopment) {
        logger.info(`[Hook] Tool ${tool.name} completed in ${toolProcessingTime}ms`);
      }
    }
  },

  /**
   * Called when a task is handed off from a source agent to this agent (in sub-agent scenarios).
   */
  onHandoff: async (args: OnHandoffHookArgs) => {
    const { agent } = args;
    if (isDevelopment) {
      logger.info(`[Hook] Task handed off to ${agent.name}`);
    }
  },
});

export default myAgentHooks;