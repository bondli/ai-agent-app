import * as path from 'path';
import * as fs from 'fs';
import { app, ipcMain, BrowserWindow, globalShortcut } from 'electron';
import { fork } from 'child_process';
import Store from 'electron-store';
import logger from 'electron-log';
import * as dotenv from 'dotenv';

// 强制设置环境变量
process.env.NODE_ENV = process.env.ELECTRON_ENV || process.env.NODE_ENV || 'production';

// file position on macOS: ~/Library/Logs/{app name}/main.log
// file position on windows: C:\Users\Administrator\AppData\Roaming\{app name}\main.log
logger.transports.file.fileName = 'main.log';
logger.transports.file.level = 'info';
logger.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}]{scope} {text}';
logger.transports.file.maxSize = 10 * 1024 * 1024; // 10MB，超过后自动归档

// 载入配置文件
function loadEnv() {
  // 生产环境优先 Resources/.env
  const envPathResource = path.join(process.resourcesPath, '..', '.env');
  // 开发环境优先 cwd/.env
  const envPathCwd = path.join(process.cwd(), '.env');
  let envPath = '';

  if (fs.existsSync(envPathResource)) {
    envPath = envPathResource;
  } else if (fs.existsSync(envPathCwd)) {
    envPath = envPathCwd;
  }

  if (envPath) {
    dotenv.config({ path: envPath });
  }
  // logger.info('envPath:', envPathResource, envPath, process.env.DB_HOST);
}

// 数据持久化
const store = new Store();

// 通过bridge的方式开放给渲染进程的功能
const initIpcRenderer = () => {
  ipcMain.on('setStore', (_, key, value) => {
    store.set(key, value);
  });

  ipcMain.on('getStore', (_, key) => {
    const value = store.get(key);
    _.returnValue = value || '';
  });

  ipcMain.on('deleteStore', (_, key) => {
    store.delete(key);
    _.returnValue = '';
  });

  // 打日志
  ipcMain.on('userLog', (_, message) => {
    logger.info(message);
  });

};

// 定义ipcRenderer监听事件
initIpcRenderer();

// 启动ApiServer服务器
let apiServerStatus = '';
let apiServerChild: any = null;
const startApiServer = () => {
  logger.info('[Main Process] API Server will be start');

  apiServerChild = fork(path.join(__dirname, 'apiserver', 'index'), [], {
    env: {
      ...process.env,
      NODE_ENV: process.env.NODE_ENV || 'production',
    },
  });

  apiServerChild.on('error', (err) => {
    logger.info('[Main Process] API Server error:', err);
  });

  apiServerChild.on('message', (data) => {
    logger.info('[Main Process] API Server stdout: ' , data);
    apiServerStatus = 'success';
  });

  apiServerChild.on('exit', (code, signal) => {
    logger.info('[Main Process] API Server exit code: ', code);
    logger.info('[Main Process] API Server exit signal: ', signal);
  });

  apiServerChild.unref();
};

//on parent process exit, terminate child process too.
process.on('exit', () => {
  apiServerChild.kill();
});

let mainWindow: any = null;

const createWindow = () => {
  logger.info('[Main Process] main window will be create');
  mainWindow = new BrowserWindow({
    title: 'AI Agent',
    center: true,
    autoHideMenuBar: true,
    resizable: true,
    width: 1280,
    height: 800,
    minWidth: 1000,
    minHeight: 720,
    webPreferences: {
      webSecurity: false,
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false, // 禁用 nodeIntegration 以配合 contextIsolation
      contextIsolation: true, // 启用上下文隔离
    },
  });

  const openWin = () => {
    if (!app.isPackaged) {
      mainWindow.loadURL('http://localhost:3000/');
    } else {
      mainWindow.loadFile('dist/index.html').catch(() => null);
      mainWindow.setMenuBarVisibility(false); // 设置菜单栏不可见
      mainWindow.menuBarVisible = false;
    }
    logger.info('[Main Process] main window is showed');
  };

  // 服务起来之后再打开界面，否则出现加载不到数据，延迟100ms来检查
  if (apiServerStatus === 'success') {
    logger.info('[Main Process] server is startup before main window create');
    openWin();
  } else {
    let timer = 0;
    const t = setInterval(() => {
      timer ++;
      // 5s之后服务还没有起来了，结束轮询，前台报错提示就好
      if (apiServerStatus === 'success' || timer >= 50) {
        openWin();
        timer = 0;
        clearInterval(t);
      }
    }, 100);
  }  

  // 关闭 window 时触发下列事件
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

// 绑定 ready 方法，当 electron 应用创建成功时，创建一个窗口。
app.whenReady().then(() => {
  logger.info('[Main Process] app is ready');
  if (!app.isPackaged) {
    globalShortcut.register('CommandOrControl+Alt+D', () => {
      mainWindow.webContents.isDevToolsOpened()
        ? mainWindow.webContents.closeDevTools()
        : mainWindow.webContents.openDevTools();
    });
  }

  loadEnv();

  startApiServer();

  createWindow();

  if (!mainWindow.isFocused()) {
    mainWindow.focus();
  }

  // 绑定 activate 方法，当 electron 应用激活时，创建一个窗口。这是为了点击关闭按钮之后从 dock 栏打开。
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
    // macOS 中点击 Dock 图标时没有已打开的其余应用窗口时，则通常在应用中重建一个窗口。
    if (mainWindow === null) {
      createWindow();
    }
  });
});

// 绑定关闭方法，当 electron 应用关闭时，退出 electron 。 macos 系统因为具有 dock 栏机制，可选择不退出。
app.on('window-all-closed', () => {
  // macOS 中除非用户按下 `Cmd + Q` 显式退出，否则应用与菜单栏始终处于活动状态。
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    // 当运行第二个实例时，将会聚焦到 mainWindow 这个窗口。
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.focus();
      mainWindow.show();
    }
  });
}