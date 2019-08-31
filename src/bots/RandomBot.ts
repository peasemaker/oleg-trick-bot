import ChessGame from '../chess/ChessGame';

export default class RandomBot extends ChessGame{
  getNextMove(): number {
    const legalMoves = this.getLegalMoves();

    // console.log(legalMoves.map(m => ChessGame.numericToUci(m)).join('; '));
    const randomIndex = Math.floor(Math.random() * legalMoves.length);

    return legalMoves[randomIndex];
  }
}