"use strict";
exports.__esModule = true;
var electron_1 = require("electron");
function createMenu() {
    var template = [];
    // Edit Menu
    template.push({
        label: 'Edit',
        submenu: [
            { role: 'undo' },
            { role: 'redo' },
            { type: 'separator' },
            { role: 'cut' },
            { role: 'copy' },
            { role: 'paste' },
            { role: 'pasteandmatchstyle' },
            { role: 'delete' },
            { role: 'selectall' }
        ]
    });
    // View Menu
    template.push({
        label: 'View',
        submenu: [
            { role: 'reload' },
            { role: 'forcereload' },
            { role: 'toggledevtools' },
            { type: 'separator' },
            { role: 'resetzoom' },
            { role: 'zoomin' },
            { role: 'zoomout' },
            { type: 'separator' },
            { role: 'togglefullscreen' }
        ]
    });
    // Windown menu
    template.push({
        role: 'window',
        submenu: [{ role: 'minimize' }, { role: 'close' }]
    });
    // Help menu
    template.push({
        role: 'help',
        submenu: [
            {
                label: 'Learn More',
                click: function () {
                    require('electron').shell.openExternal('https://electron.atom.io');
                }
            }
        ]
    });
    if (process.platform === 'darwin') {
        template.unshift({
            label: electron_1.app.getName(),
            submenu: [
                { role: 'about' },
                { type: 'separator' },
                { role: 'services', submenu: [] },
                { type: 'separator' },
                { role: 'hide' },
                { role: 'hideothers' },
                { role: 'unhide' },
                { type: 'separator' },
                { role: 'quit' }
            ]
        });
        // Edit menu
        template[1].submenu.push({ type: 'separator' }, { label: 'Speech', submenu: [{ role: 'startspeaking' }, { role: 'stopspeaking' }] });
        // Window menu
        template[3].submenu = [{ role: 'close' }, { role: 'minimize' }, { role: 'zoom' }, { type: 'separator' }, { role: 'front' }];
    }
    var menu = electron_1.Menu.buildFromTemplate(template);
    electron_1.Menu.setApplicationMenu(menu);
}
exports.createMenu = createMenu;
