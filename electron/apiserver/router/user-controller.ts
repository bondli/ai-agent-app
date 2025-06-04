import { Request, Response } from 'express';
import { User } from '../model/user';

// 新增一个用户
export const createUser = async (req: Request, res: Response) => {
  try {
    const { avatar, name, password, email } = req.body;
    const result = await User.findOne({
      where: {
        name,
      },
    });
    if (result === null) {
      const updateResult = await User.create({ avatar, name, password, email });
      res.status(200).json(updateResult.toJSON());
    } else {
      res.json({
        error: '用户名已存在',
        code: 1,
      });
    }
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 查询用户详情
export const getUserInfo = async (req: Request, res: Response) => {
  try {
    const { id } = req.query;
    const result = await User.findByPk(Number(id));
    if (result) {
      res.json(result.toJSON());
    } else {
      res.json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error getting User by ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 更新用户信息
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.query;
    const { avatar, name, password, email } = req.body;
    const result = await User.findByPk(Number(id));
    if (result) {
      await result.update({ avatar, name, password, email });
      res.json(result.toJSON());
    } else {
      res.json({ error: 'user not found' });
    }
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 用户登录
export const userLogin = async (req: Request, res: Response) => {
  try {
    const { name, password } = req.body;
    const result = await User.findOne({
      where: {
        name,
        password,
      },
    });
    if (result === null) {
      res.json({ error: 'user not found' });
    } else {
      res.json(result.toJSON());
    }
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};