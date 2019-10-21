import ChessGame from './chess/ChessGame';
import {Piece} from './constants';
import LichessBot from './lichess/LichessBot';
import MinimaxBot from './bots/MinimaxBot';

const game = new ChessGame('6b1/5P2/8/8/3n1k2/8/8/4K2R w K - 0 1');

const botOleg = new LichessBot(MinimaxBot);
botOleg.start();
