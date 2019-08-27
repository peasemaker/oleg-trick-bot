import ChessGame from '../chess/ChessGame';

export default class RandomBot {
  getNextMove(chessGame: ChessGame) {
    const start = process.hrtime.bigint();
    const legalMoves = chessGame.getLegalMoves();
    const end = process.hrtime.bigint();
    console.log(`move time: ${Number(end - start) / 1000000} ms`);

    // console.log(legalMoves.map(m => ChessGame.numericToUci(m)).join('; '));
    const randomIndex = Math.floor(Math.random() * legalMoves.length);

    return ChessGame.numericToUci(legalMoves[randomIndex]);
  }
}