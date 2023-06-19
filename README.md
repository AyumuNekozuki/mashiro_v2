<h1><p align="center"><img src="https://raw.githubusercontent.com/AyumuNekozuki/mashiro_v2/main/mashiro.png" alt="Mashiro-code" height="200"></p></h1>
<p align="center">An Mashiro for Misskey.</p>

---

## これなに

汎用チャットボットです。ChatGPTを使ってます。
Misskey, Discord, Slackで利用できます。

できることは [こちら](https://ayumunekozuki.notion.site/b6998c77d0bb483b8db5859d5f774e5f?pvs=4) に。

## 使い方

一部ファイルを自前で用意する必要があります。

./config.json

```json
{
  "memoryDir": "data", //記憶の保存先
  "chatgpt": { //ChatGPTの設定
    "isEnabled": true, 
    "apikey": "hogehoge", //ChatGPTのAPIキー
    "functions": {
      "weatherapi_apikey": "hogehoge" //天気予報APIのAPIキー
    }
  },
  "misskey": { //Misskeyの設定
    "isEnabled": true, 
    "host": "example.com", //動かすインスタンスのドメイン
    "token": "hogehoge" // MisskeyのBotアカウントのアクセストークン
  },
  "discord": { //Discordの設定
    "isEnabled": true,
    "token": "hogehoge" //DiscordのBotトークン
  },
  "slack": { //Slackの設定
    "isEnabled": true,
    "port": 3001,
    "botToken": "", //SlackのBotトークン
    "signingSecret": "hogehoge", //signingSecret
    "appToken": "xapp-hogehoge" //SlackのAppトークン
  }
}

```

./src/lib/prompt.js

```js
// ChatGPT用のプロンプトファイルです。
// キャラクターに合わせて上手く調整してください。

const prompt = `

ここにプロンプトを書く

`;

export default prompt;

```