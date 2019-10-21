import LichessApi from './LichessApi';
import {Bot, GameEventType, LichessGameEvent, RoomType} from '../types';
import {DEFAULT_POS} from '../constants/lichessContacts';
import {Color} from '../constants/chessGameConstants';
import ChessGame from '../chess/ChessGame';
import {g, m} from '../helpers';
import MinimaxBot from '../bots/MinimaxBot';

export default class LichessGame {
  gameId: string;
  playerId: string;
  api: LichessApi;
  bot: Bot;
  color: Color;

  constructor(gameId: string, playerId: string, api: LichessApi, botType: new(...args: any[]) => Bot) {
    this.gameId = gameId;
    this.playerId = playerId;
    this.api = api;
    this.bot = new botType();
    this.color = Color.WHITE;
  }

  start() {
    const onGameEnd = () => {
      if (this.bot instanceof MinimaxBot) {
        const averagePerformace = this.bot.performances.reduce((a, b) => a + b, 0) / this.bot.performances.length;
        console.log(`average performance: ${m(averagePerformace.toFixed(2))} kn/s`);
        console.log(`max performance: ${m(this.bot.maxPerformance)} kn/s`)
      }
    };

    this.api.streamGame(this.gameId, (event) => this.gameEventListener(event), onGameEnd);
  }

  gameEventListener(event: LichessGameEvent) {
    switch (event.type) {
      case GameEventType.CHAT_LINE:
        break;
      case GameEventType.GAME_FULL: {
        if (event.initialFen !== DEFAULT_POS) {
          this.bot.loadFen(event.initialFen);
        }

        this.color = (event.white.id === this.playerId) ? Color.WHITE : Color.BLACK;
        const moves = event.state.moves === '' ? [] : event.state.moves.split(' ');

        if (moves.length === 0) {
          console.log(m('*****************'));
          console.log(m(`Game ${g(this.gameId)} started!`));
          console.log(m('*****************'));
          this.api.sendMessage(this.gameId, RoomType.PLAYER, 'Hello! I am Oleg!');
        }

        this.bot.applyUciMoves(moves);
        this.playNextMove();
        break;
      }
      case GameEventType.GAME_STATE: {
        const moves = event.moves === '' ? [] : event.moves.split(' ');
        this.bot.makeUciMove(moves[moves.length - 1]);
        this.playNextMove();
        break;
      }
      default:
        console.error(`Unexpected game event: ${event}`);
    }
  }

  playNextMove() {
    if (this.color === this.bot.turn) {
      const nextMove = ChessGame.numericToUci(this.bot.getNextMove());
      this.api.makeMove(this.gameId, nextMove);
    }
  }
}