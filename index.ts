import ChessGame from './helpers/chess';
import LichessBot from './src/LichessBot';

const botOleg = new LichessBot();
botOleg.start();

const game1 = new ChessGame();
// const game2 = new ChessGame('r4rk1/pp3qpp/2p1b3/3np1N1/1P2B3/P5PP/3Q1P2/3R1RK1 b - - 0 24');
// const game3 = new ChessGame('r3kb1r/ppp1pppp/3q1n2/3P4/1n1P4/5N2/PPP1QPPP/RNB2RK1 b kq - 4 8');
// const game4 = new ChessGame('r1bqkbnr/pp1pp1pp/2n5/2p1Pp2/8/5N2/PPPP1PPP/RNBQKB1R w KQkq f6 0 4');
//
game1.printBoard();
// console.log('###########');
// game2.printBoard();
// console.log('###########');
// game3.printBoard();
// console.log('###########');
// game4.printBoard();

game1.makeMove('e2e8q');
console.log('#########');
game1.printBoard();
