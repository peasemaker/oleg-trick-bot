import {LichessLobbyEvent, LobbyEventType, RoomType} from '../types';
import LichessApi from '../helpers/LichessApi';
import LichessGame from './LichessGame';
import RandomBot from './Bots/RandomBot';

const token = '3LBpuFgvWMF74HgB';
const whiteList = ['victorinthesky', 'droooney', 'tonygbotdev'];

export default class LichessBot {
  api: LichessApi;
  bot: RandomBot;
  accountId: string;

  constructor(bot: RandomBot) {
    this.api = new LichessApi(token);
    this.bot = bot;
    this.accountId = '';
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
    const game = new LichessGame(gameId, this.accountId, this.api, this.bot);
    game.start();
  }
}