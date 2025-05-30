/**
 * Eletron.js
 * 封装了 web 与 electron 的通信
 */

const win: any = window;

const isInElectron = navigator.userAgent.toLowerCase().indexOf(' electron/') > -1;
const ipcRenderer = win.electron?.ipcRenderer || {};

export const setStore = (key, value) => {
  if (!isInElectron) {
    win.localStorage.setItem(key, value);
    return;
  }
  ipcRenderer.setStoreValue(key, value);
}

export const getStore = (key) => {
  if (!isInElectron) {
    return win.localStorage.getItem(key);
  }
  return ipcRenderer.getStoreValue(key);
}

export const deleteStore = (key) => {
  if (!isInElectron) {
    win.localStorage.removeItem(key);
    return;
  }
  ipcRenderer.deleteStore(key);
}

// 打日志
export const userLog = (msg: any, msgData?: any) => {
  msgData ? console.log(msg, msgData) : console.log(msg);
  
  let outMsg = typeof msg === 'string' ? msg : JSON.stringify(msg);
  if (msgData) {
    outMsg += ` ${typeof msgData === 'string' ? msgData : JSON.stringify(msgData)}`;
  }
  ipcRenderer?.userLog?.(outMsg);
}

const ElectronBridge = {
  setStore,
  getStore,
  deleteStore,
  userLog,
};

export default ElectronBridge;