import ChessGame from '../chess/ChessGame';
import {g, m} from '../helpers';

export default class MinimaxBot extends ChessGame {
  depth: number;
  nodesCount: number;
  positionScoreTable: Map<bigint, {depth: number, score: number}>;
  firstCutNodesCount: number;
  cutNodesCount: number;
  performances: number[];
  maxPerformance: number;

  constructor() {
    super();

    this.depth = 3;
    this.nodesCount = 0;
    this.positionScoreTable = new Map();
    this.firstCutNodesCount = 0;
    this.cutNodesCount = 0;
    this.performances = [];
    this.maxPerformance = -Infinity;
  }

  private printScore(score: number): string {
    return Math.abs(score) >= 1e3 ? `#${score < 0 ? '-' : ''}${Math.floor((1e3 - Math.abs(score) + this.depth ) / 2) + 1}` : score.toString();
  }

  getNextMove(): number {
    this.nodesCount = 0;
    const start = process.hrtime.bigint();

    const legalMoves = this.getLegalMoves();

    if (legalMoves.length === 0) {
      return 0;
    }

    const movesWithScore: [number, number][] = [];
    let pickedMove, bestMoves;
    let alpha = -Infinity;

    // console.log(legalMoves.map(m => ChessGame.numericToUci(m)).join('; '));

    if (legalMoves.length > 1) {
      for (let i = 0; i < legalMoves.length; i++) {
        const move = legalMoves[i];
        this.makeMove(move);
        const moveScore = -this.minimax(this.depth, -Infinity, -alpha + 0.05);
        movesWithScore.push([move, moveScore]);
        this.revertMove();
        if (moveScore > alpha) {
          alpha = moveScore;
        }
      }

      movesWithScore.sort((a, b) => b[1] - a[1]);
      const bestMove = movesWithScore[0];
      bestMoves = [bestMove];

      for (let i = 1; i < movesWithScore.length; i++) {
        if (bestMove[1] === movesWithScore[i][1]) {
          bestMoves.push(movesWithScore[i]);
        }
      }

      pickedMove = bestMoves[Math.floor(Math.random() * bestMoves.length)];
    } else {
      bestMoves = [[legalMoves[0], 0]];
      pickedMove = [legalMoves[0], 0];
    }

    const end = process.hrtime.bigint();
    const moveTime = Number(end - start) / 1e6;
    console.log(`best moves: ${bestMoves.map(move => `${m(ChessGame.numericToUci(move[0]))} (${g(this.printScore(move[1]))})`).join(' ')}`);
    console.log(`picked move: ${m(ChessGame.numericToUci(pickedMove[0]))} (${g(this.printScore(pickedMove[1]))}); time: ${g(moveTime.toFixed(3))} ms`);
    console.log(`node count: ${m(this.nodesCount)}`);

    const performance = +(this.nodesCount / moveTime).toFixed(2);

    if (performance) {
      this.performances.push(performance);
    }

    this.maxPerformance = Math.max(this.maxPerformance, performance);

    console.log(`performance: ${m(performance)} kn/s`);
    console.log(`move ordering quality: ${m(Math.round(100 * this.firstCutNodesCount / this.cutNodesCount))} %`);
    console.log('');

    return pickedMove[0];
  }

  // TODO: do not eval same positions
  minimax(depth: number, alpha: number, beta: number): number {
    if (depth === 0) {
      this.nodesCount++;

      const isInCheck = this.isCheck();

      if (isInCheck && !this.haveLegalMoves()) {
        return -1e3;
      }

      if ((!isInCheck && !this.haveLegalMoves()) || this.isDraw()) {
        return 0
      }

      return this.evalMaterial();
    }

    const legalMoves = this.getLegalMoves();

    if (legalMoves.length === 0) {
      if (this.isCheck()) {
        return -1e3 - depth;
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

      if (score >= beta) {
        if (i === 0) {
          this.firstCutNodesCount++;
        }

        this.cutNodesCount++;
        return beta;
      }

      if (score > alpha) {
        alpha = score;
      }
    }

    return alpha;
  }

  evalMaterial(): number {
    return this.materialScore[this.turn] - this.materialScore[this.turn ^ 1];
  }
}