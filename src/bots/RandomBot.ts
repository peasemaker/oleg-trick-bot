import ChessGame from '../chess/ChessGame';

export default class RandomBot {
  getNextMove(chessGame: ChessGame) {
    console.time('move');
    const legalMoves = chessGame.getLegalMoves();
    console.timeEnd('move');

    // console.log(legalMoves.join('; '));
    const randomIndex = Math.floor(Math.random() * legalMoves.length);

    return legalMoves[randomIndex];
  }
}