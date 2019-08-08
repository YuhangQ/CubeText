"use strict";
exports.__esModule = true;
var electron_1 = require("electron");
var AppMenu = require("./models/AppMenu");
var mainWindow;
exports.mainWindow = mainWindow;
electron_1.app.setName("cubetext");
function createWindow() {
    exports.mainWindow = mainWindow = new electron_1.BrowserWindow({
        width: 800,
        height: 600
    });
    mainWindow.loadURL("file://" + __dirname + "/../views/index.html");
    //mainWindow.webContents.openDevTools();
    AppMenu.createMenu();
    mainWindow.show();
}
electron_1.app.on("ready", createWindow);
electron_1.app.on('window-all-closed', function () {
    //if (process.platform !== 'darwin') app.quit()
    electron_1.app.quit();
});
electron_1.app.on('activate', function () {
    if (mainWindow === null)
        createWindow();
});
electron_1.ipcMain.on('datapath', function (event) {
    event.returnValue = electron_1.app.getPath("appData");
});
electron_1.ipcMain.on('devtools', function (event) {
    if (mainWindow.webContents.isDevToolsOpened()) {
        mainWindow.webContents.closeDevTools();
    }
    else {
        mainWindow.webContents.openDevTools();
    }
});
