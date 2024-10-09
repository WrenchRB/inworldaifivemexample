// Declare variables and constants
let mediaRecorder;
let isRecording = false;
let canListen = false;
const audioConstraints = {
  audio: {
    sampleRate: 16000,
    channelCount: 1,
  }
};
// Event listener for receiving messages
window.addEventListener('message', (event) => {
  let data = event.data;
  
  if (data.action === 'Thinking') {
    isThinking = false;
  }else if (data.action === 'Talking') {
    isTalking = false;
  }else if (data.action === 'isXSoundActive') {
    isXSoundActive = data.isXSoundActive;
  }else if (data.action === 'listen') {
    navigator.mediaDevices.getUserMedia(audioConstraints)
    .then(function (stream) {
      if (!mediaRecorder) {
        // Create a new MediaRecorder instance
        mediaRecorder = new MediaRecorder(stream);

        // Event handler for when data is available
        mediaRecorder.ondataavailable = function (event) {
          // Send the recorded audio data to the backend
          const audioBlob = new Blob([event.data], { type: 'audio/wav' });
          blobToBase64(audioBlob, function(chunk){
            fetch("https://inworldai/sendToBackEnd", {
              method: "POST",
              body: JSON.stringify({ chunk: chunk }),
            });
          });
        }
        // Event handler for when recording starts
        mediaRecorder.onstart = function () {
          console.log('Recording started...');
        };

        // Event handler for when recording stops
        mediaRecorder.onstop = function () {
          console.log('Recording stopped...');
        };

      }
      canListen =true;
      fetch("https://inworldai/notif", {
        method: "POST",
        body: JSON.stringify({ text: "Hold N and talk", type: "success" }),
      });
    })
  }else if (data.action === "keyup") {
    if (isRecording) {
      canListen = false;
      isRecording = false;
      setTimeout(() => {
        fetch("https://inworldai/notif", {
          method: "POST",
          body: JSON.stringify({ text: "Lester is thinking", type: "success" }),
        });
        mediaRecorder.stop();
      }, 2000);
    }
  }else if (data.action === "keydown"){
    if (!isRecording && canListen) {
      isRecording = true;
      fetch("https://inworldai/notif", {
        method: "POST",
        body: JSON.stringify({ text: "Lester is listening", type: "success" }),
      });
      mediaRecorder.start();
    }
  }
});
 
function blobToBase64(blob, callback) {
  var reader = new FileReader();
  reader.onload = function() {
      var base64String = reader.result.split(',')[1];
      callback(base64String);
  };
  reader.readAsDataURL(blob);
}






