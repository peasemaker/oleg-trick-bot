import ChessGame from './chess/ChessGame';
import {Piece} from './constants';
import LichessBot from './lichess/LichessBot';
import MinimaxBot from './bots/MinimaxBot';

const game = new ChessGame('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');

const botOleg = new LichessBot(MinimaxBot);
botOleg.start();
