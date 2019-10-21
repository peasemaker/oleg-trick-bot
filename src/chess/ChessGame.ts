import {GameState, Zobrist} from '../types';
import {
  BISHOP_MOVES,
  BOARD_SIZE,
  Castling,
  CASTLING_FEN_MASK,
  Color,
  DEFAULT_FEN,
  FILES_NOTATION,
  KING_MOVES,
  KNIGHT_MOVES,
  MoveType,
  PAWN_CAPTURING,
  PAWN_MOVES,
  Piece,
  PIECE_NOTATION,
  PIECE_NUMBER,
  PIECE_VALUES,
  PiecesByColor,
  PieceType,
  Promotion,
  PROMOTION_NOTATION,
  QUEEN_MOVES,
  randInt64,
  Ranks,
  RANKS_NOTATION,
  ROOK_MOVES,
  sq120,
  sq64,
  SQUARE_COLOR,
  Squares,
  SquareType
} from '../constants';
import {b, g, m} from '../helpers';

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
  isInCheck: boolean;
  isInDoubleCheck: boolean;
  checkingPieceSquare: number;

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
    this.isInCheck = false;
    // TODO: add initialization in loadFen
    this.isInDoubleCheck = false;
    this.checkingPieceSquare = Squares.NO_SQUARE;

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

  static isVertical(dir: number): boolean {
    return dir === ROOK_MOVES[0] || dir === ROOK_MOVES[3];
  }

  static isHorizontal(dir: number): boolean {
    return dir === ROOK_MOVES[1] || dir === ROOK_MOVES[2];
  }

  static isOrthogonal(dir: number): boolean {
    return ChessGame.isHorizontal(dir) || ChessGame.isVertical(dir);
  }

  static isDiagonal(dir: number): boolean {
    return BISHOP_MOVES.includes(dir);
  }

  static getDirection(sq1: number, sq2: number): number {
    const rank1 = ChessGame.rank(sq1);
    const file1 = ChessGame.file(sq1);
    const rank2 = ChessGame.rank(sq2);
    const file2 = ChessGame.file(sq2);

    if (rank1 === rank2) {
      return (sq2 - sq1) / Math.abs(file2 - file1);
    } else if (file1 === file2) {
      return (sq2 - sq1) / Math.abs(rank2 - rank1);
    } else if (Math.abs(rank2 - rank1) === Math.abs(file2 - file1)) {
      return (sq2 - sq1) / Math.abs(rank2 - rank1);
    }

    return 0;
  }

  static isSquareBetween(startSq: number, endSq: number, betweenSq: number): boolean {
    const dirStartToBetween = ChessGame.getDirection(startSq, betweenSq);
    const dirEndToBetween = ChessGame.getDirection(endSq, betweenSq);

    return !!dirStartToBetween && dirStartToBetween === -dirEndToBetween;
  }

  static isThreeSquaresOnLine(sq1: number, sq2: number, sq3: number): boolean {
    const rank1 = ChessGame.rank(sq1);
    const file1 = ChessGame.file(sq1);
    const rank2 = ChessGame.rank(sq2);
    const file2 = ChessGame.file(sq2);
    const rank3 = ChessGame.rank(sq3);
    const file3 = ChessGame.file(sq3);

    return (rank1 - rank2) * (file1 - file3) === (rank1 - rank3) * (file1 - file2);
  }

  getSliderSquareOnDirection(dir: number, startSq: number, color: Color): number {
    const isDiagonal = ChessGame.isDiagonal(dir);
    let sq = startSq + dir;
    while (this.board[sq] !== SquareType.OFFBOARD) {
      const piece = this.board[sq];
      const pieceColor = ChessGame.pieceColor(piece);
      const pieceType = ChessGame.pieceType(piece);
      if (piece !== SquareType.EMPTY) {
        if (pieceColor === color
          && (pieceType === (isDiagonal ? PieceType.BISHOP : PieceType.ROOK) || pieceType === PieceType.QUEEN)) {
          return sq;
        }

        return Squares.NO_SQUARE;
      }
      sq += dir;
    }

    return Squares.NO_SQUARE;
  }

  getPinDirection(kingSq: number, pieceSq: number, color: Color): number {
    const dir = ChessGame.getDirection(kingSq, pieceSq);

    let sq = kingSq + dir;

    while(sq !== pieceSq) {
      if (this.board[sq] !== SquareType.EMPTY) {
        return 0;
      }
      sq += dir;
    }

    return this.getSliderSquareOnDirection(dir, pieceSq, color) === Squares.NO_SQUARE ? 0 : dir;
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

    this.isInCheck = this.isCheck();
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
          this.checkingPieceSquare = square - PAWN_CAPTURING[sideColor][i];
          return true;
        }
      }
    }

    if (pieceCount[knight] !== 0) {
      for (let i = 0; i < KNIGHT_MOVES.length; i++) {
        if (this.board[square + KNIGHT_MOVES[i]] === knight) {
          this.checkingPieceSquare = square + KNIGHT_MOVES[i];
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
              this.checkingPieceSquare = sq;
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
              this.checkingPieceSquare = sq;
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

  isSquareAttackedByPiece(square: number, piece: number): boolean {
    const color = this.turn;
    const sideColor = color === undefined ? this.turn ^ 1 : color;

    switch(ChessGame.pieceType(piece)) {
      case PieceType.PAWN:
        for (let i = 0; i < PAWN_CAPTURING[sideColor].length; i++) {
          if (this.board[square - PAWN_CAPTURING[sideColor][i]] === piece) {
            return true;
          }
        }
        break;
      case PieceType.KNIGHT:
        for (let i = 0; i < KNIGHT_MOVES.length; i++) {
          if (this.board[square + KNIGHT_MOVES[i]] === piece) {
            return true;
          }
        }
        break;
      case PieceType.BISHOP:
        for (let i = 0; i < BISHOP_MOVES.length; i++) {
          let sq = square + BISHOP_MOVES[i];
          while (this.board[sq] !== SquareType.OFFBOARD) {
            if (this.board[sq] !== SquareType.EMPTY) {
              if (this.board[sq] === piece) {
                return true;
              } else {
                break;
              }
            }
            sq += BISHOP_MOVES[i];
          }
        }
        break;
      case PieceType.ROOK:
        for (let i = 0; i < ROOK_MOVES.length; i++) {
          let sq = square + ROOK_MOVES[i];
          while (this.board[sq] !== SquareType.OFFBOARD) {
            if (this.board[sq] !== SquareType.EMPTY) {
              if (this.board[sq] === piece) {
                return true;
              } else {
                break;
              }
            }
            sq += ROOK_MOVES[i];
          }
        }
        break;
      case PieceType.QUEEN:
        for (let i = 0; i < QUEEN_MOVES.length; i++) {
          let sq = square + ROOK_MOVES[i];
          while (this.board[sq] !== SquareType.OFFBOARD) {
            if (this.board[sq] !== SquareType.EMPTY) {
              if (this.board[sq] === piece) {
                return true;
              } else {
                break;
              }
            }
            sq += QUEEN_MOVES[i];
          }
        }
        break;
      case PieceType.KING:
        for (let i = 0; i < KING_MOVES.length; i++) {
          if (this.board[square + KING_MOVES[i]] === piece) {
            return true;
          }
        }
        break;
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
    const movedPiece = this.board[from];
    const movedPieceType = ChessGame.pieceType(movedPiece);
    const color = this.turn;
    const opColor = color ^ 1;
    const captured = (moveType === MoveType.ENPASSANT) ? ChessGame.createPiece(opColor, PieceType.PAWN) : this.board[to];
    const capturedSquare = (moveType === MoveType.ENPASSANT) ? to + PAWN_MOVES[opColor].normal : to;
    const opKing  = opColor === Color.WHITE ? Piece.wK : Piece.bK;
    const opKingSquare = this.pieceList[opKing][0];
    let checkingPieceSquare = to;
    let checkingPiece = movedPiece;

    this.capturedPiece = captured;

    this.history.push({
      prevMove: move,
      prevHalfMoves: this.halfMoves,
      prevEpSquare: this.epSquare,
      prevCastlingPermission: this.castlingPermission,
      prevPositionKey: this.positionKey,
      prevMovedPiece: this.movedPiece,
      prevCapturedPiece: this.capturedPiece,
      prevIsInCheck: this.isInCheck,
      prevIsInDoubleCheck: this.isInDoubleCheck,
      prevCheckingPieceSquare: this.checkingPieceSquare
    });

    this.isInCheck = false;
    this.isInDoubleCheck = false;
    this.checkingPieceSquare = Squares.NO_SQUARE;

    if (this.epSquare !== Squares.NO_SQUARE) {
      this.positionKey ^= this.zobrist.epKeys[ChessGame.file(this.epSquare)];
      this.epSquare = Squares.NO_SQUARE;
    }

    this.halfMoves++;
    this.movedPiece = movedPiece;

    this.positionKey ^= this.zobrist.pieceKeys[movedPiece][sq64(from)] ^ this.zobrist.pieceKeys[movedPiece][sq64(to)];

    if (captured !== SquareType.EMPTY) {
      this.removePiece(captured, capturedSquare);
      this.halfMoves = 0;
      this.positionKey ^= this.zobrist.pieceKeys[captured][sq64(capturedSquare)];
    }

    if (moveType === MoveType.PROMOTION) {
      const promotionPiece = ChessGame.createPiece(color, promotion + PieceType.KNIGHT);
      checkingPiece = promotionPiece;
      this.removePiece(movedPiece, from);
      this.putPiece(promotionPiece, to);
      this.board[from] = SquareType.EMPTY;
      this.positionKey ^= this.zobrist.pieceKeys[movedPiece][sq64(to)] ^ this.zobrist.pieceKeys[promotionPiece][sq64(to)];
    } else if (moveType === MoveType.CASTLING) {
      const [rookFrom, rookTo] = this.doCastling(color, from, to);
      const rook = ChessGame.createPiece(color, PieceType.ROOK);
      checkingPiece = rook;
      checkingPieceSquare = rookTo;
      this.positionKey ^= this.zobrist.pieceKeys[rook][sq64(rookFrom)] ^ this.zobrist.pieceKeys[rook][sq64(rookTo)];
    } else if (moveType === MoveType.ENPASSANT) {
      this.movePiece(movedPiece, from, to);
      this.board[capturedSquare] = SquareType.EMPTY;
      this.positionKey ^= this.zobrist.pieceKeys[captured][sq64(capturedSquare)];
    } else {
      if (
        Math.abs(from - to) === Math.abs(PAWN_MOVES[color].advanced)
        && ((movedPiece === Piece.wP && (this.board[to - 1] === Piece.bP || this.board[to + 1] === Piece.bP))
        || (movedPiece === Piece.bP && (this.board[to - 1] === Piece.wP || this.board[to + 1] === Piece.wP)))
      ) {
        this.epSquare = from + PAWN_MOVES[color].normal;
        this.positionKey ^= this.zobrist.epKeys[ChessGame.file(this.epSquare)];
      }

      this.movePiece(movedPiece, from, to);
    }

    if (movedPieceType === PieceType.PAWN) {
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

    const checkingPieceType = ChessGame.pieceType(checkingPiece);

    if (checkingPieceType === PieceType.KNIGHT) {
      this.isInCheck = KNIGHT_MOVES.includes(opKingSquare - checkingPieceSquare);
    } else if (checkingPieceType === PieceType.PAWN) {
      this.isInCheck = PAWN_CAPTURING[color].includes(opKingSquare - checkingPieceSquare);
    } else if (checkingPieceType !== PieceType.KING) {
      const dir = ChessGame.getDirection(opKingSquare, checkingPieceSquare);
      this.isInCheck = this.getSliderSquareOnDirection(dir, opKingSquare, color) !== Squares.NO_SQUARE;
    }

    if (this.isInCheck) {
      this.checkingPieceSquare = checkingPieceSquare;
    } else if (moveType === MoveType.ENPASSANT) {
      const dir = ChessGame.getDirection(opKingSquare, capturedSquare);

      if (ChessGame.isDiagonal(dir)) {
        this.checkingPieceSquare = this.getSliderSquareOnDirection(dir, opKingSquare, color);
        this.isInCheck = this.checkingPieceSquare !== Squares.NO_SQUARE;
      }
    }

    if (moveType !== MoveType.CASTLING && checkingPieceType !== PieceType.QUEEN) {
      const dir = ChessGame.getDirection(opKingSquare, from);
      const isDiagonal = ChessGame.isDiagonal(dir);
      const isOrthogonal = ChessGame.isOrthogonal(dir);

      if (
        (checkingPieceType !== PieceType.BISHOP && isDiagonal && !ChessGame.isThreeSquaresOnLine(from, to, opKingSquare))
        || (checkingPieceType !== PieceType.ROOK && isOrthogonal)
      ) {
        const checkingPieceSquare = this.getSliderSquareOnDirection(dir, opKingSquare, color);
        const isDiscoveredCheck = checkingPieceSquare !== Squares.NO_SQUARE;

        if (this.isInCheck) {
          this.isInDoubleCheck = isDiscoveredCheck;
        } else {
          this.isInCheck = isDiscoveredCheck;
          this.checkingPieceSquare = checkingPieceSquare;
        }
      }
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
      prevCapturedPiece,
      prevIsInCheck,
      prevIsInDoubleCheck,
      prevCheckingPieceSquare
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
    this.isInCheck = prevIsInCheck;
    this.isInDoubleCheck = prevIsInDoubleCheck;
    this.checkingPieceSquare = prevCheckingPieceSquare;

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
    const opColor = color ^ 1;
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
    const kingSquare = this.pieceList[king][0];
    const range = isWTurn ? [Piece.wP, Piece.wK] : [Piece.bP, Piece.bK];

    for (let p = range[0]; p <= range[1]; p++) {
      if (this.isInDoubleCheck && p !== king) {
        continue;
      }

      for (let i = 0, squares = this.pieceList[p]; i < squares.length; i++) {
        const from = squares[i];

        if (from === Squares.NO_SQUARE) {
          break;
        }

        const pinDirection = this.getPinDirection(kingSquare, from, opColor);

        if (pinDirection && this.isInCheck) {
          continue;
        }

        switch (p) {
          case pawn:
            const pawnRank = ChessGame.rank(from);
            for (let i = 0; i < pawnCapturing.length; i++) {
              const dir = pawnCapturing[i];
              const to = from + dir;

              if (this.isEnemyPiece(this.board[to])) {
                if (
                  (pinDirection && Math.abs(pinDirection) !== Math.abs(dir))
                  || (this.isInCheck && to !== this.checkingPieceSquare)
                ) {
                  continue;
                }

                if (pawnRank === prePromotionRank) {
                  moves.push(ChessGame.createPromotionMove(from, to, Promotion.q));
                  moves.push(ChessGame.createPromotionMove(from, to, Promotion.n));
                  moves.push(ChessGame.createPromotionMove(from, to, Promotion.r));
                  moves.push(ChessGame.createPromotionMove(from, to, Promotion.b));
                } else {
                  moves.push(ChessGame.createMove(from, to));
                }
              }
              if (this.epSquare === to) {
                moves.push(ChessGame.createEnpassantMove(from, to));
              }
            }

            if (this.board[from + pawnMove] === SquareType.EMPTY) {
              if (pinDirection && !ChessGame.isVertical(pinDirection)) {
                continue;
              }

              if (pawnRank === prePromotionRank) {
                const to = from + pawnMove;

                if (!this.isInCheck || ChessGame.isSquareBetween(kingSquare, this.checkingPieceSquare, to)) {
                  moves.push(ChessGame.createPromotionMove(from, to, Promotion.q));
                  moves.push(ChessGame.createPromotionMove(from, to, Promotion.n));
                  moves.push(ChessGame.createPromotionMove(from, to, Promotion.r));
                  moves.push(ChessGame.createPromotionMove(from, to, Promotion.b));
                }
              } else {
                const to = from + pawnMove;

                if (!this.isInCheck || ChessGame.isSquareBetween(kingSquare, this.checkingPieceSquare, to)) {
                  moves.push(ChessGame.createMove(from, to));
                }
              }
              if (pawnRank === longMoveRank && this.board[from + pawnMoveAdvanced] === SquareType.EMPTY) {
                const to = from + pawnMoveAdvanced;

                if (!this.isInCheck || ChessGame.isSquareBetween(kingSquare, this.checkingPieceSquare, to)) {
                  moves.push(ChessGame.createMove(from, to));
                }
              }
            }
            break;
          case knight:
            if (pinDirection) {
              continue;
            }

            for (let i = 0; i < KNIGHT_MOVES.length; i++) {
              const to = from + KNIGHT_MOVES[i];

              if (
                this.isInCheck
                && !ChessGame.isSquareBetween(kingSquare, this.checkingPieceSquare, to)
                && to !== this.checkingPieceSquare
              ) {
                continue;
              }

              if (this.board[to] === SquareType.EMPTY || this.isEnemyPiece(this.board[to])) {
                moves.push(ChessGame.createMove(from, to));
              }
            }
            break;
          case bishop:
            if (pinDirection && ChessGame.isOrthogonal(pinDirection)) {
              continue;
            }

            for (let i = 0; i < BISHOP_MOVES.length; i++) {
              const dir = BISHOP_MOVES[i];

              if (pinDirection && Math.abs(pinDirection) !== Math.abs(dir)) {
                continue;
              }

              let to = from + dir;
              while (this.board[to] !== SquareType.OFFBOARD) {
                if (this.board[to] === SquareType.EMPTY || this.isEnemyPiece(this.board[to])) {
                  if (
                    !this.isInCheck
                    || ChessGame.isSquareBetween(kingSquare, this.checkingPieceSquare, to)
                    || to === this.checkingPieceSquare
                  ) {
                    moves.push(ChessGame.createMove(from, to));
                  }
                }

                if (this.board[to] !== SquareType.EMPTY) {
                  break;
                }
                to += dir;
              }
            }
            break;
          case rook:
            if (pinDirection && ChessGame.isDiagonal(pinDirection)) {
              continue;
            }

            for (let i = 0; i < ROOK_MOVES.length; i++) {
              const dir = ROOK_MOVES[i];

              if (pinDirection && Math.abs(pinDirection) !== Math.abs(dir)) {
                continue;
              }

              let to = from + dir;
              while (this.board[to] !== SquareType.OFFBOARD) {
                if (this.board[to] === SquareType.EMPTY || this.isEnemyPiece(this.board[to])) {
                  if (
                    !this.isInCheck
                    || ChessGame.isSquareBetween(kingSquare, this.checkingPieceSquare, to)
                    || to === this.checkingPieceSquare
                  ) {
                    moves.push(ChessGame.createMove(from, to));
                  }
                }

                if (this.board[to] !== SquareType.EMPTY) {
                  break;
                }
                to += dir;
              }
            }
            break;
          case queen:
            for (let i = 0; i < QUEEN_MOVES.length; i++) {
              const dir = QUEEN_MOVES[i];

              if (pinDirection && Math.abs(pinDirection) !== Math.abs(dir)) {
                continue;
              }

              let to = from + dir;
              while (this.board[to] !== SquareType.OFFBOARD) {
                if (this.board[to] === SquareType.EMPTY || this.isEnemyPiece(this.board[to])) {
                  if (
                    !this.isInCheck
                    || ChessGame.isSquareBetween(kingSquare, this.checkingPieceSquare, to)
                    || to === this.checkingPieceSquare
                  ) {
                    moves.push(ChessGame.createMove(from, to));
                  }
                }

                if (this.board[to] !== SquareType.EMPTY) {
                  break;
                }
                to += dir;
              }
            }
            break;
          case king:
            for (let i = 0; i < KING_MOVES.length; i++) {
              let to = from + KING_MOVES[i];
              if (this.board[to] === SquareType.EMPTY || this.isEnemyPiece(this.board[to])) {
                moves.push(ChessGame.createMove(from, to));
              }
            }

            if (!this.isInCheck) {
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
    const moveType = move >> 14;

    if (moveType !== MoveType.ENPASSANT && !isKing) {
      return true;
    }

    if (moveType === MoveType.ENPASSANT) {
      this.board[to - PAWN_MOVES[color].normal] = SquareType.EMPTY;
      this.board[from] = SquareType.EMPTY;
      this.board[to] = prevFromPiece;
    }

    if (isKing) {
      if (prevToPiece !== SquareType.EMPTY) {
        this.removePiece(prevToPiece, to);
      }

      this.movePiece(prevFromPiece, from, to);
    }

    const isCheck = this.isCheck();

    if (moveType === MoveType.ENPASSANT) {
      this.board[to - PAWN_MOVES[color].normal] = ChessGame.createPiece(color ^ 1, PieceType.PAWN);
      this.board[from] = prevFromPiece;
      this.board[to] = prevToPiece;
    }

    if (isKing) {
      this.movePiece(prevFromPiece, to, from);

      if (prevToPiece !== SquareType.EMPTY) {
        this.putPiece(prevToPiece, to);
      }
    }

    return !isCheck;
  }
}

export default ChessGame;