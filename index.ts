import ChessGame from './helpers/ChessGame';
import LichessBot from './src/LichessBot';
import RandomBot from './src/Bots/RandomBot';

const randomBot = new RandomBot();
const botOleg = new LichessBot(randomBot);
botOleg.start();

const game = new ChessGame('1k6/4Q3/7p/2P4P/8/8/P2P1PP1/RNBQK2R w KQ - 1 25');
// const game = new ChessGame('rnbqkb1r/ppp2ppp/5n2/1B1pp3/4P3/2N2N2/PPPP1PPP/R1BQK2R b KQkq - 1 4');
// const game = new ChessGame('rnbqkbnr/8/8/8/8/3K4/8/8 w KQkq - 0 2');
// const game = new ChessGame('1nbqkbnr/Pppppppp/8/8/8/8/1PPPPPPP/RNBQKBNR w KQkq -');

// game.printBoard();
console.log(game.getLegalMoves());
// console.log('###########');
// console.log(game.getLegalMoves());