const reminderDateCheck = (msgid, date) => {

  if(Date.now() > date){
    MkfetchApi("notes/create", {
      replyId: msgid,
      text: "これの進捗、どうでしょう...？",
    })

    global.memory.data.remind[msgid] = Date.now() + 1000 * 60 * 60 * 3;
  }
}

const remind = (msgObj) => {
  if(typeof msgObj === "undefined") return 'ごめんなさい...Misskey以外では使えないんです...';

  global.memory.data.remind = [
    ...global.memory.data.remind,
    {[msgObj.id]: Date.now() + 1000 * 60 * 60 * 3}
  ];

  return 'この機能は準備中です...ごめんなさい...';
}

export { remind, reminderDateCheck };