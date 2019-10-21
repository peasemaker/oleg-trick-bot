import {GameState, Zobrist} from '../types';
import {b, g, m} from '../helpers';

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

class ChessGame {
  board: number[];
  turn: Color;
  halfMoves: number;
  epSquare: number;
  castlingPermission: number;
  allPieceCount: number;
  pieceCount: number[];
  pieceList: number[][];
  movedPiece: number;
  capturedPiece: number;
  positionKey: bigint;
  positionsTable: Map<bigint, number>;
  history: GameState[];
  materialScore: number[];

  private pieceIndexes: number[];
  private castlingPermissionMask: {[square in string]: number};
  private zobrist: Zobrist;

  constructor(fen: string = DEFAULT_FEN) {
    this.board = ChessGame.initBoard();
    this.turn = Color.WHITE;
    this.halfMoves = 0;
    this.epSquare = Squares.NO_SQUARE;
    this.castlingPermission = 0;
    this.allPieceCount = 0;
    this.pieceCount = new Array(PIECE_NUMBER).fill(0);
    this.pieceList = new Array(PIECE_NUMBER).fill(0).map(() => []);
    this.movedPiece = SquareType.EMPTY;
    this.capturedPiece = SquareType.EMPTY;
    this.positionKey = 0n;
    this.positionsTable = new Map<bigint, number>();
    this.history = [];
    this.materialScore = [0, 0];

    this.pieceIndexes = new Array(120).fill(-1);
    this.castlingPermissionMask = {};
    this.zobrist = {
      pieceKeys: new Array(12).fill(0).map(() => new Array(64).fill(0).map(() => randInt64())),
      sideKey: randInt64(),
      epKeys: new Array(8).fill(0).map(() => randInt64()),
      castlingKeys: new Array(16).fill(0).map(() => randInt64())
    };

    this.loadFen(fen, false);
  }

  private static initBoard(): number[] {
    const board = new Array(BOARD_SIZE);

    for (let i = 0; i < BOARD_SIZE; i++) {
      board[i] = SquareType.OFFBOARD;
    }

    for (let i = 0; i < 64; i++) {
      board[sq120(i)] = SquareType.EMPTY;
    }

    return board;
  }

  static pieceType(piece: number): number {
    return piece % 6;
  }

  static pieceColor(piece: number): number {
    return ChessGame.isWhitePiece(piece) ? Color.WHITE : Color.BLACK;
  }

  static file(sq: number): number {
    return sq64(sq) & 7;
  }

  static rank(sq: number): number {
    return sq64(sq) >> 3;
  }

  static moveFrom(move: number): number {
    return sq120((move >> 6) & 63);
  }

  static moveTo(move: number): number {
    return sq120((move & 63));
  }

  static isWhitePiece(piece: number): boolean {
    return (piece >= Piece.wP) && (piece <= Piece.wK);
  }

  static isBlackPiece(piece: number): boolean {
    return (piece >= Piece.bP) && (piece <= Piece.bK);
  }

  static literalToSquare(literal: string): number {
    return sq120(FILES_NOTATION.indexOf(literal[0]) + RANKS_NOTATION.indexOf(literal[1]) * 8);
  }

  static squareToLiteral(square: number): string {
    if (square === Squares.NO_SQUARE) {
      return 'no square';
    }

    return FILES_NOTATION[ChessGame.file(square)] + RANKS_NOTATION[ChessGame.rank(square)];
  }

  static createPiece(color: Color, pieceType: PieceType) {
    return PiecesByColor[color][pieceType];
  }

  static createMove(from: number, to: number): number {
    return (sq64(from) << 6) + sq64(to);
  }

  static createPromotionMove(from: number, to: number, promotion: number): number {
    return (MoveType.PROMOTION << 14) + (promotion << 12) + (sq64(from) << 6) + sq64(to);
  }

  static createEnpassantMove(from: number, to: number): number {
    return (MoveType.ENPASSANT << 14) + (sq64(from) << 6) + sq64(to);
  }

  static createCastlingMove(from: number, to: number): number {
    return (MoveType.CASTLING << 14) + (sq64(from) << 6) + sq64(to);
  }

