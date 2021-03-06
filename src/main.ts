import { app, BrowserWindow, ipcMain, nativeImage } from "electron";
import * as AppMenu from "./models/AppMenu";
import { Console } from "./models/Console";
import * as path from "path";

let mainWindow: BrowserWindow;
let snippetWindow: BrowserWindow;
let saved: Boolean = false;

app.setName("CubeText 内测版 QQ群:688453192");

function createWindow() {
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        },
        width: 800,
        height: 600
    });
    mainWindow.loadURL(`file://${__dirname}/../views/index.html`);
    //mainWindow.webContents.openDevTools();
    AppMenu.createMenu();
    mainWindow.show();

    mainWindow.on("close", (event)=> {
        if(saved) return;
        event.preventDefault();
        mainWindow.webContents.send("close-save-all");
    })
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
    if (mainWindow.webContents.isDevToolsOpened()) {
        mainWindow.webContents.closeDevTools();
    } else {
        mainWindow.webContents.openDevTools();
    }
})

ipcMain.on('drag', (event, file) => {
    mainWindow.webContents.send("drag", file);
});

ipcMain.on("snippets", (event) => {
    if(snippetWindow != null) return;
    snippetWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        },
        width: 400,
        height: 100,
        //resizable: false,
        parent: mainWindow
    });
    snippetWindow.loadURL(`file://${__dirname}/../views/snippets.html`);
    //snippetWindow.webContents.openDevTools();
    snippetWindow.show();
});

ipcMain.on("newSnippet", (event, name)=>{
    mainWindow.webContents.send("newSnippet", name);
    snippetWindow.close();
})

ipcMain.on('close-save-all', (event, file) => {
    saved = true;
    mainWindow.close();
});

export { mainWindow };