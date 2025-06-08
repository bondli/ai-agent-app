import React, { memo, useContext } from 'react';
import { MainContext } from '@/common/context';
import Header from './Header';
import Title from './Title';
import Article from './Article';

import style from './index.module.less';

const TopicDetail: React.FC = () => {
  const { selectedTopic, setSelectedTopic, topicList, getTopicList, getTopicCounts, getCateList } = useContext(MainContext);

  // 状态更新：同步更新数量，笔记本，代办列表，选中的代办
  const handleStatusUpdate = (oldSelectedTopicId, opType) => {
    // 当操作是更新截止时间和修改优先级的时候，只需要刷新列表
    if (opType === 'updateDeadline' || opType === 'updatePriority') {
      // 刷新代办列表
      getTopicList();
    } else {
      // 刷新查询维度的数字
      getTopicCounts();
      // 刷新笔记本列表
      getCateList();
      // 刷新代办列表
      getTopicList();

      // 根据原来选择的topicId,找到他的下一条（或者上一条--出现在最后一条的时候）进行选中
      // 当只有一条的时候，不选中
      let newSelectedTopic = null;
      const index = topicList.findIndex(item => item.id === oldSelectedTopicId);
      if (topicList[index + 1]?.id) {
        newSelectedTopic = topicList[index + 1];
      } else if (topicList[index - 1]?.id) {
        newSelectedTopic = topicList[index - 1];
      } else {
        newSelectedTopic = null;
      }
      setSelectedTopic(newSelectedTopic);
    }
  };

  // 标题更新：同步更新列表中的标题
  const handleTitleUpdate = (newTtile) => {
    getTopicList();
    selectedTopic.title = newTtile;
    setSelectedTopic(selectedTopic);
  };

  // 详情更新：同步更新列表中的文本
  const handleDescUpdate = () => {
    getTopicList();
  };

  return (
    <div className={style.container}>
      <Header onUpdated={handleStatusUpdate} />
      <Title onUpdated={handleTitleUpdate} />
      <Article selectedTopic={selectedTopic} onUpdated={handleDescUpdate} />
    </div>
  );

};

export default memo(TopicDetail);