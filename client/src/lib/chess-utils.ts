import { Chess } from 'chess.js';

export interface ChessMove {
  from: string;
  to: string;
  promotion?: string;
}

export interface Repertoire {
  id: string;
  name: string;
  folderId: string;
  moves: ChessMove[];
  pgn?: string;
  createdAt: number;
  updatedAt: number;
  stats: {
    attempts: number;
    successes: number;
    lastAttempt?: number;
    difficulty: 'easy' | 'medium' | 'hard';
  };
}

export interface RepertoireFolder {
  id: string;
  name: string;
  parentId?: string;
  createdAt: number;
}

export interface TrainingSession {
  repertoireId: string;
  currentMoveIndex: number;
  mistakes: number;
  startTime: number;
  completed: boolean;
}

/**
 * Convert moves array to PGN string
 */
export function movesToPgn(moves: ChessMove[]): string {
  const chess = new Chess();
  let pgn = '';
  let moveNumber = 1;

  for (const move of moves) {
    const chessMove = chess.move(move, { sloppy: true });
    if (!chessMove) break;

    if (chessMove.color === 'w') {
      if (pgn) pgn += ' ';
      pgn += `${moveNumber}.`;
    }
    pgn += ` ${chessMove.san}`;
    moveNumber += chessMove.color === 'b' ? 1 : 0;
  }

  return pgn.trim();
}

/**
 * Parse PGN string to moves array
 */
export function pgnToMoves(pgn: string): ChessMove[] {
  const chess = new Chess();
  const moves: ChessMove[] = [];

  // Simple PGN parsing - extract moves in algebraic notation
  const movePattern = /\b[KQRBN]?[a-h]?[1-8]?x?[a-h][1-8](?:=[QRBN])?[+#]?/g;
  const matches = pgn.match(movePattern) || [];

  for (const moveStr of moves) {
    try {
      const chessMove = chess.move(moveStr as any, { strict: false } as any);
      if (chessMove) {
        moves.push({
          from: (chessMove as any).from,
          to: (chessMove as any).to,
          promotion: (chessMove as any).promotion,
        });
      }
    } catch (e) {
      // Skip invalid moves
    }
  }

  return moves;
}

/**
 * Get opening name from moves
 */
export function detectOpeningName(moves: ChessMove[]): string {
  // This is a simplified version - in production, you'd use an opening database
  const chess = new Chess();
  let moveCount = 0;

  for (const move of moves) {
    const chessMove = chess.move(move, { sloppy: true });
    if (!chessMove) break;
    moveCount++;
  }

  // Common opening patterns
  if (moveCount >= 2) {
    const fen = chess.fen();
    if (fen.includes('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR')) {
      return 'King\'s Pawn Opening';
    }
    if (fen.includes('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR')) {
      return 'Starting Position';
    }
  }

  return 'Custom Opening';
}

/**
 * Validate a move sequence
 */
export function validateMoveSequence(moves: ChessMove[]): boolean {
  const chess = new Chess();

  for (const move of moves) {
    try {
      const chessMove = chess.move(move as any, { strict: false } as any);
      if (!chessMove) return false;
    } catch (e) {
      return false;
    }
  }

  return true;
}

/**
 * Get legal moves from current position
 */
export function getLegalMoves(fen: string): ChessMove[] {
  const chess = new Chess(fen);
  const moves = chess.moves({ verbose: true } as any);

  return moves.map(move => ({
    from: move.from,
    to: move.to,
    promotion: move.promotion,
  }));
}

/**
 * Calculate spaced repetition interval
 */
export function calculateNextReviewInterval(
  stats: Repertoire['stats'],
  correct: boolean
): number {
  if (!correct) {
    // Reset to easy if wrong
    return 1;
  }

  const successRate = stats.successes / Math.max(stats.attempts, 1);

  if (successRate < 0.5) {
    return 1; // 1 day
  } else if (successRate < 0.8) {
    return 3; // 3 days
  } else {
    return 7; // 7 days
  }
}

/**
 * Sort repertoires by spaced repetition priority
 */
export function sortBySpacedRepetition(
  repertoires: Repertoire[],
  now: number
): Repertoire[] {
  return [...repertoires].sort((a, b) => {
    const lastA = a.stats.lastAttempt || 0;
    const lastB = b.stats.lastAttempt || 0;

    const intervalA = calculateNextReviewInterval(a.stats, true);
    const intervalB = calculateNextReviewInterval(b.stats, true);

    const dueA = lastA + intervalA * 24 * 60 * 60 * 1000;
    const dueB = lastB + intervalB * 24 * 60 * 60 * 1000;

    return dueA - dueB;
  });
}
