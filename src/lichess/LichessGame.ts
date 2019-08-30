import {DEFAULT_POS, GameEventType, LichessGameEvent} from './types';
import LichessApi from './LichessApi';
import RandomBot from '../bots/RandomBot';
import SemiRandomBot from '../bots/SemiRandomBot';
import {Bot} from '../types';

export default class LichessGame {
  gameId: string;
  playerId: string;
  api: LichessApi;
  bot: Bot;
  color: 0 | 1;

  constructor(gameId: string, playerId: string, api: LichessApi, botType: new(...args: any[]) => Bot) {
    this.gameId = gameId;
    this.playerId = playerId;
    this.api = api;
    this.bot = new botType();
    this.color = 0;
  }

  start() {
    this.api.streamGame(this.gameId, (event) => this.gameEventListener(event));
  }

  gameEventListener(event: LichessGameEvent) {
    switch (event.type) {
      case GameEventType.CHAT_LINE:
        break;
      case GameEventType.GAME_FULL: {
        if (event.initialFen !== DEFAULT_POS) {
          this.bot.loadFen(event.initialFen);
        }

        this.color = event.white.id === this.playerId ? 0 : 1;
        const moves = event.state.moves === '' ? [] : event.state.moves.split(' ');
        this.bot.applyUciMoves(moves);
        this.playNextMove(moves);
        break;
      }
      case GameEventType.GAME_STATE: {
        const moves = event.moves === '' ? [] : event.moves.split(' ');
        this.bot.makeUciMove(moves[moves.length - 1]);
        this.playNextMove(moves);
        break;
      }
      default:
        console.error(`Unexpected game event: ${event}`);
    }
  }

  isTurn(moves: string[]) {
    const remainder = moves.length % 2;

    return this.color === 0 ? remainder === 0 : remainder === 1;
  }

  playNextMove(moves: string[]) {
    if (this.isTurn(moves)) {
      const start = process.hrtime.bigint();

      const nextMove = this.bot.getNextMove();

      const end = process.hrtime.bigint();
      console.log(`move ${nextMove} time: ${Number(end - start) / 1000000} ms`);

      this.api.makeMove(this.gameId, nextMove);
    }
  }
}