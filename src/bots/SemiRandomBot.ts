import ChessGame from '../chess/ChessGame';

const PIECE_VALUES = [1, 3, 3, 5, 9, Infinity];

export default class SemiRandomBot {
  getNextMove(chessGame: ChessGame) {
    const legalMoves = chessGame.getLegalMoves();
    try {
      const randomIndex = Math.floor(Math.random() * legalMoves.length);
      let pickedMove = legalMoves[randomIndex];
      const checkmates = [];
      const captures = [];

      for (let i = 0; i < legalMoves.length; i++) {
        chessGame.makeMove(legalMoves[i]);
        if (chessGame.isCheckmate()) {
          checkmates.push(legalMoves[i]);
        } else if (chessGame.capturedPiece !== -1) {
          const movedType = ChessGame.pieceType((chessGame.movedPiece));
          const capturedType = ChessGame.pieceType(chessGame.capturedPiece);

          if (PIECE_VALUES[capturedType] >= PIECE_VALUES[movedType]) {
            captures.push(legalMoves[i]);
          } else if (!chessGame.isSquareAttacked(ChessGame.moveTo(legalMoves[i]), chessGame.turn)) {
            captures.push(legalMoves[i]);
          }
        }
        chessGame.revertMove();
      }

      // console.log('checkmates', checkmates.map(m => ChessGame.numericToUci(m)).join('; '));
      console.log('captures', captures.map(m => ChessGame.numericToUci(m)).join('; '));

      if (checkmates.length) {
        pickedMove = checkmates[Math.floor(Math.random() * checkmates.length)];
      } else if (captures.length) {
        pickedMove = captures[Math.floor(Math.random() * captures.length)];
      }

      return ChessGame.numericToUci(pickedMove);
    } catch (error) {
      console.log('semi random error: ', error);
      console.log('legal moves', legalMoves.map(m => ChessGame.numericToUci(m)).join('; '));

      return '';
    }
  }
}