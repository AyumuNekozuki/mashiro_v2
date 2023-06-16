// 記憶保持するためのモジュール
// 記憶自体は data/memory.json に保存される

import Log4js from "log4js";
Log4js.configure("log-config.json");
const logger = Log4js.getLogger("Memory");

import fs from "fs";

import botConfig from "../../config.json" assert { type: 'json' };

const memoryPath = `${botConfig.memoryDir}/memory.json`;

const loadMemory = () => {
  if(fs.existsSync(memoryPath)) {
    const memory = JSON.parse(fs.readFileSync(memoryPath, "utf-8"));
    global.memory = memory;
  } else {
    logger.info("Memory file not found. Create new file.");
    global.memory = {
      "filename": memoryPath,
      "lastWakeUp": 0,
      "data": {
        "messages": {}
      }
    };
    fs.writeFileSync(memoryPath, JSON.stringify(global.memory));
  }
 
  // autosave
  setInterval(saveMemory, 1000);
}

const saveMemory = () => {
  global.memory.lastWakeUp = Date.now();
  fs.writeFileSync(memoryPath, JSON.stringify(global.memory));
}

export default loadMemory;