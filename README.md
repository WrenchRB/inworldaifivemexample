# Inworld AI FiveM Example

## Overview

This project demonstrates how to integrate **Inworld AI** with **FiveM**, using the Inworld AI SDK to create interactive NPCs (Non-Player Characters) in a game environment. The example shows how you can send text and audio input to Inworld AI, process responses, and interact with NPCs in real time. This is only a basic example to illustrate the structure of the code, and you will need to customize it for your own use.

## Key Features

- **Text and Audio Interactions**: Players can interact with NPCs via text or audio.
- **Inworld AI Integration**: Uses Inworld AI's SDK to handle communication with the AI characters.
- **Session Management**: Manages connections with Inworld AI, handles session continuation, and handles audio file conversion for proper communication.
- **Basic Example**: This code serves as a template for integrating Inworld AI into FiveM. You'll need to define your own characters, API keys, and secrets.

## Installation & Setup

### Step 1: Clone or Download the Repository

```bash
git clone https://github.com/YOUR_USERNAME/inworldaifivemexample.git
```

Place the `inworldaifivemexample` folder into your **resources** folder within your FiveM server directory.

### Step 2: Define Your Characters

To properly use this example, you need to define your own characters in the Inworld AI platform. This is not included in the example code. 

1. **Go to the [Inworld AI](https://inworld.ai/) platform.**
2. **Create and configure characters** based on your game world or storyline.
3. For each character, **set up their scenes, personalities, and responses**. You can use the Inworld AI dashboard to customize these settings.

### Step 3: Set Up Your API Key and Secret

To connect to the Inworld AI service, you'll need to use your own API credentials:

1. **Sign up at Inworld AI** to get your API keys and secret.
2. In the `server.js` file, locate this section:

```javascript
const client = await new InworldClient()
  .setApiKey({
    key: "", // Insert your API key here
    secret: "", // Insert your secret here
  })
```

3. **Insert your own API key** and **secret** from Inworld AI.

### Step 4: Add Your Discord Webhook

1. Set up a webhook in your Discord server.
2. Replace the placeholder webhook URL in the code with your own:
   
```javascript
const webhookURL = 'https://discord.com/api/webhooks/YOUR_WEBHOOK_ID';
```

### Step 5: Start Your FiveM Server

Ensure that your FiveM server is configured properly and the resource is listed in your `server.cfg` file:

```bash
start inworldaifivemexample
```

After the server starts, the players should be able to interact with NPCs using Inworld AI.

## Usage

Once the setup is complete:

1. **Join the FiveM server**.
2. Interact with the NPCs using text or voice commands. The NPCs will respond with either text or audio based on the interactions and the configurations you’ve defined on the Inworld platform.

## Important Notes

- **API Keys and Secrets**: The API keys and secrets provided in this example are placeholders. You must use your own credentials from the Inworld AI platform.
- **Character Definitions**: This code does not include any pre-defined characters. You need to create and configure your own characters using the Inworld AI dashboard.
- **Audio Processing**: This example uses `ffmpeg` to process audio. Make sure `ffmpeg` is installed on your server.
- **Customization**: This example is intended to show the structure of how to use Inworld AI in FiveM. You can modify and extend it to suit your specific needs, such as adding more sophisticated player interactions, NPC behaviors, and game-specific logic.

## License

This project is provided as-is for educational purposes. You are free to modify and use it in your own projects.

---

Feel free to expand this example as needed and make it your own!
