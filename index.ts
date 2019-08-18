import ChessGame from './helpers/ChessGame';
import LichessBot from './src/LichessBot';

const botOleg = new LichessBot();
botOleg.start();

// const game = new ChessGame();
// const game = new ChessGame('rnbqkb1r/ppp2ppp/5n2/1B1pp3/4P3/2N2N2/PPPP1PPP/R1BQK2R b KQkq - 1 4');
// const game = new ChessGame('rnbqkbnr/8/8/8/8/3K4/8/8 w KQkq - 0 2');
// const game = new ChessGame('r1bqkbnr/pp1pp1pp/2n5/2p1Pp2/8/5N2/PPPP1PPP/RNBQKB1R w KQkq f6 0 4');

// game.printBoard();
// console.log('###########');