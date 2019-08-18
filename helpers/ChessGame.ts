const BOARD_SIZE = 120;
const DEFAULT_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
enum Side {
  WHITE = 'w',
  BLACK = 'b'
}
enum PieceType {
  NO_PIECE_TYPE = 0,
  PAWN,
  KNIGHT,
  BISHOP,
  ROOK,
  QUEEN,
  KING
}
enum Pieces {
  wP = 0,
  wN,
  wB,
  wR,
  wQ,
  wK,
  bP,
  bN,
  bB,
  bR,
  bQ,
  bK
}
enum SquareType {
  EMPTY = -1,
  OFFBOARD = 100
}
enum Promotion {
  n = 0,
  b,
  r,
  q
}
enum MoveType {
  NORMAL = 0,
  PROMOTION,
  ENPASSANT,
  CASTLING
}
const PIECE_NOTATION = 'PNBRQKpnbrqk';
const RANKS_NOTATION = '87654321';
const FILES_NOTATION = 'abcdefgh';
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
enum Files {
  FILE_1 = 0,
  FILE_2,
  FILE_3,
  FILE_4,
  FILE_5,
  FILE_6,
  FILE_7,
  FILE_8
}
enum Castling {
  WK = 1,
  WQ = 2,
  BK = 4,
  BQ = 8
}
const WK_CASTLING_UCI = 'e1g1';
const WQ_CASTLING_UCI = 'e1c1';
const BK_CASTLING_UCI = 'e8g8';
const BQ_CASTLING_UCI = 'e8c8';
const CASTLING_MOVES = [WK_CASTLING_UCI, WQ_CASTLING_UCI, BK_CASTLING_UCI, BQ_CASTLING_UCI];
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
const PAWN_CAPTURING = [-9, -11];
const PAWN_MOVES = [-10, -20];

export default class ChessGame {
  board: number[];
  turn: Side;
  halfMoves: number;
  epSquare: number;
  castlingPermission: number;

  constructor(fen: string = DEFAULT_FEN) {
    this.board = ChessGame.initBoard();
    this.turn = Side.WHITE;
    this.halfMoves = 0;
    this.epSquare = Squares.NO_SQUARE;
    this.castlingPermission = 0;

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
    return piece >= Pieces.wP && piece <= Pieces.wK;
  }

  static isBPiece(piece: number): boolean {
    return piece >= Pieces.bP && piece <= Pieces.bK;
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

    if (CASTLING_MOVES.includes(moveUci) && (fromPiece === Pieces.wK || fromPiece === Pieces.bK)) {
      moveType = MoveType.CASTLING;
    }

    if ((fromPiece === Pieces.wP || fromPiece === Pieces.bP) && this.epSquare === to) {
      moveType = MoveType.ENPASSANT;
    }

    return (moveType << 14) + (promotion << 12) + (sq64(from) << 6) + sq64(to);
  }

