import { Request, Response } from 'express';

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { z } from 'zod';
import logger from 'electron-log';
import * as chrono from 'chrono-node';

import { User } from '../model/user';
import { Topic } from '../model/topic';

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

myMcpServer.tool(
  'createTodo',
  '创建一个提醒事件',
  {
    title: z.string().describe('事件标题'),
    desc: z.string().describe('事件描述'),
    deadline: z.union([z.string(), z.date()]).describe('事件截止时间'),
  },
  async ({ title, desc, deadline }) => {
    let parsedDeadline = deadline;
    if (typeof deadline === 'string') {
      const results = chrono.zh.parse(deadline);
      if (results.length > 0) {
        parsedDeadline = results[0].start.date();
      } else {
        parsedDeadline = new Date();
      }
    }
    logger.info('parsedDeadline', parsedDeadline);
    logger.info('title', title);
    logger.info('desc', desc);
    const todo = await Topic.create({
      title,
      desc,
      cateId: 24, // 默认分类ID,这个对应的名称是提醒事件
      tags: '',
      deadline: parsedDeadline,
      priority: 2,
      userId: 1,
    });
    if (!todo) {
      return {
        content: [{ type: 'text', text: '事件创建失败' }],
        isError: true,
      };
    }
    return {
      content: [{ type: 'text', text: JSON.stringify(todo) }],
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