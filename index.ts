import { EventController } from './app/utils/eventController';
import { BotController } from 'dbc';
import { Client, Intents } from 'discord.js';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import startUpdateCreateLoop from './app/utils/UpdateCreateInfo';
dotenv.config();

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.DIRECT_MESSAGES,
    Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
    Intents.FLAGS.DIRECT_MESSAGE_TYPING,
    Intents.FLAGS.DIRECT_MESSAGE_TYPING,
  ],
  partials: ['CHANNEL'],
});

client.on('ready', async () => {
  await mongoose
    .connect(process.env.MONGO_URI || '')
    .then(async (res) => {
      const botController = new BotController(client, {
        comandsDir: path.join(__dirname, './app/commands'),
        featuresDir: path.join(__dirname, './app/features'),
        prefix: '!',
        testServer: ['987015990644715620'],
        event: new EventController(),
      });
      //botController.destroyAllSlashCommands(client);
      // await RequestLiveData()
      startUpdateCreateLoop();
    })
    .catch((err) => {
      console.log('-----');
      console.log('DB Connection error!');
      console.log('-----');
      console.log(err);
    });
});

client.login(process.env.TOKEN);
