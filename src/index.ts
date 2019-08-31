import ChessGame from './chess/ChessGame';
import LichessBot from './lichess/LichessBot';
import RandomBot from './bots/RandomBot';
import SemiRandomBot from './bots/SemiRandomBot';
import MinimaxBot from './bots/MinimaxBot';


const game = new ChessGame('r1bq1rk1/ppppbpp1/2n2n1p/7P/4pP2/P1PBP3/1P1P2P1/RNBQK1NR b KQ f3 0 8');
// const game = new ChessGame('rnbqkb1r/ppp2ppp/5n2/1B1pp3/4P3/2N2N2/PPPP1PPP/R1BQK2R b KQkq - 1 4');
// const game = new ChessGame('rnbqkbnr/8/8/8/8/3K4/8/8 w KQkq - 0 2');
// const game = new ChessGame('1nbqkbnr/Pppppppp/8/8/8/8/1PPPPPPP/RNBQKBNR w KQkq -');

const botOleg = new LichessBot(MinimaxBot);
botOleg.start();
