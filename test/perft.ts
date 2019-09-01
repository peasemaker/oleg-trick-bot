import ChessGame from '../src/chess/ChessGame';

export function perft(depth: number, game: ChessGame): number {
  let nodes = 0;

  if (depth === 0) {
    return 1;
  }

  const legalMoves = game.getLegalMoves();

  for (let i = 0; i < legalMoves.length; i++) {
    game.makeMove(legalMoves[i]);
    nodes += perft(depth - 1, game);
    game.revertMove();
  }

  return nodes;
}

export function perftDivide(depth: number, game: ChessGame): number {
  let nodes = 0;

  if (depth === 0) {
    return 1;
  }

  const legalMoves = game.getLegalMoves();

  for (let i = 0; i < legalMoves.length; i++) {
    game.makeMove(legalMoves[i]);
    const oldNodes = nodes;
    nodes += perft(depth - 1, game);
    game.revertMove();
    const moveNodes = nodes - oldNodes;
    const move = ChessGame.numericToUci(legalMoves[i]);

    console.log(`${move} - ${moveNodes}`);
  }

  return nodes;
}