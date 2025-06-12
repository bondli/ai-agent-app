import { memo, useRef, useEffect, useState, useContext } from 'react';
import { App, Space, Spin, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import {
  Bubble,
  BubbleProps,
  Sender,
  Suggestion,
  Welcome,
} from '@ant-design/x';

import markdownit from 'markdown-it';

import { MainContext } from '@common/context';
import { AGENT_BASE_URL } from '@common/constant';

import style from './index.module.less';

type Message = {
  role: string;
  content: string;
  status: 'loading' | 'success' | 'error';
};

const AGENT_PLACEHOLDER = 'Generating content, please wait...';

const md = markdownit({ html: true, breaks: true });
const renderMarkdown: BubbleProps['messageRender'] = (content) => {
  console.log('content', content);
  return (
    <Typography>
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: used in demo */}
      <div dangerouslySetInnerHTML={{ __html: md.render(content) }} className={style.markdown} />
    </Typography>
  );
};

const Copilot = ({ sessionId }: { sessionId: string }) => {
  const { message } = App.useApp();
  const { userInfo } = useContext(MainContext);

  const abortController = useRef<AbortController>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const [inputValue, setInputValue] = useState('');
  const [conversationId, setConversationId] = useState(sessionId);

  // ==================== Event ====================
  const handleUserSubmit = async (val: string) => {
    if (!val.trim()) return;
    
    // 1. 同时追加用户消息和loading状态的assistant消息，避免状态更新时序问题
    setMessages(prev => [
      ...prev,
      { role: 'user', content: val, status: 'success' },
      { role: 'assistant', content: '', status: 'loading' }
    ]);
    setLoading(true);

    // 2. 构造 fetch 请求参数
    const controller = new AbortController();
    abortController.current = controller;
    const agentId = 'my-agent'; // 可根据实际情况动态传递
    const url = `${AGENT_BASE_URL}/${agentId}/stream`;
    const body = JSON.stringify({
      input: val,
      options: {
        userId: `${userInfo?.id}`,
        conversationId,
        contextLimit: 10,
        temperature: 0.5, // 降低温度以提高工具调用的准确性
        maxTokens: 4000,
      },
    });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'accept': 'text/event-stream',
          'Content-Type': 'application/json',
          'X-User-Id': `${userInfo?.id}`,
        },
        body,
        signal: controller.signal,
      });
      if (!response.body) throw new Error('No response body');
      const reader = response.body.getReader();
      let assistantContent = '';
      let done = false;
      const decoder = new TextDecoder('utf-8');
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          // 逐行处理 data: ...
          chunk.split(/\r?\n/).forEach(line => {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.replace('data: ', ''));
                if (typeof data.text === 'string') {
                  assistantContent += data.text;
                  setMessages(prev => {
                    const updated = [...prev];
                    // 从后往前找最近的loading状态的assistant消息进行更新
                    for (let i = updated.length - 1; i >= 0; i--) {
                      if (updated[i].role === 'assistant' && updated[i].status === 'loading') {
                        updated[i] = {
                          ...updated[i],
                          content: assistantContent,
                          status: 'loading',
                        };
                        break;
                      }
                    }
                    return updated;
                  });
                }
              } catch (e) {
                // 忽略解析错误
              }
            }
          });
        }
      }
      // 3. 结束后将 assistant 消息状态设为 success
      setMessages(prev => {
        const updated = [...prev];
        // 从后往前找最近的loading状态的assistant消息
        for (let i = updated.length - 1; i >= 0; i--) {
          if (updated[i].role === 'assistant' && updated[i].status === 'loading') {
            updated[i] = {
              ...updated[i],
              content: assistantContent,
              status: 'success',
            };
            break;
          }
        }
        return updated;
      });
    } catch (err) {
      // 4. 错误时设为 error
      setMessages(prev => {
        const updated = [...prev];
        // 从后往前找最近的loading状态的assistant消息
        for (let i = updated.length - 1; i >= 0; i--) {
          if (updated[i].role === 'assistant' && updated[i].status === 'loading') {
            updated[i] = {
              ...updated[i],
              status: 'error',
              content: '出错了，请重试',
            };
            break;
          }
        }
        return updated;
      });
    } finally {
      setLoading(false);
    }
  };

  const chatList = (
    <div className={style.chatList}>
      {messages?.length ? (
        /** 消息列表 */
        <Bubble.List
          style={{ height: '100%', paddingInline: 16 }}
          items={messages?.map((i, index) => {
            return {
              content: i.content,
              role: i.role,
              // 关键修复：只有在loading状态且没有内容时才显示loading UI
              // 如果有内容，即使是loading状态也要显示内容，实现实时流式效果
              loading: i.status === 'loading' && !i.content.trim(),
              // 优化typing效果：流式状态下使用更快的typing速度，完成状态下禁用typing
              typing: i.status === 'loading' && i.content.trim() 
                ? { step: 1, interval: 10 } // 流式状态：每次1个字符，间隔10ms
                : false, // 非流式状态：禁用typing效果
              messageRender: renderMarkdown,
            };
          })}
          roles={{
            assistant: {
              placement: 'start', 
              avatar: { icon: <UserOutlined />, style: { background: '#fde3cf' } },
              loadingRender: () => (
                <Space>
                  <Spin size="small" />
                  {AGENT_PLACEHOLDER}
                </Space>
              ),
            },
            user: {
              placement: 'end',
              avatar: { icon: <UserOutlined />, style: { background: '#87d068' } },
            },
          }}
        />
      ) : (
        /** 没有消息时的 welcome */
        <>
          <Welcome
            variant="borderless"
            title="Hello, I'm a AI Agent"
            description="I can help you to answer questions and solve problems."
            className={style.chatWelcome}
          />
        </>
      )}
    </div>
  );

  const chatSender = (
    <div>
      {/** 输入框 */}
      <Suggestion items={[]} onSelect={(itemVal) => setInputValue(`[${itemVal}]:`)}>
        {({ onTrigger, onKeyDown }) => (
          <Sender
            loading={loading}
            value={inputValue}
            onChange={(v) => {
              onTrigger(v === '/');
              setInputValue(v);
            }}
            onSubmit={() => {
              handleUserSubmit(inputValue);
              setInputValue('');
            }}
            onCancel={() => {
              abortController.current?.abort();
            }}
            allowSpeech
            placeholder="Ask or input / use skills"
            onKeyDown={onKeyDown}
            actions={(_, info) => {
              const { SendButton, LoadingButton, SpeechButton } = info.components;
              return (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <SpeechButton className={style.speechButton} />
                  {loading ? <LoadingButton type="default" /> : <SendButton type="primary" />}
                </div>
              );
            }}
          />
        )}
      </Suggestion>
    </div>
  );

  useEffect(() => {
    setMessages([]);
    setInputValue('');
    setConversationId(sessionId);
    abortController.current?.abort();
  }, [sessionId]);

  return (
    <div className={style.copilotChat}>

      {/** 对话区 - 消息列表 */}
      {chatList}

      {/** 对话区 - 输入框 */}
      {chatSender}
    </div>
  );

};

export default memo(Copilot);