import { Sequelize } from 'sequelize';

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import logger from 'electron-log';
import * as chrono from 'chrono-node';

import { Topic } from '../model/topic';
import { Cate } from '../model/cate';

const myMcpServer = new McpServer({
  name: 'note-mcp',
  version: '1.0.0',
});

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
    logger.info('[mcp-server] parsedDeadline', parsedDeadline);
    logger.info('[mcp-server] title', title);
    logger.info('[mcp-server] desc', desc);
    // 通过“提醒事件”这个分类名称，获取分类ID
    const cateQueryResult = await Cate.findOne({
      where: {
        name: '提醒事件',
      },
    });
    if (!cateQueryResult) {
      logger.error('[mcp-server] 分类“提醒事件”不存在');
      return {
        content: [{ type: 'text', text: '分类“提醒事件”不存在' }],
        isError: true,
      };
    }
    const cateId = cateQueryResult?.toJSON()?.id;
    const todo = await Topic.create({
      title,
      desc,
      cateId, 
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
    // 在对应的分类下更新数量字段
    const CateResult = await Cate.findByPk(Number(cateId));
    CateResult && CateResult.update({
      counts: Sequelize.literal('counts + 1'),
    }, {
      where: {
        id: Number(cateId),
      },
    });

    logger.info('[mcp-server] 提醒事件创建成功', JSON.stringify(todo.toJSON()));
    return {
      content: [{ type: 'text', text: JSON.stringify(todo.toJSON()) }],
    };
  }
);

myMcpServer.tool(
  'writeArticle',
  '创建一篇文章/日志/笔记',
  {
    title: z.string().describe('标题'),
    url: z.string().describe('链接'),
    desc: z.string().describe('内容'),
    cate: z.string().describe('分类'),
  },
  async ({ title, url, desc, cate }) => {
    logger.info('[mcp-server] title', title);
    logger.info('[mcp-server] url', url);
    logger.info('[mcp-server] desc', desc);
    logger.info('[mcp-server] cate', cate);
    // 通过传入的分类名称，获取分类ID
    const cateQueryResult = await Cate.findOne({
      where: {
        name: cate,
      },
    });
    if (!cateQueryResult) {
      logger.error('[mcp-server] 分类“' + cate + '”不存在');
      return {
        content: [{ type: 'text', text: '分类“' + cate + '”不存在' }],
        isError: true,
      };
    }
    const cateId = cateQueryResult?.toJSON()?.id;
    const article = await Topic.create({
      title,
      desc: `文章来源：${url}<br>${desc}`,
      cateId,
      tags: '',
      priority: 2,
      userId: 1,
      sourceUrl: url,
    });
    if (!article) {
      logger.error('[mcp-server] 文章创建失败');
      return {
        content: [{ type: 'text', text: '文章创建失败' }],
        isError: true,
      };
    }
    // 在对应的分类下更新数量字段
    const CateResult = await Cate.findByPk(Number(cateId));
    CateResult && CateResult.update({
      counts: Sequelize.literal('counts + 1'),
    }, {
      where: {
        id: Number(cateId),
      },
    });
    logger.info('[mcp-server] 文章创建成功', JSON.stringify(article.toJSON()));
    return {
      content: [{ type: 'text', text: JSON.stringify(article.toJSON()) }],
    };
  }
);

export default myMcpServer;