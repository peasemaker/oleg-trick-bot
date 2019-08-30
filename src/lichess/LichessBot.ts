import {LichessLobbyEvent, LobbyEventType, RoomType} from './types';
import LichessApi from './LichessApi';
import LichessGame from './LichessGame';
import RandomBot from '../bots/RandomBot';
import {Bot} from '../types';

const token = '3LBpuFgvWMF74HgB';
const whiteList = ['victorinthesky', 'droooney', 'tonygbotdev'];

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
        this.api.sendMessage(event.game.id, RoomType.PLAYER, 'Hello! I am Oleg!');
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