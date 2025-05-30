import React, { memo, useState, useContext } from 'react';
import type { FormProps } from 'antd';
import { Layout, Row, Col, Form, Input, Button, App } from 'antd';
import { userLog, setStore, getStore } from '@common/electron';
import request from '@common/request';
import { MainContext } from '@common/context';
import Logo from '@components/Logo';

import style from './index.module.less';

const { Header, Content } = Layout;

type FieldType = {
  username?: string;
  password?: string;
};

type RegFieldType = {
  regname?: string;
  regpwd?: string;
  repregpwd?: string;
};

const UserPage: React.FC = () => {
  const { message } = App.useApp();

  const [showLogin, setShowLogin] = useState(true);
  const { setUserInfo } = useContext(MainContext);

  // 登录和注册切换
  const handleSwitch = (type: string) => {
    userLog('Switch Login Action:', type);
    if (type === 'login') {
      setShowLogin(true);
    } else {
      setShowLogin(false);
    }
  };

  // 执行登录
  const onLogin: FormProps<FieldType>['onFinish'] = async (values) => {
    userLog('Submit Login:', values);
    // 登录是从缓存中获取用户列表，然后判断用户名和密码是否正确
    const userList = getStore('userList') || [];
    const user = userList.find((user: any) => user.name === values.username && user.password === values.password);
    if (!user) {
      message.error(`用户名或密码错误`);
      return;
    }
    message.success(`登录成功`);
    setStore('loginData', user);
    setUserInfo({
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
    });
  };

  // 执行注册
  const onRegister: FormProps<RegFieldType>['onFinish'] = async (values) => {
    userLog('Submit Register:', values);
    const userList = getStore('userList') || [];
    const user = userList.find((user: any) => user.name === values.regname);
    if (user) {
      message.error(`用户名已存在`);
      return;
    }
    const newUser = {
      id: userList.length + 1,
      name: values.regname,
      password: values.regpwd,
      avatar: values.regname.substring(0,1),
      role: 'normal',
    };
    userList.push(newUser);
    setStore('userList', userList);
    message.success(`注册成功，已自动为你登录`);
    setStore('loginData', newUser);
    setUserInfo({
      id: newUser.id,
      name: newUser.name,
      avatar: newUser.avatar,
      role: newUser.role,
    });
  };

  return (
    <Layout className={style.layout}>
      <Header className={style.header}>
        <Logo mode={'light'} title={'AI Agent'} />
        <div className={style.sologon}>{'A helpful assistant that answers questions and helps you with your tasks'}</div>
      </Header>
      <Content className={style.content}>
        <Row style={{ width: '100%' }}>
          <Col span={12} className={style.left}>
            <img src="https://w2.eckwai.com/kos/nlav12333/backend-assets/todoist.172057bfeba2887f.png" style={{ width: '450px', height: '232px' }} />
          </Col>
          <Col span={12} className={style.right}>
            {
              showLogin ? (
                <div className={style.loginForm}>
                  <Form
                    name="basic"
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 16 }}
                    style={{ minWidth: 400, maxWidth: 600 }}
                    onFinish={onLogin}
                    autoComplete="off"
                  >
                    <Form.Item<FieldType>
                      label={`username`}
                      name="username"
                      rules={[{ required: true, message: '用户名不能为空' }]}
                    >
                      <Input />
                    </Form.Item>

                    <Form.Item<FieldType>
                      label={`password`}
                      name="password"
                      rules={[{ required: true, message: '密码不能为空' }]}
                    >
                      <Input.Password />
                    </Form.Item>

                    <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
                      <Button type="primary" htmlType="submit">
                        {'login'}
                      </Button>
                      <span className={style.userTips} onClick={() => handleSwitch('register') }>{'goRegister'}</span>
                    </Form.Item>
                  </Form>
                </div>
              ) : (
                <div className={style.loginForm}>
                  <Form
                    name="basic"
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 16 }}
                    style={{ minWidth: 400, maxWidth: 600 }}
                    onFinish={onRegister}
                    autoComplete="off"
                  >
                    <Form.Item<RegFieldType>
                      label={`username`}
                      name="regname"
                      rules={[{ required: true, message: '用户名不能为空' }]}
                    >
                      <Input />
                    </Form.Item>

                    <Form.Item<RegFieldType>
                      label={`password`}
                      name="regpwd"
                      hasFeedback
                      rules={[{ required: true, message: '密码不能为空' }]}
                    >
                      <Input.Password />
                    </Form.Item>

                    <Form.Item<RegFieldType>
                      label={`repeat`}
                      name="repregpwd"
                      dependencies={['regpwd']}
                      hasFeedback
                      rules={[
                        { required: true, message: '请输入重复密码' },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value || getFieldValue('regpwd') === value) {
                              return Promise.resolve();
                            }
                            return Promise.reject(new Error('两次密码不一致'));
                          },
                        }),
                      ]}
                    >
                      <Input.Password />
                    </Form.Item>

                    <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
                      <Button type="primary" htmlType="submit">
                        {'register'}
                      </Button>
                      <span className={style.userTips} onClick={() => handleSwitch('login') }>{'goLogin'}</span>
                    </Form.Item>
                  </Form>
                </div>
              )
            }
          </Col>
        </Row>
      </Content>
    </Layout>
  );

};

export default memo(UserPage);