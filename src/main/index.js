// Modules to control application life and create native browser window
const { app } = require("electron");
const path = require("path");
const findProcess = require("find-process");
const createWindow = require("./create-window");
const Daemon = require("./daemon");
const IS_DEV = process.env.NODE_ENV === "development";

console.log("starting?");

// Auto-reload when we make changes
if (IS_DEV) {
  require("electron-reload")(__dirname, {
    electron: path.join(__dirname, "node_modules", ".bin", "electron")
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", function() {
  createWindow();

  const processListArgs =
    process.platform === "win32" ? "lbrynet" : "lbrynet start";
  findProcess("name", processListArgs).then(processList => {
    const isDaemonRunning = processList.length > 0;

    if (!isDaemonRunning) {
      daemon = new Daemon();
      daemon.on("exit", () => {
        if (!isDev) {
          daemon = null;
          if (!appState.isQuitting) {
            dialog.showErrorBox(
              "Daemon has Exited",
              "The daemon may have encountered an unexpected error, or another daemon instance is already running. \n\n" +
                "For more information please visit: \n" +
                "https://lbry.io/faq/startup-troubleshooting"
            );
          }
          app.quit();
        }
      });
      daemon.launch();
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
