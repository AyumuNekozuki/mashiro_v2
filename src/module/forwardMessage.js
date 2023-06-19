import Log4js from "log4js";
Log4js.configure("log-config.json");
const logger = Log4js.getLogger("core");

import ping from "../module/ping.js";
import talkgpt from "../module/talkgpt.js";
import { remind, remindClear } from "../module/remind.js";


const forwardMessage = async (inputText, messageLog, msgObj) => {
  try{
    // remindClear
    if(msgObj){
      if(typeof global.memory.data.remind[msgObj.replyId] !== "undefined" || typeof global.memory.data.remind[msgObj.reply.renoteId] !== "undefined"){
        return await remindClear(msgObj);
      }

      // Ping
    }else if(inputText.match(/ping/)){
      return await ping();

      // RemindSet
    }else if(inputText.match(/remind/)){
      return await remind(msgObj);

      // TalkGPT
    }else{
      return await talkgpt(inputText, messageLog);
    }
  }catch(e){
    logger.error(e);
    return "サーバーでエラーが起きたみたいです...";
  }
}

export default forwardMessage;