  static numericToUci(moveNum: number): string {
    const to = ChessGame.squareToLiteral(sq120(moveNum & 63));
    const from = ChessGame.squareToLiteral(sq120((moveNum >> 6) & 63));
    const promotion = (moveNum >> 12) & 3;
    const moveType = moveNum >> 14;
    const promotionUci = (moveType === MoveType.PROMOTION) ? PROMOTION_NOTATION[promotion] : '';

    return from + to + promotionUci;
  }

  uciToNumeric(moveUci: string): number {
    const from = ChessGame.literalToSquare(moveUci.slice(0, 2));
    const to = ChessGame.literalToSquare(moveUci.slice(2, 4));
    const promotionUci = moveUci[4];
    let promotion = 0;
    let moveType = MoveType.NORMAL;
    const fromPiece = this.board[from];

    if (promotionUci) {
      promotion = Promotion[promotionUci];
      moveType = MoveType.PROMOTION;
    }

    if (Math.abs(from - to) === 2 && ChessGame.pieceType(fromPiece) === PieceType.KING) {
      moveType = MoveType.CASTLING;
    }

    if (ChessGame.pieceType(fromPiece) === PieceType.PAWN && this.epSquare === to) {
      moveType = MoveType.ENPASSANT;
    }

    return (moveType << 14) + (promotion << 12) + (sq64(from) << 6) + sq64(to);
  }

  isEnemyPiece(piece: number): boolean {
    return this.turn === Color.WHITE ? ChessGame.isBlackPiece(piece) : ChessGame.isWhitePiece(piece);
  }

  resetBoard() {
    this.board = ChessGame.initBoard();
    this.halfMoves = 0;
    this.epSquare = Squares.NO_SQUARE;
    this.castlingPermission = 0;
    this.allPieceCount = 0;
    this.pieceCount = new Array(PIECE_NUMBER).fill(0);
    this.pieceList = new Array(PIECE_NUMBER).fill(0).map(() => []);
    this.materialScore = [0, 0];
    this.positionKey = 0n;
    this.positionsTable = new Map<bigint, number>();
    this.castlingPermissionMask = {};
  }

  loadFen(fen: string, needReset: boolean = true) {
    if (needReset) {
      this.resetBoard();
    }

    const tokens = fen.split(/\s+/);
    const position = tokens[0];
    let square = 0;

    for (let i = 0; i < position.length; i++) {
      if (/\d/.test(position[i])) {
        square += parseInt(position[i]);
      } else if (PIECE_NOTATION.includes(position[i])) {
        this.putPiece(PIECE_NOTATION.indexOf(position[i]), sq120(square));
        square++;
      }
    }

    this.turn = (tokens[1] === 'w') ? Color.WHITE : Color.BLACK;

    const castling = tokens[2];

    if (castling !== '-') {
      for (let i = 0; i < castling.length; i++) {
        const castlingFenMask = CASTLING_FEN_MASK[castling[i]];
        this.castlingPermission |= castlingFenMask.castling;
        this.castlingPermissionMask[castlingFenMask.kingSquare] |= castlingFenMask.castling;
        this.castlingPermissionMask[castlingFenMask.rookSquare] |= castlingFenMask.castling;
      }
    }

    this.epSquare = (tokens[3] === '-') ? Squares.NO_SQUARE : ChessGame.literalToSquare(tokens[3]);
    this.halfMoves = parseInt(tokens[4]);

    for (let p = 0; p < PIECE_NUMBER; p++) {
      for (let sq = 0; sq < this.pieceList[p].length; sq++) {
        this.positionKey ^= this.zobrist.pieceKeys[p][sq];
      }
    }

    if (this.turn === Color.BLACK) {
      this.positionKey ^= this.zobrist.sideKey;
    }

    this.positionKey ^= this.zobrist.castlingKeys[this.castlingPermission];

    if (this.epSquare !== Squares.NO_SQUARE) {
      this.positionKey ^= this.zobrist.epKeys[ChessGame.file(this.epSquare)];
    }

    this.positionsTable.set(this.positionKey, 1);
  }

