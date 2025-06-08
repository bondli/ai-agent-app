import React, { memo, useEffect, useContext } from 'react';
import { Empty } from 'antd';
import { MainContext } from '@/common/context';
import Header from './Header';
import TopicCard from './TopicCard';
import style from './index.module.less';

const TopicList: React.FC = () => {
  const { currentCate, getCateList, topicList, getTopicList, getTopicCounts, setSelectedTopic } = useContext(MainContext);

  // 当前选中的笔记本发现变化的时候，根据currentNote去获取该笔记本下的所有topic
  useEffect(() => {
    getTopicList();
  }, [currentCate]);

  // 当前选中的笔记本发现变化的时候，去掉原已选择的代办事项
  useEffect(() => {
    setSelectedTopic(null);
  }, [currentCate]);

  // 新增代办成功的回调
  const handleNewTopicSuccess = (topic) => {
    // 刷新查询维度的数字
    getTopicCounts();
    // 重新拉取note列表
    getCateList();
    // 重新获取topic列表
    getTopicList();
    // 选中新创建的代办事项
    setSelectedTopic(topic);
  };

  return (
    <div className={style.container}>
      <Header onCreated={handleNewTopicSuccess} />
      {
        // 无数据
        topicList.length === 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="还没有任何代办事项" style={{ marginTop: '100px' }} />
        ) : null
      }
      {
        // 有数据
        topicList.length > 0 ? (
          <div className={style.listContainer}>
            {
              topicList.map((item, index) => {
                return (
                  <TopicCard data={item as any} key={index} />
                );
              })
            }
          </div>
        ) : null
      }
    </div>
  );

};

export default memo(TopicList);