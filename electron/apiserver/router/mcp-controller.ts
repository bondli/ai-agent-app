import { Request, Response } from 'express';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import logger from 'electron-log';

import myMcpServer from '../service/mcp-server';

// Map to store transports by session ID
const transports: { [sessionId: string]: SSEServerTransport } = {};

/**
 * 供agent来测试MCP服务
 */
export const mcpServer = async (req: Request, res: Response) => {
  logger.info('[mcp-server] MCP server ready');
  const transport = new SSEServerTransport('/mcpMessage', res);
  transports[transport.sessionId] = transport;
  
  res.on('close', () => {
    delete transports[transport.sessionId];
  });
  
  await myMcpServer.connect(transport);
};

/**
 * 供agent来调用MCP服务
 */
export const mcpMessage = async (req: Request, res: Response) => {
  logger.info('[mcp-server] MCP server message');
  const sessionId = req.query.sessionId as string;
  const transport = transports[sessionId];
  if (transport) {
    await transport.handlePostMessage(req, res, req.body);
  } else {
    res.status(400).send('No transport found for sessionId');
  }
};