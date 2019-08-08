/// <reference path="../../node_modules/monaco-editor/monaco.d.ts" />
import { remote, ipcRenderer } from "electron";
import { Console } from "../models/Console";
import { SSL_OP_CRYPTOPRO_TLSEXT_BUG } from "constants";

declare var amdRequire;
var editor: monaco.editor.IStandaloneCodeEditor;
var input: monaco.editor.IStandaloneCodeEditor;
var output: monaco.editor.IStandaloneCodeEditor;

amdRequire(['vs/editor/editor.main'], () => {
    ipcRenderer.sendToHost("editor-loading");
});

/**
 * 初始化文本
 */
ipcRenderer.on("set", (event, content) => {
    editor = monaco.editor.create(document.getElementById('container'), {
        value: content,
        language: 'cpp',
        automaticLayout: true,
        theme: "vs-dark",
        
    });
    editor.onDidChangeCursorPosition((e)=>{
        document.getElementById("line-info").innerText = "行 " + e.position.lineNumber + ", 列 " + e.position.column;
    });
    editor.onDidChangeModelContent(()=>{
        ipcRenderer.sendToHost("text-change");
    });

    input = monaco.editor.create(document.getElementById('input'), {
        automaticLayout: true,
        theme: "vs-dark",
        minimap: {enabled: false},
        lineNumbersMinChars: 3,
        lineDecorationsWidth: 0,
        hideCursorInOverviewRuler: true,
        overviewRulerBorder: false,
        disableLayerHinting: true,
        selectionHighlight: false,
    });
    output = monaco.editor.create(document.getElementById('output'), {
        automaticLayout: true,
        theme: "vs-dark",
        minimap: {enabled: false},
        lineNumbersMinChars: 3,
        lineDecorationsWidth: 0,
        hideCursorInOverviewRuler: true,
        overviewRulerBorder: false,
        disableLayerHinting: true,
        selectionHighlight: false,
        readOnly: true
    });
});


document.getElementById("lang").onmouseenter = () => {
    document.getElementById("lang").style.backgroundColor = "#177ec4"
};
document.getElementById("lang").onmouseleave = () => {
    document.getElementById("lang").style.backgroundColor = "#0063a6"
};

document.getElementById("encoding").onmouseenter = () => {
    document.getElementById("encoding").style.backgroundColor = "#177ec4"
};
document.getElementById("encoding").onmouseleave = () => {
    document.getElementById("encoding").style.backgroundColor = "#0063a6"
};

document.getElementById("kill").onmouseenter = () => {
    document.getElementById("kill").style.backgroundColor = "#177ec4"
};
document.getElementById("kill").onmouseleave = () => {
    document.getElementById("kill").style.backgroundColor = "#0063a6"
};

document.getElementById("kill").onmouseup = () => {
    ipcRenderer.sendToHost("kill");
};


ipcRenderer.on("get", (event)=>{
    ipcRenderer.sendToHost("content", editor.getValue());
});

let buf = "";
ipcRenderer.on("output", (event, txt)=>{
    buf += txt;
});
function foutput() {
    if(buf.length > 50000) {
        ipcRenderer.sendToHost("outlimit");
    }
    if(buf != "") {
        output.setValue(output.getValue() + buf);
        output.revealLine(1000000000000);
        buf = "";
    }
}
setInterval(foutput, 1000);
ipcRenderer.on("flashOutput", (event)=>{
    foutput();
});

ipcRenderer.on("cprun", (event)=>{
    ipcRenderer.sendToHost("cprun", input.getValue());
});
ipcRenderer.on("clear", (event)=>{
    output.setValue("");
});
ipcRenderer.on("hide", (event)=>{
    document.getElementById("input").hidden = true;
    document.getElementById("output").hidden = true;
    document.getElementById("liney").hidden = true;
    document.getElementById("container").style.height = "calc(100vh - 20px)";
});
ipcRenderer.on("show", (event)=>{
    document.getElementById("input").hidden = false;
    document.getElementById("output").hidden = false;
    document.getElementById("liney").hidden = false;
    document.getElementById("container").style.height = "50vh";
});
ipcRenderer.on("font-larger", (event)=>{
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
ipcRenderer.on("font-smaller", (event)=>{
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
let icon = document.getElementById("svg-icon");
let text = document.getElementById("run-info");
let kill = document.getElementById("kill");
ipcRenderer.on("waiting", (event, message)=> {
    text.innerText = message;
    icon.setAttribute("src" ,"../styles/hourglass.svg");
    kill.hidden = !(message == "正在运行...");
});
ipcRenderer.on("warning", (event, message)=> {
    text.innerText = message;
    icon.setAttribute("src" ,"../styles/warning.svg");
    kill.hidden = true;
});
ipcRenderer.on("error", (event, message)=> {
    text.innerText = message;
    icon.setAttribute("src" ,"../styles/cancel.svg");
    kill.hidden = true;
});
ipcRenderer.on("success", (event, message)=> {
    text.innerText = message;
    icon.setAttribute("src" ,"../styles/checked.svg");
    kill.hidden = true;
});

ipcRenderer.on("ifkill", (event, time)=>{
    if(text.innerText == "正在运行...") {
        icon.setAttribute("src" ,"../styles/cancel.svg");
        text.innerText = "被强行杀死.";
        kill.hidden = true;
    }
})