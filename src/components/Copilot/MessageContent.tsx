import React, { memo } from 'react';

import { Typography } from 'antd';
import markdownit from 'markdown-it';

import ToolCall from './ToolCall';
import Think from './Think';
import AskHuman from './AskHuman';

import style from './index.module.less';

type ComProps = {
  content: string;
  onAction: (input: string, action?: string) => void;
};

const md = markdownit({ html: true, breaks: true });

const MessageContent: React.FC<ComProps> = (props) => {
  const { content, onAction } = props;

  // 用正则分割所有<think>...</think>、<tool_call>...</tool_call>、<ask_human_input>...</ask_human_input>和纯文本
  const regex = /(<think>[\s\S]*?<\/think>)|(<tool_call>[\s\S]*?<\/tool_call>)|(<ask_human_input>[\s\S]*?<\/ask_human_input>)/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(content)) !== null) {
    // 匹配前的纯文本
    if (match.index > lastIndex) {
      const text = content.slice(lastIndex, match.index);
      if (text.trim()) {
        parts.push({ type: 'text', value: text });
      }
    }
    // 匹配到的标签内容
    if (match[1]) {
      parts.push({ type: 'think', value: match[1] });
    } else if (match[2]) {
      parts.push({ type: 'tool_call', value: match[2] });
    } else if (match[3]) {
      parts.push({ type: 'ask_human_input', value: match[3] });
    }
    lastIndex = regex.lastIndex;
  }
  // 最后一个标签后的纯文本
  if (lastIndex < content.length) {
    const text = content.slice(lastIndex);
    if (text.trim()) {
      parts.push({ type: 'text', value: text });
    }
  }

  const handleUserSubmit = (input: string) => {
    onAction(input, input === '取消' ? 'cancel' : 'resume'); // 调用resume/cancel方法,和后端强约定字符串
  }

  return (
    <>
      {parts.map((part, idx) => {
        if (part.type === 'think') {
          return <Think key={idx} content={part.value} />;
        }
        if (part.type === 'tool_call') {
          return <ToolCall key={idx} content={part.value} />;
        }
        if (part.type === 'ask_human_input') {
          return <AskHuman key={idx} content={part.value} onSubmit={handleUserSubmit} />;
        }
        // 纯文本用Markdown渲染
        return (
          <Typography key={idx}>
            <div
              dangerouslySetInnerHTML={{ __html: md.render(part.value) }}
              className={style.markdown}
            />
          </Typography>
        );
      })}
    </>
  );
};

export default memo(MessageContent);