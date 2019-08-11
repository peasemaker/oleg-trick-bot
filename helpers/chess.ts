const BOARD_SIZE = 120;

const DEFAULT_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

enum Side {
    WHITE = 'w',
    BLACK = 'b'
}

enum Pieces {
    wP = 0,
    wN = 1,
    wB = 2,
    wR = 3,
    wQ = 4,
    wK = 5,
    bP = 6,
    bN = 7,
    bB = 8,
    bR = 9,
    bQ = 10,
    bK = 11
}

const piecesNotation = 'PNBRQKpnbrqk';
const ranks = '12345678';
const files = 'abcdefgh';

enum Squares {
    EMPTY = -1,
    NOSQUARE = 99,
    OFFBOARD = 100
}

enum Castling {
    WK = 1,
    WQ = 2,
    BK = 4,
    BQ = 8
}

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

        this.turn = Side.WHITE === tokens[1] ? Side.WHITE : Side.BLACK;
        
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
        
        this.epSquare = tokens[3] === '-' ? Squares.EMPTY : ChessGame.literalToSquare(tokens[3]);
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
}