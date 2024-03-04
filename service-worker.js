chrome.runtime.onMessage.addListener(async function (
  message,
  sender,
  sendResponse
) {
  //start button click handler
  if (message.action === "start button clicked") {
    creatOffScreen(message.activeStreamId);
  }
  if (message.action === "stop button clicked") {
    stopOffScreenRecording();
  }
});

//create off screen function
creatOffScreen = async (activeStreamId) => {
  console.log("Active stream ID:", activeStreamId);
  const existingContexts = await chrome.runtime.getContexts({});

  const offscreenDocument = existingContexts.find(
    (c) => c.contextType === "OFFSCREEN_DOCUMENT"
  );

  // If an offscreen document is not already open, create one.
  if (!offscreenDocument) {
    // Create an offscreen document.
    await chrome.offscreen.createDocument({
      url: "offscreen.html",
      reasons: ["USER_MEDIA"],
      justification: "Recording from chrome.tabCapture API",
    });
  }

  // Send the stream ID to the offscreen document to start recording.
  chrome.runtime.sendMessage({
    action: "start-recording",

    data: activeStreamId,
  });
};

//stop fucntion for off screen recording\

stopOffScreenRecording = async () => {
  console.log("stop button click check on background.js");
  chrome.runtime.sendMessage({
    action: "stop-recording",
  });
};
