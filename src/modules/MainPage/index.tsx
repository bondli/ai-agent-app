import React, { memo, useState, useContext } from 'react';
import { App, Layout, theme } from 'antd';

import { MainContext } from '@common/context';
import { deleteStore } from '@common/electron';

import Logo from '@components/Logo';
import User from '@components/User';

import style from './index.module.less';

import Copilot from './Copilot';

const { Header, Content } = Layout;

const MainPage: React.FC = () => {
  const { message } = App.useApp();
  const { userInfo, setUserInfo } = useContext(MainContext);

  const { token: { colorBgContainer } } = theme.useToken();

  const onLogout = () => {
    deleteStore('loginData');
    message.success(`退出系统成功`);
    setUserInfo(null);
  };

  return (
    <Layout className={style.container}>
      <Header
      className={style.header}
        style={{
          background: colorBgContainer,
        }}
      >
        <Logo mode={'dark'} title={'AI Agent'} />

        <div className={style.user}>
          <User info={userInfo} onLogout={onLogout} />
        </div>
      </Header>
      <Content className={style.content}>
        <div className={style.copilotWrapper}>
          {/** 左侧工作区 */}
          <div className={style.workarea}>
            <div className={style.workareaBody}>
              <div className={style.bodyContent}>
                hello world
              </div>
            </div>
          </div>

          {/** 右侧对话区 */}
          <Copilot />
        </div>
      </Content>
    </Layout>
  );
};

export default memo(MainPage);