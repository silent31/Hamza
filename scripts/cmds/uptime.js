module.exports = {
  config: {
    name: "uptime",
    aliases: ["up", "upt"],
    version: "1.2",
    author: "Aminul sardar",
    role: 0,
    shortDescription: {
      en: "Displays the bot's uptime."
    },
    longDescription: {
      en: "Shows how long the bot has been running in days, hours, minutes, and seconds."
    },
    category: "System",
    guide: {
      en: "Type {p}uptime to see how long the bot has been running."
    }
  },

  onStart: async function ({ api, event }) {
    const uptime = process.uptime();

    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    const uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;

    const message = `
➽────────────────❥
🤖 Bot Uptime Information 🤖

⏳ Total Time Running:
💫 ${uptimeString}

👑 Bot by: @Aminusardar
🔗 Facebook: https://www.facebook.com/100071880593545
🎯 Enjoy using the bot! 💖
➽────────────────❥
`;

    return api.sendMessage(message, event.threadID);
  }
};
