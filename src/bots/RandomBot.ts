import ChessGame from '../chess/ChessGame';

export default class RandomBot {
  getNextMove(chessGame: ChessGame) {
    const legalMoves = chessGame.getLegalMoves();

    // console.log(legalMoves.map(m => ChessGame.numericToUci(m)).join('; '));
    const randomIndex = Math.floor(Math.random() * legalMoves.length);

    return ChessGame.numericToUci(legalMoves[randomIndex]);
  }
}