  printBoard() {
    let print = '';

    for (let i = 0; i < 64; i++) {
      const square = this.board[sq120(i)];

      if (square === SquareType.EMPTY) {
        // if (this.isSquareAttacked(sq120(i))) {
        //   print += 'X  ';
        // } else {
        print += '.  ';
        // }
      } else {
        print += PIECE_NOTATION[square] + '  ';
      }

      if ((i + 1) % 8 === 0) {
        print += '\n';
      }
    }

    console.log(print);
    console.log(`position key: ${m(this.positionKey.toString(16))}`);
    console.log(`material score: ${m(this.materialScore)}`);
    console.log(`piece count: ${m(this.pieceCount)}`);
    for (let i = 0; i < this.pieceList.length; i++) {
      const pieces = ['w_pawn', 'w_khight', 'w_bishop', 'w_rook', 'w_queen', 'w_king', 'b_pawn', 'b_khight', 'b_bishop', 'b_rook', 'b_queen', 'b_king'];
      console.log(`${b(pieces[i])}: ${this.pieceList[i].map(sq => g(ChessGame.squareToLiteral(sq))).join('; ')}`);
    }
    console.log('piece indexes');
    let indexesStr = '';
    for (let i = 0; i < 64; i++) {
      const sq = sq120(i);
      indexesStr += `${m(ChessGame.squareToLiteral(sq))}: ${g(this.pieceIndexes[sq] === -1 ? '.' : this.pieceIndexes[sq])}  `;
      if (i && (i + 1) % 8 === 0) {
        indexesStr += '\n';
      }
    }
    console.log(indexesStr);
    console.log(`ep square: ${m(ChessGame.squareToLiteral(this.epSquare))}`);
    console.log(`castling permission: ${m(this.castlingPermission.toString(2))}`);
    console.log(`half moves: ${m(this.halfMoves)}`);
  }

  isSquareAttacked(square: number, color?: Color): boolean {
    if (square === Squares.NO_SQUARE) {
      return false;
    }

    const pieceCount = this.pieceCount;
    const sideColor = color === undefined ? this.turn ^ 1 : color;
    const pieces = PiecesByColor[sideColor];
    const pawn = pieces[PieceType.PAWN];
    const knight = pieces[PieceType.KNIGHT];
    const bishop = pieces[PieceType.BISHOP];
    const rook = pieces[PieceType.ROOK];
    const queen = pieces[PieceType.QUEEN];
    const king = pieces[PieceType.KING];

    if (pieceCount[pawn] !== 0) {
      for (let i = 0; i < PAWN_CAPTURING[sideColor].length; i++) {
        if (this.board[square - PAWN_CAPTURING[sideColor][i]] === pawn) {
          return true;
        }
      }
    }

    if (pieceCount[knight] !== 0) {
      for (let i = 0; i < KNIGHT_MOVES.length; i++) {
        if (this.board[square + KNIGHT_MOVES[i]] === knight) {
          return true;
        }
      }
    }

    if (pieceCount[king] !== 0) {
      for (let i = 0; i < KING_MOVES.length; i++) {
        if (this.board[square + KING_MOVES[i]] === king) {
          return true;
        }
      }
    }

    if (pieceCount[bishop] !== 0 || pieceCount[queen] !== 0) {
      for (let i = 0; i < BISHOP_MOVES.length; i++) {
        let sq = square + BISHOP_MOVES[i];
        while (this.board[sq] !== SquareType.OFFBOARD) {
          if (this.board[sq] !== SquareType.EMPTY) {
            if (this.board[sq] === bishop || this.board[sq] === queen) {
              return true;
            } else {
              break;
            }
          }
          sq += BISHOP_MOVES[i];
        }
      }
    }

    if (pieceCount[rook] !== 0 || pieceCount[queen] !== 0) {
      for (let i = 0; i < ROOK_MOVES.length; i++) {
        let sq = square + ROOK_MOVES[i];
        while (this.board[sq] !== SquareType.OFFBOARD) {
          if (this.board[sq] !== SquareType.EMPTY) {
            if (this.board[sq] === rook || this.board[sq] === queen) {
              return true;
            } else {
              break;
            }
          }
          sq += ROOK_MOVES[i];
        }
      }
    }

    return false;
  }

