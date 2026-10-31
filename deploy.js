process.loadEnvFile();  //讀取 .env 檔
const { REST, Routes } = require('discord.js');

const commands = [
  {
    name: 'ping',
    description: '得知機器人的延遲資訊',
  },
];

const rest = new REST({ version: '10' }).setToken( process.env.DISCORD_TOKEN );

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(Routes.applicationCommands( process.env.CLIENT_ID ), { body: commands });

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();