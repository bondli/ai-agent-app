import { Request, Response } from 'express';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import logger from 'electron-log';

import noteMcpServer from '../service/note-mcp-server';
import fetchMcpServer from '../service/fetch-mcp-server';

// Map to store transports by session ID
const transports: { [sessionId: string]: SSEServerTransport } = {};

/**
 * 供agent来测试MCP服务
 */
export const noteMcp = async (req: Request, res: Response) => {
  logger.info('[mcp-server] Note MCP Server ready');
  const transport = new SSEServerTransport('/mcp/note-mcp', res);
  transports[transport.sessionId] = transport;
  
  res.on('close', () => {
    delete transports[transport.sessionId];
  });
  
  await noteMcpServer.connect(transport);
};

/**
 * 供agent来调用MCP服务
 */
export const noteMcpMessage = async (req: Request, res: Response) => {
  logger.info('[mcp-server] Note MCP Server message');
  const sessionId = req.query.sessionId as string;
  const transport = transports[sessionId];
  if (transport) {
    await transport.handlePostMessage(req, res, req.body);
  } else {
    res.status(400).send('No transport found for sessionId');
  }
};


/**
 * 供agent来测试MCP服务
 */
export const fetchMcp = async (req: Request, res: Response) => {
  logger.info('[mcp-server] Fetch MCP Server ready');
  const transport = new SSEServerTransport('/mcp/fetch-mcp', res);
  transports[transport.sessionId] = transport;
  
  res.on('close', () => {
    delete transports[transport.sessionId];
  });
  
  await fetchMcpServer.connect(transport);
};

/**
 * 供agent来调用MCP服务
 */
export const fetchMcpMessage = async (req: Request, res: Response) => {
  logger.info('[mcp-server] Fetch MCP Server message');
  const sessionId = req.query.sessionId as string;
  const transport = transports[sessionId];
  if (transport) {
    await transport.handlePostMessage(req, res, req.body);
  } else {
    res.status(400).send('No transport found for sessionId');
  }
};