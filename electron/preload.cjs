const { contextBridge } = require('electron')

contextBridge.exposeInMainWorld('desktopEnv', {
  isElectron: true
})
