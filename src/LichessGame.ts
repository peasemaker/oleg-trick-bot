import {DEFAULT_POS, GameEventType, LichessGameEvent} from '../types';
import LichessApi from '../helpers/LichessApi';
import ChessGame from '../helpers/ChessGame';
import RandomBot from './Bots/RandomBot';

export default class LichessGame {
  gameId: string;
  playerId: string;
  chessGame: ChessGame;
  api: LichessApi;
  bot: RandomBot;
  color: 'w' | 'b';

  constructor(gameId: string, playerId: string, api: LichessApi, bot: RandomBot) {
    this.gameId = gameId;
    this.playerId = playerId;
    this.api = api;
    this.bot = bot;
    this.chessGame = new ChessGame();
    this.color = 'w';
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
          this.chessGame = new ChessGame(event.initialFen);
        }

        this.color = event.white.id === this.playerId ? 'w' : 'b';
        const moves = event.state.moves === '' ? [] : event.state.moves.split(' ');
        this.chessGame.applyMoves(moves);
        this.playNextMove(moves);
        break;
      }
      case GameEventType.GAME_STATE: {
        const moves = event.moves === '' ? [] : event.moves.split(' ');
        this.chessGame.makeMove(moves[moves.length - 1]);
        this.playNextMove(moves);
        break;
      }
      default:
        console.error(`Unexpected game event: ${event}`);
    }
  }

  isTurn(moves: string[]) {
    const remainder = moves.length % 2;

    return this.color === 'w' ? remainder === 0 : remainder === 1;
  }

  playNextMove(moves: string[]) {
    if (this.isTurn(moves)) {
      const nextMove = this.bot.getNextMove(this.chessGame);

      if (nextMove) {
        this.api.makeMove(this.gameId, nextMove);
      } else {
        this.api.resignGame(this.gameId);
      }
    }
  }
}