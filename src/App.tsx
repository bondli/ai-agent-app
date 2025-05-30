import React, { useState, useEffect, useContext } from 'react';
import { userLog, getStore } from '@common/electron';

import { MainContext } from '@common/context';

import UserPage from '@modules/UserPage';
import MainPage from '@modules/MainPage';

import './styles/global.less';

const AppContainer: React.FC = () => {
  const { userInfo, setUserInfo } = useContext(MainContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 判断是否初始化了用户
    const loginData = getStore('loginData') || {};
    userLog('app startup:', loginData);
    const { id, name, avatar } = loginData;
    if (id && name && avatar) {
      setUserInfo(loginData);
    }
    setLoading(false);
  }, []);

  // 避免一进来还在获取本地缓存数据的时候显示了登录的问题
  if (loading) {
    return <div style={{ color: '#eee', fontSize: '24px' }}>loading...</div>;
  }

  if (!userInfo || !userInfo.id) {
    return <UserPage />;
  }

  return <MainPage />;
};

export default AppContainer;