  isCheck(color?: Color): boolean {
    const sideColor = color === undefined ? this.turn : color;
    const king = ChessGame.createPiece(sideColor, PieceType.KING);
    const kingSquare = this.pieceList[king][0];

    return this.isSquareAttacked(kingSquare, sideColor ^ 1);
  }

  isCheckmate(): boolean {
    return this.isCheck() && this.getLegalMoves().length === 0;
  }

  isStalemate(): boolean {
    return !this.isCheck() && this.getLegalMoves().length === 0;
  }

  isInsufficientMaterial(): boolean {
    if (this.allPieceCount === 2) {
      return true;
    } else if (
      this.allPieceCount === 3
      && (this.pieceCount[Piece.wB] === 1
        || this.pieceCount[Piece.wN] === 1
        || this.pieceCount[Piece.bB] === 1
        || this.pieceCount[Piece.bN] === 1
      )
    ) {
      return true;
    } else if (this.pieceCount[Piece.wB] + this.pieceCount[Piece.bB] === this.allPieceCount - 2) {
      const whiteBishops = this.pieceList[Piece.wB];
      const blackBishops = this.pieceList[Piece.bB];
      const whiteBishopsCount = this.pieceCount[Piece.wB];
      const blackBishopsCount = this.pieceCount[Piece.bB];
      const firstBishop = whiteBishopsCount > 0 ? whiteBishops[0] : blackBishops[0];
      const firstBishopColor = SQUARE_COLOR[firstBishop];

      for (let i = 0; i < whiteBishopsCount; i++) {
        if (firstBishopColor !== SQUARE_COLOR[whiteBishops[i]]) {
          return false;
        }
      }

      for (let i = 0; i < blackBishopsCount; i++) {
        if (firstBishopColor !== SQUARE_COLOR[blackBishops[i]]) {
          return false;
        }
      }

      return true;
    }

    return false;
  }

  isThreefoldRepetition(): boolean {
    const positionCount = this.positionsTable.get(this.positionKey);

    return !!positionCount && positionCount >= 3;
  }

  isDraw(): boolean {
    return (
      this.halfMoves >= 100
      || this.isInsufficientMaterial()
      || this.isThreefoldRepetition()
    );
  }

  putPiece(piece: Piece, to: number) {
    this.board[to] = piece;
    this.pieceIndexes[to] = this.pieceCount[piece]++;
    this.pieceList[piece][this.pieceIndexes[to]] = to;
    this.allPieceCount++;
    this.materialScore[ChessGame.pieceColor(piece)] += PIECE_VALUES[ChessGame.pieceType(piece)];
  }

  movePiece(piece: Piece, from: number, to: number) {
    this.board[from] = SquareType.EMPTY;
    this.board[to] = piece;
    this.pieceIndexes[to] = this.pieceIndexes[from];
    this.pieceIndexes[from] = -1;
    this.pieceList[piece][this.pieceIndexes[to]] = to;
  }

  removePiece(piece: Piece, from: number) {
    const lastSquare = this.pieceList[piece][--this.pieceCount[piece]];
    this.pieceList[piece][this.pieceIndexes[from]] = lastSquare;
    this.pieceList[piece][this.pieceCount[piece]] = Squares.NO_SQUARE;
    this.pieceIndexes[lastSquare] = this.pieceIndexes[from];
    this.pieceIndexes[from] = -1;
    this.allPieceCount--;
    this.materialScore[ChessGame.pieceColor(piece)] -= PIECE_VALUES[ChessGame.pieceType(piece)];
  }

  doCastling(color: Color, from: number, to: number, revert: boolean = false): number[] {
    const isWhite = color === Color.WHITE;
    const isKingSide = to > from;
    let rookTo, rookFrom;
    const king = ChessGame.createPiece(color, PieceType.KING);
    const rook = ChessGame.createPiece(color, PieceType.ROOK);

    if (isKingSide) {
      rookFrom = isWhite ? Squares.H1 : Squares.H8;
      rookTo = isWhite ? Squares.F1 : Squares.F8;
    } else {
      rookFrom = isWhite ? Squares.A1 : Squares.A8;
      rookTo = isWhite ? Squares.D1 : Squares.D8;
    }

    this.board[revert ? to : from] = this.board[revert ? rookTo : rookFrom] = SquareType.EMPTY;
    this.removePiece(king, revert ? to : from);
    this.removePiece(rook, revert ? rookTo : rookFrom);
    this.putPiece(king, revert ? from : to);
    this.putPiece(rook, revert ? rookFrom : rookTo);

    return [rookFrom, rookTo];
  }

