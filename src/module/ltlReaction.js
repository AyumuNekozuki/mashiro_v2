import Log4js from "log4js";
Log4js.configure("log-config.json");
const logger = Log4js.getLogger("Mk-LTLReaction");

import { parse } from 'twemoji-parser';

import { MkfetchApi } from "../misskey/init_misskey.js";

const reactionCreate = async (noteId, reaction) => {
  try{
    const result = await MkfetchApi("notes/reactions/create", {
      noteId: noteId,
      reaction: reaction + ""
    });
    logger.info(`Reaction: ${reaction} to ${noteId}`)
  }catch(e){
    logger.error(e);
  }
}

const ltlReaction = async (msg) => {
  const note = msg.body.body;

  if (note.replyId) return;
  if (!note.text) return;
  if (note.text.indexOf('@') > 0) return;

  // カスタム絵文字
  const customEmojis = note.text.match(/:([^\n:]+?):/g);
  if (customEmojis) {
    if (!customEmojis.every((val, i, arr) => val === arr[0])) return;
    return reactionCreate(note.id, customEmojis[0]);
  }

  // Unicode絵文字
  const emojis = parse(note.text).map(x => x.text);
  if (emojis.length > 0) {
    if (!emojis.every((val, i, arr) => val === arr[0])) return;
    let reaction = emojis[0];
    switch (reaction) {
      case '✊': return reactionCreate(note.id, '🖐');
      case '✌': return reactionCreate(note.id, '✊');
      case '🖐': case '✋': return reactionCreate(note.id, '✌');
    }

    return reactionCreate(note.id, reaction);
  }

  if(note.text.indexOf('すし') > 0){
    return reactionCreate(note.id, '🍣')
  };

  if(note.text.indexOf('おなかすいた') > 0){
    return reactionCreate(note.id, '🍔')
  };
  if(note.text.indexOf('ねむい') > 0){
    return reactionCreate(note.id, '💤')
  };
  if(note.text.indexOf('ましろ') > 0){
    return reactionCreate(note.id, '🤍')
  };

}

export default ltlReaction;