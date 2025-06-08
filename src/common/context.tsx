import React, { createContext, useState, useEffect } from 'react';
import request from '@common/request';
import { DEFAULT_CATE, UserInfo, Cate, Topic } from '@common/constant';

type MainContextType = {
  userInfo: UserInfo;
  setUserInfo: React.Dispatch<React.SetStateAction<UserInfo>>;
  currentCate: Cate;
  setCurrentCate: React.Dispatch<React.SetStateAction<Cate>>;
  cateList: Cate[];
  setCateList: React.Dispatch<React.SetStateAction<Cate[]>>;
  topicList: Topic[];
  setTopicList: React.Dispatch<React.SetStateAction<Topic[]>>;
  selectedTopic: Topic;
  setSelectedTopic: React.Dispatch<React.SetStateAction<Topic>>;
  topicCounts: { [key: string]: number };
  getCateList: () => void;
  getTopicList: () => void;
  getTopicCounts: () => void;
};

export const MainContext = createContext<MainContextType | undefined>(undefined);
export const MainProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userInfo, setUserInfo] = useState<UserInfo>({
    id: 0,
    name: '',
    avatar: '',
  });
  const [currentCate, setCurrentCate] = useState(DEFAULT_CATE);
  const [cateList, setCateList] = useState([]);
  const [topicList, setTopicList] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [topicCounts, setTopicCounts] = useState({});

  // 获取分类列表
  const getCateList = async () => {
    const response = await request.get('/cate/list');
    const result = response.data;
    setCateList(result.data);
  };

  // 获取代办事项列表
  const getTopicList = async () => {
    const response = await request.get(`/topic/getList?cateId=${currentCate.id}`);
    const result = response.data;
    setTopicList(result.data);
  };

  // 获取各种分类下代办的数量
  const getTopicCounts = async () => {
    const response = await request.get(`/topic/counts`);
    const result = response.data;
    setTopicCounts(result);
  };

  // 当前分类变化的时候自动拉取代办事项列表
  useEffect(() => {
    getTopicList();
  }, [currentCate]);

  return (
    <MainContext.Provider
      value={{
        userInfo,
        setUserInfo,
        currentCate,
        setCurrentCate,
        cateList,
        setCateList,
        getCateList,
        topicList,
        setTopicList,
        getTopicList,
        selectedTopic,
        setSelectedTopic,
        topicCounts,
        getTopicCounts,
      }}
    >
      {children}
    </MainContext.Provider>
  );
};