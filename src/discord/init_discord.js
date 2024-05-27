// Discord接続用

import Log4js from "log4js";
Log4js.configure("log-config.json");
const logger = Log4js.getLogger("discord");

import { Client, Events, GatewayIntentBits, ActivityType } from "discord.js";
import botConfig from "../../config.json" assert { type: 'json' };

import forwardMessage from "../module/forwardMessage.js";
import { saveTalkLog } from "../module/memory.js";

import { MkfetchApi } from "../misskey/init_misskey.js"

const discordClient = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
	]
});


const init_discord = () => {
	discordClient.once(Events.ClientReady, c => {
		logger.info(`Ready! Logged in as ${c.user?.tag}`);

		discordClient.user.setActivity("みすほわいと", {
			type: ActivityType.Watching,
		});

		discordClient.on(Events.MessageCreate, async message => {
			if (message.mentions.users.first()?.username !== c.user.username) return;

			try{
				message.channel.sendTyping();

				const inputText = message.content.replace(/<@.*>/g, "").trim();
				logger.info(`Received Message: ${inputText}`);

				var messageLog = null;
				if(typeof global.memory?.data?.messages?.discord?.[message.author.username] !== "undefined"){
					messageLog = global.memory.data.messages.discord[message.author.username];
				}

				const response = await forwardMessage(inputText, messageLog);
	
				if(response){
					message.reply(response);
					logger.info(`Send Message: ${response}`);

					saveTalkLog("discord", message.author.username, inputText, response);

				}else{
					message.reply("サーバーでエラーが起きたみたいです...");
				}
			}catch(e){
				message.reply("サーバーでエラーが起きたみたいです...");
				logger.error(e);
			}
		});

		setInterval(async () => {
			try{
				const pingResponse = await MkfetchApi("ping", {});
				if(!pingResponse.pong) throw new Error(`Misskey Ping: Failed`);

				discordClient.user.setActivity("みすほわいと", {
					type: ActivityType.Watching,
				});
				logger.info(`Misskey Ping: Success ${pingResponse.pong}`);
			}catch(e){
				discordClient.user.setActivity("みすほわが見れません...", {
					type: ActivityType.Custom,
				});
				logger.error(e);
			}

		}, 1000 * 60 * 15);


	});
	discordClient.login(botConfig.discord.token);
}

export default init_discord;