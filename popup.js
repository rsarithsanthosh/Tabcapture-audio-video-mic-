document.addEventListener("DOMContentLoaded", function () {
  let startButton = document.getElementById("start-button");
  let stopButton = document.getElementById("stop-button");
  let micButton = document.getElementById("mic-button");

  //Start Button click Event
  startButton.addEventListener("click", async function () {
    console.log("Start button clicked");

    // Query the active tab and pass stream id to service-worker.js
    chrome.tabs.query(
      { active: true, currentWindow: true },
      async function (tabs) {
        // tabs is an array of tab objects that match the query criteria
        if (tabs.length > 0) {
          var activeTabId = tabs[0].id;
          console.log("Active tab ID:", activeTabId);
          const activeStreamId = await chrome.tabCapture.getMediaStreamId({
            targetTabId: activeTabId,
          });
          console.log("active Stream Id:", activeStreamId);
          chrome.runtime.sendMessage({
            action: "start button clicked",
            activeStreamId: activeStreamId,
          });
        }
      }
    );
  });

  //stop Button click Event
  stopButton.addEventListener("click", function () {
    console.log("stop button clicked");
    chrome.runtime.sendMessage({
      action: "stop button clicked",
    });
  });
  micButton.addEventListener("click", function () {
    var newWindow = window.open("", "_blank", "width=600,height=200");

    // Check if the new window is opened successfully
    if (newWindow) {
      // Create a new iframe element
      var iframe = document.createElement("iframe");

      // Set attributes for the iframe
      iframe.src = "premissionForMic.html"; // Replace with the URL you want to load
      iframe.width = "100%";
      iframe.height = "100%";
      iframe.frameBorder = "0"; // Remove the border if needed

      // Append the iframe to the new window's document body
      newWindow.document.body.appendChild(iframe);

    } else {
      alert("Popup blocked! Please allow popups for this site.");
    }
  });
});
