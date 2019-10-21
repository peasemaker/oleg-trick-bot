export interface GameState {
  prevMove: number;
  prevHalfMoves: number;
  prevEpSquare: number;
  prevCastlingPermission: number;
  prevPositionKey: bigint;
  prevMovedPiece: number;
  prevCapturedPiece: number;
  prevIsInCheck: boolean;
  prevIsInDoubleCheck: boolean;
  prevCheckingPieceSquare: number;
}

export interface Zobrist {
  pieceKeys: bigint[][],
  sideKey: bigint,
  epKeys: bigint[],
  castlingKeys: bigint[]
}