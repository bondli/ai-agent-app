import React, { memo, useRef, useEffect, useState, useContext } from 'react';
import { App, Layout, theme, Button, GetProp, GetRef, Image, Popover, Space, Spin, message } from 'antd';
import {
  AppstoreAddOutlined,
  CloseOutlined,
  CloudUploadOutlined,
  CommentOutlined,
  CopyOutlined,
  DislikeOutlined,
  LikeOutlined,
  OpenAIFilled,
  PaperClipOutlined,
  PlusOutlined,
  ProductOutlined,
  ReloadOutlined,
  ScheduleOutlined,
} from '@ant-design/icons';

import {
  Attachments,
  type AttachmentsProps,
  Bubble,
  Conversations,
  Prompts,
  Sender,
  Suggestion,
  Welcome,
  useXAgent,
  useXChat,
} from '@ant-design/x';

import type { Conversation } from '@ant-design/x/es/conversations';
import dayjs from 'dayjs';

import style from './index.module.less';

type BubbleDataType = {
  role: string;
  content: string;
};

const MOCK_SESSION_LIST = [
  {
    key: '5',
    label: 'New session',
    group: 'Today',
  },
  {
    key: '4',
    label: 'What has Ant Design X upgraded?',
    group: 'Today',
  },
  {
    key: '3',
    label: 'New AGI Hybrid Interface',
    group: 'Today',
  },
  {
    key: '2',
    label: 'How to quickly install and import components?',
    group: 'Yesterday',
  },
  {
    key: '1',
    label: 'What is Ant Design X?',
    group: 'Yesterday',
  },
];
const MOCK_SUGGESTIONS = [
  { label: 'Write a report', value: 'report' },
  { label: 'Draw a picture', value: 'draw' },
  {
    label: 'Check some knowledge',
    value: 'knowledge',
    icon: <OpenAIFilled />,
    children: [
      { label: 'About React', value: 'react' },
      { label: 'About Ant Design', value: 'antd' },
    ],
  },
];
const MOCK_QUESTIONS = [
  'What has Ant Design X upgraded?',
  'What components are in Ant Design X?',
  'How to quickly install and import components?',
];
const AGENT_PLACEHOLDER = 'Generating content, please wait...';

