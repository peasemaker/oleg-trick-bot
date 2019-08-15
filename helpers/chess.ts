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

const piecesNotation = 'PNBRQKpnbrqk';
const ranks = '12345678';
const files = 'abcdefgh';

enum Squares {
    EMPTY = -1,
    A8 = 21, B8, C8, D8, E8, F8, G8, H8,
    A7 = 31, B7, C7, D7, E7, F7, G7, H7,
    A6 = 41, B6, C6, D6, E6, F6, G6, H6,
    A5 = 51, B5, C5, D5, E5, F5, G5, H5,
    A4 = 61, B4, C4, D4, E4, F4, G4, H4,
    A3 = 71, B3, C3, D3, E3, F3, G3, H3,
    A2 = 81, B2, C2, D2, E2, F2, G2, H2,
    A1 = 91, B1, C1, D1, E1, F1, G1, H1,
    NOSQUARE = 99,
    OFFBOARD = 100
}

enum Castling {
    WK = 1,
    WQ = 2,
    BK = 4,
    BQ = 8
}

const WS_CASTLING_UCI = 'e1g1';
const WL_CASTLING_UCI = 'e1c1';
const BS_CASTLING_UCI = 'e8g8';
const BL_CASTLING_UCI = 'e8c8';

const castlingMoves = [WS_CASTLING_UCI, WL_CASTLING_UCI, BS_CASTLING_UCI, BL_CASTLING_UCI];

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
        this.epSquare = Squares.EMPTY;
        this.castlingPermission = 0;

        this.parseFen(fen);
    }

    static initBoard(): number[] {
        const board = new Array(BOARD_SIZE);

        for (let i = 0; i < BOARD_SIZE; i++) {
            board[i] = Squares.OFFBOARD;
        }

        for (let i = 0; i < 64; i++) {
            board[sq120(i)] = Squares.EMPTY;
        }

        return board;
    }

    static literalToSquare(literal: string): number {
        return sq120(files.indexOf(literal[0]) + (7 - ranks.indexOf(literal[1])) * 8);
    }

    static squareToLiteral(square: number): string {
        if (square === Squares.EMPTY) {
            return 'empty';
        }

        const rankIndex = Math.floor(sq64(square) / 8);
        const fileIndex = sq64(square) - rankIndex * 8;

        return files[fileIndex] + ranks[7 - rankIndex];
    }

    uciToNumeric(moveUci: string): number {
        const from = ChessGame.literalToSquare(moveUci.slice(0, 2));
        const to = ChessGame.literalToSquare(moveUci.slice(2, 4));
        const promotionUci = moveUci[4];
        let promotion = 0;
        let moveType = MoveType.NORMAL;

        if (promotionUci) {
            promotion = Promotion[promotionUci];
            moveType = MoveType.PROMOTION;
        }

        if (castlingMoves.includes(moveUci) && (this.board[from] === Pieces.wK || this.board[from] === Pieces.bK)) {
            moveType = MoveType.CASTLING;
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

    parseFen(fen: string) {
        const tokens = fen.split(/\s+/);
        const position = tokens[0];
        let square = 0;

        for (let i = 0; i < position.length; i++) {
            if (/\d/.test(position[i])) {
                square += parseInt(position[i]);
            } else if (piecesNotation.includes(position[i])) {
                this.board[sq120(square)] = piecesNotation.indexOf(position[i]);
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
        
        this.epSquare = (tokens[3] === '-') ? Squares.EMPTY : ChessGame.literalToSquare(tokens[3]);
        this.halfMoves = parseInt(tokens[4]);
    }

    printBoard() {
        let print = '';

        for (let i = 0; i < 64; i++) {
            const square = this.board[sq120(i)];

            if (square === Squares.EMPTY) {
                print += '.';
            } else {
                print += piecesNotation[square];
            }

            if ((i + 1) % 8 === 0) {
                print += '\n';
            }
        }

        console.log(print);
        console.log(`turn: ${this.turn}`);
        console.log(`ep square: ${ChessGame.squareToLiteral(this.epSquare)}`);
        console.log(`half moves: ${this.halfMoves}`);
        console.log(`castling permission: ${this.castlingPermission.toString(2)}`);
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

        if (moveType === MoveType.PROMOTION) {
            let promotionPiece = 0;

            switch (promotion) {
                case Promotion.n:
                    promotionPiece = (this.turn === Side.WHITE) ? Pieces.wN : Pieces.bN;
                    break;
                case Promotion.b:
                    promotionPiece = (this.turn === Side.WHITE) ? Pieces.wB : Pieces.bB;
                    break;
                case Promotion.r:
                    promotionPiece = (this.turn === Side.WHITE) ? Pieces.wR : Pieces.bR;
                    break;
                case Promotion.q:
                    promotionPiece = (this.turn === Side.WHITE) ? Pieces.wQ : Pieces.bQ;
                    break;
            }

            this.board[to] = promotionPiece;
        } else if (moveType === MoveType.CASTLING) {
            this.board[to] = this.board[from];

            switch (moveUci) {
                case WS_CASTLING_UCI:
                    this.board[Squares.F1] = Pieces.wR;
                    this.board[Squares.H1] = Squares.EMPTY;
                    break;
                case WL_CASTLING_UCI:
                    this.board[Squares.D1] = Pieces.wR;
                    this.board[Squares.A1] = Squares.EMPTY;
                    break;
                case BS_CASTLING_UCI:
                    this.board[Squares.F8] = Pieces.bR;
                    this.board[Squares.H8] = Squares.EMPTY;
                    break;
                case BL_CASTLING_UCI:
                    this.board[Squares.D8] = Pieces.bR;
                    this.board[Squares.A8] = Squares.EMPTY;
                    break;
            }
        } else {
            this.board[to] = this.board[from];
        }

        this.board[from] = Squares.EMPTY;

        this.turn = (this.turn === Side.WHITE) ? Side.BLACK : Side.WHITE;

        // console.log(moveNum.toString(2));
        // console.log(ChessGame.squareToLiteral(to));
        // console.log(ChessGame.squareToLiteral(from));
        // console.log(promotion);
        // console.log(moveType);
        // console.log(ChessGame.numericToUci(moveNum));
    }

    getLegalMoves(): string[] {
        const moves = [];

        for (let i = 0; i < 64; i++) {
            if (this.turn === Side.WHITE) {
                if (this.board[sq120(i)] === Pieces.wP) {
                    if (this.board[sq120(i) - 9] !== Squares.OFFBOARD && this.board[sq120(i) - 9] > Pieces.wK) {
                        moves.push(ChessGame.squareToLiteral(sq120(i)) + ChessGame.squareToLiteral(sq120(i) - 9));
                    }
                    if (this.board[sq120(i) - 11] !== Squares.OFFBOARD && this.board[sq120(i) - 11] > Pieces.wK) {
                        moves.push(ChessGame.squareToLiteral(sq120(i)) + ChessGame.squareToLiteral(sq120(i) - 11));
                    }
                }
            } else {

            }
        }

        return moves;
    }
}