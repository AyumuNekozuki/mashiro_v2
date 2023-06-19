import { MkfetchApi } from "../misskey/init_misskey.js";


const sleepReport = () => {
  const Now = Date.now();
  const sleepTime = Now - global.memory.lastWakeUp;
  const sleepHours = sleepTime / 1000 / 60 / 60;

  // 0.1時間未満は無視
  if (sleepHours < 0.1) return;

  if (sleepHours >= 1) {
    MkfetchApi("notes/create", {
      text: `んぅ、${sleepHours}時間ぐらい眠ちゃってたみたいです...`
    });
  } else {
    MkfetchApi("notes/create", {
      text: "ん... うたた寝しちゃってました..."
    });
  }
}

export default sleepReport;