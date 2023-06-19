import Log4js from "log4js";
Log4js.configure("log-config.json");
const logger = Log4js.getLogger("core");

import ping from "../module/ping.js";
import talkgpt from "../module/talkgpt.js";
import { remind, remindClear } from "../module/remind.js";


const forwardMessage = async (inputText, messageLog, msgObj) => {
  try{
    // リマインダーチェック
    if(typeof global.memory.data.remind[msgObj.replyId] !== "undefined" || typeof global.memory.data.remind[msgObj.reply.renoteId] !== "undefined"){
      return await remindClear(msgObj);

      // なければ通常フローへ
    }else if(inputText.match(/ping/)){
      return await ping();
    }else if(inputText.match(/rmdtst/)){
      return await remind(msgObj);
    }else{
      return await talkgpt(inputText, messageLog);
    }
  }catch(e){
    logger.error(e);
    return "サーバーでエラーが起きたみたいです...";
  }
}

export default forwardMessage;