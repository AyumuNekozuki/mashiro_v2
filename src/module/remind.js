
import Log4js from "log4js";
Log4js.configure("log-config.json");
const logger = Log4js.getLogger("reminder");

import { MkfetchApi } from "../misskey/init_misskey.js";

const reminderDateCheck = async () => {
  setInterval(() => {
    logger.info("Reminder Date Check...")
    if (typeof global.memory.data.remind === "undefined") return;

    Object.keys(global.memory.data.remind).forEach(async (key) => {
      if (Date.now() > global.memory.data.remind[key]) {
        await MkfetchApi("notes/create", {
          renoteId: key,
          text: "これの進捗、どうでしょう...？",
        });

        delete global.memory.data.remind[key];

        // 3H後
        global.memory.data.remind[key] = Date.now() + 1000 * 60 * 60 * 3;
      }
    });

  }, 1000 * 60 * 3);
}


const remindClear = async (msgObj) => {
  const doneList = [
    "done",
    "やった",
    "やりました",
    "はい",
    "おわった",
    "終",
    "できた"
  ];

  let isdone = false;
  await doneList.forEach(element => {
    if(isdone === true) return true;
 
    const done = msgObj.text.includes(element);
    if (done) isdone = true;
  });

  if (isdone) {
    logger.info("Reminder is Done")
    delete global.memory.data.remind[msgObj.reply.renoteId]
    delete global.memory.data.remind[msgObj.replyId];
    return "お疲れ様です...！";
  }


  const cancelList = [
    "やめる",
    "やめた",
    "キャンセル",
    "諦",
    "あきらめ",
    "できな"
  ];
  let iscancel = false;
  await cancelList.forEach(element => {
    if(iscancel === true) return true;
    const cancel = msgObj.text.includes(element);
    if (cancel) iscancel = true;
  });

  if (iscancel) {
    logger.info("Reminder is Cancel")
    delete global.memory.data.remind[msgObj.reply.renoteId]
    delete global.memory.data.remind[msgObj.replyId];
    return "わかりました...！";
  }
}

const remind = (msgObj) => {
  if (typeof msgObj === "undefined") return 'ごめんなさい...Misskey以外では使えないんです...';

  global.memory.data.remind = {
    ...global.memory.data.remind,
    [msgObj.id]: Date.now() + 1000 * 60 * 60 * 3
  }

  return '了解です！3時間後にリマインドします...！';
}

export { remind, reminderDateCheck, remindClear };