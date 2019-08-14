import {DEFAULT_POS, GameEventType, LichessGameEvent, LichessGameFullEvent} from '../types';
import LichessApi from '../helpers/lichessApi';
import ChessGame from '../helpers/chess';

export default class LichessGame {
    gameId: string;
    playerId: string;
    chessGame: ChessGame;
    api: LichessApi;
    color: 'w' | 'b';

    constructor(gameId, playerId, api) {
        this.gameId = gameId;
        this.playerId = playerId;
        this.api = api;
    }

    start() {
        this.api.streamGame(this.gameId, (event) => this.gameEventListener(event));
    }

    gameEventListener(event: LichessGameEvent) {
        switch (event.type) {
            case GameEventType.CHAT_LINE:
                break;
            case GameEventType.GAME_FULL:
                if (event.initialFen === DEFAULT_POS) {
                    this.chessGame = new ChessGame();
                } else {
                    this.chessGame = new ChessGame(event.initialFen);
                }

                const moves = event.state.moves === '' ? [] : event.state.moves.split(' ');
                this.chessGame.applyMoves(moves);
                this.setColor(event);
                this.playNextMove(event.state.moves);
                break;
            case GameEventType.GAME_STATE:
                this.playNextMove(event.moves);
                break;
            default:
                console.error(`Unexpected game event: ${event}`);
        }
    }

    isTurn(moves: string[]) {
        const remainder = moves.length % 2;

        return this.color === 'w' ? remainder === 0 : remainder === 1;
    }

    playNextMove(prevMoves: string) {
        const moves = prevMoves === '' ? [] : prevMoves.split(' ');

        if (this.isTurn(moves)) {
            if (this.color === 'w') {
                this.api.makeMove(this.gameId, 'e2e4');
            } else {
                this.api.makeMove(this.gameId, 'e7e5');
            }
        }
    }

    setColor(event: LichessGameFullEvent) {
        this.color = event.white.id === this.playerId ? 'w' : 'b';
    }
}