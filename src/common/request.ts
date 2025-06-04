import { notification } from 'antd';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { userLog, getStore } from '@common/electron';

export const baseURL = 'http://localhost:9587/';
// 创建axios实例
const service: AxiosInstance = axios.create({
  baseURL, // api的base_url
  timeout: 10000 // 请求超时时间
});

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 可以在这里添加请求头部，例如token
    config.headers['X-From'] = 'AI-Agent-Client';
    const loginData = getStore('loginData') || {};
    config.headers['X-User-Id'] = loginData.id || 0;
    return config;
  },
  error => {
    // 请求错误处理
    userLog('request error:', error);
    notification.error({
      message: '请求出错',
      description: error?.message || `unknown error`,
      duration: 3,
    });
    Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    if (response.data?.error) {
      notification.error({
        message: '服务器响应出错',
        description: response.data?.error || `unknown error`,
        duration: 3,
      });
    }
    return response;
  },
  error => {
    userLog('response error:', error);
    notification.error({
      message: '服务器响应出错',
      description: error?.message || `unknown error`,
      duration: 3,
    });
    return Promise.reject(error);
  }
);

export default service;