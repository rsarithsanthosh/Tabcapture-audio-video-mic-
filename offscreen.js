chrome.runtime.onMessage.addListener(async function (
  message,
  sender,
  sendResponse
) {
  //start button click handler
  if (message.action === "start-recording") {
    let activeStreamId = message.data;
    startRecording(activeStreamId);
  }
  if (message.action === "stop-recording") {
    let activeStreamId = message.data;
    stopRecording();
  }
});
let recorder;
let data = [];

async function startRecording(streamId) {
  var startTime;
  if (recorder?.state === "recording") {
    throw new Error("Called startRecording while recording is in progress.");
  }

  //stream tab audio +video
  const tabVideoAndAudio = await navigator.mediaDevices.getUserMedia({
    audio: {
      mandatory: {
        chromeMediaSource: "tab",
        chromeMediaSourceId: streamId,
      },
    },
    video: {
      mandatory: {
        chromeMediaSource: "tab",
        chromeMediaSourceId: streamId,
      },
    },
  });

  //stream mic audio
  const micAudio = await navigator.mediaDevices.getUserMedia({
    audio: true,
  });

  //adding audio of microhone and tab together
  const audioContext = new AudioContext();
  let audioIn_01 = audioContext.createMediaStreamSource(tabVideoAndAudio);
  let audioIn_02 = audioContext.createMediaStreamSource(micAudio);
  dest = audioContext.createMediaStreamDestination();
  audioIn_01.connect(dest);
  audioIn_02.connect(dest);
  console.log(dest.stream, "combined audio stream");
  const combinedStream = new MediaStream();

  //add video to combined stream
  const videoTracks = tabVideoAndAudio.getVideoTracks();
  videoTracks.forEach((videoTrack) => {
    combinedStream.addTrack(videoTrack);
  });

  //add combined audio to combined stream
  const audioTracks = dest.stream.getAudioTracks();
  audioTracks.forEach((audiotrack) => {
    combinedStream.addTrack(audiotrack);
  });

  // Continue to play the captured audio to the user.
  const output = new AudioContext();
  const source = output.createMediaStreamSource(tabVideoAndAudio);
  source.connect(output.destination);

  // Start recording.
  recorder = new MediaRecorder(combinedStream, {
    mimeType: "video/webm",
    codec: "H.264",
  });
  recorder.ondataavailable = (event) => data.push(event.data);
  recorder.onstop = () => {
    var duration = Date.now() - startTime;

    const buggyBlob = new Blob(data, { type: "video/webm" });
    // v1: callback-style
    ysFixWebmDuration(buggyBlob, duration, function (fixedBlob) {
      // window.open(URL.createObjectURL(fixedBlob), "_blank");
      var url = URL.createObjectURL(fixedBlob);

      const downloadLink = document.createElement("a");
      downloadLink.href = url;
      downloadLink.download = "demo.webm";
      downloadLink.click();
      // Clear state ready for next recording
    });

    // var url = URL.createObjectURL(blob);

    // const downloadLink = document.createElement("a");
    // downloadLink.href = url;
    // downloadLink.download = "demo.mp4";
    // downloadLink.click();
    // Clear state ready for next recording
    recorder = undefined;
    data = [];
  };
  recorder.start();
  startTime = Date.now();
  window.location.hash = "recording";
}

async function stopRecording() {
  recorder.stop();

  // Stopping the tracks makes sure the recording icon in the tab is removed.
  recorder.stream.getTracks().forEach((t) => t.stop());

  // Update current state in URL
  window.location.hash = "";
}
