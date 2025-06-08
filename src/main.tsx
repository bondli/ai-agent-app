import React from 'react';
import { createRoot } from 'react-dom/client';
import { App, ConfigProvider, notification } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

// 配置 dayjs 时区
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('zh-cn');
dayjs.tz.setDefault('Asia/Shanghai');

import { MainProvider } from '@common/context';

import AppContainer from './App';

import 'antd/dist/reset.css';

dayjs.locale('zh-cn');

notification.config({
  placement: 'topRight',
  top: 20,
  duration: 3,
  rtl: false,
});

// 以下配置是开发环境使用stagewise，便于cursor快速调整UI
// import { initToolbar, type ToolbarConfig } from '@stagewise/toolbar';

// const stagewiseConfig: ToolbarConfig = {
//   plugins: [],
// };

// function setupStagewise() {
//   if (import.meta.env.DEV) {
//     initToolbar(stagewiseConfig);
//   }
// }

// setupStagewise();

const root = createRoot(document.getElementById('root'));
root.render(
  <App>
    <ConfigProvider
      locale={zhCN}
      input={{ autoComplete: 'off' }}
      theme={{
        token: {
          colorPrimary: '#18181b',
          colorPrimaryActive: 'rgb(24 24 27 / 80%)',
          colorPrimaryHover: 'rgb(24 24 27 / 80%)',
          borderRadius: 6,
        },
        components: {
          Menu: {
            itemHeight: 36,
            itemSelectedColor: 'white',
            itemSelectedBg: '#18181b',
          },
          Button: {
            contentFontSizeSM: 12,
            primaryShadow: '0',
          }
        },
      }}
    >
      <MainProvider>
        <AppContainer />
      </MainProvider>
    </ConfigProvider>
  </App>,
);