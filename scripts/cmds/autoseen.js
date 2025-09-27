module.exports = {
config: {
name: "autoseen",
author: "massive credit to sandip",
role: 0,
shortDescription: "Text to image",
guide: "{pn} <query>",
category: "midjorney"
},
onStart: async function ({ message, args }) {
var prompt = args.join(" ");
var imagine = "https://sandipapi.onrender"+ ".com/dalle";
message.reply({
body: prompt,
attachment: await global.utils.getStreamFromURL(imagine)
});
}
};