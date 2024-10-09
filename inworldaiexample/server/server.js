// Data storage arrays for different response types
const textResponseArray = {};
const AudioResponseArray = {};
const TriggerResponseArray = {};
const responseArrayString = {};
const playersData = {};
const AudioIndex = {};
const inworldClients = {};
const inworldConnections = {};
const isActive = {};

// Import required libraries and modules
const { InworldClient } = require('@inworld/nodejs-sdk');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const axios = require('axios');
const FormData = require('form-data'); // Import the 'form-data' package
const fileLocations = path.normalize(GetResourcePath(GetCurrentResourceName())) + "\\temp";
const webhookURL = 'https://discord.com/api/'; // discord webhook

// Function for handling the start of the client
const clientStart = async function (text, key, Scene, lastS, event, param, chunk, source) {
  while (isActive[key]) {};
  isActive[key] = true;
  let client = inworldClients[key];

  if (!client) {

    console.log("Created client!");
    try {
      client = await createClient(key, source);
    } catch (error) {
      console.error('error creating client:', error);
    }
  }

  console.log("Reload client!");

  if (lastS) {
    const targetTime = new Date(lastS.creationTime);
    const currentTime = new Date();
    const timeDifference = currentTime - targetTime;
    const minutesDifference = timeDifference / (1000 * 60);

    if (minutesDifference <= 25) {
      client.setSessionContinuation({ lastS });
    }
  }

  if (Scene) {
    client.setScene(lastS);
  }

  if (playersData[key]) {
    client.setUser(playersData[key])
  }

  // Manually open the connection
  console.log("Opened connection!");

  if (text) {
    await inworldConnections[key].sendText(text);
  }

  if (chunk) {
    const mp3Data = Buffer.from(chunk, 'base64');
    const filename = sanitizeFilename(key + GetGameTimer().toString());
    const outputPath = path.join(fileLocations, filename + '.mp3');
    const outputPath2 = path.join(fileLocations, filename + '.wav');
    fs.writeFileSync(outputPath, mp3Data, 'binary');

    await new Promise((resolve, reject) => {
      exec(`ffmpeg -i ${outputPath} -ar 16000 -sample_fmt s16 ${outputPath2}`, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });

    const timeout = 200;
    const highWaterMark = 1024 * 5;
    const Astream = fs.createReadStream(outputPath2, { highWaterMark });

    await inworldConnections[key].sendAudioSessionStart();
    let i = 0;
    console.log(1234);

    Astream.on('data', async (chunk) => {
      console.log(22);
      setTimeout(() => {
        inworldConnections[key].sendAudio(chunk);
      }, timeout * i);
      i++;
    });

    Astream.on('end', async () => {
      console.log(44);
      setTimeout(() => {
        inworldConnections[key].sendAudioSessionEnd();
        fs.unlink(outputPath, (err) => {
          if (err) {
            console.error(`Error deleting file: ${err}`);
          }
        });
        fs.unlink(outputPath2, (err) => {
          if (err) {
            console.error(`Error deleting file: ${err}`);
          }
        });
      }, timeout * (i - 1));
      Astream.close();
    });
  }

  if (event) {
    await inworldConnections[key].sendTrigger(event, param);
  }

  return client;
}

// Function for sanitizing filenames
const sanitizeFilename = function (filename) {
  return filename.replace(/[:\s]/g, '');
}

// Function for fixing input strings
const fixString = function (inputString) {
  const fixedString = inputString.replace(/,+/g, ',').replace(/\.,/g, ',');

  return fixedString;
}

// Function to create an Inworld client
const createClient = async function (clientKey, source) {
  const client = await new InworldClient()
    .setApiKey({
      key: "", // key and your secret
      secret: "",
    })
    .setConfiguration({
      capabilities: { audio: true, emotions: true },
      connection: {
        disconnectTimeout: 60 * 1000, // time in milliseconds
        autoReconnect: true,
      }
    })
    .setScene("workspaces") // set scene here
    // .setOnDisconnect(() => {

    // })
    .setOnMessage((packet) => {
      if (packet.isText()) {
        if (packet.text.final && packet.routing.source.isCharacter) {
          const textResponse = packet.text.text;
          textResponseArray[clientKey].push(textResponse);
        }
      }

      if (packet.isAudio() && packet.routing.source.isCharacter) {
        console.log("get data!");
        const mp3DataString = packet.audio.chunk;
        const mp3Data = Buffer.from(mp3DataString, 'base64');
        const formData = new FormData();
        AudioIndex[clientKey] = AudioIndex[clientKey] + 1
        const index = AudioIndex[clientKey]
        formData.append('audio', mp3Data, 'audio.mp3');
        axios.post(webhookURL, formData, {
          headers: {
            ...formData.getHeaders(),
          },
        }).then((response) => {
          AudioResponseArray[clientKey].push({url : response.data.attachments[0].url, index : index}); // todo check all url took
          emitNet('inworldai:getAudioDataFromBackEnd', source, response.data.attachments[0].url);
        });
      }

      if (packet.isTrigger()) {
        if (packet.parameters) {
          TriggerResponseArray[clientKey][packet.trigger.name] = packet.parameters
        }else{
          TriggerResponseArray[clientKey][packet.trigger.name] = true
        }
      }

      if (packet.isInteractionEnd()) {
        responseArrayString[clientKey] = fixString(textResponseArray[clientKey].toString());
        isActive[clientKey] = false;
        console.log("end data!");
        finishReq(clientKey, source);
      }
    })

  inworldConnections[clientKey] = client.build();
  inworldClients[clientKey] = client;
  textResponseArray[clientKey] = [];
  responseArrayString[clientKey] = "";
  AudioIndex[clientKey] = -1;
  AudioResponseArray[clientKey] = [];
  TriggerResponseArray[clientKey] = {};
  return client;
}

// Function to clean up client-related data
const cleanup = (clientKey) => {
  inworldConnections[clientKey].close();
  textResponseArray[clientKey] = [];
  responseArrayString[clientKey] = "";
  AudioIndex[clientKey] = -1;
  AudioResponseArray[clientKey] = [];
  TriggerResponseArray[clientKey] = {};
}

// Function to delete a client
const deleteClient = (clientKey) => {
  if (inworldClients[clientKey]) {
    textResponseArray[clientKey] = null;
    responseArrayString[clientKey] = null;
    AudioIndex[clientKey] = null;
    AudioResponseArray[clientKey] = null;
    TriggerResponseArray[clientKey] = null;
    inworldClients[clientKey] = null;
    inworldConnections[clientKey] = null;
  }
  fs.readdir(fileLocations, (err, files) => {
    if (err) {
      console.error('Error reading folder contents:', err);
      return;
    }

    files.forEach((file) => {
      if (file.includes(clientKey)) {
        const filePath = path.join(fileLocations, file);
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error('Error deleting file:', err);
          };
        });
      }
    });
  });
}

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Fivem event handlers
onNet('inworldai:sendDataToBackEnd', (text, Scene, lastS, event, param, chunk) => {
  const source = global.source;
  const key = getPlayerIDF(source)
  clientStart(text, key, Scene, lastS, event, param, chunk, source);
});

