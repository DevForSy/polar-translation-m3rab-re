"use strict";

const { contextBridge, ipcRenderer } = require("electron");

function subscribe(channel, handler) {
  const listener = (_event, payload) => handler(payload);
  ipcRenderer.on(channel, listener);
  return () => ipcRenderer.removeListener(channel, listener);
}

const api = {
  auth: {
    check: () => ipcRenderer.invoke("auth:check"),
    startLogin: () => ipcRenderer.invoke("auth:start-login"),
    logout: () => ipcRenderer.invoke("auth:logout"),
    stats: () => ipcRenderer.invoke("auth:stats"),
    onChanged: (handler) => subscribe("auth:changed", handler),
  },
  window: {
    minimize: () => ipcRenderer.invoke("window:minimize"),
    toggleMaximize: () => ipcRenderer.invoke("window:toggle-maximize"),
    close: () => ipcRenderer.invoke("window:close"),
    isMaximized: () => ipcRenderer.invoke("window:is-maximized"),
    onMaximized: (handler) => subscribe("window:maximized", handler),
  },
  updater: {
    getState: () => ipcRenderer.invoke("desktop-updater:get-state"),
    checkNow: () => ipcRenderer.invoke("desktop-updater:check-now"),
    restartAndInstall: () => ipcRenderer.invoke("desktop-updater:restart-and-install"),
    onEvent: (handler) => subscribe("desktop-updater:event", handler),
  },
  content: {
    fetchJson: (url) => ipcRenderer.invoke("content:fetch-json", String(url)),
    requestTranslation: (game) => ipcRenderer.invoke("content:request-translation", String(game)),
  },
  installer: {
    myGamesDir: () => ipcRenderer.invoke("installer:my-games-dir"),
    detectGamePath: (game) => ipcRenderer.invoke("installer:detect-game-path", game),
    launchGame: (game, installPath, installedFiles) =>
      ipcRenderer.invoke("installer:launch-game", game, installPath, installedFiles),
    verifyInstallation: (installPath, installedFiles) =>
      ipcRenderer.invoke("installer:verify-installation", installPath, installedFiles),
    install: (jobId, game, translation, targetPath) =>
      ipcRenderer.invoke("installer:install", jobId, game, translation, targetPath),
    uninstall: (jobId, targetPath, installedFiles) =>
      ipcRenderer.invoke("installer:uninstall", jobId, targetPath, installedFiles),
    onProgress: (handler) => subscribe("installer:progress", handler),
    setLocale: (locale) => ipcRenderer.invoke("installer:set-locale", String(locale)),
    onConfirmRequest: (handler) => subscribe("installer:confirm-request", handler),
    answerConfirm: (requestId, allow) =>
      ipcRenderer.invoke("installer:confirm-answer", String(requestId), Boolean(allow)),
  },
};

contextBridge.exposeInMainWorld("polar", api);
