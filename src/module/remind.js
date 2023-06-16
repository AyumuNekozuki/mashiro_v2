const reminderDateCheck = (msgid, date) => {
  // const interval = setInterval(reminderDateCheck(msgid, date), 1000 * 60);

  // if(Date.now() > date){
  //   MkfetchApi("notes/create", {
  //     replyId: msgid,
  //     text: "これの進捗、どうでしょう...？",
  //   })


  //   clearInterval(interval);
  // }
  // TODO
}

const remind = (msgObj) => {
  if(typeof msgObj === "undefined") return 'ごめんなさい...Misskey以外では使えないんです...';

  global.memory.data.remind = [
    ...global.memory.data.remind,
    {
      "msgid": [msgObj.id],
      "date": Date.now() + 1000 * 60 * 60 * 3
    }
  ];

  return '了解です！３時間後にリマインドします！';
}

export { remind, reminderDateCheck };