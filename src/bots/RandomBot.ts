import ChessGame from '../chess/ChessGame';

export default class RandomBot extends ChessGame{
  getNextMove() {
    const legalMoves = this.getLegalMoves();

    // console.log(legalMoves.map(m => ChessGame.numericToUci(m)).join('; '));
    const randomIndex = Math.floor(Math.random() * legalMoves.length);

    return ChessGame.numericToUci(legalMoves[randomIndex]);
  }
}