const Copilot = () => {
  const attachmentsRef = useRef<GetRef<typeof Attachments>>(null);
  const abortController = useRef<AbortController>(null);

  const [messageHistory, setMessageHistory] = useState<Record<string, any>>({});

  const [sessionList, setSessionList] = useState<Conversation[]>(MOCK_SESSION_LIST);
  const [curSession, setCurSession] = useState(sessionList[0].key);

  const [attachmentsOpen, setAttachmentsOpen] = useState(false);
  const [files, setFiles] = useState<GetProp<AttachmentsProps, 'items'>>([]);

  const [inputValue, setInputValue] = useState('');

  const [agent] = useXAgent<BubbleDataType>({
    baseURL: 'http://localhost:3141/agents/my-agent/stream',
    model: 'gpt-4o-mini',
    dangerouslyApiKey: 'Bearer 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',
  });

  const loading = agent.isRequesting();

  const { messages, onRequest, setMessages } = useXChat({
    agent,
    requestFallback: (_, { error }) => {
      if (error.name === 'AbortError') {
        return {
          content: 'Request is aborted',
          role: 'assistant',
        };
      }
      return {
        content: 'Request failed, please try again!',
        role: 'assistant',
      };
    },
    transformMessage: (info) => {
      const { originMessage, chunk } = info || {};
      let currentContent = '';
      let currentThink = '';
      try {
        if (chunk?.data && !chunk?.data.includes('DONE')) {
          const message = JSON.parse(chunk?.data);
          currentThink = message?.choices?.[0]?.delta?.reasoning_content || '';
          currentContent = message?.choices?.[0]?.delta?.content || '';
        }
      } catch (error) {
        console.error(error);
      }

      let content = '';

      if (!originMessage?.content && currentThink) {
        content = `<think>${currentThink}`;
      } else if (
        originMessage?.content?.includes('<think>') &&
        !originMessage?.content.includes('</think>') &&
        currentContent
      ) {
        content = `${originMessage?.content}</think>${currentContent}`;
      } else {
        content = `${originMessage?.content || ''}${currentThink}${currentContent}`;
      }

      return {
        content: content,
        role: 'assistant',
      };
    },
    resolveAbortController: (controller) => {
      abortController.current = controller;
    },
  });

  // ==================== Event ====================
  const handleUserSubmit = (val: string) => {
    onRequest({
      model: 'gpt-4o-mini',
      message: {
        input: [
          {
            role: 'user',
            content: [
              { type: 'text', text: val }
            ]
          }
        ],
        options: {
          conversationId: curSession,
          temperature: 0.8,
          maxTokens: 1000
        }
      }
    });

    // session title mock
    if (sessionList.find((i) => i.key === curSession)?.label === 'New session') {
      setSessionList(
        sessionList.map((i) => (i.key !== curSession ? i : { ...i, label: val?.slice(0, 20) })),
      );
    }
  };

  const onPasteFile = (_: File, files: FileList) => {
    for (const file of files) {
      attachmentsRef.current?.upload(file);
    }
    setAttachmentsOpen(true);
  };

  // ==================== Nodes ====================
  const chatHeader = (
    <div className={style.chatHeader}>
      <div className={style.headerTitle}>AI Copilot</div>
      <Space size={0}>
        <Button
          type="text"
          icon={<PlusOutlined />}
          onClick={() => {
            if (messages?.length) {
              const timeNow = dayjs().valueOf().toString();
              abortController.current?.abort();
              // The abort execution will trigger an asynchronous requestFallback, which may lead to timing issues.
              // In future versions, the sessionId capability will be added to resolve this problem.
              setTimeout(() => {
                setSessionList([
                  { key: timeNow, label: 'New session', group: 'Today' },
                  ...sessionList,
                ]);
                setCurSession(timeNow);
                setMessages([]);
              }, 100);
            } else {
              message.error('It is now a new conversation.');
            }
          }}
          className={style.headerButton}
        />
        <Popover
          placement="bottom"
          styles={{ body: { padding: 0, maxHeight: 600 } }}
          content={
            <Conversations
              items={sessionList?.map((i) =>
                i.key === curSession ? { ...i, label: `[current] ${i.label}` } : i,
              )}
              activeKey={curSession}
              groupable
              onActiveChange={async (val) => {
                abortController.current?.abort();
                // The abort execution will trigger an asynchronous requestFallback, which may lead to timing issues.
                // In future versions, the sessionId capability will be added to resolve this problem.
                setTimeout(() => {
                  setCurSession(val);
                  setMessages(messageHistory?.[val] || []);
                }, 100);
              }}
              styles={{ item: { padding: '0 8px' } }}
              className={style.conversations}
            />
          }
        >
          <Button type="text" icon={<CommentOutlined />} className={style.headerButton} />
        </Popover>
      </Space>
    </div>
  );

  const chatList = (
    <div className={style.chatList}>
      {messages?.length ? (
        /** 消息列表 */
        <Bubble.List
          style={{ height: '100%', paddingInline: 16 }}
          items={messages?.map((i) => ({
            ...i.message,
            classNames: {
              content: i.status === 'loading' ? style.loadingMessage : '',
            },
            typing: i.status === 'loading' ? { step: 5, interval: 20, suffix: <>💗</> } : false,
          }))}
          roles={{
            assistant: {
              placement: 'start',
              footer: (
                <div style={{ display: 'flex' }}>
                  <Button type="text" size="small" icon={<ReloadOutlined />} />
                  <Button type="text" size="small" icon={<CopyOutlined />} />
                  <Button type="text" size="small" icon={<LikeOutlined />} />
                  <Button type="text" size="small" icon={<DislikeOutlined />} />
                </div>
              ),
              loadingRender: () => (
                <Space>
                  <Spin size="small" />
                  {AGENT_PLACEHOLDER}
                </Space>
              ),
            },
            user: { placement: 'end' },
          }}
        />
      ) : (
        /** 没有消息时的 welcome */
        <>
          <Welcome
            variant="borderless"
            title="👋 Hello, I'm Ant Design X"
            description="Base on Ant Design, AGI product interface solution, create a better intelligent vision~"
            className={style.chatWelcome}
          />

          <Prompts
            vertical
            title="I can help："
            items={MOCK_QUESTIONS.map((i) => ({ key: i, description: i }))}
            onItemClick={(info) => handleUserSubmit(info?.data?.description as string)}
            style={{
              marginInline: 16,
            }}
            styles={{
              title: { fontSize: 14 },
            }}
          />
        </>
      )}
    </div>
  );

  const sendHeader = (
    <Sender.Header
      title="Upload File"
      styles={{ content: { padding: 0 } }}
      open={attachmentsOpen}
      onOpenChange={setAttachmentsOpen}
      forceRender
    >
      <Attachments
        ref={attachmentsRef}
        beforeUpload={() => false}
        items={files}
        onChange={({ fileList }) => setFiles(fileList)}
        placeholder={(type) =>
          type === 'drop'
            ? { title: 'Drop file here' }
            : {
                icon: <CloudUploadOutlined />,
                title: 'Upload files',
                description: 'Click or drag files to this area to upload',
              }
        }
      />
    </Sender.Header>
  );

  const chatSender = (
    <div className={style.chatSend}>
      <div className={style.sendAction}>
        <Button
          icon={<ScheduleOutlined />}
          onClick={() => handleUserSubmit('What has Ant Design X upgraded?')}
        >
          Upgrades
        </Button>
        <Button
          icon={<ProductOutlined />}
          onClick={() => handleUserSubmit('What component assets are available in Ant Design X?')}
        >
          Components
        </Button>
        <Button icon={<AppstoreAddOutlined />}>More</Button>
      </div>

      {/** 输入框 */}
      <Suggestion items={MOCK_SUGGESTIONS} onSelect={(itemVal) => setInputValue(`[${itemVal}]:`)}>
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
            header={sendHeader}
            prefix={
              <Button
                type="text"
                icon={<PaperClipOutlined style={{ fontSize: 18 }} />}
                onClick={() => setAttachmentsOpen(!attachmentsOpen)}
              />
            }
            onPasteFile={onPasteFile}
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
    // history mock
    if (messages?.length) {
      setMessageHistory((prev) => ({
        ...prev,
        [curSession]: messages,
      }));
    }
  }, [messages]);

  return (
    <div className={style.copilotChat}>
      {/** 对话区 - header */}
      {chatHeader}

      {/** 对话区 - 消息列表 */}
      {chatList}

      {/** 对话区 - 输入框 */}
      {chatSender}
    </div>
  );

};

export default memo(Copilot);