import { LibSQLStorage } from '@voltagent/core';
import path from 'path';

const defaultDatabasePath = path.join('/Users/bondli/Library/Application Support/ai-agent-app/Local Storage/memory.db');

const memoryStorage = new LibSQLStorage({
  // Required: Connection URL
  url: process.env.DATABASE_URL || `file:${defaultDatabasePath}`,

  // Optional: Prefix for database table names
  tablePrefix: 'my_agent_memory', // Defaults to 'voltagent_memory'

  // Optional: Storage limit (max number of messages per user/conversation)
  // storageLimit: 100, // Defaults to 100

  // Optional: Enable debug logging for the storage provider
  // debug: true, // Defaults to false
});

export default memoryStorage;