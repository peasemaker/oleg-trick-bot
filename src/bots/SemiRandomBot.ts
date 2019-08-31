import ChessGame from '../chess/ChessGame';

const PIECE_VALUES = [1, 3, 3, 5, 9, Infinity];

export default class SemiRandomBot extends ChessGame {
  getNextMove(): number {
    const legalMoves = this.getLegalMoves();
    const randomIndex = Math.floor(Math.random() * legalMoves.length);
    let pickedMove = legalMoves[randomIndex];
    const checkmates = [];
    const captures = [];
    const saveMoves = [];

    for (let i = 0; i < legalMoves.length; i++) {
      this.makeMove(legalMoves[i]);
      const isSquareSave = !this.isSquareAttacked(ChessGame.moveTo(legalMoves[i]), this.turn);
      if (this.isCheckmate()) {
        checkmates.push(legalMoves[i]);
      } else if (this.capturedPiece !== -1) {
        const movedType = ChessGame.pieceType((this.movedPiece));
        const capturedType = ChessGame.pieceType(this.capturedPiece);

        if (PIECE_VALUES[capturedType] >= PIECE_VALUES[movedType]) {
          captures.push(legalMoves[i]);
        } else if (isSquareSave) {
          captures.push(legalMoves[i]);
        }
      } else if (isSquareSave) {
        saveMoves.push(legalMoves[i]);
      }
      this.revertMove();
    }

    // console.log('checkmates', checkmates.map(m => ChessGame.numericToUci(m)).join('; '));
    console.log('captures', captures.map(m => ChessGame.numericToUci(m)).join('; '));
    console.log('saveMoves', saveMoves.map(m => ChessGame.numericToUci(m)).join('; '));

    if (checkmates.length) {
      pickedMove = checkmates[Math.floor(Math.random() * checkmates.length)];
    } else if (captures.length) {
      pickedMove = captures[Math.floor(Math.random() * captures.length)];
    } else if (saveMoves.length) {
      pickedMove = saveMoves[Math.floor(Math.random() * saveMoves.length)];
    }

    return pickedMove;
  }
}