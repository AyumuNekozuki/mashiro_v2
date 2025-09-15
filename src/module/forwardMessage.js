import Log4js from "log4js";
Log4js.configure("log-config.json");
const logger = Log4js.getLogger("core");

import ping from "../module/ping.js";
import talkgpt from "../module/talkgpt.js";

const forwardMessage = async (inputText, messageLog, msgObj) => {
  try {
    if (inputText.match(/ping/)) {
      return await ping();
    }
    return await talkgpt(inputText, messageLog);
  } catch (e) {
    logger.error(e);
    return "サーバーでエラーが起きたみたいです...";
  }
}

export default forwardMessage;