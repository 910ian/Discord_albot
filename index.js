process.loadEnvFile();  //讀取 .env 檔
const { Client, GatewayIntentBits, ActivityType } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('clientReady', () => {
    client.user.setActivity( '你的需求' , { type : ActivityType.Listening} )   //設置狀態為"在聽你需要幫什麼忙"
    client.user.setStatus( 'online' );  //設置狀態為"在線"
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'ping') {
    await interaction.reply( 'pong!' )
  }
});

client.login( process.env.DISCORD_TOKEN );