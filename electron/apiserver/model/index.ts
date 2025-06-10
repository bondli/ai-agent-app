import { Sequelize } from 'sequelize';
import logger from 'electron-log';

let DB_CONFIG = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

if (process.env.NODE_ENV === 'development') {
  DB_CONFIG = {
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: 'cx0917CXC',
    database: 'notebook',
  };
}

// 使用到的是sequelize，文档：
// https://github.com/demopark/sequelize-docs-Zh-CN/blob/v6/core-concepts/model-querying-basics.md
export const sequelize = new Sequelize({
  dialect: 'mysql',
  ...DB_CONFIG,

  logging: (msg) => logger.info(`[API SQL] ${msg}`),
  dialectOptions: {
    // 设置时区
    timezone: '+08:00',
    dateStrings: true,
    typeCast: true
  },
  timezone: '+08:00', // 添加全局时区设置
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});