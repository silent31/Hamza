/**
 * Complete A-to-Z Login Implementation for GoatBot V2 using aminul-new-fca
 * This replaces the complex login system with a clean, direct implementation
 */

const fs = require('fs-extra');
const path = require('path');
const { loginWithAccountTxt, validateAccountTxt } = require('./aminulLogin.js');
const { log, logColor, getText, convertTime, colors, randomString } = global.utils;

/**
 * Complete login system for GoatBot V2 using aminul-new-fca
 */
async function startBotWithAminul() {
    try {
        console.log(colors.hex("#f5ab00")("─".repeat(50)));
        console.log(colors.hex("#f5ab00")("    AMINUL-NEW-FCA LOGIN SYSTEM"));
        console.log(colors.hex("#f5ab00")("─".repeat(50)));

        const currentVersion = require("../../package.json").version;
        const { dirAccount } = global.client;
        const { facebookAccount, config } = global.GoatBot;

        // Validate account.txt
        console.log("[ AMINUL-FCA ]", "Validating account.txt...");
        const validation = validateAccountTxt(dirAccount);
        
        if (!validation.valid) {
            log.err("LOGIN FACEBOOK", `Invalid account.txt: ${validation.error}`);
            log.info("LOGIN FACEBOOK", "Please ensure account.txt contains valid Facebook cookies in JSON format");
            return process.exit();
        }

        console.log("[ AMINUL-FCA ]", `✓ Account.txt is valid`);
        console.log("[ AMINUL-FCA ]", `✓ User ID: ${validation.userId}`);
        console.log("[ AMINUL-FCA ]", `✓ Cookie count: ${validation.cookieCount}`);

        // Initialize bot data structures
        global.GoatBot.commands = new Map();
        global.GoatBot.eventCommands = new Map();
        global.GoatBot.aliases = new Map();
        global.GoatBot.onChat = [];
        global.GoatBot.onEvent = [];
        global.GoatBot.onReply = new Map();
        global.GoatBot.onReaction = new Map();

        // Login with aminul-new-fca
        console.log("[ AMINUL-FCA ]", "Starting login process...");
        const api = await loginWithAccountTxt(dirAccount, config.optionsFca);
        
        // Set global API references
        global.GoatBot.fcaApi = api;
        global.GoatBot.botID = api.getCurrentUserID();
        global.botID = api.getCurrentUserID();

        // Display bot info
        logColor("#f5ab00", "─".repeat(30) + " BOT INFO " + "─".repeat(30));
        log.info("NODE VERSION", process.version);
        log.info("PROJECT VERSION", currentVersion);
        log.info("BOT ID", global.botID);
        log.info("LOGIN METHOD", "aminul-new-fca");
        log.info("LOGIN STATUS", "✓ SUCCESSFUL");

        // Load database and scripts
        await loadBotData(api);
        
        // Setup message listener
        await setupMessageListener(api);
        
        // Setup uptime server if enabled
        await setupUptimeServer();
        
        // Setup auto-restart listener if enabled
        setupAutoRestart();

        console.log("[ AMINUL-FCA ]", "✓ Bot successfully started!");
        logColor("#f5ab00", "─".repeat(70));

        return api;

    } catch (error) {
        log.err("LOGIN FACEBOOK", "Login failed:", error.message);
        console.error("[ AMINUL-FCA ]", "Error details:", error);
        
        // Fallback to dashboard if enabled
        if (global.GoatBot.config.dashBoard?.enable == true) {
            try {
                await require("../../dashboard/app.js")(null);
                log.info("DASHBOARD", "Dashboard opened successfully");
            } catch (err) {
                log.err("DASHBOARD", "Dashboard error:", err);
            }
            return;
        }
        
        process.exit(1);
    }
}

/**
 * Create line separator for console output
 */
function createLine(content, isMaxWidth = false) {
    const widthConsole = process.stdout.columns > 50 ? 50 : process.stdout.columns;
    if (!content)
        return Array(isMaxWidth ? process.stdout.columns : widthConsole).fill("─").join("");
    else {
        const lineLength = isMaxWidth ? process.stdout.columns : widthConsole;
        const contentLength = content.length;
        const sideLength = Math.floor((lineLength - contentLength - 2) / 2);
        return "─".repeat(sideLength) + ` ${content} ` + "─".repeat(lineLength - contentLength - 2 - sideLength);
    }
}

