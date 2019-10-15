import ChessGame from './chess/ChessGame';
import {Piece} from './constants';
import LichessBot from './lichess/LichessBot';
import MinimaxBot from './bots/MinimaxBot';

const game = new ChessGame('8/2k5/8/3Pp3/8/8/7Q/4K3 w - e6');

// const botOleg = new LichessBot(MinimaxBot);
// botOleg.start();

game.makeUciMove('d5e6');
game.printBoard();

// console.time('is move legal');
// for (let i = 0; i < 1_000_000; i++) {
//   game.isMoveLegal(3242);
// }
// console.timeEnd('is move legal');