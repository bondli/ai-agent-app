import { Request, Response } from 'express';
import { Cate } from '../model/cate';

// 新增一个分类
export const createCate = async (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'];
  try {
    const { icon, name, orders } = req.body;
    const result = await Cate.create({ icon, name, orders, userId });
    res.status(200).json(result.toJSON());
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 查询一个分类详情
export const getCateInfo = async (req: Request, res: Response) => {
  try {
    const { id } = req.query;
    const result = await Cate.findByPk(Number(id));
    if (result) {
      res.json(result.toJSON());
    } else {
      res.json({ error: 'Cate not found' });
    }
  } catch (error) {
    console.error('Error getting cate by ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 查询所有分类
export const getCates = async (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'];
  try {
    const { count, rows } = await Cate.findAndCountAll({
      where: { userId },
      order: [
        ['orders', 'ASC'],
        ['createdAt', 'DESC'],
      ],
    });
    res.json({
      count: count || 0,
      data: rows || [],
    });
  } catch (error) {
    console.error('Error getting cates:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 更新分类
export const updateCate = async (req: Request, res: Response) => {
  try {
    const { id } = req.query;
    const { icon, name, orders } = req.body;
    const result = await Cate.findByPk(Number(id));
    if (result) {
      await result.update({ icon, name, orders });
      res.json(result.toJSON());
    } else {
      res.json({ error: 'cate not found' });
    }
  } catch (error) {
    console.error('Error updating cate:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 删除分类
export const deleteCate = async (req: Request, res: Response) => {
  try {
    const { id } = req.query;
    const result = await Cate.findByPk(Number(id));
    if (result) {
      await result.destroy();
      res.json({ message: 'cate deleted successfully' });
    } else {
      res.json({ error: 'cate not found' });
    }
  } catch (error) {
    console.error('Error deleting cate:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};