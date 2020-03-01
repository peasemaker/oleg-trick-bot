import ChessGame from '../chess/ChessGame';
import {g, m} from '../helpers';
import {
  Color,
  PIECE_NUMBER, PIECE_VALUES,
  PiecesByColor,
  pieceSquareValues,
  PieceType,
  sq120,
  sq64,
  Squares, SquareType
} from '../constants/chessGameConstants';

const CHECKMATE_SCORE = 1e6;
const DRAW_SCORE = 0;
const ENDGAME_THRESHOLD = 1400;

export default class MinimaxBot extends ChessGame {
  depth: number;
  nodesCount: number;
  positionScoreTable: Map<bigint, number>;
  firstCutNodesCount: number;
  cutNodesCount: number;
  performances: number[];
  maxPerformance: number;

  constructor() {
    super();

    this.depth = 5;
    this.nodesCount = 0;
    this.positionScoreTable = new Map();
    this.firstCutNodesCount = 0;
    this.cutNodesCount = 0;
    this.performances = [];
    this.maxPerformance = -Infinity;
  }

  private printScore(score: number): string {
    return Math.abs(score) >= CHECKMATE_SCORE ? `#${score < 0 ? '-' : ''}${Math.floor((CHECKMATE_SCORE - Math.abs(score) + this.depth ) / 2) + 1}` : score.toString();
  }

  getNextMove(): number {
    this.nodesCount = 0;
    const start = process.hrtime.bigint();

    const legalMoves = this.sortMoves(this.getLegalMoves());

    if (legalMoves.length === 0) {
      return 0;
    }

    const movesWithScore: [number, number][] = [];
    let pickedMove, bestMoves;
    let alpha = -Infinity;

    console.log(legalMoves.map(m => ChessGame.numericToUci(m)).join('; '));

    // if (legalMoves.length !== 0) {
    //   throw new Error();
    // }

    if (legalMoves.length > 1) {
      for (let i = 0; i < legalMoves.length; i++) {
        const move = legalMoves[i];
        this.makeMove(move);
        const moveScore = -this.minimax(this.depth, -Infinity, -alpha + 0.05);
        movesWithScore.push([move, moveScore]);
        this.revertMove();
        if (moveScore > alpha) {
          alpha = moveScore;
        }
      }

      movesWithScore.sort((a, b) => b[1] - a[1]);
      const bestMove = movesWithScore[0];
      bestMoves = [bestMove];

      for (let i = 1; i < movesWithScore.length; i++) {
        if (bestMove[1] === movesWithScore[i][1]) {
          bestMoves.push(movesWithScore[i]);
        }
      }

      pickedMove = bestMoves[Math.floor(Math.random() * bestMoves.length)];
    } else {
      bestMoves = [[legalMoves[0], 0]];
      pickedMove = [legalMoves[0], 0];
    }

    const end = process.hrtime.bigint();
    const moveTime = Number(end - start) / 1e6;
    // console.log(`all moves: ${movesWithScore.map(move => `${m(ChessGame.numericToUci(move[0]))} (${g(this.printScore(move[1]))})`).join(' ')}`);
    console.log(`best moves: ${bestMoves.map(move => `${m(ChessGame.numericToUci(move[0]))} (${g(this.printScore(move[1]))})`).join(' ')}`);
    console.log(`picked move: ${m(ChessGame.numericToUci(pickedMove[0]))} (${g(this.printScore(pickedMove[1]))}); time: ${g(moveTime.toFixed(3))} ms`);
    console.log(`node count: ${m(this.nodesCount)}`);

    const performance = +(this.nodesCount / moveTime).toFixed(2);

    if (performance) {
      this.performances.push(performance);
    }

    this.maxPerformance = Math.max(this.maxPerformance, performance);

    console.log(`performance: ${m(performance)} kn/s`);
    console.log(`move ordering quality: ${m(Math.round(100 * this.firstCutNodesCount / this.cutNodesCount))} %`);
    console.log('');

    return pickedMove[0];
  }

  minimax(depth: number, alpha: number, beta: number): number {
    if (depth === 0) {
      this.nodesCount++;

      const cashedScore = this.positionScoreTable.get(this.positionKey);

      if (cashedScore !== undefined) {
        return cashedScore;
      }

      const positionScore = this.evalPosition();

      this.positionScoreTable.set(this.positionKey, positionScore);

      return positionScore;
    }

    const legalMoves = this.sortMoves(this.getLegalMoves());
    let bestScore = -Infinity;

    if (legalMoves.length === 0) {
      if (this.isCheck()) {
        return -CHECKMATE_SCORE - depth;
      }

      return 0;
    }

    if (this.isDraw()) {
      return 0;
    }

    for (let i = 0; i < legalMoves.length; i++) {
      const move = legalMoves[i];
      this.makeMove(move);

      const score = -this.minimax(depth - 1, -beta, -alpha);

      this.revertMove();

      if (score > bestScore) {
        bestScore = score;
      }

      if (bestScore > alpha) {
        alpha = bestScore;
      }

      if (bestScore >= beta) {
        if (i === 0) {
          this.firstCutNodesCount++;
        }

        this.cutNodesCount++;
        break;
      }
    }

    return alpha;
  }

  evalPosition() {
    const isInCheck = this.isCheck();

    if (isInCheck && !this.haveLegalMoves()) {
      return -CHECKMATE_SCORE;
    }

    if ((!isInCheck && !this.haveLegalMoves()) || this.isDraw()) {
      return DRAW_SCORE;
    }

    const isEndgame = this.materialScore[this.turn] <= ENDGAME_THRESHOLD && this.materialScore[this.turn ^ 1] <= ENDGAME_THRESHOLD;

    return this.evalMaterial(this.turn, isEndgame) - this.evalMaterial(this.turn ^ 1, isEndgame);
  }

  evalMaterial(color: Color, isEndgame: boolean): number {
    let material = this.materialScore[color];
    let pieces = PiecesByColor[color];

    for (let i = 0; i < pieces.length; i++) {
      const p = pieces[i];

      for (let j = 0, squares = this.pieceList[p]; j < squares.length; j++) {
        const sq = squares[j];

        if (sq === Squares.NO_SQUARE) {
          break;
        }

        if (ChessGame.pieceType(p) === PieceType.KING && isEndgame) {
          material += pieceSquareValues[color][sq64(sq)];
        } else {
          material += pieceSquareValues[p][sq64(sq)];
        }
      }
    }

    return material;
  }

  sortMoves(moves: number[]): number[] {
    const movesScore: Record<number, number> = {};

    for (let i = 0; i < moves.length; i++) {
      movesScore[moves[i]] = this.getMoveScore(moves[i]);
    }

    return moves.sort((move1, move2) => {
      return movesScore[move2] - movesScore[move1];
    });
  }

  getMoveScore(move: number): number {
    const from = sq120(move >> 6 & 63);
    const to = sq120(move & 63);
    const fromPiece = this.board[from];
    const toPiece = this.board[to];
    const fromPieceValue = PIECE_VALUES[ChessGame.pieceType(fromPiece)] + pieceSquareValues[fromPiece][sq64(from)];
    const toPieceValue = toPiece === SquareType.EMPTY ? fromPieceValue : PIECE_VALUES[ChessGame.pieceType(toPiece)] + pieceSquareValues[toPiece][sq64(to)];

    return toPieceValue - fromPieceValue;
  }
}