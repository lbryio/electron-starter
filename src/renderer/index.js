const { Lbry } = require("lbry-redux");

Lbry.connect().then(checkSDKStarted);

// Wait until the sdk is fully started before doing anything else
function checkSDKStarted() {
  Lbry.status().then(status => {
    if (status.is_running) {
      // SDK is now running
      const resolveWrapper = document.getElementById("resolve");
      const loadingWrapper = document.getElementById("loading");
      loadingWrapper.style.display = "none";
      resolveWrapper.style.display = "block";
      return;
    }

    setTimeout(() => {
      checkSDKStarted();
    }, 500);
  });
}

const resolveInput = document.getElementById("resolve-input");
const resolveButton = document.getElementById("resolve-button");
const getButton = document.getElementById("get-button");
const help = document.getElementById("help");
const claimData = document.getElementById("claim");
const imageWrapper = document.getElementById("image-wrapper");

resolveInput.addEventListener("input", e => {
  const { value } = e.target;
  const helpText = `Would resolve <b>lbry://${value}</b>`;
  help.innerHTML = helpText;
});

resolveButton.addEventListener("click", () => {
  const value = resolveInput.value;
  if (!value) {
    help.innerHTML = "You need to enter a name before resolving a claim.";
    return;
  }

  claimData.innerText = "Loading...";
  const url = `lbry://${value}`;
  Lbry.resolve({ urls: url }) // This can be a list of urls
    .then(res => {
      claimData.innerText = JSON.stringify(res[url].claim, null, 2);
    })
    .catch(error => {
      claimData.innerText = JSON.stringify(error, null, 2);
    });
});

// getButton.addEventListener("click", () => {
//   const value = resolveInput.value;
//   if (!value) {
//     help.innerHTML = "You need to enter a name before getting the file.";
//     return;
//   }

//   claimData.innerText = "Loading...";
//   Lbry.get({ uri: `lbry://${value}` })
//     .then(res => {
//       const filePath = res.download_path;
//       const image = document.createElement("img");
//       image.src = filePath;
//       imageWrapper.appendChild(image);
//       claimData.innerText = null;
//     })
//     .catch(error => {
//       claimData.innerText = JSON.stringify(error, null, 2);
//     });
// });
