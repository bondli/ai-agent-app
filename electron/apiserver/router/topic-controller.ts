import { Request, Response } from 'express';
import Sequelize, { Op } from 'sequelize';
import { Topic } from '../model/topic';
import { Cate } from '../model/cate';

// 新增一条代办topic
export const createTopic = async (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'];
  try {
    const { title, desc, cateId, tags, deadline, priority } = req.body;
    const result = await Topic.create({ title, desc, cateId, tags, deadline, priority, userId });
    if (result) {
      // 给对应的分类中增加代办记录数
      const CateResult = await Cate.findByPk(Number(cateId));
      CateResult && CateResult.update({
        counts: Sequelize.literal('counts + 1'),
      }, {
        where: {
          id: Number(cateId),
        },
      });
    }
    res.status(200).json(result.toJSON());
  } catch (error) {
    console.error('Error creating topic:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 查询一条代办详情
export const getTopicInfo = async (req: Request, res: Response) => {
  try {
    const { id } = req.query;
    const result = await Topic.findByPk(Number(id));
    if (result) {
      res.json(result.toJSON());
    } else {
      res.json({ error: 'Topic not found' });
    }
  } catch (error) {
    console.error('Error getting topic by ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 查询代办列表
export const getTopics = async (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'];
  try {
    const { cateId } = req.query;
    const where = {
      userId,
    };
    // 所有代办
    if (cateId === 'all') {
      where['status'] = 'undo';
    }
    // 所有已完成
    else if (cateId === 'done') {
      where['status'] = 'done';
    }
    // 今日到期
    else if (cateId === 'today') {
      const today = new Date();
      const todayAtMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
      where['deadline'] = {
        [Op.gte]: todayAtMidnight,
        [Op.lte]: endOfToday,
      };
      where['status'] = 'undo';
    }
    // 已删除
    else if (cateId === 'trash') {
      where['status'] = 'deleted';
    }
    // 正常查笔记本下的
    else {
      where['status'] = 'undo';
      where['cateId'] = cateId;
    }
    const { count, rows } = await Topic.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
    });
    res.json({
      count: count || 0,
      data: rows || [],
    });
  } catch (error) {
    console.error('Error getting topicList by cateId:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 更新一条代办
export const updateTopic = async (req: Request, res: Response) => {
  try {
    const { id, op } = req.query;
    const { title, desc, cateId, status, tags, priority, deadline } = req.body;
    const result = await Topic.findByPk(Number(id));
    if (result) {
      await result.update({ title, desc, cateId, status, tags, priority, deadline });
      // 针对不同的操作类型，需要更新笔记本中的数量字段
      if (op === 'done' || op === 'delete' || op === 'restore' || op === 'undo') {
        const operatorTopic = result.toJSON();
        let updateNumCommand = '';
        if (op === 'restore' || op === 'undo') {
          updateNumCommand = 'counts + 1';
        } else if (op === 'done' || op === 'delete') {
          updateNumCommand = 'counts - 1';
        }
        const CateResult = await Cate.findByPk(Number(operatorTopic.cateId));
        CateResult && CateResult.update({
          counts: Sequelize.literal(updateNumCommand),
        }, {
          where: {
            id: operatorTopic.cateId,
          },
        });
      }
      res.json(result.toJSON());
    } else {
      res.json({ error: 'topic not found' });
    }
  } catch (error) {
    console.error('Error updating topic:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 移动一个代办
export const moveTopic = async (req: Request, res: Response) => {
  try {
    const { id, status } = req.query;
    const { oldCateId, newCateId } = req.body;
    const result = await Topic.findByPk(Number(id));
    if (result) {
      await result.update({ cateId: Number(newCateId) });
      if (status === 'undo') {
        // 只针对当前的代办还没有完结的情况下
        // 给新的分类中增加代办记录数，给老的分类减少代办记录数
        const newCateResult = await Cate.findByPk(Number(newCateId));
        newCateResult && newCateResult.update({
          counts: Sequelize.literal('counts + 1'),
        }, {
          where: {
            id: Number(newCateId),
          },
        });
        const oldCateResult = await Cate.findByPk(Number(oldCateId));
        oldCateResult && oldCateResult.update({
          counts: Sequelize.literal('counts - 1'),
        }, {
          where: {
            id: Number(oldCateId),
          },
        });
      }
      res.json(result.toJSON());
    } else {
      res.json({ error: 'topic not found' });
    }
  }
  catch(error) {
    console.error('Error moving topic:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// 获取虚拟分类下的代办数量
export const getTopicCounts = async(req: Request, res: Response) => {
  const userId = req.headers['x-user-id'];
  try {
    const allTopicCount = await Topic.count({
      where: {
        userId,
        status: {
          [Op.eq]: 'undo'
        }
      },
    });
    const doneTopicCount = await Topic.count({
      where: {
        userId,
        status: {
          [Op.eq]: 'done'
        }
      },
    });
    const deletedTopicCount = await Topic.count({
      where: {
        userId,
        status: {
          [Op.eq]: 'deleted'
        }
      },
    });
    const today = new Date();
    const todayAtMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
    const todayDeadline = await Topic.count({
      where: {
        userId,
        status: {
          [Op.eq]: 'undo'
        },
        deadline: {
          [Op.gte]: todayAtMidnight,
          [Op.lte]: endOfToday,
        },
      }
    });
    res.json({
      all: allTopicCount || 0,
      today: todayDeadline || 0,
      done: doneTopicCount || 0,
      deleted: deletedTopicCount || 0,
    });
  } catch (error) {
    console.error('Error getting topicCounts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 搜素代办列表
export const searchTopics = async (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'];

  try {
    const { cateId } = req.query;
    const { searchKey } = req.body;

    let status: string = 'undo';
    let deadline: any = null;

    // 所有代办
    if (cateId === 'all') {
      status = 'undo';
    }
    // 所有已完成
    else if (cateId === 'done') {
      status = 'done';
    }
    // 今日到期
    else if (cateId === 'today') {
      const today = new Date();
      const todayAtMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
      deadline = {
        [Op.gte]: todayAtMidnight,
        [Op.lte]: endOfToday,
      };
    }
    // 已删除
    else if (cateId === 'trash') {
      status = 'deleted';
    }

    const commonCondition: any = [];
    commonCondition.push({
      userId,
    });
    commonCondition.push({
      status,
    });

    if (deadline) {
      commonCondition.push({
        deadline,
      });
    }

    let where: any = {
      [Op.and]: commonCondition,
    };

    if (searchKey) {
      where = {
        [Op.and]: commonCondition,
        [Op.or]: [
          {
            title: {
              [Op.like]: `%${searchKey}%`,
            }
          },
          {
            desc: {
              [Op.like]: `%${searchKey}%`,
            }
          }
        ]
      };
    }

    const { count, rows } = await Topic.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
    });
    res.json({
      count: count || 0,
      data: rows || [],
    });
  } catch (error) {
    console.error('Error search topicList by cateId:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 彻底删除一个代办
export const deletedFromTrash = async (req: Request, res: Response) => {
  try {
    const { id } = req.query;
    const result = await Topic.findByPk(Number(id));
    if (result) {
      await result.destroy();
      res.json(result.toJSON());
    } else {
      res.json({ error: 'topic not found' });
    }
  } catch (error) {
    console.error('Error deletedFromTrash:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}