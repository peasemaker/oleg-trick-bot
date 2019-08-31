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
    const isWhiteTurn = this.turn === Color.WHITE;
    let bestScore = -Infinity;
    let bestMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];

    for (let i = 0; i < legalMoves.length; i++) {
      const move = legalMoves[i];
      this.makeMove(move);
      this.printBoard();
      const moveScore = this.minimax(3);
      this.revertMove();
      this.printBoard();
      if (moveScore > bestScore) {
        bestMove = move;
        bestScore = moveScore;
      }
    }

    console.log('bestScore', bestScore);
    // console.log(legalMoves.map(m => ChessGame.numericToUci(m)).join('; '));

    return bestMove;
  }

  minimax(depth: number, isMax: boolean = true): number {
    if (depth === 0) {
      return this.evalMaterial();
    }

    const legalMoves = this.getLegalMoves();
    let bestScore = isMax ? -Infinity : Infinity;

    if (legalMoves.length === 0) {
      if (this.isCheck(this.color)) {
        return -Infinity;
      } else if (this.isCheck(this.color ^ 1)) {
        return Infinity;
      }

      return 0;
    }

    for (let i = 0; i < legalMoves.length; i++) {
      const move = legalMoves[i];
      this.makeMove(move);

      if (isMax) {
        bestScore = Math.max(bestScore, this.minimax(depth - 1, !isMax));
      } else {
        bestScore = Math.min(bestScore, this.minimax(depth - 1, !isMax));
      }
      this.revertMove();
    }

    return bestScore;
  }

  evalMaterial(): number {
    return this.materialScore[this.color] - this.materialScore[this.color ^ 1];
  }
}