const { getTime } = global.utils;
const moment = require("moment-timezone");
const fs = require("fs");
const path = require("path");
const request = require("request");

if (!global.temp.welcomeEvent) global.temp.welcomeEvent = {};

module.exports = {
  config: {
    name: "welcome",
    version: "1.7",
    author: "Aminulsordar",
    category: "events"
  },

  langs: {
    vi: {
      session1: "sáng",
      session2: "trưa",
      session3: "chiều",
      session4: "tối",
      welcomeMessage:
        "Cảm ơn bạn đã mời tôi vào nhóm!\nPrefix bot: %1\nĐể xem danh sách lệnh hãy nhập: %1help",
      multiple1: "bạn",
      multiple2: "các bạn",
      defaultWelcomeMessage:
        "Xin chào {userName}.\nChào mừng bạn đến với {boxName}.\nChúc bạn có buổi {session} vui vẻ!\nCurrent date and time in Manila: {dateTime}\nBạn là thành viên thứ {position} của nhóm này.\nTổng số thành viên: {membersCount}\nTổng số quản trị viên: {adminsCount}"
    },
    en: {
      session1: "morning",
      session2: "noon",
      session3: "afternoon",
      session4: "evening",
      welcomeMessage: `╭━─━─≪𝐖𝐄𝐋𝐂𝐎𝐌𝐄≫─━─━❯❯
│
├─❯【•𝐁𝐎𝐓-𝐎𝐖𝐍𝐄𝐑: 𝗔𝗺𝗶𝗻𝘂𝗹 𝗦𝗼𝗿𝗱𝗮𝗿】
│
├─❯【𝐀𝐌𝐈𝐍𝐔𝐋-𝐗-𝐁𝐎𝐓】
│
├─❯【•𝐁𝐎𝐓-𝐏𝐑𝐄𝐅𝐈𝐗:【/】
│
├─❯ 【•𝐓𝐘𝐏𝐄:  /help 𝐔𝐒𝐄 𝐂𝐌𝐃•】
│
├─❯【•𝐎𝐖𝐍𝐄𝐑+𝐀𝐃𝐌𝐈𝐍】
│
├─❯ https://www.facebook.com/br4nd.abir.your.next.bf.jan
│
├─❯ m.me/100071880593545
│
╰━─━─≪𝐀𝐌𝐈𝐍𝐔𝐋-𝐗-𝐁𝐎𝐓≫─━─━❯❯`,
      multiple1: "you",
      multiple2: "you guys",
      defaultWelcomeMessage: `╔════•|      💛      |•════╗
 ❤️আসসালামু আলাইকুম❤️
╚════•|      💛      |•════╝

━❯🅆🄴🄻🄲🄾🄼🄴➤

━❯🅽🅴🆆➤

━❯🇲🇪🇲🇧🇪🇷➤

━❯{userName}➤

༄✺আপনাকে আমাদের✺࿐

{boxName}

🌺🌿🌸—এর পক্ষ থেকে—🌸🌿🌺

🌿_ভালোবাসা অবিরাম_🌿

༄✺আপনি এই গ্রুপের {memberNumber} নং মেম্বার࿐

Total members: {membersCount}.
Total admins: {adminsCount}

আমাদের সাথে সময় দেওয়া ও পাশে থাকার অনুরোধ রইলো !! 🍂🌺🥀

🦋༎❤❤༎🦋

💐☘️-ধন্যবাদ প্রিয়-☘️💐
𝄞❤️⋆⃝❤️ BOT-OWNER: Aminul Sordar ❤️

Current date and time: {dateTime}`
    }
  },

  onStart: async ({ threadsData, message, event, api, getLang, usersData }) => {
    if (event.logMessageType !== "log:subscribe") return;

    const { threadID } = event;
    const { nickNameBot } = global.GoatBot.config;
    const prefix = global.utils.getPrefix(threadID);
    const dataAddedParticipants = event.logMessageData.addedParticipants;

    // If new member is bot
    if (dataAddedParticipants.some(item => item.userFbId === api.getCurrentUserID())) {
      if (nickNameBot) {
        api.changeNickname(nickNameBot, threadID, api.getCurrentUserID());
      }
      return message.send(getLang("welcomeMessage", prefix));
    }

    // Initialize temp data for this thread if not exist
    if (!global.temp.welcomeEvent[threadID]) {
      global.temp.welcomeEvent[threadID] = {
        joinTimeout: null,
        dataAddedParticipants: []
      };
    }

    // Push new members to array and clear/set timeout
    global.temp.welcomeEvent[threadID].dataAddedParticipants.push(...dataAddedParticipants);
    clearTimeout(global.temp.welcomeEvent[threadID].joinTimeout);

    global.temp.welcomeEvent[threadID].joinTimeout = setTimeout(async () => {
      const threadData = await threadsData.get(threadID);
      if (threadData.settings.sendWelcomeMessage === false) return;

      const dataAddedParticipants = global.temp.welcomeEvent[threadID].dataAddedParticipants;
      const dataBanned = threadData.data.banned_ban || [];
      const threadName = threadData.threadName;
      const threadInfo = await api.getThreadInfo(threadID);

      // Filter out banned users
      const validParticipants = dataAddedParticipants.filter(
        user => !dataBanned.some(ban => ban.id === user.userFbId)
      );
      if (validParticipants.length === 0) return;

      // Ensure the cache folder exists
      const cacheFolder = path.resolve(__dirname, "cache");
      if (!fs.existsSync(cacheFolder)) {
        fs.mkdirSync(cacheFolder);
      }

      // Fixed background image URL
      const background = "https://cdn.popcat.xyz/welcome-bg.png";

      // Function to get session name
      const getSessionName = () => {
        const hours = getTime("HH");
        return hours <= 10
          ? getLang("session1")
          : hours <= 12
          ? getLang("session2")
          : hours <= 18
          ? getLang("session3")
          : getLang("session4");
      };

      // Function to get the ordinal suffix for a number
      const getOrdinalSuffix = i => {
        const j = i % 10,
          k = i % 100;
        if (j == 1 && k != 11) return i + "st";
        if (j == 2 && k != 12) return i + "nd";
        if (j == 3 && k != 13) return i + "rd";
        return i + "th";
      };

      const sendWelcomeMessage = async (user, position) => {
        const userName = user.fullName;
        const userId = user.userFbId;
        const dateTime = moment().tz("Asia/Dhaka").format("MMMM Do YYYY, h:mm:ss a");
        const membersCount = threadInfo.participantIDs.length;
        const adminsCount = threadInfo.adminIDs.length;

        let welcomeMessage = threadData.data.welcomeMessage || getLang("defaultWelcomeMessage");

        welcomeMessage = welcomeMessage
          .replace(/\{userName\}|\{userNameTag\}/g, userName)
          .replace(/\{boxName\}|\{threadName\}/g, threadName)
          .replace(/\{multiple\}/g, getLang("multiple1"))
          .replace(/\{session\}/g, getSessionName())
          .replace(/\{dateTime\}/g, dateTime)
          .replace(/\{membersCount\}/g, membersCount)
          .replace(/\{adminsCount\}/g, adminsCount)
          .replace(/\{position\}/g, getOrdinalSuffix(position))
          .replace(/\{memberNumber\}/g, position);

        const form = { body: welcomeMessage, mentions: [{ tag: userName, id: userId }] };

        // Fetch user's profile picture using usersData
        const avt = await usersData.getAvatarUrl(userId);
        const url = `https://api.popcat.xyz/welcomecard?background=${encodeURIComponent(
          background
        )}&text1=${encodeURIComponent(userName)}&text2=Welcome%20To%20${encodeURIComponent(
          threadName
        )}&text3=Member%20${encodeURIComponent(position)}&avatar=${encodeURIComponent(avt)}`;
        const filePath = path.resolve(cacheFolder, `${userId}.jpg`);

        request(url)
          .pipe(fs.createWriteStream(filePath))
          .on("close", () => {
            form.attachment = [fs.createReadStream(filePath)];
            message.send(form);
          })
          .on("error", error => console.error(error));
      };

      // Send welcome messages one by one
      for (const [index, user] of validParticipants.entries()) {
        await sendWelcomeMessage(
          user,
          threadInfo.participantIDs.length - validParticipants.length + index + 1
        );
      }

      delete global.temp.welcomeEvent[threadID];
    }, 1500);
  }
};
