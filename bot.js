const Redis = require("ioredis");
const { Client, Intents } = require("discord.js");

require("dotenv").config();
const SECRET_WORD = "fight";
const SECRET_COUNT = 3;
const SECRET_ROLE = "Fight Club";

const redis = new Redis(process.env.REDIS_URL);

//Create a new Discord client
const client = new Client({
  intents: [
    "GUILDS",
    "GUILD_MESSAGES",
    "GUILD_MEMBERS",
    "GUILD_MESSAGE_REACTIONS",
    "DIRECT_MESSAGES",
    "GUILD_MESSAGE_REACTIONS",
    "DIRECT_MESSAGE_REACTIONS",
  ],
  partials: ["MESSAGE", "CHANNEL", "REACTION"],
});
client.login(process.env.DISCORD_TOKEN);

client.on("ready", () => {
  console.log("ready");
});

client.on("messageCreate", async (messageCreate) => {
  if (messageCreate.author.bot) return;
  if (messageCreate.channel.type === "DM") return;
  let keyspace = `guild:${messageCreate.guild.id}:user:${messageCreate.author.id}`;
  let countKey = `${keyspace}:count`;
  let confirmedKey = `${keyspace}:confirm`;
  let filterKey = `${keyspace}:filter`;

  let confirmed = await redis.getbit(confirmedKey, 0);
  if (confirmed) return;

  let count = messageCreate.content
    .split(" ")
    .map((word) => word.toLowerCase())
    .filter((word) => word === SECRET_WORD).length;

  if (!count) return;

  let totalCount = await redis.incrby(countKey, count);
  if (totalCount >= SECRET_COUNT) {
    let role = messageCreate.guild.roles.cache.find(
      (role) => role.name === SECRET_ROLE
    );
    if (role) {
      messageCreate.member.roles.add(role);
      redis.setbit(confirmedKey, 0, 1);
      messageCreate.author.send(
        "Welcome to Fight Club 💪. The first rule of Fight Club is: you do not talk about Fight Club."
      );
    }
  }
});