/**
 * Load database and bot scripts
 */
async function loadBotData(api) {
    try {
        // Load database and capture returned controllers
        const dbControllers = await require("./loadData.js")(api, createLine);
        
        // Store controllers in global.db if they exist
        if (dbControllers) {
            global.db = {
                ...global.db,
                threadModel: dbControllers.threadModel,
                userModel: dbControllers.userModel,
                dashBoardModel: dbControllers.dashBoardModel,
                globalModel: dbControllers.globalModel,
                threadsData: dbControllers.threadsData,
                usersData: dbControllers.usersData,
                dashBoardData: dbControllers.dashBoardData,
                globalData: dbControllers.globalData,
                sequelize: dbControllers.sequelize
            };
        }
        
        log.info("DATABASE", "✓ Database loaded successfully");
        
        // Load scripts - call the function with required parameters
        await require("./loadScripts.js")(
            api, 
            dbControllers.threadModel, 
            dbControllers.userModel, 
            dbControllers.dashBoardModel, 
            dbControllers.globalModel, 
            dbControllers.threadsData, 
            dbControllers.usersData, 
            dbControllers.dashBoardData, 
            dbControllers.globalData, 
            createLine
        );
        log.info("SCRIPTS", "✓ Commands and events loaded successfully");
        
    } catch (error) {
        log.err("LOAD DATA", "Error loading bot data:", error.message);
        throw error;
    }
}

/**
 * Setup message listener with aminul-new-fca
 */
async function setupMessageListener(api) {
    try {
        const { callbackListenTime, storage5Message } = global.GoatBot;
        const handlerAction = require("../handler/handlerAction.js")(
            api,
            global.db.threadModel,
            global.db.userModel,
            global.db.dashBoardModel,
            global.db.globalModel,
            global.db.usersData,
            global.db.threadsData,
            global.db.dashBoardData,
            global.db.globalData
        );

        // Create callback function
        function callBackListen(error, event) {
            if (error) {
                return log.err("LISTEN", "Listen error:", error);
            }

            if (!event || !event.type) return;

            // Check whitelist modes
            const config = global.GoatBot.config;
            if (config.whiteListMode?.enable || config.whiteListModeThread?.enable) {
                const isWhitelistedUser = config.whiteListMode?.whiteListIds?.includes(event.senderID);
                const isWhitelistedThread = config.whiteListModeThread?.whiteListThreadIds?.includes(event.threadID);
                const isAdmin = config.adminBot?.includes(event.senderID);

                if (!isAdmin && config.whiteListMode?.enable && !isWhitelistedUser) return;
                if (!isAdmin && config.whiteListModeThread?.enable && !isWhitelistedThread) return;
            }

            // Handle message loop detection
            if (event.messageID && event.type === "message") {
                if (storage5Message.includes(event.messageID)) {
                    Object.keys(callbackListenTime).slice(0, -1).forEach(key => {
                        callbackListenTime[key] = () => {};
                    });
                } else {
                    storage5Message.push(event.messageID);
                }
                if (storage5Message.length > 5) storage5Message.shift();
            }

            // Log events if enabled
            const configLog = global.GoatBot.config.logEvents;
            if (configLog.disableAll === false && configLog[event.type] !== false) {
                const participantIDs_ = [...event.participantIDs || []];
                if (event.participantIDs) {
                    event.participantIDs = 'Array(' + event.participantIDs.length + ')';
                }
                console.log(colors.green((event.type || "").toUpperCase() + ":"), JSON.stringify(event, null, 2));
                if (event.participantIDs) {
                    event.participantIDs = participantIDs_;
                }
            }

            // Handle the event
            handlerAction(event);
        }

        // Create callback listener
        function createCallBackListen(key) {
            key = randomString(10) + (key || Date.now());
            callbackListenTime[key] = callBackListen;
            return function (error, event) {
                callbackListenTime[key](error, event);
            };
        }

        // Start listening
        global.GoatBot.Listening = api.listenMqtt(createCallBackListen());
        global.GoatBot.callBackListen = callBackListen;
        
        log.info("LISTENER", "✓ Message listener started successfully");

        // Setup restart listener if enabled
        const restartListenMqtt = global.GoatBot.config.restartListenMqtt;
        if (restartListenMqtt.enable) {
            const restart = setInterval(async function () {
                if (!restartListenMqtt.enable) {
                    clearInterval(restart);
                    return log.warn("LISTEN_MQTT", "Restart listener disabled");
                }
                try {
                    await stopListening();
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    global.GoatBot.Listening = api.listenMqtt(createCallBackListen());
                    log.info("LISTEN_MQTT", "Message listener restarted");
                } catch (e) {
                    log.err("LISTEN_MQTT", "Restart error:", e);
                }
            }, restartListenMqtt.timeRestart);
            
            global.intervalRestartListenMqtt = restart;
            log.info("LISTEN_MQTT", `✓ Auto-restart enabled (${convertTime(restartListenMqtt.timeRestart, true)})`);
        }

    } catch (error) {
        log.err("LISTENER", "Error setting up message listener:", error.message);
        throw error;
    }
}

