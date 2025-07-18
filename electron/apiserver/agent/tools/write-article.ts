import { StructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import logger from 'electron-log';
import { Sequelize } from 'sequelize';

import { Topic } from '../../model/topic';
import { Cate } from '../../model/cate';

class WriteArticleTool extends StructuredTool {
  name = 'writeArticle';
  description = '创建文章/笔记';
  schema = z.object({
    title: z.string().describe('标题'),
    url: z.string().describe('链接'),
    desc: z.string().describe('内容'),
    cate: z.string().describe('分类'),
  });

  protected async _call(input: { title: string; desc: string, url: string, cate: string }) {
    const { title, desc, url, cate } = input;
    logger.info('[WriteArticleTool] title:', title);
    logger.info('[WriteArticleTool] url:', url);
    logger.info('[WriteArticleTool] desc:', desc);
    logger.info('[WriteArticleTool] cate:', cate);

    // 通过传入的分类名称，获取分类ID
    const cateQueryResult = await Cate.findOne({
      where: {
        name: cate,
      },
    });
    if (!cateQueryResult) {
      logger.error('[WriteArticleTool] 分类“' + cate + '”不存在');
      return '分类“' + cate + '”不存在';
    }
    const cateId = cateQueryResult?.toJSON()?.id;
    const article = await Topic.create({
      title,
      desc: `内容来源：${url}<br>${desc}`,
      cateId,
      tags: '',
      priority: 2,
      userId: 1,
    });
    if (!article) {
      logger.error('[WriteArticleTool] 文章创建失败');
      return '文章创建失败';
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
    logger.info('[WriteArticleTool] 文章创建成功', JSON.stringify(article.toJSON()));
    return `文章创建成功，内容为：${JSON.stringify(article.toJSON())}`;
  }
}

const writeArticle = new WriteArticleTool();

export default writeArticle;