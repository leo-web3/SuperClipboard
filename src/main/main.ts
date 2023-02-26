import path from 'path';
import { app, BrowserWindow, shell, ipcMain, Tray, globalShortcut, clipboard } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let appTray = null;
let mainWindow: BrowserWindow | null = null;

if (process.env.NODE_ENV === 'production') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('electron-debug')();
}

const installExtensions = async () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 260,
    height: 380,
    minWidth: 260,
    minHeight: 380,
    maxWidth: 260,
    maxHeight: 380,
    useContentSize: false,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  appTray = new Tray(getAssetPath('icons/16x16.png')); // app.ico是app目录下的ico文件
  appTray.setToolTip('Super Clipboard');

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

const items:string[] = [];
ipcMain.on('ipc-messages', async (_event, [value, index]) => {
  items[index] = value;
});
ipcMain.on('ipc-start', async (_event, [onoff]) => {
  if (onoff) {
    Array(10).fill(0).forEach((_, i) => {
      const ret = globalShortcut.register(`CommandOrControl+${i}`, () => {
        clipboard.writeText(items[i] || "")
      })
      if (!ret) {console.log('Shortcut registration failed')}
      // console.log(globalShortcut.isRegistered(`CommandOrControl+${i}`))
    })
  } else {
    Array(10).fill(0).forEach((_, i) => {
      // console.log(`unregister CommandOrControl+${i}`)
      globalShortcut.unregister(`CommandOrControl+${i}`)
    })
  }
})
ipcMain.on("ipc-copy", async (_event, [index]) => {
  clipboard.writeText(items[index] || "")
})
app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
    globalShortcut.unregisterAll()
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})
app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);


