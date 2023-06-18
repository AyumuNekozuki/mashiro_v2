// GPT接続用

import Log4js from "log4js";
Log4js.configure("log-config.json");
const logger = Log4js.getLogger("GPT");

import { Configuration, OpenAIApi } from "openai";
import prompt from "../lib/prompt.js";
import botConfig from "../../config.json" assert { type: 'json' };

import getWeather from "./weather.js";

const configuration = new Configuration({
  apiKey: botConfig.chatgpt.apikey,
});
const openai = new OpenAIApi(configuration);


const getGPTResult = async (messages) => {
  return await openai.createChatCompletion({
    model: "gpt-3.5-turbo-0613",
    messages: messages,
    functions: [
      {
        "name": "get_current_weather",
        "description": "今日の指定した地点の天気情報を取得する",
        "parameters": {
          "type": "object",
          "properties": {
            "location": {
              "type": "string",
              "description": `都道府県名。英語で入力すること。東京近郊の地名が入力された場合は東京に置き換え、それ以外の地名が入力された場合は、県庁所在地名に置き換えること。例：原宿→Tokyo, 渋谷→Tokyo, 北海道→Sapporo, 沖縄→Naha, 京都→Kyoto`
            },
          },
          "required": ["location"]
        }
      }
    ],
    function_call: "auto"
  });
}

export default async function talkgpt(inputText, messageLog) {
   let messages = [
    { "role": "system", "content": prompt },
   ];

   if(messageLog != null){
    let messageLogPrompt = "以下に示すものは、あなたと、これからあなたが会話する相手との過去の会話です。返答の参考にしてください。\n\n";

    messageLog.forEach(msg => {
      messageLogPrompt += `${msg}\n`
    });

    messages.push({ "role": "system", "content": messageLogPrompt })
   }

  messages.push({ "role": "user", "content": inputText })
  let exportTexts = "";

  try {
    // 初回回答GET
    let response = await getGPTResult(messages);

    // 関数呼び出しがあれば
    if(response.data.choices[0].message.function_call){

      switch (response.data.choices[0].message.function_call.name) {
        case "get_current_weather":
          var functionData = getWeather(response.data.choices[0].message.function_call.arguments);
          break;
      
        default:
          break;
      }

      messages.push(
        { 
          "role": "assistant", 
          "content": null, 
          "function_call": {
            "name": "get_current_weather",
            "arguments": response.data.choices[0].message.function_call.arguments
          }
        },
        {
          "role": "function",
          "name": "get_current_weather",
          "content": JSON.stringify(functionData)
        }
      );
      response = await getGPTResult(messages);
    }
    
    const retryOverLength = () => {
      messages.push(
        {
          "role": "user",
          "content": "もうちょっと短くしてくれませんか...？100文字以下で回答をお願いします。"
        }
      )

      return getGPTResult(messages);
    }

    // 150文字以上なら
    if(response.data.choices[0].message.content.replace(/<@.*>/g, "").trim().length > 150){
      response = await retryOverLength();
    }

    exportTexts = response.data.choices[0].message.content.replace(/<@.*>/g, "").trim();


    if(exportTexts.length > 150){
      exportTexts = "わたしちょっとよく知らなくて...よかったら教えてくれませんか...？"
    }
    return exportTexts;

  } catch(e) {
    logger.error(e);
    return "サーバーでエラーが起きたみたいです...";
  }
}