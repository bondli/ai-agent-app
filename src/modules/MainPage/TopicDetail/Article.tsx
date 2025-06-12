import React, { memo, useEffect, useState, useRef } from 'react';
import { throttle } from 'lodash-es';
import ReactQuill from 'react-quill';

import 'react-quill/dist/quill.snow.css';
import './editor.css';

import request from '@common/request';
import { autoLinkify } from '@common/utils';

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
  
  // 用于防止重复处理相同内容
  const lastProcessedContentRef = useRef<string>('');
  const isProcessingRef = useRef<boolean>(false);

  // 切换了不同的内容，更新编辑器中的展示
  // id的变化清除选中态，防止切换带来的误更新
  useEffect(() => {
    setTempDesc(selectedTopic.desc || '');
    lastProcessedContentRef.current = selectedTopic.desc || '';
    canUpdateId = 0;
  }, [selectedTopic]);

  // 内容输入，直接更新（不再自动转换链接）
  const handleChange = (value: string) => {
    // console.log('change:', value, canUpdateId, selectedTopic.id);
    
    // 如果正在处理链接，直接返回避免循环
    if (isProcessingRef.current) {
      return;
    }
    
    setTempDesc(value);
    saveArticleChange(value);
  };

  // 失去焦点时处理链接
  const handleBlur = () => {
    const currentContent = tempDesc;
    
    // 避免重复处理相同内容
    if (currentContent === lastProcessedContentRef.current || !currentContent.trim()) {
      return;
    }
    
    // 标记正在处理，防止循环
    isProcessingRef.current = true;
    
    try {
      const processedContent = autoLinkify(currentContent);
      
      if (processedContent !== currentContent) {
        setTempDesc(processedContent);
        saveArticleChange(processedContent);
        lastProcessedContentRef.current = processedContent;
      } else {
        lastProcessedContentRef.current = currentContent;
      }
    } catch (error) {
      console.error('处理链接时出错:', error);
      lastProcessedContentRef.current = currentContent;
    } finally {
      // 延迟重置标记，确保状态更新完成
      setTimeout(() => {
        isProcessingRef.current = false;
      }, 100);
    }
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
        onBlur={handleBlur}
        placeholder="请输入内容"
      />
    </div>
  );
};

export default memo(Article);