onNet('inworldai:setPlayerData', (data) => {
  const source = global.source;
  const key = getPlayerIDF(source)
  playersData[key] = data
});


//todo set player name

on("playerDropped", (reason) => {
  const source = global.source;
  const key = getPlayerIDF(source);
  deleteClient(key);
});

// Helper functions
const getPlayerIdentifiers = (id) => {
  const ids = {};
  for (let i = 0; i < GetNumPlayerIdentifiers(id); i++) {
    const identifier = GetPlayerIdentifier(id, i).split(":");
    ids[identifier[0]] = identifier[1];
  }
  return ids;
};

const getPlayerIDF = (id) => {
  const ids = getPlayerIdentifiers(id);
  return ids["steam"] || ids["license"];
};

const finishReq = async function(clientKey, source) {
  async function myFunction(intervalId) {
    const data = {};
    data.texts = responseArrayString[clientKey];
    if (AudioResponseArray[clientKey].length-1 != AudioIndex[clientKey]) {
      return
    }
    clearInterval(intervalId);
    data.audios = AudioResponseArray[clientKey];
    data.last = await inworldConnections[clientKey].getSessionState();
    data.trigger = TriggerResponseArray[clientKey];
    emitNet('inworldai:getDataFromBackEnd', source, data);
    cleanup(clientKey);
  }
  const intervalId = setInterval(() => myFunction(intervalId), 100);
};

const logStream = fs.createWriteStream(path.join(path.normalize(GetResourcePath(GetCurrentResourceName())), 'log.txt'), { flags: 'a' });
console.log = function(msg) {
  logStream.write(`[LOG] ${msg}\n`);
}

console.error = function(msg) {
  if (msg === "1 CANCELLED: Cancelled on client") {
    return
  };
  logStream.write(`[ERROR] ${msg}\n`);
}
