const path = require("path");
const fs = require("fs");
const packageJSON = require("../package.json");
const fetch = require("node-fetch");
const decompress = require("decompress");
const os = require("os");
const del = require("del");

// Downloads and extracts the LBRY SDK
const downloadSDK = targetPlatform =>
  new Promise((resolve, reject) => {
    const sdkURLTemplate = packageJSON.lbrySettings.lbrynetSDKUrlTemplate;
    const sdkVersion = packageJSON.lbrySettings.lbrynetSDKVersion;
    const sdkDir = path.join(__dirname, "..", packageJSON.lbrySettings.lbrynetSDKDir);
    let sdkFileName = packageJSON.lbrySettings.lbrynetSDKFileName;

    let currentPlatform = os.platform();

    var sdkPlatform = process.env.TARGET || targetPlatform || currentPlatform;
    if (sdkPlatform === "mac" || sdkPlatform === "darwin") sdkPlatform = "mac";
    if (sdkPlatform === "win32" || sdkPlatform === "windows") {
      sdkPlatform = "windows";
      sdkFileName = sdkFileName + ".exe";
    }
    const sdkFilePath = path.join(sdkDir, sdkFileName);
    const sdkVersionPath = path.join(__dirname, "sdk.ver");
    const tmpZipPath = path.join(__dirname, "..", "dist", "sdk.zip");
    const sdkURL = sdkURLTemplate.replace(/SDKVER/g, sdkVersion).replace(/OSNAME/g, sdkPlatform);

    // If an sdk was perviously downloaded and sdk.ver exists, check to see if it matches the current sdk version
    const hasSDKDownloaded = fs.existsSync(sdkFilePath);
    const hasSDKVersion = fs.existsSync(sdkVersionPath);
    let downloadedSDKVersion;
    if (hasSDKVersion) {
      downloadedSDKVersion = fs.readFileSync(sdkVersionPath, "utf8");
    }

    if (hasSDKDownloaded && hasSDKVersion && downloadedSDKVersion === sdkVersion) {
      console.log("\x1b[34minfo\x1b[0m SDK already downloaded");
      resolve("Done");
      return;
    } else {
      console.log("\x1b[34minfo\x1b[0m Downloading SDK...");
      fetch(sdkURL, {
        method: "GET",
        headers: {
          "Content-Type": "application/zip"
        }
      })
        .then(response => response.buffer())
        .then(
          result =>
            new Promise((newResolve, newReject) => {
              const distPath = path.join(__dirname, "..", "dist");
              const hasDistFolder = fs.existsSync(distPath);

              if (!hasDistFolder) {
                fs.mkdirSync(distPath);
              }

              fs.writeFile(tmpZipPath, result, error => {
                if (error) return newReject(error);
                return newResolve();
              });
            })
        )
        .then(() => del(`${sdkFilePath}*`))
        .then(() =>
          decompress(tmpZipPath, sdkDir, {
            filter: file => path.basename(file.path) === sdkFileName
          })
        )
        .then(() => {
          console.log("\x1b[32msuccess\x1b[0m SDK downloaded!");
          if (hasSDKVersion) {
            del(sdkVersionPath);
          }

          fs.writeFileSync(sdkVersionPath, sdkVersion, "utf8");
          resolve("Done");
        })
        .catch(error => {
          console.error(`\x1b[31merror\x1b[0m SDK download failed due to: \x1b[35m${error}\x1b[0m`);
          reject(error);
        });
    }
  });

downloadSDK();
