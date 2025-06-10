// 用户信息
export type UserInfo = {
  id: number;
  name: string;
  avatar: string;
};

// 笔记本分类
export type Cate = {
  id: number | string;
  name: string;
  counts: number;
  icon: React.ReactNode;
  isVirtual?: boolean;
  orders?: number;
};

// 文章
export type Topic = {
  id: number;
  title: string;
  desc?: string;
  priority?: number;
  status?: string;
  deadline?: string;
  createdAt?: string;
  updatedAt?: string;
  cateId?: number;
};

export const DEFAULT_CATE = {
  id: 'all',
  name: '所有笔记',
  counts: 0,
  icon: null,
  isVirtual: true,
};

export const SPLIT_LINE = '1px solid #E5E5E5';

export const HEADER_HEIGHT = 64;

export const AGENT_BASE_URL = 'http://localhost:3141/agents';
export const API_BASE_URL = 'http://localhost:9587/';
