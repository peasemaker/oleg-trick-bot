import ChessGame from './chess/ChessGame';
import LichessBot from './lichess/LichessBot';
import RandomBot from './bots/RandomBot';

const randomBot = new RandomBot();
const botOleg = new LichessBot(randomBot);
botOleg.start();

const game = new ChessGame('1b1b1b1b/bkb1b1b1/1b1b1b1b/b1b1b1b1/1b1b1b1b/b1b1b1b1/1b1b1b1b/b1bKb1b1 w - - 0 0');
// const game = new ChessGame('rnbqkb1r/ppp2ppp/5n2/1B1pp3/4P3/2N2N2/PPPP1PPP/R1BQK2R b KQkq - 1 4');
// const game = new ChessGame('rnbqkbnr/8/8/8/8/3K4/8/8 w KQkq - 0 2');
// const game = new ChessGame('1nbqkbnr/Pppppppp/8/8/8/8/1PPPPPPP/RNBQKBNR w KQkq -');

// game.printBoard();
// console.log(game.isDraw());
// console.log(game.getLegalMoves());
// console.log(game.isInsufficientMaterial());