  applyUciMoves(moves: string[]) {
    for (let i = 0; i < moves.length; i++) {
      this.makeMove(this.uciToNumeric(moves[i]));
    }
  }

  makeUciMove(move: string) {
    this.makeMove(this.uciToNumeric(move));
  }

  applyMoves(moves: number[]) {
    for (let i = 0; i < moves.length; i++) {
      this.makeMove(moves[i]);
    }
  }

  makeMove(move: number) {
    const to = sq120(move & 63);
    const from = sq120(move >> 6 & 63);
    const promotion = move >> 12 & 3;
    const moveType = move >> 14;
    const piece = this.board[from];
    const color = this.turn;
    const opColor = color ^ 1;
    const captured = (moveType === MoveType.ENPASSANT) ? ChessGame.createPiece(opColor, PieceType.PAWN) : this.board[to];
    const capturedSquare = (moveType === MoveType.ENPASSANT) ? to + PAWN_MOVES[opColor].normal : to;

    this.capturedPiece = captured;

    this.history.push({
      prevMove: move,
      prevHalfMoves: this.halfMoves,
      prevEpSquare: this.epSquare,
      prevCastlingPermission: this.castlingPermission,
      prevPositionKey: this.positionKey,
      prevMovedPiece: this.movedPiece,
      prevCapturedPiece: this.capturedPiece
    });

    if (this.epSquare !== Squares.NO_SQUARE) {
      this.positionKey ^= this.zobrist.epKeys[ChessGame.file(this.epSquare)];
      this.epSquare = Squares.NO_SQUARE;
    }

    this.halfMoves++;
    this.movedPiece = piece;

    this.positionKey ^= this.zobrist.pieceKeys[piece][sq64(from)] ^ this.zobrist.pieceKeys[piece][sq64(to)];

    if (captured !== SquareType.EMPTY) {
      this.removePiece(captured, capturedSquare);
      this.halfMoves = 0;
      this.positionKey ^= this.zobrist.pieceKeys[captured][sq64(capturedSquare)];
    }

    if (moveType === MoveType.PROMOTION) {
      const promotionPiece = ChessGame.createPiece(color, promotion + PieceType.KNIGHT);
      this.removePiece(piece, from);
      this.putPiece(promotionPiece, to);
      this.board[from] = SquareType.EMPTY;
      this.positionKey ^= this.zobrist.pieceKeys[piece][sq64(to)] ^ this.zobrist.pieceKeys[promotionPiece][sq64(to)];
    } else if (moveType === MoveType.CASTLING) {
      const [rookFrom, rookTo] = this.doCastling(color, from, to);
      const rook = ChessGame.createPiece(color, PieceType.ROOK);
      this.positionKey ^= this.zobrist.pieceKeys[rook][sq64(rookFrom)] ^ this.zobrist.pieceKeys[rook][sq64(rookTo)];
    } else if (moveType === MoveType.ENPASSANT) {
      this.movePiece(piece, from, to);
      this.board[capturedSquare] = SquareType.EMPTY;
      this.positionKey ^= this.zobrist.pieceKeys[captured][sq64(capturedSquare)];
    } else {
      if (
        Math.abs(from - to) === Math.abs(PAWN_MOVES[color].advanced)
        && ((piece === Piece.wP && (this.board[to - 1] === Piece.bP || this.board[to + 1] === Piece.bP))
        || (piece === Piece.bP && (this.board[to - 1] === Piece.wP || this.board[to + 1] === Piece.wP)))
      ) {
        this.epSquare = from + PAWN_MOVES[color].normal;
        this.positionKey ^= this.zobrist.epKeys[ChessGame.file(this.epSquare)];
      }

      this.movePiece(piece, from, to);
    }

    if (ChessGame.pieceType(piece) === PieceType.PAWN) {
      this.halfMoves = 0;
    }

    if (this.castlingPermission && (this.castlingPermissionMask[from] | this.castlingPermissionMask[to])) {
      this.positionKey ^= this.zobrist.castlingKeys[this.castlingPermission];
      this.castlingPermission &= ~(this.castlingPermissionMask[from] | this.castlingPermissionMask[to]);
      this.positionKey ^= this.zobrist.castlingKeys[this.castlingPermission];
    }

    this.turn = opColor;
    this.positionKey ^= this.zobrist.sideKey;

    const positionCount = this.positionsTable.get(this.positionKey);

    if (positionCount) {
      this.positionsTable.set(this.positionKey, positionCount + 1);
    } else {
      this.positionsTable.set(this.positionKey, 1);
    }

    // console.log('after: ', ChessGame.numericToUci(move));
    // this.printBoard();

    // console.log(move.toString(2));
    // console.log(ChessGame.squareToLiteral(to));
    // console.log(ChessGame.squareToLiteral(from));
    // console.log(promotion);
    // console.log(moveType);
    // console.log(ChessGame.numericToUci(move));
  }

