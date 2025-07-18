import { Request, Response } from 'express';

import { agentExecutor, streamAgentResponse } from '../agent/index';

export const agentChat = async (req: Request, res: Response) => {
  const currentUserId = req.headers['x-user-id'] as string;
  const { input, options } = req.body;

  if (!input) {
    return res.status(400).json({ error: 'Message is required' });
  }
  // 设置响应头
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const executor = await agentExecutor();
 
  options.currentUserId = currentUserId; // 设置当前用户ID
  await streamAgentResponse(executor, input, options, (token) => {
    const message = {
      text: token,
      timestamp: new Date().toISOString(),
      type: 'text',
    };
    res.write(`data: ${JSON.stringify(message)}\n\n`); // SSE 格式
  });

  res.end(); // 关闭连接
};