"use strict";const n=require("electron"),t=require("path"),p=require("fs");process.env.ELECTRON_DISABLE_SECURITY_WARNINGS="true";const w=t.resolve(__dirname,"../dist"),f=process.env.VITE_DEV_SERVER_URL?t.resolve(__dirname,"../public"):w,_=t.resolve(__dirname,"preload.js"),S=t.resolve(w,"index.html");n.app.disableHardwareAcceleration();const l=new Map;let d="D:/Repressive-Music";const g=()=>{const a=new n.BrowserWindow({width:1024,height:680,icon:t.resolve(f,"favicon.ico"),frame:!1,resizable:!1,fullscreenable:!1,webPreferences:{preload:_}});process.env.VITE_DEV_SERVER_URL?(a.loadURL(process.env.VITE_DEV_SERVER_URL),n.globalShortcut.register("F10",()=>a.webContents.openDevTools())):a.loadFile(S),n.ipcMain.on("window-close",()=>{a.close()}),n.ipcMain.on("window-min",()=>{a.minimize()}),n.ipcMain.on("download",(i,e,s)=>{if(l.has(s)){a.webContents.send("download-confirm",null);return}const c={key:e+Date.now(),name:e,url:s,progress:0,isPaused:!1,status:"downloading",size:0,receivedSize:0};l.set(s,{music:c,downloadItem:null}),a.webContents.downloadURL(s)}),n.ipcMain.on("download-cancel",(i,e)=>{const{downloadItem:s}=l.get(e.url);s==null||s.cancel()}),n.ipcMain.on("download-open",()=>{p.existsSync(d)&&n.shell.openPath(t.normalize(d))}),n.ipcMain.on("download-path-select",()=>{const i=n.dialog.showOpenDialogSync(a,{title:"选择保存位置",defaultPath:t.normalize(d),properties:["openDirectory","createDirectory"]});i&&(d=i[0],a.webContents.send("download-path-change",d))}),n.ipcMain.on("download-path-change",(i,e)=>{d=e}),a.webContents.session.on("will-download",(i,e,s)=>{e.setSavePath(t.resolve(d,e.getFilename()));const c=l.get(e.getURL());c.music.size=e.getTotalBytes(),c.downloadItem=e,s.send("download-confirm",c.music),e.on("updated",(u,r)=>{const{music:o}=l.get(e.getURL());o.isPaused=e.isPaused(),o.progress=100*e.getReceivedBytes()/e.getTotalBytes(),o.receivedSize=e.getReceivedBytes(),o.status="downloading",s.send("download-update",o)}),e.on("done",(u,r)=>{const{music:o}=l.get(e.getURL());if(o.isPaused=e.isPaused(),o.progress=100*e.getReceivedBytes()/e.getTotalBytes(),o.receivedSize=e.getReceivedBytes(),r=="completed"){o.status="success";const v=t.extname(e.getFilename()),h=o.name+v,R=t.resolve(e.getSavePath(),"../"+h);p.renameSync(e.getSavePath(),R),l.delete(e.getURL()),s.send("download-completed",o)}else r=="interrupted"?(o.status="fail",l.delete(e.getURL()),s.send("download-failed",o)):l.delete(e.getURL())})})};n.app.whenReady().then(()=>{g()});n.app.on("activate",()=>{n.BrowserWindow.getAllWindows().length==0&&g()});n.app.on("window-all-closed",()=>{process.platform!="darwin"&&n.app.quit()});