import { contextBridge, ipcRenderer } from 'electron';

/*
 * 导出给到渲染进程可以使用的bridge
 * 渲染进程中的调用示例代码：
 * const win: any = window;
 * const ipcRenderer = win.electron?.ipcRenderer;
 * ipcRenderer.setStoreValue('key', 'value');
 */
contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    // 写缓存
    setStoreValue: (key, value) => {
      ipcRenderer.send('setStore', key, value);
    },

    // 读缓存
    getStoreValue(key) {
      const resp = ipcRenderer.sendSync('getStore', key);
      return resp;
    },

    // 删除缓存
    deleteStore(key) {
      ipcRenderer.send('deleteStore', key);
    },

    // 采集日志
    userLog(msg) {
      ipcRenderer.send('userLog', msg);
    },
  },
});