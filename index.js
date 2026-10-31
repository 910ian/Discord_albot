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
    const response = await interaction.reply({
      content: "正在計算延遲......",
      withResponse: true
    });
    const msg = response.resource.message;

    const ping = msg.createdTimestamp - interaction.createdTimestamp;

    await interaction.editReply(`機器人延遲：${ping} ms\nＡＰＩ延遲：${client.ws.ping} ms`)
  }

if (interaction.commandName === 'bot-info') {
    interaction.reply(
      `機器人名稱：${client.user.username}\n`+
      `機器人ＩＤ：${client.user.id}\n`+
      `機器人製作者：<@1034440947276206140>\n`+
      `機器人建立時間：<t:${~~(client.user.createdTimestamp/1000)}:R>\n`+
      `機器人邀請連結:[(點我)](https://discord.com/oauth2/authorize?client_id=1561362437507125388&permissions=8&integration_type=0&scope=bot)\n`+
      `機器人版本：ver 1.0\n`+
      `機器人所在伺服器數量：${client.guilds.cache.size}\n`+
      `機器人上線時間：${msToHMS(client.uptime)}`
    )
  }
});

client.login( process.env.DISCORD_TOKEN );

function msToHMS(ms) {
  let seconds = ms / 1000; //將毫秒轉換為秒
  const hours = parseInt( seconds / 3600 ); //將可以轉為小時的秒轉換為小時
  seconds = seconds % 3600; //去除已轉換為小時的秒
  const minutes = parseInt( seconds / 60 ); //將可以轉為分鐘的秒轉換為分鐘
  seconds = seconds % 60; //去除已轉換為分鐘的秒
  return(`${hours}:${minutes}:${~~(seconds)}`); //回傳轉換後的結果，秒數進行四捨五入
}