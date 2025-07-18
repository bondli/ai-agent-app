import { StructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import logger from 'electron-log';
import * as chrono from 'chrono-node';
import { Sequelize } from 'sequelize';

import { Topic } from '../../model/topic';
import { Cate } from '../../model/cate';

class CreateTodoTool extends StructuredTool {
  name = 'createTodo';
  description = '创建提醒事件，设置提醒事件, 设置提醒事件';
  schema = z.object({
    title: z.string().describe('提醒事件标题'),
    desc: z.string().describe('提醒事件内容'),
    deadline: z.string().describe('提醒事件截止时间，支持自然语言描述如"明天下午3点"、"下周一"等'),
  });

  protected async _call(input: { title: string; desc: string; deadline: string }) {
    const { title, desc, deadline } = input;
    let parsedDeadline: Date;
    const results = chrono.zh.parse(deadline);
    if (results.length > 0) {
      parsedDeadline = results[0].start.date();
    } else {
      parsedDeadline = new Date();
    }
    logger.info('[CreateTodoTool] title:', title);
    logger.info('[CreateTodoTool] desc:', desc);
    logger.info('[CreateTodoTool] deadline:', deadline);

    // 通过“提醒事件”这个分类名称，获取分类ID
    const cateQueryResult = await Cate.findOne({
      where: {
        name: '提醒事件',
      },
    });
    if (!cateQueryResult) {
      logger.error('[CreateTodoTool] 分类“提醒事件”不存在');
      return '分类“提醒事件”不存在';
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
      return '提醒事件创建失败';
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

    logger.info('[CreateTodoTool] 提醒事件创建成功', JSON.stringify(todo.toJSON()));
    return `提醒事件创建成功，内容为：${JSON.stringify(todo.toJSON())}`;
  }
}

const createTodo = new CreateTodoTool();

export default createTodo;