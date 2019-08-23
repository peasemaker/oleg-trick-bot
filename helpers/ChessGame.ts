const BOARD_SIZE = 120;
const DEFAULT_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
enum Color {
  WHITE = 'w',
  BLACK = 'b'
}
enum PieceType {
  PAWN,
  KNIGHT,
  BISHOP,
  ROOK,
  QUEEN,
  KING
}
enum Piece {
  wP = 0, wN, wB, wR, wQ, wK,
  bP, bN, bB, bR, bQ, bK
}
const PIECE_NUMBER = 12;
const PiecesByColor = {
  [Color.WHITE]: [Piece.wP, Piece.wN, Piece.wB, Piece.wR, Piece.wQ, Piece.wK],
  [Color.BLACK]: [Piece.bP, Piece.bN, Piece.bB, Piece.bR, Piece.bQ, Piece.bK]
};
enum SquareType {
  EMPTY = -1,
  OFFBOARD = 100
}
const Promotion: {[promotion in string]: number} = {
  n: 0,
  b: 1,
  r: 2,
  q: 3
};
enum MoveType {
  NORMAL = 0,
  PROMOTION,
  ENPASSANT,
  CASTLING
}
const PIECE_NOTATION = 'PNBRQKpnbrqk';
const RANKS_NOTATION = '87654321';
const FILES_NOTATION = 'abcdefgh';
const PROMOTION_NOTATION = 'nbrq';
enum Squares {
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
enum Ranks {
  RANK_8 = 0,
  RANK_7,
  RANK_6,
  RANK_5,
  RANK_4,
  RANK_3,
  RANK_2,
  RANK_1
}
// enum Files {
//   FILE_1 = 0,
//   FILE_2,
//   FILE_3,
//   FILE_4,
//   FILE_5,
//   FILE_6,
//   FILE_7,
//   FILE_8
// }
enum Castling {
  WK = 1,
  WQ = 2,
  BK = 4,
  BQ = 8,
  W = WK | WQ,
  B = BK | BQ
}
const CastlingFenMask: {[castling in string]: {kingSquare: number, rookSquare: number, castling: Castling}} = {
  K: {kingSquare: Squares.E1, rookSquare: Squares.H1, castling: Castling.WK},
  Q: {kingSquare: Squares.E1, rookSquare: Squares.A1, castling: Castling.WQ},
  k: {kingSquare: Squares.E8, rookSquare: Squares.H8, castling: Castling.BK},
  q: {kingSquare: Squares.E8, rookSquare: Squares.A8, castling: Castling.BQ}
};
const SQ120TO64 = [
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
const SQ64TO120 = [
  21, 22, 23, 24, 25, 26, 27, 28,
  31, 32, 33, 34, 35, 36, 37, 38,
  41, 42, 43, 44, 45, 46, 47, 48,
  51, 52, 53, 54, 55, 56, 57, 58,
  61, 62, 63, 64, 65, 66, 67, 68,
  71, 72, 73, 74, 75, 76, 77, 78,
  81, 82, 83, 84, 85, 86, 87, 88,
  91, 92, 93, 94, 95, 96, 97, 98
];
const sq120 = (square64: number): number => SQ64TO120[square64];
const sq64 = (square120: number): number => SQ120TO64[square120];
const KNIGHT_MOVES = [-21, -19, -12, -8, 8, 12, 19, 21];
const BISHOP_MOVES = [-11, -9, 9, 11];
const ROOK_MOVES = [-10, -1, 1, 10];
const QUEEN_MOVES = [-11, -10, -9, -1, 1, 9, 10, 11];
const KING_MOVES = [-11, -10, -9, -1, 1, 9, 10, 11];
const PAWN_CAPTURING = {
  [Color.WHITE] : [-9, -11],
  [Color.BLACK] : [9, 11]
};
const PAWN_MOVES = {
  [Color.WHITE]: {normal: -10, advanced: -20},
  [Color.BLACK]: {normal: 10, advanced: 20},
};

export default class ChessGame {
  board: number[];
  pieceCount: number[];
  pieceList: number[][];
  turn: Color;
  halfMoves: number;
  epSquare: number;
  castlingPermission: number;
  castlingPermissionMask: {[square in string]: number};

  constructor(fen: string = DEFAULT_FEN) {
    this.board = ChessGame.initBoard();
    this.turn = Color.WHITE;
    this.halfMoves = 0;
    this.epSquare = Squares.NO_SQUARE;
    this.castlingPermission = 0;
    this.castlingPermissionMask = {};
    this.pieceCount = new Array(PIECE_NUMBER).fill(0);
    this.pieceList = new Array(PIECE_NUMBER).fill(0).map(() => []);

    this.parseFen(fen);
  }

  static initBoard(): number[] {
    const board = new Array(BOARD_SIZE);

    for (let i = 0; i < BOARD_SIZE; i++) {
      board[i] = SquareType.OFFBOARD;
    }

    for (let i = 0; i < 64; i++) {
      board[sq120(i)] = SquareType.EMPTY;
    }

    return board;
  }

  static isWPiece(piece: number): boolean {
    return (piece >= Piece.wP) && (piece <= Piece.wK);
  }

  static isBPiece(piece: number): boolean {
    return (piece >= Piece.bP) && (piece <= Piece.bK);
  }

  static literalToSquare(literal: string): number {
    return sq120(FILES_NOTATION.indexOf(literal[0]) + RANKS_NOTATION.indexOf(literal[1]) * 8);
  }

  static squareToLiteral(square: number): string {
    if (square === Squares.NO_SQUARE) {
      return 'no square';
    }

    const rankIndex = Math.floor(sq64(square) / 8);
    const fileIndex = sq64(square) - rankIndex * 8;

    return FILES_NOTATION[fileIndex] + RANKS_NOTATION[rankIndex];
  }

  static createPiece(color: Color, pieceType: PieceType) {
    return PiecesByColor[color][pieceType];
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

    if (Math.abs(from - to) === 2 && (fromPiece === Piece.wK || fromPiece === Piece.bK)) {
      moveType = MoveType.CASTLING;
    }

    if ((fromPiece === Piece.wP || fromPiece === Piece.bP) && this.epSquare === to) {
      moveType = MoveType.ENPASSANT;
    }

    return (moveType << 14) + (promotion << 12) + (sq64(from) << 6) + sq64(to);
  }

  isEnemyPiece(piece: number): boolean {
    return this.isWTurn() ? ChessGame.isBPiece(piece) : ChessGame.isWPiece(piece);
  }

  parseFen(fen: string) {
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

    this.turn = (Color.WHITE === tokens[1]) ? Color.WHITE : Color.BLACK;

    const castling = tokens[2];

    if (castling !== '-') {
      for (let i = 0; i < castling.length; i++) {
        const castlingFenMask = CastlingFenMask[castling[i]];
        this.castlingPermission |= castlingFenMask.castling;
        this.castlingPermissionMask[castlingFenMask.kingSquare] |= castlingFenMask.castling;
        this.castlingPermissionMask[castlingFenMask.rookSquare] |= castlingFenMask.castling;
      }
    }

    this.epSquare = (tokens[3] === '-') ? Squares.NO_SQUARE : ChessGame.literalToSquare(tokens[3]);
    this.halfMoves = parseInt(tokens[4]);
  }

  printBoard() {
    let print = '';

    for (let i = 0; i < 64; i++) {
      const square = this.board[sq120(i)];

      if (square === SquareType.EMPTY) {
        // if (this.isSquareAttacked(sq120(i))) {
        //   print += 'X';
        // } else {
        print += '.';
        // }
      } else {
        print += PIECE_NOTATION[square];
      }

      if ((i + 1) % 8 === 0) {
        print += '\n';
      }
    }

    console.log(print);
    console.log(`piece count: ${this.pieceCount}`);
    for (let i = 0; i < this.pieceList.length; i++) {
      const pieces = ['w_pawn', 'w_khight', 'w_bishop', 'w_rook', 'w_queen', 'w_king', 'b_pawn', 'b_khight', 'b_bishop', 'b_rook', 'b_queen', 'b_king'];
      console.log(pieces[i], this.pieceList[i].map(sq => ChessGame.squareToLiteral(sq)));
    }
    // console.log(`ep square: ${ChessGame.squareToLiteral(this.epSquare)}`);
    // console.log(`castling permission: ${this.castlingPermission.toString(2)}`);
    // console.log(`half moves: ${this.halfMoves}`);
  }

  isWTurn() {
    return this.turn === Color.WHITE;
  }

  isSquareAttacked(square: number, color?: Color): boolean {
    if (square === Squares.NO_SQUARE) {
      return false;
    }
    const sideColor = color || this.turn;
    const [pawn, knight, bishop, rook, queen, king] = PiecesByColor[sideColor];

    for (let i = 0; i < PAWN_CAPTURING[sideColor].length; i++) {
      if (this.board[square - PAWN_CAPTURING[sideColor][i]] === pawn) {
        return true;
      }
    }

    for (let i = 0; i < KNIGHT_MOVES.length; i++) {
      if (this.board[square + KNIGHT_MOVES[i]] === knight) {
        return true;
      }
    }

    for (let i = 0; i < KING_MOVES.length; i++) {
      if (this.board[square + KING_MOVES[i]] === king) {
        return true;
      }
    }

    for (let i = 0; i < BISHOP_MOVES.length; i++) {
      let sq = square + BISHOP_MOVES[i];
      while(this.board[sq] !== SquareType.OFFBOARD) {
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

    for (let i = 0; i < ROOK_MOVES.length; i++) {
      let sq = square + ROOK_MOVES[i];
      while(this.board[sq] !== SquareType.OFFBOARD) {
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

    return false;
  }

  isCheck(color?: Color): boolean {
    const sideColor = color || this.turn;
    const oppositeColor = sideColor === Color.WHITE ? Color.BLACK : Color.WHITE;
    const king = sideColor === Color.WHITE ? Piece.wK : Piece.bK;
    const kingSquare = this.pieceList[king][0];

    return this.isSquareAttacked(kingSquare, oppositeColor);
  }

  isMate(): boolean {
    return this.isCheck() && this.getLegalMoves().length === 0;
  }

  isStaleMate(): boolean {
    return !this.isCheck() && this.getLegalMoves().length === 0;
  }

  putPiece(piece: Piece, to: number) {
    this.board[to] = piece;
    this.pieceList[piece][this.pieceCount[piece]++] = to;
  }

  movePiece(piece: Piece, from: number, to: number) {
    this.board[from] = SquareType.EMPTY;
    this.board[to] = piece;
    const index = this.pieceList[piece].findIndex((sq) =>  sq === from);

    if (index === -1) {
      console.error('ERROR IN MOVE PIECE');
      return;
    }

    this.pieceList[piece][index] = to;
  }

  removePiece(piece: Piece, from: number) {
    const index = this.pieceList[piece].findIndex((sq) => sq === from);

    if (index === -1) {
      return;
    }

    this.pieceList[piece][index] = this.pieceList[piece][--this.pieceCount[piece]];
    this.pieceList[piece][this.pieceCount[piece]] = Squares.NO_SQUARE
  }

  doCastling(color: Color, from: number, to: number) {
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

    this.board[from] = this.board[rookFrom] = SquareType.EMPTY;
    this.removePiece(king, from);
    this.removePiece(rook, rookFrom);
    this.putPiece(king, to);
    this.putPiece(rook, rookTo);
  }

  applyMoves(moves: string[]) {
    for (let i = 0; i < moves.length; i++) {
      this.makeMove(moves[i]);
    }
  }

  makeMove(moveUci: string) {
    const moveNum = this.uciToNumeric(moveUci);
    const to = sq120(moveNum & 63);
    const from = sq120(moveNum >> 6 & 63);
    const promotion = moveNum >> 12 & 3;
    const moveType = moveNum >> 14;
    const piece = this.board[from];
    const color = this.turn;
    const opColor = (color === Color.WHITE) ? Color.BLACK : Color.WHITE;
    const captured = (moveType === MoveType.ENPASSANT) ? ChessGame.createPiece(opColor, PieceType.PAWN) : this.board[to];
    const capturedSquare = (moveType === MoveType.ENPASSANT) ? to + PAWN_MOVES[opColor].normal : to;

    this.epSquare = Squares.NO_SQUARE;

    if (moveType === MoveType.PROMOTION) {
      const promotionPiece = ChessGame.createPiece(color, promotion + PieceType.KNIGHT);
      this.removePiece(piece, from);
      this.putPiece(promotionPiece, to);
      this.board[from] = SquareType.EMPTY;
    } else if (moveType === MoveType.CASTLING) {
      this.doCastling(color, from, to);
    } else if (moveType === MoveType.ENPASSANT) {
      this.movePiece(piece, from, to);
      this.board[capturedSquare] = SquareType.EMPTY;
    } else {
      if (
          Math.abs(from - to) === Math.abs(PAWN_MOVES[color].advanced)
          && ((this.board[from] === Piece.wP && (this.board[to - 1] === Piece.bP || this.board[to + 1] === Piece.bP))
          || (this.board[from] === Piece.bP && (this.board[to - 1] === Piece.wP || this.board[to + 1] === Piece.wP)))
      ) {
        this.epSquare = from + PAWN_MOVES[color].normal;
      }

      this.movePiece(piece, from, to);
    }

    if (captured !== SquareType.EMPTY) {
      this.removePiece(captured, capturedSquare);
    }

    if (this.castlingPermission && (this.castlingPermissionMask[from] | this.castlingPermissionMask[to])) {
      this.castlingPermission &= ~(this.castlingPermissionMask[from] | this.castlingPermissionMask[to]);
    }

    this.turn = opColor;

    // console.log(moveNum.toString(2));
    // console.log(ChessGame.squareToLiteral(to));
    // console.log(ChessGame.squareToLiteral(from));
    // console.log(promotion);
    // console.log(moveType);
    // console.log(ChessGame.numericToUci(moveNum));

    // console.log('after: ', moveUci);
    // this.printBoard();
  }

  getPseudoLegalMoves(): number[] {
    const moves = [];
    const color = this.turn;
    const pawnMove = PAWN_MOVES[color].normal;
    const pawnMoveAdvanced = PAWN_MOVES[color].advanced;
    const pawnCapturing = PAWN_CAPTURING[color];
    const isWTurn = this.isWTurn();
    const longMoveRank = isWTurn ? Ranks.RANK_2 : Ranks.RANK_7;
    const prePromotionRank = isWTurn ? Ranks.RANK_7 : Ranks.RANK_2;
    const [pawn, knight, bishop, rook, queen, king] = PiecesByColor[this.turn];

    for (let p = 0; p < PIECE_NUMBER; p++) {
      for (let i = 0, squares = this.pieceList[p]; i < squares.length; i++) {
        const sq = squares[i];

        if (sq === Squares.NO_SQUARE) {
          break;
        }

        switch (p) {
          case pawn:
            for (let i = 0; i < pawnCapturing.length; i++) {
              if (this.isEnemyPiece(this.board[sq + pawnCapturing[i]]) || this.epSquare === sq + pawnCapturing[i]) {
                if (Math.floor(sq64(sq) / 8) === prePromotionRank) {
                  moves.push((MoveType.PROMOTION << 14) + (Promotion.q << 12) + (sq64(sq) << 6) + sq64(sq + pawnCapturing[i]));
                } else {
                  moves.push((sq64(sq) << 6) + sq64(sq + pawnCapturing[i]));
                }
              }
            }
            if (this.board[sq + pawnMove] === SquareType.EMPTY) {
              if (Math.floor(sq64(sq) / 8) === prePromotionRank) {
                moves.push((MoveType.PROMOTION << 14) + (Promotion.q << 12) + (sq64(sq) << 6) + sq64(sq + pawnMove));
              } else {
                moves.push((sq64(sq) << 6) + sq64(sq + pawnMove));
              }
              if (Math.floor(sq64(sq) / 8) === longMoveRank && this.board[sq + pawnMoveAdvanced] === SquareType.EMPTY) {
                moves.push((sq64(sq) << 6) + sq64(sq + pawnMoveAdvanced));
              }
            }
            break;
          case knight:
            for (let i = 0; i < KNIGHT_MOVES.length; i++) {
              if (this.board[sq + KNIGHT_MOVES[i]] === SquareType.EMPTY || this.isEnemyPiece(this.board[sq + KNIGHT_MOVES[i]])) {
                moves.push((sq64(sq) << 6) + sq64(sq + KNIGHT_MOVES[i]));
              }
            }
            break;
          case bishop:
            for (let i = 0; i < BISHOP_MOVES.length; i++) {
              let nextSq = sq + BISHOP_MOVES[i];
              while (this.board[nextSq] !== SquareType.OFFBOARD) {
                if (this.isEnemyPiece(this.board[nextSq]) || this.board[nextSq] === SquareType.EMPTY) {
                  moves.push((sq64(sq) << 6) + sq64(nextSq));
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
                  moves.push((sq64(sq) << 6) + sq64(nextSq));
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
                  moves.push((sq64(sq) << 6) + sq64(nextSq));
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
              if (this.board[sq + KING_MOVES[i]] === SquareType.EMPTY || this.isEnemyPiece(this.board[sq + KING_MOVES[i]])) {
                moves.push((sq64(sq) << 6) + sq64(sq + KING_MOVES[i]));
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
                  moves.push((sq64(Squares.E1) << 6) + sq64(Squares.G1));
                }
                if (
                    (this.castlingPermission & Castling.WQ)
                    && this.board[Squares.D1] === SquareType.EMPTY
                    && this.board[Squares.C1] === SquareType.EMPTY
                    && this.board[Squares.B1] === SquareType.EMPTY
                    && !this.isSquareAttacked(Squares.D1)
                ) {
                  moves.push((sq64(Squares.E1) << 6) + sq64(Squares.C1));
                }
              } else {
                if (
                    (this.castlingPermission & Castling.BK)
                    && this.board[Squares.F8] === SquareType.EMPTY
                    && this.board[Squares.G8] === SquareType.EMPTY
                    && !this.isSquareAttacked(Squares.F8)
                ) {
                  moves.push((sq64(Squares.E8) << 6) + sq64(Squares.G8));
                }
                if (
                    (this.castlingPermission & Castling.BQ)
                    && this.board[Squares.D8] === SquareType.EMPTY
                    && this.board[Squares.C8] === SquareType.EMPTY
                    && this.board[Squares.B8] === SquareType.EMPTY
                    && !this.isSquareAttacked(Squares.D8)
                ) {
                  moves.push((sq64(Squares.E8) << 6) + Squares.C8);
                }
              }
            }
            break;
        }
      }
    }

    return moves;
  }

  getLegalMoves(): string[] {
    return this.getPseudoLegalMoves()
        .filter(move => this.isMoveLegal(move))
        .map(move => ChessGame.numericToUci(move));
  }

  isMoveLegal(move: number): boolean {
    const to = sq120(move & 63);
    const from = sq120(move >> 6 & 63);
    const prevToPiece = this.board[to];
    const prevFromPiece = this.board[from];
    const color = this.turn;
    const isKing = prevFromPiece === Piece.wK || prevFromPiece === Piece.bK;

    if (to === this.epSquare) {
      if (this.board[from] === Piece.wP) {
        this.board[to - PAWN_MOVES[color].normal] = SquareType.EMPTY;
      } else {
        this.board[to + PAWN_MOVES[color].normal] = SquareType.EMPTY;
      }
    }

    if (isKing) {
      this.movePiece(prevFromPiece, from, to);
    }

    this.board[from] = SquareType.EMPTY;
    this.board[to] = prevFromPiece;

    const isCheck = this.isCheck();

    if (to === this.epSquare) {
      if (this.board[to] === Piece.wP) {
        this.board[to - PAWN_MOVES[color].normal] = Piece.bP;
      } else {
        this.board[to + PAWN_MOVES[color].normal] = Piece.wP;
      }
    }

    if (isKing) {
      this.movePiece(prevFromPiece, to, from);
    }

    this.board[from] = prevFromPiece;
    this.board[to] = prevToPiece;

    return !isCheck;
  }
}