import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { exec } from 'child_process';
import logger from 'electron-log';


const fetchMcpServer = new McpServer({
  name: 'fetch-mcp',
  version: '1.0.0',
});

fetchMcpServer.tool(
  'fetchUrlContent',
  '获取URL/网页/页面/地址的内容',
  {
    url: z.string().describe('URL'),
  },
  async ({ url }) => {
    logger.info('[mcp-server] 获取URL/网页/页面/地址的内容', url);
    const result = {
      title: '',
      description: '',
      url,
    };

    try {
      // 通过curl获取url内容
      const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36';
      const cmd = `curl -s -L -A "${userAgent}" -H "Accept: text/html" --max-time 15 "${url}"`;
      const output: string = await new Promise((resolve, reject) => {
        exec(cmd, { maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
          if (error) {
            reject(stderr || error.message);
          } else {
            resolve(stdout);
          }
        });
      });
      // 从output中提取title
      result.title = output.match(/<title>(.*?)<\/title>/)?.[1] || '';
      // 从output中提取description
      result.description = output.match(/<meta name="description" content="(.*?)"/)?.[1] || '';

      // 如果上述提取失败，则尝试从 `<meta property="og:title" content="..." />` 中提取title
      if (!result.title || !result.description) {
        result.title = output.match(/<meta property="og:title" content="(.*?)" \/>/)?.[1] || '';
        result.description = output.match(/<meta property="og:description" content="(.*?)" \/>/)?.[1] || '';
        return {
          content: [{ type: "text", text: `${JSON.stringify(result)}` }],
        };
      }
      return {
        content: [{ type: "text", text: `${JSON.stringify(result)}` }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `${JSON.stringify(error)}` }],
        isError: true,
      };
    }
  }
);

export default fetchMcpServer;