  revertMove() {
    const prevState = this.history.pop();

    if (!prevState) {
      return;
    }

    const {
      prevMove,
      prevHalfMoves,
      prevEpSquare,
      prevCastlingPermission,
      prevPositionKey,
      prevMovedPiece,
      prevCapturedPiece
    } = prevState;

    const prevColor = this.turn ^ 1;

    const positionCount = this.positionsTable.get(this.positionKey)!;

    if (positionCount === 1) {
      this.positionsTable.delete(this.positionKey);
    } else {
      this.positionsTable.set(this.positionKey, positionCount - 1);
    }

    this.turn = prevColor;
    this.halfMoves = prevHalfMoves;
    this.epSquare = prevEpSquare;
    this.castlingPermission = prevCastlingPermission;
    this.movedPiece = prevMovedPiece;
    this.capturedPiece = prevCapturedPiece;
    this.positionKey = prevPositionKey;

    const to = sq120(prevMove & 63);
    const from = sq120(prevMove >> 6 & 63);
    const promotion = prevMove >> 12 & 3;
    const moveType = prevMove >> 14;
    let piece = this.board[to];
    const capturedSquare = (moveType === MoveType.ENPASSANT) ? to - PAWN_MOVES[prevColor].normal : to;

    if (moveType === MoveType.PROMOTION) {
      this.removePiece(piece, to);
      piece = ChessGame.createPiece(prevColor, PieceType.PAWN);
      this.putPiece(piece, to);
      this.board[to] = SquareType.EMPTY;
    } else if (moveType === MoveType.CASTLING) {
      this.doCastling(prevColor, from, to, true);
    }

    if (moveType !== MoveType.CASTLING) {
      this.movePiece(piece, to, from);

      if (prevCapturedPiece !== SquareType.EMPTY) {
        this.putPiece(prevCapturedPiece, capturedSquare);
      }
    }

    // console.log('revert: ', ChessGame.numericToUci(prevMove));
    // this.printBoard();
  }

