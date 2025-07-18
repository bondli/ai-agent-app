import { ChatOllama } from '@langchain/ollama';

const llm = new ChatOllama({
  baseUrl: process.env.MODEL_BASE_URL,
  model: process.env.MODEL_NAME,
  temperature: 0.7,
});

export default llm;