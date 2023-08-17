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
  "memoryDir": "data",
  "chatgpt": {
    "isEnabled": true, 
    "apikey": "apiKey",
    "functions": {
      "weatherapi_apikey": "weatherapi.com's apikey" 
    }
  },
  "misskey": {
    "isEnabled": true, 
    "host": "Misskey Instance Domain: example.com", 
    "token": "AccessToken" 
  },
  "discord": { 
    "isEnabled": true,
    "token": "BotToken" 
  },
  "slack": { 
    "isEnabled": true,
    "port": 3001,
    "botToken": "bot token", 
    "signingSecret": "SigningSecret", 
    "appToken": "xapp-token" 
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

ファイルを作ったら、
`yarn install` → `yarn start` で起動できます。

systemdの設定などよしなにしてください。
