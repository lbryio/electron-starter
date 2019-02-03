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
const resolveHelp = document.getElementById("resolve-help");
const claimData = document.getElementById("claim");

resolveInput.addEventListener("input", e => {
  const { value } = e.target;
  const helpText = `Would resolve <b>lbry://${value}</b>`;
  resolveHelp.innerHTML = helpText;
});

resolveButton.addEventListener("click", () => {
  const value = resolveInput.value;
  if (!value) {
    return;
  }

  claimData.innerText = "Loading...";
  Lbry.resolve({ uri: `lbry://${value}` })
    .then(res => {
      claimData.innerText = JSON.stringify(res.claim, null, 2);
    })
    .catch(error => {
      claimData.innerText = JSON.stringify(error, null, 2);
    });
});
