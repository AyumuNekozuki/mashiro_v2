// 根幹部分

import Log4js from "log4js";
Log4js.configure("log-config.json");

import botConfig from "../config.json" assert { type: 'json' };

import init_discord from "./discord/init_discord.js";
import init_slack from "./slack/init_slack.js";
import init_misskey from "./misskey/init_misskey.js";
import loadMemory from "./module/memory.js";
import { reminderDateCheck } from "./module/remind.js";

// ====== Bot Setup ======

loadMemory();

if(botConfig.discord.isEnabled) init_discord();

if(botConfig.slack.isEnabled) init_slack();

if(botConfig.misskey.isEnabled) init_misskey();


// ====== Reminder ======

global.memory.data.remind.forEach((reminder) => {
  reminderDateCheck(reminder.msgid, reminder.date);
});