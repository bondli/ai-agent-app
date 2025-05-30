import 'dotenv/config';
import { VoltAgent, Agent } from '@voltagent/core';
import { VercelAIProvider } from '@voltagent/vercel-ai'; // Example provider
import { openai } from '@ai-sdk/openai'; // Example model

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OpenAI API key is missing. Please set the OPENAI_API_KEY environment variable.');
}

// Define a simple agent
const agent = new Agent({
  name: 'my-agent',
  instructions: 'A helpful assistant that answers questions without using tools',
  // Note: You can swap VercelAIProvider and openai with other supported providers/models
  llm: new VercelAIProvider(),
  model: openai('gpt-4o-mini'),
});

// Initialize VoltAgent with your agent(s)
new VoltAgent({
  agents: {
    agent,
  },
});

if (typeof process.send === 'function') {
  process.send({ type: 'server-started', port: 3141 });
}