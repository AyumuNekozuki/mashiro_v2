// Slack接続用

import Log4js from "log4js";
Log4js.configure("log-config.json");
const logger = Log4js.getLogger("slack");

import slackBolt from '@slack/bolt';
const { App } = slackBolt;
import botConfig from "../../config.json" assert { type: 'json' };

import forwardMessage from "../module/forwardMessage.js";

const app = new App({
  token: botConfig.slack.botToken,
  signingSecret: botConfig.slack.signingSecret,
  socketMode: true,
  appToken: botConfig.slack.appToken,
  port: botConfig.slack.port || 3001,
});

app.event('app_mention', async ({ event, context, client, say }) => {
  try{
    const inputText = event.text.replace(/<@.*>/g, "").trim();
    logger.info(`Received Message: ${inputText}`);

    var messageLog = null;
    if(typeof global.memory?.data?.messages?.slack?.[event.user] !== "undefined"){
      messageLog = global.memory.data.messages.slack[event.user];
    }

    const response = await forwardMessage(inputText, messageLog);

    await say({
      text: `<@${event.user}> ${response}`,
      thread_ts: event.ts,
    });
    logger.info(`Send Message: ${response}`);

    if(typeof global.memory?.data?.messages?.slack?.[event.user] === "undefined"){
      global.memory.data.messages.slack = {
        ...global.memory.data.messages.slack,
        [event.user]: []
      };
    }

    global.memory.data.messages.slack[event.user].push(`${event.user}: ${inputText}`);
    global.memory.data.messages.slack[event.user].push(`あなた: ${response}`);

  }catch(e){
    logger.error(e);
  }
});

const init_slack = async () => {
  await app.start();
  logger.info("⚡️ Bolt app is running!");
}

export default init_slack;