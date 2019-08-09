import { app, BrowserWindow, ipcMain } from "electron";
import * as AppMenu from "./models/AppMenu";
import { Console } from "./models/Console";

let mainWindow: BrowserWindow;

app.setName("cubetext");

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600
    });
    mainWindow.loadURL(`file://${__dirname}/../views/index.html`);
    //mainWindow.webContents.openDevTools();
    AppMenu.createMenu();
    mainWindow.show();
}

app.on("ready", createWindow);

app.on('window-all-closed', function () {
    //if (process.platform !== 'darwin') app.quit()
    app.quit();
})

app.on('activate', function () {
    if (mainWindow === null) createWindow()
})

ipcMain.on('datapath', (event) => {
    event.returnValue = app.getPath("appData");
}) 
ipcMain.on('devtools', (event) => {
    if(mainWindow.webContents.isDevToolsOpened()) {
        mainWindow.webContents.closeDevTools();
    } else {
        mainWindow.webContents.openDevTools();
    }
}) 



export { mainWindow };