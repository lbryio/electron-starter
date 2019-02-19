// Modules to control application life and create native browser window
const { app } = require("electron");
const path = require("path");
const findProcess = require("find-process");
const createWindow = require("./create-window");
const SDK = require("./sdk");

// Simple auto reload
require("electron-reload")(__dirname);

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", function() {
  createWindow();

  // Determine if the LBRY SDK is already running, or if it needs to be started
  // This allows you to run the sdk binary separately and have your app connect to it
  const processListArgs = process.platform === "win32" ? "lbrynet" : "lbrynet start";
  findProcess("name", processListArgs).then(processList => {
    const isSDKRunning = processList.length > 0;

    if (!isSDKRunning) {
      sdk = new SDK();
      sdk.on("exit", () => {
        sdk = null;
        dialog.showErrorBox("SDK has quit");
        app.quit();
      });
      sdk.launch();
    }
  });
});

// Quit when all windows are closed.
app.on("window-all-closed", function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});
