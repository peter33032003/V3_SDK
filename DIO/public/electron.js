const { app, BrowserWindow } = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");

function createWindow() {
    // Create the browser window.
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        autoHideMenuBar: true, // Hide top menubar.
        webPreferences: {
            nodeIntegration: true
        }
    });

    // and load the index.html of the app.
    win.loadURL(
        isDev
        ? "http://localhost:3000"
        : `file://${path.join(__dirname, "../build/index.html")}`
    );
    // open devtool with ctrl+shift+i
    // remove devtools 
    //win.removeMenu();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// 有些 API 只能在這個事件發生後才能用。
app.whenReady().then(createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", () => {
    // 在 macOS 中，一般會讓應用程式及選單列繼續留著，
    // 除非使用者按了 Cmd + Q 確定終止它們
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    // 在 macOS 中，一般會在使用者按了 Dock 圖示
    // 且沒有其他視窗開啟的情況下，
    // 重新在應用程式裡建立視窗。
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});