"use strict";
exports.__esModule = true;
/// <reference path="../../node_modules/monaco-editor/monaco.d.ts" />
var electron_1 = require("electron");
var editor;
var input;
var output;
amdRequire(['vs/editor/editor.main'], function () {
    electron_1.ipcRenderer.sendToHost("editor-loading");
});
/**
 * 初始化文本
 */
electron_1.ipcRenderer.on("set", function (event, content) {
    editor = monaco.editor.create(document.getElementById('container'), {
        value: content,
        language: 'cpp',
        automaticLayout: true,
        theme: "vs-dark"
    });
    editor.onDidChangeCursorPosition(function (e) {
        document.getElementById("line-info").innerText = "行 " + e.position.lineNumber + ", 列 " + e.position.column;
    });
    editor.onDidChangeModelContent(function () {
        electron_1.ipcRenderer.sendToHost("text-change");
    });
    input = monaco.editor.create(document.getElementById('input'), {
        automaticLayout: true,
        theme: "vs-dark",
        minimap: { enabled: false },
        lineNumbersMinChars: 3,
        lineDecorationsWidth: 0,
        hideCursorInOverviewRuler: true,
        overviewRulerBorder: false,
        disableLayerHinting: true,
        selectionHighlight: false
    });
    output = monaco.editor.create(document.getElementById('output'), {
        automaticLayout: true,
        theme: "vs-dark",
        minimap: { enabled: false },
        lineNumbersMinChars: 3,
        lineDecorationsWidth: 0,
        hideCursorInOverviewRuler: true,
        overviewRulerBorder: false,
        disableLayerHinting: true,
        selectionHighlight: false,
        readOnly: true
    });
});
document.getElementById("lang").onmouseenter = function () {
    document.getElementById("lang").style.backgroundColor = "#177ec4";
};
document.getElementById("lang").onmouseleave = function () {
    document.getElementById("lang").style.backgroundColor = "#0063a6";
};
document.getElementById("encoding").onmouseenter = function () {
    document.getElementById("encoding").style.backgroundColor = "#177ec4";
};
document.getElementById("encoding").onmouseleave = function () {
    document.getElementById("encoding").style.backgroundColor = "#0063a6";
};
document.getElementById("kill").onmouseenter = function () {
    document.getElementById("kill").style.backgroundColor = "#177ec4";
};
document.getElementById("kill").onmouseleave = function () {
    document.getElementById("kill").style.backgroundColor = "#0063a6";
};
document.getElementById("kill").onmouseup = function () {
    electron_1.ipcRenderer.sendToHost("kill");
};
electron_1.ipcRenderer.on("get", function (event) {
    electron_1.ipcRenderer.sendToHost("content", editor.getValue());
});
var buf = "";
electron_1.ipcRenderer.on("output", function (event, txt) {
    buf += txt;
});
function foutput() {
    if (buf.length > 50000) {
        electron_1.ipcRenderer.sendToHost("outlimit");
    }
    if (buf != "") {
        output.setValue(output.getValue() + buf);
        output.revealLine(1000000000000);
        buf = "";
    }
}
setInterval(foutput, 1000);
electron_1.ipcRenderer.on("flashOutput", function (event) {
    foutput();
});
electron_1.ipcRenderer.on("cprun", function (event) {
    electron_1.ipcRenderer.sendToHost("cprun", input.getValue());
});
electron_1.ipcRenderer.on("clear", function (event) {
    output.setValue("");
});
electron_1.ipcRenderer.on("hide", function (event) {
    document.getElementById("input").hidden = true;
    document.getElementById("output").hidden = true;
    document.getElementById("liney").hidden = true;
    document.getElementById("container").style.height = "calc(100vh - 20px)";
});
electron_1.ipcRenderer.on("show", function (event) {
    document.getElementById("input").hidden = false;
    document.getElementById("output").hidden = false;
    document.getElementById("liney").hidden = false;
    document.getElementById("container").style.height = "50vh";
});
electron_1.ipcRenderer.on("font-larger", function (event) {
    editor.updateOptions({
        fontSize: editor.getConfiguration().fontInfo.fontSize + 1
    });
    input.updateOptions({
        fontSize: editor.getConfiguration().fontInfo.fontSize + 1
    });
    output.updateOptions({
        fontSize: editor.getConfiguration().fontInfo.fontSize + 1
    });
});
electron_1.ipcRenderer.on("font-smaller", function (event) {
    editor.updateOptions({
        fontSize: editor.getConfiguration().fontInfo.fontSize - 1
    });
    input.updateOptions({
        fontSize: editor.getConfiguration().fontInfo.fontSize - 1
    });
    output.updateOptions({
        fontSize: editor.getConfiguration().fontInfo.fontSize - 1
    });
});
var icon = document.getElementById("svg-icon");
var text = document.getElementById("run-info");
var kill = document.getElementById("kill");
electron_1.ipcRenderer.on("waiting", function (event, message) {
    text.innerText = message;
    icon.setAttribute("src", "../styles/hourglass.svg");
    kill.hidden = !(message == "正在运行...");
});
electron_1.ipcRenderer.on("warning", function (event, message) {
    text.innerText = message;
    icon.setAttribute("src", "../styles/warning.svg");
    kill.hidden = true;
});
electron_1.ipcRenderer.on("error", function (event, message) {
    text.innerText = message;
    icon.setAttribute("src", "../styles/cancel.svg");
    kill.hidden = true;
});
electron_1.ipcRenderer.on("success", function (event, message) {
    text.innerText = message;
    icon.setAttribute("src", "../styles/checked.svg");
    kill.hidden = true;
});
electron_1.ipcRenderer.on("ifkill", function (event, time) {
    if (text.innerText == "正在运行...") {
        icon.setAttribute("src", "../styles/cancel.svg");
        text.innerText = "被强行杀死.";
        kill.hidden = true;
    }
});
