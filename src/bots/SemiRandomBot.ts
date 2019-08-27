import ChessGame from '../chess/ChessGame';

export default class SemiRandomBot {
  getNextMove(chessGame: ChessGame) {
    try {
      const start = process.hrtime.bigint();
      const legalMoves = chessGame.getLegalMoves();
      const randomIndex = Math.floor(Math.random() * legalMoves.length);
      let pickedMove = legalMoves[randomIndex];

      for (let i = 0; i < legalMoves.length; i++) {
        chessGame.makeMove(legalMoves[i]);
        if (chessGame.isCheckmate()) {
          pickedMove = legalMoves[i];
          chessGame.revertMove();
          break;
        }
        chessGame.revertMove();
      }

      const end = process.hrtime.bigint();
      console.log(`move time: ${Number(end - start) / 1000000} ms`);

      // console.log(legalMoves.map(m => ChessGame.numericToUci(m)).join('; '));

      return ChessGame.numericToUci(pickedMove);
    } catch (error) {
      console.log('error: ', error);
      return 'a';
    }
  }
}