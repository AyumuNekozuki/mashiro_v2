// Misskey接続用

import Log4js from "log4js";
Log4js.configure("log-config.json");
const logger = Log4js.getLogger("misskey");

import fetch from "node-fetch";
import WebSocket from "ws";

import botConfig from "../../config.json" assert { type: 'json' };

import forwardMessage from "../module/forwardMessage.js";
import { saveTalkLog } from "../module/memory.js";
import ltlReaction from "../module/ltlReaction.js";

const MkfetchApi = async (api, param) => {
  const response = await fetch(`https://${botConfig.misskey.host}/api/${api}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...param,
      i: botConfig.misskey.token,
    }),
  });

  if(api == "notes/reactions/create"){
    return "ok";
  }
  return await response.json();

}

const noteRepryCreate = async (replyId, text) => {
  const result = await MkfetchApi("notes/create", {
    replyId: replyId,
    text: text,
  })
}

const streamChannel_main = {
	type: 'connect',
	body: {
		channel: 'main',
		id: 'streamChannel_main',
		params: {}
	}
}
const streamChannel_ltl = {
	type: 'connect',
	body: {
		channel: 'localTimeline',
		id: 'streamChannel_ltl',
		params: {}
	}
}

// メンションされたらリアクション＆リプライ
const mentionReplyMessage = async (msg) => {
  const msgObj = msg.body.body;
  try{
    try{
      await MkfetchApi("notes/reactions/create", {
        noteId: msgObj.id,
        reaction: "❤️",
      });
    }catch(e){
      logger.error("リアクション付与に失敗しました。");
    }

    let inputText = msgObj.text.replace(/@mashiro/, "").trim();
    inputText = inputText.replace(/<@.*>/g, "").trim();

    logger.info(`Received Message: ${inputText}`);

    var messageLog = null;
    if(typeof global.memory?.data?.messages?.misskey?.[msgObj.user.username] !== "undefined"){
      messageLog = global.memory.data.messages.misskey[msgObj.user.username];
    }

    const response = await forwardMessage(inputText, messageLog, msgObj);
    
    await noteRepryCreate(msgObj.id, response);
    logger.info(`Send Message: ${response}`);

    saveTalkLog("misskey", msgObj.user.username, inputText, response);
  }catch(e){
    logger.error(e);
  }
}


// WebSocket
const wsConnect = () => {
  logger.info("WebSocket is Connecting Now...");
  const stream = new WebSocket(`wss://${botConfig.misskey.host}/streaming?i=${botConfig.misskey.token}`);

  stream.onopen = () => {
    stream.send(JSON.stringify(streamChannel_main));
    stream.send(JSON.stringify(streamChannel_ltl));
    logger.info("WebSocket is Connected!");
  }

  stream.onmessage = async (msgevent) => {
    const msg = JSON.parse(msgevent.data);

    // isCatDecorator
    if(msg.body.body.text){
      if(msg.body.body.text.indexOf("にゃ")){
        msg.body.body.text = msg.body.body.text.replace(/にゃ/g, "な");
      }
    }

    if(msg.body.type === "mention"){
      await mentionReplyMessage(msg);
    }else if(msg.body.type === "note"){
      await ltlReaction(msg);
    }
  }

  stream.onclose = () => {
    logger.error("WebSocket is Closed!");
    wsConnect();
  }
}


const init_misskey = async () => {
  logger.info("Connecting to Misskey...");

  // Check login Account
  const botAccount = await MkfetchApi("i", {});
  logger.info(`Logged in as @${botAccount.username}@${botConfig.misskey.host}`);

  // connect stream
  try{
    wsConnect();
  }catch(e){
    logger.error(e);
  }
};

export default init_misskey;

export { MkfetchApi };