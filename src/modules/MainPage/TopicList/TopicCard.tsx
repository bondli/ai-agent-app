import React, { memo, useContext } from 'react';
import { Card, Badge } from 'antd';
import { format as timeAgoFormat } from 'timeago.js';
import dayjs from 'dayjs';
import { userLog } from '@/common/electron';
import { MainContext } from '@/common/context';
import { Topic } from '@/common/constant';

import style from './index.module.less';

type TopicCardData = {
  id: number;
  title: string;
  createdAt: string;
  desc: string;
  priority: number;
  status: string;
  deadline?: string;
};
type TopicCardProps = {
  data: TopicCardData;
};

const color = {
  1: 'error',
  2: 'warning',
  3: 'default',
  4: 'processing',
};

const TopicCard: React.FC<TopicCardProps> = (props) => {
  const { data } = props;
  const { id, desc, createdAt } = data;

  const { selectedTopic, setSelectedTopic } = useContext(MainContext);

  const handleClick = () => {
    userLog('Click Topic:', {id: data.id, title: data.title});
    setSelectedTopic(data as unknown as Topic);
  };

  const titleContent = (data) => {
    const { title, priority, deadline } = data;
    if (!deadline) {
      return (
        <Badge
          status={color[priority]}
          text={title}
        />
      );
    }
    return (
      <div className={style.cardTitleLeft}>
        <Badge
          status={color[priority]}
          text={title.length > 40 ? title.substring(0, 40) + '...' : title}
        />
        <div className={style.time}>截止时间：{dayjs(deadline).format('YY/MM/DD HH:mm')}</div>
      </div>
    );
  };

  // 去掉html的标签，展示纯文本
  let displayDesc = !desc ? '该笔记暂时没有详细信息，等你来添加详细的信息' : desc.replace(/(<([^>]+)>)/ig, "");
  if (displayDesc.length > 200) {
    displayDesc = displayDesc.substring(0, 200);
  }

  return (
    <Card
      className={style.cardContainer}
      style={selectedTopic?.id === id ? {boxShadow: '0 0 0 2px rgba(3, 4, 12, 0.67)'} : {}}
      hoverable
      type="inner"
      title={titleContent(data)}
      extra={<span className={style.cardExtra}>创建于：{timeAgoFormat(createdAt)}</span>}
      onClick={handleClick}
    >
      <div className={style.desc}>
        {
          displayDesc
        }
      </div>
    </Card>
  );

};

export default memo(TopicCard);