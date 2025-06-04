import { DataTypes } from 'sequelize';
import { sequelize } from './index';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  avatar: {
    comment: '头像',
    type: DataTypes.STRING,
    allowNull: true,
  },
  name: {
    comment: '用户名',
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    comment: '密码',
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '123456',
  },
  email: {
    comment: '邮箱',
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    comment: '状态',
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'normal',
  },
  extra: {
    comment: '额外信息',
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  // 这是其他模型参数
  tableName: 'User',
});

export { User };