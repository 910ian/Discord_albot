process.loadEnvFile();  //讀取 .env 檔
const { Client, GatewayIntentBits, ActivityType, ChannelType, MessageFlags, ThreadAutoArchiveDuration } = require('discord.js');

const client = new Client({ intents: [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMessages,  //接收伺服器訊息
  GatewayIntentBits.MessageContent  //讀取訊息的附件，要在 Developer Portal 開啟 Message Content Intent
] });

const MAX_UPLOAD_SIZE = 35 * 1024 * 1024;  //Apps Script 單次最多約 50MB，轉成 base64 會變大約 1.33 倍

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
      `機器人版本：ver 2.0.00\n`+
      `機器人所在伺服器數量：${client.guilds.cache.size}\n`+
      `機器人上線時間：${msToHMS(client.uptime)}`
    )
  }

  if (interaction.commandName === 'create-album'){
    const name = interaction.options.getString('name');

    //只能在相簿專用頻道使用
    if (interaction.channelId !== process.env.ALBUM_CHANNEL_ID) {
      return interaction.reply({ content: `請到 <#${process.env.ALBUM_CHANNEL_ID}> 使用這個指令`, flags: MessageFlags.Ephemeral });
    }

    try {
      const thread = await interaction.channel.threads.create({
        name: `📷 ${name}`,
        autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,  //一週沒有新訊息就自動封存，因為DC有活躍討論串上限
        reason: `${interaction.user.tag} 建立相簿`
      });
      await thread.members.add(interaction.user.id);  //把建立者加入討論串
      await thread.send(`這是 <@${interaction.user.id}> 建立的相簿「${name}」，把照片傳到這裡吧！`);

      await interaction.reply(`已建立相簿：${thread}`);
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: '建立相簿失敗，請確認機器人有「建立公開討論串」的權限', flags: MessageFlags.Ephemeral });
    }
  }
});

//相簿討論串裡有人傳照片或影片，就同步到 Google 雲端硬碟
client.on('messageCreate', async message => {
  if (message.author.bot) return;
  if (!message.channel.isThread() || message.channel.parentId !== process.env.ALBUM_CHANNEL_ID) return;

  const images = message.attachments.filter(a => a.contentType?.startsWith('image/') || a.contentType?.startsWith('video/'));  //照片和影片
  if (images.size === 0) return;

  const albumName = message.channel.name.replace(/^📷 /, '');  //資料夾名稱不要相機符號
  const time = message.createdAt.toLocaleString('sv-SE', { timeZone: 'Asia/Taipei' }).replace(' ', '_').replaceAll(':', '');  //例如 2026-11-01_193005
  let allOk = true;

  for (const image of images.values()) {
    try {
      if (image.size > MAX_UPLOAD_SIZE) throw new Error(`檔案太大（${image.size} bytes）`);

      const data = Buffer.from(await (await fetch(image.url)).arrayBuffer()).toString('base64');
      const res = await fetch(process.env.DRIVE_UPLOAD_URL, {
        method: 'POST',
        body: JSON.stringify({
          secret: process.env.DRIVE_UPLOAD_SECRET,
          threadId: message.channel.id,
          threadName: albumName,
          fileName: `${time}_${message.author.username}_${image.name}`,
          mimeType: image.contentType,
          data
        })
      });
      const result = await res.json();
      if (!result.ok) throw new Error(result.error);
    } catch (error) {
      allOk = false;
      console.error(`上傳 ${image.name} 失敗：`, error);
    }
  }

  await message.react(allOk ? '✅' : '❌').catch(console.error);  //用表情符號告訴大家有沒有同步成功
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