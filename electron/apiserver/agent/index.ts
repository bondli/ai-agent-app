import 'dotenv/config';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { StateGraph, MessagesAnnotation, START, END, Command } from '@langchain/langgraph';
import { HumanMessage, AIMessage, isAIMessageChunk, isToolMessageChunk } from '@langchain/core/messages';

import llm from './llm';
import { prompt } from './prompt';
import { memory } from './memory';
import { askHuman } from './human';

import allTools from './tools';

// agent 执行器
export const agentExecutor = async () => {

  const tools = Object.values(allTools);

  // 工具节点
  const toolActionNode = new ToolNode([...tools]);

  // 绑定工具到模型
  const boundModel = llm.bindTools([...tools]);

  // 判断是否继续执行
  const shouldContinue = ({ messages }: typeof MessagesAnnotation.State) => {
    const lastMessage = messages[messages.length - 1] as AIMessage;

    if (lastMessage && !lastMessage.tool_calls?.length) {
      return END;
    }

    if (lastMessage.tool_calls?.[0]?.name === 'askHuman') {
      console.log('--- asking human ---');
      return 'askHuman';
    }
    
    return 'action';
  }

  // 调用模型
  const callModel = async (state: typeof MessagesAnnotation.State) => {
    const formattedPrompt = await prompt.formatMessages({
      time: new Date().toISOString(),
      tool_names: tools.map((tool) => tool.name).join(', '),
      messages: state.messages,
    });
    const response = await boundModel.invoke(formattedPrompt);
    return { messages: [response] };
  }

  // 工作流
  const workflow = new StateGraph(MessagesAnnotation)
    .addNode('agent', callModel)
    .addNode('action', toolActionNode)
    .addNode('askHuman', askHuman)
    .addEdge(START, 'agent')
    .addEdge('action', 'agent')
    .addEdge('askHuman', 'agent')
    .addConditionalEdges('agent', shouldContinue);

  return workflow.compile({ checkpointer: memory });

};

// 流式输出处理
export const streamAgentResponse = async (
  executor,
  input: string,
  options: {
    conversationId: string;
    action?: string;
    currentUserId?: string;
  },
  onToken: (token: string) => void
) => {
  const config = {
    configurable: {
      thread_id: options.conversationId,
      currentUserId: options.currentUserId, // 当前用户ID，从客户端会话的请求头中获取的，传递到智能体中
    },
    streamMode: 'messages',
  };

  let stream;

  // 用户反馈是"取消"的时候
  if (options.action === 'cancel') {
    // console.log('--- 用户反馈是取消 ---');
    stream = await executor.stream(
      new Command({ 
        resume: '用户取消了操作，请结束当前任务并给出总结。',
      }),
      config,
    );
  }
  // 用户反馈了信息
  else if (options.action === 'resume') {
    stream = await executor.stream(
      new Command({
        resume: input,
      }),
      config,
    );
  }
  // 正常会话
  else {
    stream = await executor.stream(
      { messages: [new HumanMessage(input)] },
      config,
    );
  }

  for await (const [message, _metadata] of stream) {
    if (isAIMessageChunk(message)) {
      onToken(message.content as string);
    }
    if (isToolMessageChunk(message)) {
      const output = `<tool_call>${message.name}__TOOLCALL__${message.content}</tool_call>`;
      onToken(output);
    }
  }

  //获取exector的状态，是否被打断中，并且打断的节点是askHuman的时候追加消息给到用户
  const state = await executor.getState(config);
  const { values, next: nextNodes } = state;
  const lastMessage = values.messages[values.messages.length - 1] as AIMessage;
  // 下个节点和tool_call的name是askHuman的时候，追加消息给到用户
  if (nextNodes && nextNodes[0] === 'askHuman' && lastMessage.tool_calls?.[0]?.name === 'askHuman') {
    const feedback = lastMessage.tool_calls?.[0].args.input;
    const feedbackContent = `<ask_human_input>${feedback}</ask_human_input>`;
    onToken(feedbackContent);
  }
};

export default {
  agentExecutor,
  streamAgentResponse,
};