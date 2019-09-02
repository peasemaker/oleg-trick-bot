export const BOARD_SIZE = 120;
export const DEFAULT_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
export enum Color {
  WHITE = 0,
  BLACK = 1
}
export enum PieceType {
  PAWN,
  KNIGHT,
  BISHOP,
  ROOK,
  QUEEN,
  KING
}
export const PIECE_VALUES = [1, 3, 3, 5, 9, 0];
export enum Piece {
  wP = 0, wN, wB, wR, wQ, wK,
  bP, bN, bB, bR, bQ, bK
}
export const PIECE_NUMBER = 12;
export const PiecesByColor = [
  [Piece.wP, Piece.wN, Piece.wB, Piece.wR, Piece.wQ, Piece.wK],
  [Piece.bP, Piece.bN, Piece.bB, Piece.bR, Piece.bQ, Piece.bK]
];
export enum SquareType {
  EMPTY = -1,
  OFFBOARD = 100
}
export const Promotion: {[promotion in string]: number} = {
  n: 0,
  b: 1,
  r: 2,
  q: 3
};
export enum MoveType {
  NORMAL = 0,
  PROMOTION,
  ENPASSANT,
  CASTLING
}
export const PIECE_NOTATION = 'PNBRQKpnbrqk';
export const RANKS_NOTATION = '87654321';
export const FILES_NOTATION = 'abcdefgh';
export const PROMOTION_NOTATION = 'nbrq';
export enum Squares {
  A8 = 21, B8, C8, D8, E8, F8, G8, H8,
  A7 = 31, B7, C7, D7, E7, F7, G7, H7,
  A6 = 41, B6, C6, D6, E6, F6, G6, H6,
  A5 = 51, B5, C5, D5, E5, F5, G5, H5,
  A4 = 61, B4, C4, D4, E4, F4, G4, H4,
  A3 = 71, B3, C3, D3, E3, F3, G3, H3,
  A2 = 81, B2, C2, D2, E2, F2, G2, H2,
  A1 = 91, B1, C1, D1, E1, F1, G1, H1,
  NO_SQUARE = -1
}
export enum Ranks {
  RANK_8 = 0,
  RANK_7,
  RANK_6,
  RANK_5,
  RANK_4,
  RANK_3,
  RANK_2,
  RANK_1
}
export enum Files {
  FILE_A = 0,
  FILE_B,
  FILE_C,
  FILE_D,
  FILE_E,
  FILE_F,
  FILE_G,
  FILE_H
}
export enum Castling {
  NO_CASTLING = 0,
  WK = 1,
  WQ = 2,
  BK = 4,
  BQ = 8,
  W = WK | WQ,
  B = BK | BQ,
  ALL_CASTLING = W | B
}
export const CASTLING_FEN_MASK: {[castling in string]: {kingSquare: number, rookSquare: number, castling: Castling}} = {
  K: {kingSquare: Squares.E1, rookSquare: Squares.H1, castling: Castling.WK},
  Q: {kingSquare: Squares.E1, rookSquare: Squares.A1, castling: Castling.WQ},
  k: {kingSquare: Squares.E8, rookSquare: Squares.H8, castling: Castling.BK},
  q: {kingSquare: Squares.E8, rookSquare: Squares.A8, castling: Castling.BQ}
};
export const SQUARE_COLOR = [
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  -1, 0, 1, 0, 1, 0, 1, 0, 1, -1,
  -1, 1, 0, 1, 0, 1, 0, 1, 0, -1,
  -1, 0, 1, 0, 1, 0, 1, 0, 1, -1,
  -1, 1, 0, 1, 0, 1, 0, 1, 0, -1,
  -1, 0, 1, 0, 1, 0, 1, 0, 1, -1,
  -1, 1, 0, 1, 0, 1, 0, 1, 0, -1,
  -1, 0, 1, 0, 1, 0, 1, 0, 1, -1,
  -1, 1, 0, 1, 0, 1, 0, 1, 0, -1,
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1
];
export const SQ120TO64 = [
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  -1, 0, 1, 2, 3, 4, 5, 6, 7, -1,
  -1, 8, 9, 10, 11, 12, 13, 14, 15, -1,
  -1, 16, 17, 18, 19, 20, 21, 22, 23, -1,
  -1, 24, 25, 26, 27, 28, 29, 30, 31, -1,
  -1, 32, 33, 34, 35, 36, 37, 38, 39, -1,
  -1, 40, 41, 42, 43, 44, 45, 46, 47, -1,
  -1, 48, 49, 50, 51, 52, 53, 54, 55, -1,
  -1, 56, 57, 58, 59, 60, 61, 62, 63, -1,
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1
];
export const SQ64TO120 = [
  21, 22, 23, 24, 25, 26, 27, 28,
  31, 32, 33, 34, 35, 36, 37, 38,
  41, 42, 43, 44, 45, 46, 47, 48,
  51, 52, 53, 54, 55, 56, 57, 58,
  61, 62, 63, 64, 65, 66, 67, 68,
  71, 72, 73, 74, 75, 76, 77, 78,
  81, 82, 83, 84, 85, 86, 87, 88,
  91, 92, 93, 94, 95, 96, 97, 98
];
export const sq120 = (square64: number): number => SQ64TO120[square64];
export const sq64 = (square120: number): number => SQ120TO64[square120];
export const KNIGHT_MOVES = [-21, -19, -12, -8, 8, 12, 19, 21];
export const BISHOP_MOVES = [-11, -9, 9, 11];
export const ROOK_MOVES = [-10, -1, 1, 10];
export const QUEEN_MOVES = [-11, -10, -9, -1, 1, 9, 10, 11];
export const KING_MOVES = [-11, -10, -9, -1, 1, 9, 10, 11];
export const PAWN_CAPTURING = [
  [-9, -11],
  [9, 11]
];
export const PAWN_MOVES = [
  {normal: -10, advanced: -20},
  {normal: 10, advanced: 20}
];

export const randInt64 = (): bigint => {
  let int64 = 0n;

  do {
    for (let i = 0n; i < 8n; i++) {
      int64 |= BigInt(Math.floor(Math.random() * 256)) << i * 8n;
    }
  } while (!int64);

  return int64;
};