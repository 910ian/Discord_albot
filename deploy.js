process.loadEnvFile();  //讀取 .env 檔
const { REST, Routes } = require('discord.js');

const commands = [
  {
    name: 'ping',
    description: '取得機器人的延遲',
  },
  {
    name: 'bot-info',
    description: '取得機器人基本資訊'
  },
  {
    name: 'create-album',
    description: '新增一個相簿',
    options: [
      {
        type: 3,  //3 = 文字選項
        name: 'name',
        description: '相簿名稱',
        required: true,
      }
    ]
  }
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