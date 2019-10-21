import ChessGame from './chess/ChessGame';
import {Piece} from './constants';
import LichessBot from './lichess/LichessBot';
import MinimaxBot from './bots/MinimaxBot';

const game = new ChessGame('6b1/5P2/8/8/3n1k2/8/8/4K2R w K - 0 1');

// const botOleg = new LichessBot(MinimaxBot);
// botOleg.start();

game.makeUciMove('f7f8q');
game.printBoard();
console.log(game.getLegalMoves().map(m => ChessGame.numericToUci(m)));

// console.time('is move legal');
// for (let i = 0; i < 1_000_000; i++) {
//   game.isMoveLegal(3242);
// }
// console.timeEnd('is move legal');