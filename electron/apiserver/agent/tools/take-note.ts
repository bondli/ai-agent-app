import { StructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import logger from 'electron-log';
import { Sequelize } from 'sequelize';

import { Topic } from '../../model/topic';
import { Cate } from '../../model/cate';

class TakeNoteTool extends StructuredTool {
  name = 'takeNote';
  description = '创建备忘，记录备忘，设置备忘';
  schema = z.object({
    title: z.string().describe('备忘标题'),
    desc: z.string().describe('备忘内容'),
  });

  protected async _call(input: { title: string; desc: string }) {
    const { title, desc } = input;
    logger.info('[TakeNoteTool] title:', title);
    logger.info('[TakeNoteTool] desc:', desc);

    // 通过“日常备忘”这个分类名称，获取分类ID
    const cateQueryResult = await Cate.findOne({
      where: {
        name: '日常备忘',
      },
    });
    if (!cateQueryResult) {
      logger.error('[TakeNoteTool] 分类“日常备忘”不存在');
      return '备忘创建失败，分类“日常备忘”不存在';
    }
    const cateId = cateQueryResult?.toJSON()?.id;
    const todo = await Topic.create({
      title,
      desc,
      cateId, 
      tags: '',
      priority: 2,
      userId: 1,
    });
    
    if (!todo) {
      return '备忘创建失败，服务端异常';
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

    logger.info('[TakeNoteTool] 备忘创建成功', JSON.stringify(todo.toJSON()));
    return `备忘创建成功，内容为：${JSON.stringify(todo.toJSON())}`;
  }
}

const takeNote = new TakeNoteTool();

export default takeNote;