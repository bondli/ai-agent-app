import { DataTypes } from 'sequelize';
import { sequelize } from './index';

const Topic = sequelize.define('Topic', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  title: {
    comment: '笔记标题',
    type: DataTypes.STRING,
    allowNull: false,
  },
  desc: {
    comment: '笔记详情',
    type: DataTypes.TEXT,
    allowNull: true,
  },
  noteId: {
    comment: '笔记本id',
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  userId: {
    comment: '用户id',
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  tags: {
    comment: '标签',
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    comment: '状态',
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'undo',
  },
  deadline: {
    comment: '截止时间',
    type: DataTypes.DATE,
    allowNull: true,
  },
  priority: {
    comment: '优先级',
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 4,
  },
}, {
  // 这是其他模型参数
  tableName: 'Topic',
});

export { Topic };