import ChessGame from '../src/chess/ChessGame';
import {g, m, r} from '../src/helpers';

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

    console.log(`${m(move)} - ${g(moveNodes)}`);
  }

  return nodes;
}

const tests = [
  {
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -',
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
    fen: 'r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq -',
    nodeCounts: [6, 264, 9_467, 422_333, 15_833_292]
  },
  {
    fen: 'r2q1rk1/pP1p2pp/Q4n2/bbp1p3/Np6/1B3NBn/pPPP1PPP/R3K2R b KQ -',
    nodeCounts: [6, 264, 9_467, 422_333, 15_833_292]
  },
  {
    fen: 'r4rk1/1pp1qppp/p1np1n2/2b1p1B1/2B1P1b1/P1NP1N2/1PP1QPPP/R4RK1 w - -',
    nodeCounts: [46, 2_079, 89_890, 3_894_594]
  },
  {
    fen: 'rnbq1k1r/pp1P1ppp/2p5/8/2B4b/P7/1PP1NnPP/RNBQK2R w KQ -',
    nodeCounts: [42, 1_432, 51_677, 1_747_286]
  },
  {
    fen: '3b4/2P5/8/8/8/2n5/8/2k1K2R w K -',
    nodeCounts: [20, 268, 5_464, 69_692, 1_490_361]
  },
  {
    fen: '6b1/5P2/8/8/3n1k2/8/8/4K2R w K -',
    nodeCounts: [22, 325, 6_839, 96_270, 2_148_378]
  },
  {
    fen: '8/p3p3/1b1k4/3P1p2/8/8/1n3B2/2KR4 w - -',
    nodeCounts: [19, 326, 5_853, 99_157, 1_905_025]
  },
  {
    fen: '8/p3p3/3k4/3P1p2/8/8/5B2/K7 w - -',
    nodeCounts: [12, 99, 1_262, 11_208, 150_846, 1_366_710]
  }
];

// const game = new ChessGame('6b1/5P2/8/8/3n1k2/8/8/4K2R w K - 0 1');
// console.log(perftDivide(2, game));

console.time('perft');
for (let test of tests) {
  const { fen, nodeCounts } = test;
  const game = new ChessGame(fen);

  for (let i = 0; i < nodeCounts.length; i++) {
    const start = process.hrtime.bigint();

    const testCount = perft(i + 1, game);

    const end = process.hrtime.bigint();

    const isPassed = testCount === nodeCounts[i];
    const status = isPassed ? g('passed') : r('failed');
    const time = Number(end - start) / 1e6;
    console.log(`Test with fen: ${m(fen)}, depth: ${m(i + 1)} is ${status}`);
    console.log(`nodes count: ${m(testCount)}`);
    console.log(`time: ${m(time.toFixed(3))} ms`);
    console.log(`performance: ${m((testCount / time).toFixed(3))} kn/s`);

    if (!isPassed) {
      break;
    }
  }

  console.log('');
}
console.timeEnd('perft');