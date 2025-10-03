module.exports = {

    config: {

        name: "bot",

        version: "1.0",

        author: "Aminulsordar",

        countDown: 5,

        role: 0,

        shortDescription: "bot",

        longDescription: "bot",

        category: "Fun",

        guide: {

            en: "{pn} text"

        }

    },

    onStart: async () => {},

    onChat: async function({ message, event, api }) {

        const quotes = ["I love you 💝", "BOT NAHI HON Min ap ki janu hon 🤖", "Hi, I'm massanger Bot i can help you.?🤖","Use callad to contact admin!", "Hi, Don't disturb 🤖 🚘Now I'm going to Feni,Bangladesh..bye", "Hi, 🤖  HoW i can help you~~~~","TOO MERI CUTE JANU HAI NA ","BAR BAR AWAZ MAT DE PEYAR HOJANA MUJHE WARNA  :- https://www.facebook.com/100071880593545","Hmmm sona 🖤 meye hoile kule aso ar sele hoile kule new 🫂😘","Yah This Bot creator : MARINA KHAN ((A.R))     link => https://www.facebook.com/100071880593545","হা বলো, শুনছি আমি 🤸‍♂️🫂","Ato daktasen kn bujhlam na 😡", "jan bal falaba,🙂","ask amr mon vlo nei dakben na🙂", "Hmm jan ummah😘😘","jang hanga korba 🙂🖤","iss ato dako keno lojja lage to 🫦🙈","suna tomare amar valo lage,🙈😽" ];


        const Prefixes = ['bot', 'Bot'];


        if (!event.body) return;


        const prefix = Prefixes.find(p => event.body.toLowerCase().startsWith(p.toLowerCase()));

        if (!prefix) return;


        const uid = event.senderID;


        let name = "User";

        try {

            const userInfo = await api.getUserInfo(uid);

            name = userInfo[uid]?.name || "User";

        } catch (error) {

            console.error("Error fetching user info:", error);

        }


        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

        return message.reply({

            body: `🥀 ${name} 🥀\n\n${randomQuote}`,

            mentions: [{ id: uid, tag: name }]

        });

    }

};
