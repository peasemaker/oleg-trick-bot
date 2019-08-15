import ChessGame from './helpers/chess';
import LichessBot from './src/LichessBot';

const botOleg = new LichessBot();
botOleg.start();

// const game1 = new ChessGame();
const game2 = new ChessGame('4k2r/r2q1ppp/ppp1bn2/PBbpp3/4PP2/1NNP4/1PPBQ1PP/R3K2R w KQk - 1 13');
// const game3 = new ChessGame('r3kb1r/ppp1pppp/3q1n2/3P4/1n1P4/5N2/PPP1QPPP/RNB2RK1 b kq - 4 8');
// const game4 = new ChessGame('r1bqkbnr/pp1pp1pp/2n5/2p1Pp2/8/5N2/PPPP1PPP/RNBQKB1R w KQkq f6 0 4');
//
game2.printBoard();
// console.log('###########');
// game2.printBoard();
// console.log('###########');
// game3.printBoard();
// console.log('###########');
// game4.printBoard();
console.log(game2.getLegalMoves());