  getPseudoLegalMoves(): number[] {
    const moves = [];
    const color = this.turn;
    const pawnMove = PAWN_MOVES[color].normal;
    const pawnMoveAdvanced = PAWN_MOVES[color].advanced;
    const pawnCapturing = PAWN_CAPTURING[color];
    const isWTurn = color === Color.WHITE;
    const longMoveRank = isWTurn ? Ranks.RANK_2 : Ranks.RANK_7;
    const prePromotionRank = isWTurn ? Ranks.RANK_7 : Ranks.RANK_2;
    const pieces = PiecesByColor[color];
    const pawn = pieces[PieceType.PAWN];
    const knight = pieces[PieceType.KNIGHT];
    const bishop = pieces[PieceType.BISHOP];
    const rook = pieces[PieceType.ROOK];
    const queen = pieces[PieceType.QUEEN];
    const king = pieces[PieceType.KING];

    for (let p = 0; p < PIECE_NUMBER; p++) {
      for (let i = 0, squares = this.pieceList[p]; i < squares.length; i++) {
        const sq = squares[i];

        if (sq === Squares.NO_SQUARE) {
          break;
        }

        switch (p) {
          case pawn:
            const pawnRank = ChessGame.rank(sq);
            for (let i = 0; i < pawnCapturing.length; i++) {
              if (this.isEnemyPiece(this.board[sq + pawnCapturing[i]])) {
                if (pawnRank === prePromotionRank) {
                  moves.push(ChessGame.createPromotionMove(sq, sq + pawnCapturing[i], Promotion.q));
                  moves.push(ChessGame.createPromotionMove(sq, sq + pawnCapturing[i], Promotion.n));
                  moves.push(ChessGame.createPromotionMove(sq, sq + pawnCapturing[i], Promotion.r));
                  moves.push(ChessGame.createPromotionMove(sq, sq + pawnCapturing[i], Promotion.b));
                } else {
                  moves.push(ChessGame.createMove(sq, sq + pawnCapturing[i]));
                }
              }
              if (this.epSquare === sq + pawnCapturing[i]) {
                moves.push(ChessGame.createEnpassantMove(sq, sq + pawnCapturing[i]));
              }
            }
            if (this.board[sq + pawnMove] === SquareType.EMPTY) {
              if (pawnRank === prePromotionRank) {
                moves.push(ChessGame.createPromotionMove(sq, sq + pawnMove, Promotion.q));
                moves.push(ChessGame.createPromotionMove(sq, sq + pawnMove, Promotion.n));
                moves.push(ChessGame.createPromotionMove(sq, sq + pawnMove, Promotion.r));
                moves.push(ChessGame.createPromotionMove(sq, sq + pawnMove, Promotion.b));
              } else {
                moves.push(ChessGame.createMove(sq, sq + pawnMove));
              }
              if (pawnRank === longMoveRank && this.board[sq + pawnMoveAdvanced] === SquareType.EMPTY) {
                moves.push(ChessGame.createMove(sq, sq + pawnMoveAdvanced));
              }
            }
            break;
          case knight:
            for (let i = 0; i < KNIGHT_MOVES.length; i++) {
              const nextSq = sq + KNIGHT_MOVES[i];
              if (this.board[nextSq] === SquareType.EMPTY || this.isEnemyPiece(this.board[nextSq])) {
                moves.push(ChessGame.createMove(sq, nextSq));
              }
            }
            break;
          case bishop:
            for (let i = 0; i < BISHOP_MOVES.length; i++) {
              let nextSq = sq + BISHOP_MOVES[i];
              while (this.board[nextSq] !== SquareType.OFFBOARD) {
                if (this.isEnemyPiece(this.board[nextSq]) || this.board[nextSq] === SquareType.EMPTY) {
                  moves.push(ChessGame.createMove(sq, nextSq));
                }

                if (this.board[nextSq] !== SquareType.EMPTY) {
                  break;
                }
                nextSq += BISHOP_MOVES[i];
              }
            }
            break;
          case rook:
            for (let i = 0; i < ROOK_MOVES.length; i++) {
              let nextSq = sq + ROOK_MOVES[i];
              while (this.board[nextSq] !== SquareType.OFFBOARD) {
                if (this.isEnemyPiece(this.board[nextSq]) || this.board[nextSq] === SquareType.EMPTY) {
                  moves.push(ChessGame.createMove(sq, nextSq));
                }

                if (this.board[nextSq] !== SquareType.EMPTY) {
                  break;
                }
                nextSq += ROOK_MOVES[i];
              }
            }
            break;
          case queen:
            for (let i = 0; i < QUEEN_MOVES.length; i++) {
              let nextSq = sq + QUEEN_MOVES[i];
              while (this.board[nextSq] !== SquareType.OFFBOARD) {
                if (this.isEnemyPiece(this.board[nextSq]) || this.board[nextSq] === SquareType.EMPTY) {
                  moves.push(ChessGame.createMove(sq, nextSq));
                }

                if (this.board[nextSq] !== SquareType.EMPTY) {
                  break;
                }
                nextSq += QUEEN_MOVES[i];
              }
            }
            break;
          case king:
            for (let i = 0; i < KING_MOVES.length; i++) {
              let nextSq = sq + KING_MOVES[i];
              if (this.board[nextSq] === SquareType.EMPTY || this.isEnemyPiece(this.board[nextSq])) {
                moves.push(ChessGame.createMove(sq, nextSq));
              }
            }

            if (!this.isCheck()) {
              if (isWTurn) {
                if (
                  (this.castlingPermission & Castling.WK)
                  && this.board[Squares.F1] === SquareType.EMPTY
                  && this.board[Squares.G1] === SquareType.EMPTY
                  && !this.isSquareAttacked(Squares.F1)
                ) {
                  moves.push(ChessGame.createCastlingMove(Squares.E1, Squares.G1));
                }
                if (
                  (this.castlingPermission & Castling.WQ)
                  && this.board[Squares.D1] === SquareType.EMPTY
                  && this.board[Squares.C1] === SquareType.EMPTY
                  && this.board[Squares.B1] === SquareType.EMPTY
                  && !this.isSquareAttacked(Squares.D1)
                ) {
                  moves.push(ChessGame.createCastlingMove(Squares.E1, Squares.C1));
                }
              } else {
                if (
                  (this.castlingPermission & Castling.BK)
                  && this.board[Squares.F8] === SquareType.EMPTY
                  && this.board[Squares.G8] === SquareType.EMPTY
                  && !this.isSquareAttacked(Squares.F8)
                ) {
                  moves.push(ChessGame.createCastlingMove(Squares.E8, Squares.G8));
                }
                if (
                  (this.castlingPermission & Castling.BQ)
                  && this.board[Squares.D8] === SquareType.EMPTY
                  && this.board[Squares.C8] === SquareType.EMPTY
                  && this.board[Squares.B8] === SquareType.EMPTY
                  && !this.isSquareAttacked(Squares.D8)
                ) {
                  moves.push(ChessGame.createCastlingMove(Squares.E8, Squares.C8));
                }
              }
            }
            break;
        }
      }
    }

    return moves;
  }

