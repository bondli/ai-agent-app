import React, { memo, useState, useContext } from 'react';
import { App, Layout, Row, Col, FloatButton, Drawer, Button, Tooltip } from 'antd';
import { CommentOutlined, PlusOutlined } from '@ant-design/icons';

import { MainContext } from '@common/context';
import { SPLIT_LINE } from '@common/constant';
import { deleteStore } from '@common/electron';

import Logo from '@components/Logo';
import User from '@components/User';
import Copilot from '@components/Copilot';

import style from './index.module.less';

import Category from './Category';
import TopicList from './TopicList';
import TopicDetail from './TopicDetail';
import SearchBox from './SearchBox';

const { Header } = Layout;

// 生成 uuid作为sessionId
const generateUUID = () => {
  // 简单 uuid 生成
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const MainPage: React.FC = () => {
  const { message } = App.useApp();
  const { userInfo, setUserInfo, selectedTopic } = useContext(MainContext);

  const [showCopilot, setShowCopilot] = useState(false);
  const [sessionId, setSessionId] = useState<string>(generateUUID());

  const onLogout = () => {
    deleteStore('loginData');
    message.success(`退出系统成功`);
    setUserInfo(null);
  };

  // 新会话
  const handleNewChat = () => {
    setSessionId(generateUUID());
  };

  return (
    <Layout className={style.container}>

      <Header className={style.header}>
        <Logo mode={'dark'} title={'AI Agent'} />

        <SearchBox />

        <div className={style.user}>
          <User info={userInfo} onLogout={onLogout} />
        </div>
      </Header>

      <Row className={style.content}>
        <Col flex="208px" className={style.left} style={{ borderRight: SPLIT_LINE }}>
          <Category />
        </Col>
        <Col flex="auto" className={style.right}>
          <table className={style.mainTable}>
            <tbody>
              <tr>
                <td style={{ width: selectedTopic && selectedTopic.id ? '50%' : '100%' }}>
                  <TopicList />
                </td>
                {
                  selectedTopic && selectedTopic.id ? (
                    <td style={{ width: '50%', borderLeft: SPLIT_LINE }}>
                      <TopicDetail />
                    </td>
                  ) : null
                }
              </tr>
            </tbody>
          </table>
        </Col>
      </Row>

      <FloatButton
        icon={<CommentOutlined />}
        type="primary"
        style={{ insetInlineEnd: 24 }}
        onClick={() => {
          setShowCopilot(!showCopilot);
        }}
      />

      {/* AI聊天框 */}
      <Drawer
        title={`AI Copilot`}
        width={500}
        open={showCopilot}
        onClose={() => setShowCopilot(false)}
        extra={
          <Tooltip title="新建会话">
            <Button
              type="text"
              icon={<PlusOutlined />}
              onClick={handleNewChat}
            />
          </Tooltip>
        }
      >
        <Copilot sessionId={sessionId} />
      </Drawer>
    </Layout>
  );
};

export default memo(MainPage);