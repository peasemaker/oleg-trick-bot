import * as colors from 'colors/safe';
import ChessGame from '../src/chess/ChessGame';

function perft(depth: number, game: ChessGame): number {
  let nodes = 0;

  if (depth === 0) {
    return 1;
  }

  const legalMoves = game.getLegalMoves();

  for (let i = 0; i < legalMoves.length; i++) {
    game.makeMove(legalMoves[i]);
    nodes += perft(depth - 1, game);
    game.revertMove();
  }

  return nodes;
}

function perftDivide(depth: number, game: ChessGame): number {
  let nodes = 0;

  if (depth === 0) {
    return 1;
  }

  const legalMoves = game.getLegalMoves();

  for (let i = 0; i < legalMoves.length; i++) {
    game.makeMove(legalMoves[i]);
    const oldNodes = nodes;
    nodes += perft(depth - 1, game);
    game.revertMove();
    const moveNodes = nodes - oldNodes;
    const move = ChessGame.numericToUci(legalMoves[i]);

    console.log(`${move} - ${moveNodes}`);
  }

  return nodes;
}

const tests = [
  {
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    nodeCounts: [20, 400, 8_902, 197_281, 4_865_609]
  },
  {
    fen: 'r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq -',
    nodeCounts: [48, 2_039, 97_862, 4_085_603]
  },
  {
    fen: '8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - -',
    nodeCounts: [14, 191, 2_812, 43_238, 674_624, 11_030_083]
  },
  {
    fen: 'r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1',
    nodeCounts: [6, 264, 9_467, 422_333, 15_833_292]
  },
  {
    fen: 'r2q1rk1/pP1p2pp/Q4n2/bbp1p3/Np6/1B3NBn/pPPP1PPP/R3K2R b KQ - 0 1',
    nodeCounts: [6, 264, 9_467, 422_333, 15_833_292]
  },
  {
    fen: 'rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ - 1 8',
    nodeCounts: [44, 1_486, 62_379, 2_103_487]
  },
  {
    fen: 'r4rk1/1pp1qppp/p1np1n2/2b1p1B1/2B1P1b1/P1NP1N2/1PP1QPPP/R4RK1 w - - 0 10',
    nodeCounts: [46, 2_079, 89_890, 3_894_594]
  }
];

for (let test of tests) {
  const { fen, nodeCounts } = test;
  const game = new ChessGame(fen);

  for (let i = 0; i < nodeCounts.length; i++) {
    const testCount = perft(i + 1, game);

    const status = testCount === nodeCounts[i] ? colors.green('passed') : colors.red('failed');

    console.log(`Test with fen: ${colors.bold(fen)}, depth: ${colors.bold(`${i + 1}`)} is ${status}`);
  }

  console.log('\n');
}