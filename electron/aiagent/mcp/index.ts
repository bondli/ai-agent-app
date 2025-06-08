import { MCPConfiguration } from '@voltagent/core';

// Create MCP Configuration with multiple types of servers
const mcpConfig = new MCPConfiguration({
  servers: {
    // 新增本地HTTP类型的MCP server
    'my-mcp-server': {
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
  },
});

export default mcpConfig;