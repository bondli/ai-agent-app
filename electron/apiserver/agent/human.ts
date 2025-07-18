import { AIMessage, ToolMessage } from '@langchain/core/messages';
import { interrupt, MessagesAnnotation } from '@langchain/langgraph';


// 获取用户反馈
export const askHuman = (_state: typeof MessagesAnnotation.State) => {
  console.log('--- askHuman called ---');
  const lastMessage = _state.messages[_state.messages.length - 1] as AIMessage;
  const toolCallId = lastMessage.tool_calls?.[0].id;
  
  // 使用 interrupt 暂停执行并等待用户输入
  const feedback: string = interrupt({
    question: '请提供你的反馈:',
  });
  
  console.log('--- user feedback received ---', feedback);
  
  // 创建工具消息返回用户反馈
  const feedbackMessage = new ToolMessage({
    tool_call_id: toolCallId!,
    name: 'humanFeedback',
    content: feedback,
  });
  
  return { messages: [feedbackMessage] };
};