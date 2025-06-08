import { Request, Response } from 'express';

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { z } from 'zod';
import logger from 'electron-log';

import { User } from '../model/user';


const myMcpServer = new McpServer({
  name: 'my-mcp-server',
  version: '1.0.0',
});

myMcpServer.tool(
  'queryUserById',
  '通过ID查询用户信息',
  { id: z.string().describe('用户ID') },
  async ({ id }) => {
    const user = await User.findByPk(id);
    if (!user) {
      return {
        content: [{ type: 'text', text: '用户不存在' }],
        isError: true,
      };
    }
    return {
      content: [{ type: 'text', text: JSON.stringify(user) }],
    };
  }
);

// Map to store transports by session ID
const transports: { [sessionId: string]: SSEServerTransport } = {};

/**
 * 供agent来测试MCP服务
 */
export const mcpServer = async (req: Request, res: Response) => {
  logger.info('MCP server ready');

  const transport = new SSEServerTransport('/mcpServer', res);
  transports[transport.sessionId] = transport;
  
  res.on('close', () => {
    delete transports[transport.sessionId];
  });
  
  await myMcpServer.connect(transport);
};


/**
 * 供agent来调用MCP服务
 */
export const mcpServerPost = async (req: Request, res: Response) => {
  const sessionId = req.query.sessionId as string;
  const transport = transports[sessionId];
  if (transport) {
    await transport.handlePostMessage(req, res, req.body);
  } else {
    res.status(400).send('No transport found for sessionId');
  }
};