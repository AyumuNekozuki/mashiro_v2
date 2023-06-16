// Misskey接続用

import Log4js from "log4js";
Log4js.configure("log-config.json");
const logger = Log4js.getLogger("misskey");

import fetch from "node-fetch";
import WebSocket from "ws";

import botConfig from "../../config.json" assert { type: 'json' };

import forwardMessage from "../module/forwardMessage.js";


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

  return await response.json();
}

const noteRepryCreate = async (replyId, text) => {
  await MkfetchApi("notes/create", {
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


const wsConnect = () => {
  logger.info("WebSocket is Connecting Now...");
  const stream = new WebSocket(`wss://${botConfig.misskey.host}/streaming?i=${botConfig.misskey.token}`);

  stream.onopen = () => {
    stream.send(JSON.stringify(streamChannel_main));
    logger.info("WebSocket is Connected!");
  }

  stream.onmessage = async (msgevent) => {
    const msg = JSON.parse(msgevent.data);

    if(msg.body.type === "mention"){
      const msgObj = msg.body.body;
      try{
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

        if(typeof global.memory?.data?.messages?.misskey?.[msgObj.user.username] === "undefined"){
          global.memory.data.messages.misskey = {
            ...global.memory.data.messages.misskey,
            [msgObj.user.username]: []
          };
        }
    
        global.memory.data.messages.misskey[msgObj.user.username].push(`${msgObj.user.username}: ${inputText}`);
        global.memory.data.messages.misskey[msgObj.user.username].push(`あなた: ${response}`);
      }catch(e){
        logger.error(e);
      }
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