  static numericToUci(moveNum: number): string {
    const to = ChessGame.squareToLiteral(sq120(moveNum & 63));
    const from = ChessGame.squareToLiteral(sq120((moveNum >> 6) & 63));
    const promotion = (moveNum >> 12) & 3;
    const moveType = moveNum >> 14;
    let promotionUci = '';

    if (moveType === MoveType.PROMOTION) {
      switch (promotion) {
        case Promotion.n:
          promotionUci = 'n';
          break;
        case Promotion.b:
          promotionUci = 'b';
          break;
        case Promotion.r:
          promotionUci = 'r';
          break;
        case Promotion.q:
          promotionUci = 'q';
          break;
      }
    }

    return from + to + promotionUci;
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
        this.board[sq120(square)] = PIECE_NOTATION.indexOf(position[i]);
        square++;
      }
    }

    this.turn = (Side.WHITE === tokens[1]) ? Side.WHITE : Side.BLACK;

    const castling = tokens[2];

    if (castling !== '-') {
      for (let i = 0; i < castling.length; i++) {
        switch (castling[i]) {
          case 'K': this.castlingPermission |= Castling.WK; break;
          case 'Q': this.castlingPermission |= Castling.WQ; break;
          case 'k': this.castlingPermission |= Castling.BK; break;
          case 'q': this.castlingPermission |= Castling.BQ; break;
        }
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
    // console.log(`turn: ${this.turn}`);
    console.log(`ep square: ${ChessGame.squareToLiteral(this.epSquare)}`);
    // console.log(`half moves: ${this.halfMoves}`);
    console.log(`castling permission: ${this.castlingPermission.toString(2)}`);
  }

  isWTurn() {
    return this.turn === Side.WHITE;
  }

  isSquareAttacked(square: number): boolean {
    if (square === Squares.NO_SQUARE) {
      return false;
    }

    const isWTurn = this.isWTurn();
    const pawnDir = isWTurn ? 1 : -1;
    const pawn = isWTurn ? Pieces.bP : Pieces.wP;
    const knight = isWTurn ? Pieces.bN : Pieces.wN;
    const bishop = isWTurn ? Pieces.bB : Pieces.wB;
    const rook = isWTurn ? Pieces.bR : Pieces.wR;
    const queen = isWTurn ? Pieces.bQ : Pieces.wQ;
    const king = isWTurn ? Pieces.bK : Pieces.wK;

    for (let i = 0; i < PAWN_CAPTURING.length; i++) {
      if (this.board[square + pawnDir * PAWN_CAPTURING[i]] === pawn) {
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

  isCheck() {
    let kingSquare = Squares.NO_SQUARE;
    const king = this.isWTurn() ? Pieces.wK : Pieces.bK;

    for (let i = 0; i < 64; i++) {
      if (this.board[sq120(i)] === king) {
        kingSquare = sq120(i);
        break;
      }
    }

    return this.isSquareAttacked(kingSquare);
  }

  applyMoves(moves: string[]) {
    for (let i = 0; i < moves.length; i++) {
      this.makeMove(moves[i]);
    }
  }

  makeMove(moveUci: string) {
    console.log('before:', moveUci);
    this.printBoard();

    const isWTurn = this.isWTurn();
    const moveNum = this.uciToNumeric(moveUci);
    const to = sq120(moveNum & 63);
    const from = sq120(moveNum >> 6 & 63);
    const promotion = moveNum >> 12 & 3;
    const moveType = moveNum >> 14;

    this.epSquare = Squares.NO_SQUARE;

    if (moveType === MoveType.PROMOTION) {
      let promotionPiece = 0;

      switch (promotion) {
        case Promotion.n:
          promotionPiece = isWTurn ? Pieces.wN : Pieces.bN;
          break;
        case Promotion.b:
          promotionPiece = isWTurn ? Pieces.wB : Pieces.bB;
          break;
        case Promotion.r:
          promotionPiece = isWTurn ? Pieces.wR : Pieces.bR;
          break;
        case Promotion.q:
          promotionPiece = isWTurn ? Pieces.wQ : Pieces.bQ;
          break;
      }

      this.board[to] = promotionPiece;
    } else if (moveType === MoveType.CASTLING) {
      this.board[to] = this.board[from];

      switch (moveUci) {
        case WK_CASTLING_UCI:
          this.board[Squares.F1] = Pieces.wR;
          this.board[Squares.H1] = SquareType.EMPTY;
          this.castlingPermission &= ~Castling.WK;
          this.castlingPermission &= ~Castling.WQ;
          break;
        case WQ_CASTLING_UCI:
          this.board[Squares.D1] = Pieces.wR;
          this.board[Squares.A1] = SquareType.EMPTY;
          this.castlingPermission &= ~Castling.WK;
          this.castlingPermission &= ~Castling.WQ;
          break;
        case BK_CASTLING_UCI:
          this.board[Squares.F8] = Pieces.bR;
          this.board[Squares.H8] = SquareType.EMPTY;
          this.castlingPermission &= ~Castling.BK;
          this.castlingPermission &= ~Castling.BQ;
          break;
        case BQ_CASTLING_UCI:
          this.board[Squares.D8] = Pieces.bR;
          this.board[Squares.A8] = SquareType.EMPTY;
          this.castlingPermission &= ~Castling.BK;
          this.castlingPermission &= ~Castling.BQ;
          break;
      }
    } else if (moveType === MoveType.ENPASSANT) {
      this.board[to] = this.board[from];
      this.board[to + (isWTurn ? -1 : 1) * PAWN_MOVES[0]] = SquareType.EMPTY;
    } else {
      if (
          Math.abs(from - to) === Math.abs(PAWN_MOVES[1])
          && ((this.board[from] === Pieces.wP && (this.board[to - 1] === Pieces.bB || this.board[to + 1] === Pieces.bP))
          || (this.board[from] === Pieces.bP && (this.board[to - 1] === Pieces.wB || this.board[to + 1] === Pieces.wP)))
      ) {
        this.epSquare = from + (isWTurn ? 1 : -1) * PAWN_MOVES[0];
      }

      if (this.board[from] === Pieces.wK) {
        this.castlingPermission &= ~Castling.WK;
        this.castlingPermission &= ~Castling.WQ;
      }

      if (this.board[from] === Pieces.bK) {
        this.castlingPermission &= ~Castling.BK;
        this.castlingPermission &= ~Castling.BQ;
      }

      if (this.board[from] === Pieces.wR) {
        if (from === Squares.A1) {
          this.castlingPermission &= ~Castling.WQ;
        }
        if (from === Squares.H1) {
          this.castlingPermission &= ~Castling.WK;
        }
      }

      if (this.board[from] === Pieces.bR) {
        if (from === Squares.A8) {
          this.castlingPermission &= ~Castling.BQ;
        }
        if (from === Squares.H8) {
          this.castlingPermission &= ~Castling.BK;
        }
      }

      if (this.board[to] === Pieces.wR) {
        if (to === Squares.A1) {
          this.castlingPermission &= ~Castling.WQ;
        }
        if (to === Squares.H1) {
          this.castlingPermission &= ~Castling.WK;
        }
      }

      if (this.board[to] === Pieces.bR) {
        if (to === Squares.A8) {
          this.castlingPermission &= ~Castling.BQ;
        }
        if (to === Squares.H8) {
          this.castlingPermission &= ~Castling.BK;
        }
      }

      this.board[to] = this.board[from];
    }

    this.board[from] = SquareType.EMPTY;
    this.turn = this.isWTurn() ? Side.BLACK : Side.WHITE;

    console.log('after:', moveUci);
    this.printBoard();

    // console.log(moveNum.toString(2));
    // console.log(ChessGame.squareToLiteral(to));
    // console.log(ChessGame.squareToLiteral(from));
    // console.log(promotion);
    // console.log(moveType);
    // console.log(ChessGame.numericToUci(moveNum));
  }

  getLegalMoves(): string[] {
    const moves = [];
    const isWTurn = this.isWTurn();
    const pawnDir = isWTurn ? 1 : -1;
    const pawn = isWTurn ? Pieces.wP : Pieces.bP;
    const longMoveRank = isWTurn ? Ranks.RANK_2 : Ranks.RANK_7;
    const prePromotionRank = isWTurn ? Ranks.RANK_7 : Ranks.RANK_2;
    const knight = isWTurn ? Pieces.wN : Pieces.bN;
    const bishop = isWTurn ? Pieces.wB : Pieces.bB;
    const rook = isWTurn ? Pieces.wR : Pieces.bR;
    const queen = isWTurn ? Pieces.wQ : Pieces.bQ;
    const king = isWTurn ? Pieces.wK : Pieces.bK;

    for (let s = 0; s < 64; s++) {
      const sq = sq120(s);
      switch(this.board[sq]) {
        case pawn:
          for (let i = 0; i < PAWN_CAPTURING.length; i++) {
            if (this.isEnemyPiece(this.board[sq + pawnDir * PAWN_CAPTURING[i]]) || this.epSquare === sq + pawnDir * PAWN_CAPTURING[i]) {
              moves.push(ChessGame.squareToLiteral(sq) + ChessGame.squareToLiteral(sq + pawnDir * PAWN_CAPTURING[i]));
            }
          }
          if (this.board[sq + pawnDir * PAWN_MOVES[0]] === SquareType.EMPTY) {
            if (Math.floor(sq64(sq) / 8) === prePromotionRank) {
              moves.push(ChessGame.squareToLiteral(sq) + ChessGame.squareToLiteral(sq + pawnDir * PAWN_MOVES[0]) + 'q');
            } else {
              moves.push(ChessGame.squareToLiteral(sq) + ChessGame.squareToLiteral(sq + pawnDir * PAWN_MOVES[0]));
            }
            if (Math.floor(sq64(sq) / 8) === longMoveRank && this.board[sq + pawnDir * PAWN_MOVES[1]] === SquareType.EMPTY) {
              moves.push(ChessGame.squareToLiteral(sq) + ChessGame.squareToLiteral(sq + pawnDir * PAWN_MOVES[1]));
            }
          }
          break;
        case knight:
          for (let i = 0; i < KNIGHT_MOVES.length; i++) {
            if (this.board[sq + KNIGHT_MOVES[i]] === SquareType.EMPTY || this.isEnemyPiece(this.board[sq + KNIGHT_MOVES[i]])) {
              moves.push(ChessGame.squareToLiteral(sq) + ChessGame.squareToLiteral(sq + KNIGHT_MOVES[i]));
            }
          }
          break;
        case bishop:
          for (let i = 0; i < BISHOP_MOVES.length; i++) {
            let nextSq = sq + BISHOP_MOVES[i];
            while(this.board[nextSq] !== SquareType.OFFBOARD) {
              if (this.isEnemyPiece(this.board[nextSq]) || this.board[nextSq] === SquareType.EMPTY) {
                moves.push(ChessGame.squareToLiteral(sq) + ChessGame.squareToLiteral(nextSq));
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
            while(this.board[nextSq] !== SquareType.OFFBOARD) {
              if (this.isEnemyPiece(this.board[nextSq]) || this.board[nextSq] === SquareType.EMPTY) {
                moves.push(ChessGame.squareToLiteral(sq) + ChessGame.squareToLiteral(nextSq));
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
            while(this.board[nextSq] !== SquareType.OFFBOARD) {
              if (this.isEnemyPiece(this.board[nextSq]) || this.board[nextSq] === SquareType.EMPTY) {
                moves.push(ChessGame.squareToLiteral(sq) + ChessGame.squareToLiteral(nextSq));
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
              moves.push(ChessGame.squareToLiteral(sq) + ChessGame.squareToLiteral(sq + KING_MOVES[i]));
            }
          }

          if (!this.isCheck()) {
            console.log('not check');
            if (isWTurn) {
              if (
                  (this.castlingPermission & Castling.WK)
                  && this.board[Squares.F1] === SquareType.EMPTY
                  && this.board[Squares.G1] === SquareType.EMPTY
                  && !this.isSquareAttacked(Squares.F1)
                  && !this.isSquareAttacked(Squares.G1)
              ) {
                moves.push(WK_CASTLING_UCI);
              }
              if (
                  (this.castlingPermission & Castling.WQ)
                  && this.board[Squares.D1] === SquareType.EMPTY
                  && this.board[Squares.C1] === SquareType.EMPTY
                  && this.board[Squares.B1] === SquareType.EMPTY
                  && !this.isSquareAttacked(Squares.D1)
                  && !this.isSquareAttacked(Squares.C1)
              ) {
                moves.push(WQ_CASTLING_UCI);
              }
            } else {
              if (
                  (this.castlingPermission & Castling.BK)
                  && this.board[Squares.F8] === SquareType.EMPTY
                  && this.board[Squares.G8] === SquareType.EMPTY
                  && !this.isSquareAttacked(Squares.F8)
                  && !this.isSquareAttacked(Squares.G8)
              ) {
                moves.push(BK_CASTLING_UCI);
              }
              if (
                  (this.castlingPermission & Castling.BQ)
                  && this.board[Squares.D8] === SquareType.EMPTY
                  && this.board[Squares.C8] === SquareType.EMPTY
                  && this.board[Squares.B8] === SquareType.EMPTY
                  && !this.isSquareAttacked(Squares.D8)
                  && !this.isSquareAttacked(Squares.C8)
              ) {
                moves.push(BQ_CASTLING_UCI);
              }
            }
          }
          break;
      }
    }

    return moves;
  }
}