export interface Zobrist {
  pieceKeys: bigint[][],
  sideKey: bigint,
  epKeys: bigint[],
  castlingKeys: bigint[]
}