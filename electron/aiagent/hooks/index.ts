import {
  createHooks,
  type OnStartHookArgs, // Argument types for hooks
  type OnEndHookArgs,
  type OnToolStartHookArgs,
  type OnToolEndHookArgs,
  type OnHandoffHookArgs,
} from '@voltagent/core';

import logger from 'electron-log';

// Define a collection of hooks using the helper
const myAgentHooks = createHooks({
  /**
   * Called before the agent starts processing a request.
   */
  onStart: async (args: OnStartHookArgs) => {
    const { agent, context } = args;
    logger.info(`[Hook] Agent ${agent.name} starting interaction at ${new Date().toISOString()}`);
    logger.info(`[Hook] Operation ID: ${context.operationId}`);
  },

  /**
   * Called after the agent finishes processing a request, successfully or with an error.
   */
  onEnd: async (args: OnEndHookArgs) => {
    const { agent, output, error } = args;
    if (error) {
      logger.error(`[Hook] Agent ${agent.name} finished with error:`, error.message);
      // Log detailed error info
      logger.error(`[Hook] Error Details:`, JSON.stringify(error, null, 2));
    } else if (output) {
      logger.info(`[Hook] Agent ${agent.name} finished successfully.`);
      // Example: Log usage or analyze the result based on output type
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
    logger.info(`[Hook] Agent ${agent.name} starting tool: ${tool.name}`);
    // Example: Validate tool inputs or log intent
  },

  /**
   * Called after a tool's execute function completes or throws.
   */
  onToolEnd: async (args: OnToolEndHookArgs) => {
    const { agent, tool, output, error, context } = args;
    if (error) {
      logger.error(`[Hook] Tool ${tool.name} failed with error:`, error.message);
      // Log detailed tool error
      logger.error(`[Hook] Tool Error Details:`, JSON.stringify(error, null, 2));
    } else {
      logger.info(`[Hook] Tool ${tool.name} completed successfully with result:`, output);
      // Example: Log tool output or trigger follow-up actions
    }
  },

  /**
   * Called when a task is handed off from a source agent to this agent (in sub-agent scenarios).
   */
  onHandoff: async (args: OnHandoffHookArgs) => {
    const { agent } = args;
    logger.info(`[Hook] Task handed off to ${agent.name}`);
  },
});

export default myAgentHooks;