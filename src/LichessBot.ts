import {LichessLobbyEvent, LobbyEventType, RoomType} from '../types';
import LichessApi from '../helpers/LichessApi';
import LichessGame from './LichessGame';

let gameId = '';
const token = '3LBpuFgvWMF74HgB';

export default class LichessBot {
  api: LichessApi;
  accountId: string;

  constructor() {
    this.api = new LichessApi(token);
  }

  async start() {
    const account = await this.api.getAccountInfo();
    this.accountId = account.id;
    this.api.streamLobby((event) => this.challengeEventListener(event));
  }

  challengeEventListener(event: LichessLobbyEvent) {
    switch(event.type) {
      case LobbyEventType.CHALLENGE:
        this.api.acceptChallenge(event.challenge.id);
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
    const game = new LichessGame(gameId, this.accountId, this.api);
    game.start();
  }
}