  getLegalMoves(): number[] {
    const legalMoves = [];
    const pseudoLegalMoves = this.getPseudoLegalMoves();

    for (let i = 0, l = pseudoLegalMoves.length; i < l; i++) {
      if (this.isMoveLegal(pseudoLegalMoves[i])) {
        legalMoves.push(pseudoLegalMoves[i]);
      }
    }

    return legalMoves;
  }

  haveLegalMoves(): boolean {
    const pseudoLegalMoves = this.getPseudoLegalMoves();

    for (let i = 0, l = pseudoLegalMoves.length; i < l; i++) {
      if (this.isMoveLegal(pseudoLegalMoves[i])) {
        return true
      }
    }

    return false;
  }

  isMoveLegal(move: number): boolean {
    const to = sq120(move & 63);
    const from = sq120(move >> 6 & 63);
    const prevToPiece = this.board[to];
    const prevFromPiece = this.board[from];
    const color = this.turn;
    const isKing = ChessGame.pieceType(prevFromPiece) === PieceType.KING;
    const isPawn = ChessGame.pieceType(prevFromPiece) === PieceType.PAWN;

    if (isPawn && to === this.epSquare) {
      this.board[to - PAWN_MOVES[color].normal] = SquareType.EMPTY;
    }

    if (isKing) {
      if (prevToPiece !== SquareType.EMPTY) {
        this.removePiece(prevToPiece, to);
      }

      this.movePiece(prevFromPiece, from, to);
    } else {
      this.board[from] = SquareType.EMPTY;
      this.board[to] = prevFromPiece;
    }

    const isCheck = this.isCheck();

    if (isPawn && to === this.epSquare) {
      this.board[to - PAWN_MOVES[color].normal] = ChessGame.createPiece(color ^ 1, PieceType.PAWN);
    }

    if (isKing) {
      this.movePiece(prevFromPiece, to, from);

      if (prevToPiece !== SquareType.EMPTY) {
        this.putPiece(prevToPiece, to);
      }
    } else {
      this.board[from] = prevFromPiece;
      this.board[to] = prevToPiece;
    }

    return !isCheck;
  }
}

export default ChessGame;