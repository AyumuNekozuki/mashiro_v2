// GPT接続用

import Log4js from "log4js";
Log4js.configure("log-config.json");
const logger = Log4js.getLogger("GPT");

import OpenAI from "openai";
import prompt from "../lib/prompt.js";
import botConfig from "../../config.json" with { type: 'json' };
import requestQueue from "../lib/requestQueue.js";

import getWeather from "./weather.js";

const openai = new OpenAI({
  apiKey: botConfig.chatgpt.apikey,
});


// レート制限管理
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1秒間隔

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const getGPTResult = async (messages, retryCount = 0) => {
  const MAX_RETRIES = 3;
  const RETRY_DELAYS = [1000, 2000, 5000]; // 1秒、2秒、5秒

  try {
    // レート制限対策：前回のリクエストから最低1秒待機
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      await delay(MIN_REQUEST_INTERVAL - timeSinceLastRequest);
    }
    lastRequestTime = Date.now();

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      // tools: [
      //   {
      //     "type": "function",
      //     "function": {
      //       "name": "get_current_weather",
      //       "description": "今日の指定した地点の天気情報を取得する",
      //       "parameters": {
      //         "type": "object",
      //         "properties": {
      //           "location": {
      //             "type": "string",
      //             "description": `都道府県名。英語で入力すること。東京近郊の地名が入力された場合は東京に置き換え、それ以外の地名が入力された場合は、県庁所在地名に置き換えること。例：原宿→Tokyo, 渋谷→Tokyo, 北海道→Sapporo, 沖縄→Naha, 京都→Kyoto`
      //           },
      //         },
      //         "required": ["location"]
      //       }
      //     }
      //   }
      // ],
      // tool_choice: "auto"
    });

    return response;

  } catch (error) {
    // 429エラー（Rate Limited）の場合のリトライ処理
    if (error.status === 429 && retryCount < MAX_RETRIES) {
      const retryDelay = RETRY_DELAYS[retryCount] || 5000;
      logger.warn(`Rate limited (429). Retrying in ${retryDelay}ms... (attempt ${retryCount + 1}/${MAX_RETRIES})`);
      await delay(retryDelay);
      return getGPTResult(messages, retryCount + 1);
    }

    // その他のエラーまたは最大リトライ回数到達の場合
    throw error;
  }
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
    // 初回回答GET（キュー経由）
    let response = await requestQueue.add(() => getGPTResult(messages));

    // ツール呼び出しがあれば
    if(response.choices[0].message.tool_calls){

      let functionData = null;
      const toolCall = response.choices[0].message.tool_calls[0];
      
      switch (toolCall.function.name) {
        case "get_current_weather":
          functionData = await getWeather(toolCall.function.arguments);
          break;
      
        default:
          break;
      }

      messages.push(
        { 
          "role": "assistant", 
          "content": null, 
          "tool_calls": response.choices[0].message.tool_calls
        },
        {
          "role": "tool",
          "tool_call_id": toolCall.id,
          "content": JSON.stringify(functionData)
        }
      );
      response = await requestQueue.add(() => getGPTResult(messages));
    }
    
    const retryOverLength = async () => {
      messages.push(
        {
          "role": "user",
          "content": "もうちょっと短くしてくれませんか...？100文字以下で回答をお願いします。"
        }
      )

      return await requestQueue.add(() => getGPTResult(messages));
    }

    // 150文字以上なら
    if(response.choices[0].message.content.replace(/<@.*>/g, "").trim().length > 150){
      response = await retryOverLength();
    }

    exportTexts = response.choices[0].message.content.replace(/<@.*>/g, "").trim();


    if(exportTexts.length > 150){
      exportTexts = "わたしちょっとよく知らなくて...よかったら教えてくれませんか...？"
    }
    return exportTexts;

  } catch(e) {
    logger.error("GPT API Error:", e);
    
    // 429エラーの場合の特別なメッセージ
    if (e.status === 429) {
      logger.warn("Rate limit exceeded, returning rate limit message");
      return "少し時間をおいてからもう一度話しかけてください...";
    }
    
    // その他のAPIエラー
    if (e.status) {
      logger.error(`API Error: ${e.status} - ${e.message}`);
    }
    
    return "サーバーでエラーが起きたみたいです...";
  }
}