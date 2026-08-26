import { contextBridge, ipcRenderer } from 'electron';

// The renderer only ever calls send, sendSync and on. Exposing the whole
// ipcRenderer across the bridge would hand the page arbitrary IPC, so this
// forwards just those three.
const api = {
  send: (channel, ...args) => ipcRenderer.send(channel, ...args),
  sendSync: (channel, ...args) => ipcRenderer.sendSync(channel, ...args),
  on: (channel, listener) => {
    const subscription = (event, ...args) => listener(event, ...args);
    ipcRenderer.on(channel, subscription);
    return () => ipcRenderer.removeListener(channel, subscription);
  },
};

contextBridge.exposeInMainWorld('electronIPC', api);
