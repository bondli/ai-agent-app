import * as path from 'path';
import { defineConfig } from 'vite';
import reactPlugin from '@vitejs/plugin-react';
import electronPlugin from 'vite-plugin-electron';
import eslint from 'vite-plugin-eslint';

// eslint-disable-next-line no-undef
const getPath = (_path) => path.resolve(__dirname, _path);

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  console.table({ command, mode, NODE_ENV: process.env.NODE_ENV });
  
  const pluginsConfig = [
    eslint({
      fix: true,
    }),
    reactPlugin(),
  ];
  if (mode === 'electron') {
    pluginsConfig.push(
      electronPlugin({
        main: {
          entry: 'electron/main.ts', // 主进程文件
        },
        preload: {
          // eslint-disable-next-line no-undef
          input: path.join(__dirname, 'electron', 'preload.ts'), // 预加载文件
        },
      }),
    );
  }
  return {
    root: path.resolve(__dirname),
    base: './',
    build: {
      target: 'modules',
      outDir: 'dist',
      assetsDir: 'assets',
      // vite 3.0.0+ 需要安装 terser
      minify: 'terser',
      terserOptions: {
        // 生产环境去除 console
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
    },
    // 作为静态资源服务的文件夹，并且始终按原样提供或复制而无需进行转换。
    publicDir: getPath('public'),
    resolve: {
      alias: {
        '@': getPath('src'),
        '@public': getPath('public'),
        '@common': getPath('src/common'),
        '@components': getPath('src/components'),
        '@modules': getPath('src/modules'),
      },
    },
    server: {
      cors: true,
      open: false,
      hmr: true,
      host: true,
      port: 3000,
    },
    css: {
      modules: {
        localsConvention: 'camelCaseOnly',
      },
      preprocessorOptions: {
        less: {
          // 这里可以添加LESS的全局变量等配置
        },
      },
    },
    plugins: pluginsConfig,
  };
});