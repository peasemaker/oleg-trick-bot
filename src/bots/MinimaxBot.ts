import ChessGame from '../chess/ChessGame';
import {g, m} from '../helpers';

export default class MinimaxBot extends ChessGame {
  nodesCount: number;

  constructor() {
    super();

    this.nodesCount = 0;
  }

  getNextMove(): number {
    this.nodesCount = 0;
    const start = process.hrtime.bigint();

    const legalMoves = this.getLegalMoves();

    if (legalMoves.length === 0) {
      return 0;
    }

    let bestScore = -1e3;
    const movesWithScore: [number, number][] = [];

    // console.log(legalMoves.map(m => ChessGame.numericToUci(m)).join('; '));

    for (let i = 0; i < legalMoves.length; i++) {
      const move = legalMoves[i];
      this.makeMove(move);
      const moveScore = -this.minimax(3, -1e3, 1e3);
      movesWithScore.push([move, moveScore]);
      this.revertMove();
      if (moveScore > bestScore) {
        bestScore = moveScore;
      }
    }

    movesWithScore.sort((a, b) => b[1] - a[1]);
    const bestMove = movesWithScore[0];
    const bestMoves = [bestMove];

    for (let i = 1; i < movesWithScore.length; i++) {
      if (bestMove[1] === movesWithScore[i][1]) {
        bestMoves.push(movesWithScore[i]);
      }
    }

    const pickedMove = bestMoves[Math.floor(Math.random() * bestMoves.length)];

    const end = process.hrtime.bigint();
    const moveTime = Number(end - start) / 1e6;
    console.log(`best moves: ${bestMoves.map(move => `${m(ChessGame.numericToUci(move[0]))} (${g(move[1])})`).join(' ')}`);
    console.log(`picked move: ${m(ChessGame.numericToUci(pickedMove[0]))} (${g(pickedMove[1])}); time: ${g(moveTime.toFixed(3))} ms`);
    console.log(`node count: ${m(this.nodesCount)}`);
    console.log(`performance: ${m((this.nodesCount / moveTime).toFixed(2))} kn/s\n`);

    return pickedMove[0];
  }

  // TODO: do not eval same positions
  // TODO: add stalemates, checkmates and draw
  minimax(depth: number, alpha: number, beta: number): number {
    if (depth === 0) {
      this.nodesCount++;
      return this.evalMaterial();
    }

    const legalMoves = this.getLegalMoves();

    if (legalMoves.length === 0) {
      if (this.isCheck(this.turn)) {
        return -1e3 - depth;
      } else if (this.isCheck(this.turn ^ 1)) {
        return 1e3 + depth;
      }

      return 0;
    }

    if (this.isDraw()) {
      return 0;
    }

    for (let i = 0; i < legalMoves.length; i++) {
      const move = legalMoves[i];
      this.makeMove(move);
      const score = -this.minimax(depth - 1, -beta, -alpha);
      this.revertMove();

      if (score > alpha) {
        alpha = score;
      }

      if (alpha >= beta) {
        break;
      }
    }

    return alpha;
  }

  evalMaterial(): number {
    return this.materialScore[this.turn] - this.materialScore[this.turn ^ 1];
  }
}