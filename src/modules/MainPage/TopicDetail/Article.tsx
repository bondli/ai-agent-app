import React, { memo, useEffect, useState } from 'react';
import { throttle } from 'lodash-es';
import ReactQuill from 'react-quill';

import 'react-quill/dist/quill.snow.css';
import './editor.css';

import request from '@common/request';

import style from './index.module.less';

type ArticleProps = {
  selectedTopic: any;
  onUpdated: () => void;
};

// 定义一个变量，用于控制切换topic时带来的误更新topic内容，必须点击了编辑器才能执行更新
let canUpdateId = 0;

const Article: React.FC<ArticleProps> = (props) => {
  const { selectedTopic = {}, onUpdated } = props;
  const [tempDesc, setTempDesc] = useState<string>('');

  // 切换了不同的内容，更新编辑器中的展示
  // id的变化清除选中态，防止切换带来的误更新
  useEffect(() => {
    setTempDesc(selectedTopic.desc);
    canUpdateId = 0;
  }, [selectedTopic]);

  // 内容输入，直接更新
  const handleChange = (value: string) => {
    // console.log('change:', value, canUpdateId, selectedTopic.id);
    setTempDesc(value);
    saveArticleChange(value);
  };

  // 提交服务端修改内容
  const saveArticleChange = throttle((value) => {
    if (canUpdateId !== selectedTopic.id) {
      return;
    }
    if (value === '<p><br></p>') {
      return;
    }
    request.post(`/topic/update?id=${selectedTopic.id}`, {
      desc: value,
    }).then(() => {
      onUpdated();
    });
  }, 1000);

  // 聚焦编辑器
  const handleFocus = () => {
    canUpdateId = selectedTopic.id;
    console.log('canUpdateId:', canUpdateId);
  };

  return (
    <div className={style.articleContainer}>
      <ReactQuill
        theme="snow"
        value={tempDesc}
        onChange={handleChange}
        onFocus={handleFocus}
        placeholder="请输入内容"
      />
    </div>
  );
};

export default memo(Article);