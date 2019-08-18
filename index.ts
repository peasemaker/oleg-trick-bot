import ChessGame from './helpers/ChessGame';
import LichessBot from './src/LichessBot';

const botOleg = new LichessBot();
botOleg.start();

// const game = new ChessGame();
// const game = new ChessGame('4k2r/r2q1ppp/ppp1bn2/PBbpp3/4PP2/1NNP4/1PPBQ1PP/R3K2R w KQk - 1 13');
// const game = new ChessGame('rnbqkbnr/8/8/8/8/3K4/8/8 w KQkq - 0 2');
// const game = new ChessGame('r1bqkbnr/pp1pp1pp/2n5/2p1Pp2/8/5N2/PPPP1PPP/RNBQKB1R w KQkq f6 0 4');

// game.makeMove('e5f6');
// console.log(game.isCheck());
// console.log('###########');
// game2.printBoard();
// console.log('###########');
// game3.printBoard();
// console.log('###########');
// game4.printBoard();
// console.log(game.getLegalMoves());