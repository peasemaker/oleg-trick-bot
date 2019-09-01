import ChessGame from '../chess/ChessGame';
import {Color, Piece, Squares} from '../constants';

export default class MinimaxBot extends ChessGame {
  color: Color;

  constructor() {
    super();

    this.color = Color.WHITE;
  }

  getNextMove(): number {
    const legalMoves = this.getLegalMoves();
    let bestScore = -Infinity;
    let bestMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];

    for (let i = 0; i < legalMoves.length; i++) {
      const move = legalMoves[i];
      this.makeMove(move);
      const moveScore = this.minimax(3);
      this.revertMove();
      if (moveScore > bestScore) {
        bestMove = move;
        bestScore = moveScore;
      }
    }

    console.log('bestScore', bestScore);
    // console.log(legalMoves.map(m => ChessGame.numericToUci(m)).join('; '));

    return bestMove;
  }

  minimax(depth: number): number {
    if (depth === 0) {
      return this.evalMaterial();
    }

    const legalMoves = this.getLegalMoves();
    let bestScore = -Infinity;

    for (let i = 0; i < legalMoves.length; i++) {
      const move = legalMoves[i];
      this.makeMove(move);
      const score = -this.minimax(depth - 1);

      if (score > bestScore) {
        bestScore = score;
      }

      this.revertMove();
    }

    return bestScore;
  }

  evalMaterial(): number {
    return this.materialScore[this.color] - this.materialScore[this.color ^ 1];
  }
}