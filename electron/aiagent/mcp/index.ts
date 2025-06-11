import { MCPConfiguration } from '@voltagent/core';

// 可选：可配置headers、认证等
const requestInit = {
  headers: {
    'X-From': 'AI-Agent-Client',
    'X-User-Id': '1',
  },
};

const mcpConfig = new MCPConfiguration({
  servers: {
    // 新增本地HTTP类型的MCP server
    'note-mcp': {
      type: 'http',
      url: `${process.env.MCP_BASE_URL}/note-mcp` || `http://localhost:9587/mcp/note-mcp`,
      requestInit,
    },
    'fetch-mcp': {
      type: 'http',
      url: `${process.env.MCP_BASE_URL}/fetch-mcp` || `http://localhost:9587/mcp/fetch-mcp`,
      requestInit,
    }
  },
});

export default mcpConfig;
