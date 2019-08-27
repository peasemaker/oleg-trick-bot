import ChessGame from './chess/ChessGame';
import LichessBot from './lichess/LichessBot';
import RandomBot from './bots/RandomBot';
import SemiRandomBot from './bots/SemiRandomBot';

const randomBot = new RandomBot();
const semiRandomBot = new SemiRandomBot();
const botOleg = new LichessBot(semiRandomBot);
botOleg.start();

const game = new ChessGame('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
// const game = new ChessGame('rnbqkb1r/ppp2ppp/5n2/1B1pp3/4P3/2N2N2/PPPP1PPP/R1BQK2R b KQkq - 1 4');
// const game = new ChessGame('rnbqkbnr/8/8/8/8/3K4/8/8 w KQkq - 0 2');
// const game = new ChessGame('1nbqkbnr/Pppppppp/8/8/8/8/1PPPPPPP/RNBQKBNR w KQkq -');