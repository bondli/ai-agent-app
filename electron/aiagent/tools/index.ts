import { createTool, type ToolExecutionContext } from '@voltagent/core';
import logger from 'electron-log';
import { z } from 'zod';

// Calculator tool
export const calculatorTool = createTool({
  name: 'calculate',
  description: 'Perform a mathematical calculation',
  parameters: z.object({
    expression: z.string().describe('The mathematical expression to evaluate, e.g. (2 + 2) * 3'),
  }),
  execute: async (args: any) => {
    try {
      // In production, use a secure math parser instead of eval
      const result = eval(args.expression);
      logger.info('[tools]calculatorTool result: ', result);
      return { result };
    } catch (error) {
      throw new Error(`Invalid expression: ${args.expression}`);
    }
  },
} as any);

// Weather tool
export const weatherTool = createTool({
  name: 'get_weather',
  description: 'Get the current weather for a location',
  parameters: z.object({
    location: z.string().describe('The city name'),
  }),
  execute: async (args) => {
    // args is automatically typed as { location: string }
    const { location } = args;

    logger.info('[tools]weatherTool args: ', args);
    return {
      location,
      temperature: 22,
      conditions: 'sunny',
    };
  },
} as any);

export const loggerTool = createTool({
  name: 'context_aware_logger',
  description: 'Logs a message using the request ID from context.',
  parameters: z.object({ message: z.string() }),
  execute: async (params: { message: string }, options?: ToolExecutionContext) => {
    const requestId = options?.operationContext?.userContext?.get('requestId') || 'unknown';
    const logMessage = `[ReqID: ${requestId}] Tool Log: ${params.message}`;
    logger.info('[tools]logMessage: ', logMessage);
    return `Logged: ${params.message}`;
  },
} as any);

export default {
  calculatorTool,
  weatherTool,
  loggerTool,
};