/**
 * Setup uptime server if enabled
 */
async function setupUptimeServer() {
    try {
        const serverConfig = global.GoatBot.config.serverUptime;
        if (!serverConfig.enable || global.GoatBot.config.dashBoard?.enable || global.serverUptimeRunning) {
            return;
        }

        const http = require('http');
        const express = require('express');
        const axios = require('axios');
        
        const app = express();
        const server = http.createServer(app);
        
        const { data: html } = await axios.get("https://raw.githubusercontent.com/ntkhang03/resources-goat-bot/master/homepage/home.html");
        const PORT = global.GoatBot.config.dashBoard?.port || serverConfig.port || 3001;
        
        app.get('/', (req, res) => res.send(html));
        app.get('/uptime', global.responseUptimeCurrent);
        
        await server.listen(PORT);
        
        const nameUpTime = process.env.REPL_OWNER 
            ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`
            : process.env.API_SERVER_EXTERNAL === "https://api.glitch.com"
            ? `https://${process.env.PROJECT_DOMAIN}.glitch.me`
            : `http://localhost:${PORT}`;
            
        log.info("UPTIME", `✓ Server running at ${nameUpTime}`);
        global.serverUptimeRunning = true;
        
        if (serverConfig.socket?.enable) {
            require('./socketIO.js')(server);
        }
        
    } catch (error) {
        log.err("UPTIME", "Error setting up uptime server:", error.message);
    }
}

/**
 * Setup auto-restart functionality
 */
function setupAutoRestart() {
    try {
        const config = global.GoatBot.config;
        if (!config.autoReloginWhenChangeAccount) return;

        const { dirAccount } = global.client;
        let latestChangeContentAccount = fs.statSync(dirAccount).mtimeMs;
        let changeFbStateByCode = false;

        setTimeout(() => {
            fs.watch(dirAccount, async (type) => {
                if (type === 'change' && !changeFbStateByCode && latestChangeContentAccount !== fs.statSync(dirAccount).mtimeMs) {
                    clearInterval(global.intervalRestartListenMqtt);
                    latestChangeContentAccount = fs.statSync(dirAccount).mtimeMs;
                    log.info("AUTO RESTART", "Account file changed, restarting bot...");
                    await startBotWithAminul();
                }
            });
        }, 10000);

        log.info("AUTO RESTART", "✓ Account file watcher enabled");
        
    } catch (error) {
        log.err("AUTO RESTART", "Error setting up auto-restart:", error.message);
    }
}

/**
 * Stop listening function
 */
function stopListening(keyListen) {
    const { callbackListenTime } = global.GoatBot;
    keyListen = keyListen || Object.keys(callbackListenTime).pop();
    
    return new Promise((resolve) => {
        global.GoatBot.fcaApi.stopListening?.(() => {
            if (callbackListenTime[keyListen]) {
                callbackListenTime[keyListen] = () => {};
            }
            resolve();
        }) || resolve();
    });
}

// Set global restart function
global.GoatBot.reLoginBot = startBotWithAminul;

module.exports = {
    startBotWithAminul,
    stopListening
};