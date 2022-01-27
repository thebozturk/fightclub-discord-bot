const Redis = require("ioredis");
const { Client, Intents } = require("discord.js");

require("dotenv").config();
const SECRET_WORD = "hack";
const SECRET_COUNT = 3;
const SECRET_ROLE = "The Anonymous";

const redis = new Redis(process.env.REDIS_URL);

//Create a new Discord client
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
client.login(process.env.DISCORD_TOKEN);

client.on("ready", () => {
  client.on("message", (message) => {
    console.log(message);
  });
});
