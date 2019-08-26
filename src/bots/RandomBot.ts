import ChessGame from '../chess/ChessGame';

export default class RandomBot {
  getNextMove(chessGame: ChessGame) {
    const start = Date.now();
    const legalMoves = chessGame.getLegalMoves();
    console.log(`move time: ${Date.now() - start} ms`);

    // console.log(legalMoves.join('; '));
    const randomIndex = Math.floor(Math.random() * legalMoves.length);

    return ChessGame.numericToUci(legalMoves[randomIndex]);
  }
}