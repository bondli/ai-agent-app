import React, { memo, useContext, useEffect, useRef, useState } from 'react';
import { notification, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

import request from '@common/request';
import { userLog } from '@common/electron';
import { MainContext } from '@common/context';
import { DEFAULT_CATE } from '@common/constant';

import style from './index.module.less';

const SearchBox: React.FC = () => {
  const { currentCate, setCurrentCate, selectedTopic, setTopicList } = useContext(MainContext);

  const [searchKey, setSearchKey] = useState('');
  const inputSearchRef = useRef(null);

  // 搜索框输入
  const handleSearchChange = (e) => {
    setSearchKey(e.target.value);
  };

  // 执行搜索
  const goSearch = async () => {
    userLog('Search Topic keyword: ', searchKey);
    const response = await request.post(`/topic/searchList?noteId=${currentCate.id}`, {
      searchKey,
    });
    const { data, status } = response;
    if (status === 200) {
      // 强制切换到All的目录下
      setCurrentCate(DEFAULT_CATE);
      setTopicList(data.data || []);

      if (data.count > 0) {
        notification.success({
          message: `搜索到“${searchKey}”的结果共 ${data.count} 条`,
        });
      } else {
        notification.info({
          message: `没有搜索到“${searchKey}”的结果`,
        });
      }
    }
  };

  useEffect(() => {
    setSearchKey('');
  }, [currentCate.id, selectedTopic?.id]);

  return (
    <div className={style.container}>
      <Input
        style={{ width: 300 }}
        placeholder="请输入关键字进行查找"
        prefix={<SearchOutlined />}
        allowClear
        onChange={handleSearchChange}
        onPressEnter={goSearch}
        value={searchKey}
        ref={inputSearchRef}
      />
    </div>
  );
};

export default memo(SearchBox);