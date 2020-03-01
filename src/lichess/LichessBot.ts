import LichessApi from './LichessApi';
import LichessGame from './LichessGame';
import RandomBot from '../bots/RandomBot';
import {
  LichessLobbyEvent,
  LobbyEventType,
  RoomType,
  Bot
} from '../types';
import { m } from '../helpers';
import * as dotenv from 'dotenv';
dotenv.config();

const token = process.env.TOKEN!;

// const whiteList = ['victorinthesky', 'droooney', 'tonygbotdev', 'tonygbot'];
const whiteList = ['victorinthesky', 'droooney', 'tonygbotdev', 'tonygbot'];

export default class LichessBot {
  api: LichessApi;
  accountId: string;
  botType: new(...args: any[]) => Bot;

  constructor(botType: new(...args: any[]) => Bot) {
    this.api = new LichessApi(token);
    this.accountId = '';
    this.botType = botType;
  }

  async start() {
    const account = await this.api.getAccountInfo();
    this.accountId = account.id;
    this.api.streamLobby((event) => this.challengeEventListener(event));

    console.log(m('*****************'));
    console.log(m('Bot is started!'));
    console.log(m('*****************'));
  }

  challengeEventListener(event: LichessLobbyEvent) {
    switch(event.type) {
      case LobbyEventType.CHALLENGE:
        if (whiteList.includes(event.challenge.challenger.id)) {
          this.api.acceptChallenge(event.challenge.id);
        } else {
          this.api.declineChallenge(event.challenge.id);
        }
        break;
      case LobbyEventType.GAME_START:
        this.startGame(event.game.id);
        break;
      default:
        console.error(`Unexpected lobby event: ${event}`);
    }
  }

  startGame(gameId: string) {
    const game = new LichessGame(gameId, this.accountId, this.api, this.botType);
    game.start();
  }
}