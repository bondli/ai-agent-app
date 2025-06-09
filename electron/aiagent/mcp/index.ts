import { MCPConfiguration } from '@voltagent/core';

const mcpConfig = new MCPConfiguration({
  servers: {
    // 新增本地HTTP类型的MCP server
    'note-mcp': {
      type: 'http',
      url: process.env.MCP_SERVER_URL || '',
      // 可选：可配置headers、认证等
      requestInit: {
        headers: {
          'X-From': 'AI-Agent-Client',
          'X-User-Id': '1',
        },
      },
    },
    'fetch-mcp': {
      type: 'stdio',
      command: 'npx',
      args: ['-y', 'fetch-content-mcp', '--sse'],
    }
  },
});

export default mcpConfig;