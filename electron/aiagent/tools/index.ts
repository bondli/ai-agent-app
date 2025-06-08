import { createTool } from '@voltagent/core';
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
      logger.info('calculatorTool result: ', result);
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

    // In a real implementation, you would call a weather API
    // This is a simplified example
    logger.info('weatherTool args: ', args);
    return {
      location,
      temperature: 22,
      conditions: 'sunny',
    };
  },
} as any);

export default {
  calculatorTool,
  weatherTool,
};
