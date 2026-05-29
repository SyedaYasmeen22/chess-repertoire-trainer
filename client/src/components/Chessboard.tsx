import React, { useState, useEffect, useCallback } from 'react';
import { Chess } from 'chess.js';
import { ChessMove } from '@/lib/chess-utils';

interface ChessboardProps {
  fen?: string;
  onMove?: (move: ChessMove) => void;
  disabled?: boolean;
  flipped?: boolean;
  highlightSquares?: string[];
}

interface Piece {
  type: string;
  color: string;
}

type Board = (Piece | null)[][];

const PIECE_UNICODE: Record<string, string> = {
  'wK': '♔', 'wQ': '♕', 'wR': '♖', 'wB': '♗', 'wN': '♘', 'wP': '♙',
  'bK': '♚', 'bQ': '♛', 'bR': '♜', 'bB': '♝', 'bN': '♞', 'bP': '♟',
};

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

export const Chessboard: React.FC<ChessboardProps> = ({
  fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  onMove,
  disabled = false,
  flipped = false,
  highlightSquares = [],
}) => {
  const [chess] = useState(() => new Chess(fen));
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalMoves, setLegalMoves] = useState<string[]>([]);
  const [animatingPiece, setAnimatingPiece] = useState<{
    from: string;
    to: string;
    piece: string;
  } | null>(null);

  // Get board state from FEN
  const getBoard = useCallback((): Board => {
    const board: Board = [];
    const fenParts = chess.fen().split(' ')[0];
    const rows = fenParts.split('/');

    for (const row of rows) {
      const boardRow: (Piece | null)[] = [];

      for (const char of row) {
        if (isNaN(Number(char))) {
          const color = char === char.toUpperCase() ? 'w' : 'b';
          boardRow.push({
            type: char.toUpperCase(),
            color,
          });
        } else {
          for (let i = 0; i < Number(char); i++) {
            boardRow.push(null);
          }
        }
      }

      board.push(boardRow);
    }

    return board;
  }, [chess]);

  const board = getBoard();

  const handleSquareClick = useCallback((file: number, rank: number) => {
    if (disabled) return;

    const square = FILES[file] + RANKS[rank];

    if (selectedSquare) {
      // Try to make move
      try {
        const move = chess.move({
          from: selectedSquare,
          to: square,
        });

        if (move) {
          // Animate piece movement
          setAnimatingPiece({
            from: selectedSquare,
            to: square,
            piece: move.piece,
          });

          // Clear animation after it completes
          setTimeout(() => {
            setAnimatingPiece(null);
            setSelectedSquare(null);
            setLegalMoves([]);
            onMove?.(move);
          }, 300);
        } else {
          // Invalid move, select new piece
          const piece = board[rank][file];
          if (piece) {
            setSelectedSquare(square);
            const moves = chess.moves({ square, verbose: true });
            setLegalMoves(moves.map(m => m.to));
          } else {
            setSelectedSquare(null);
            setLegalMoves([]);
          }
        }
      } catch (e) {
        setSelectedSquare(null);
        setLegalMoves([]);
      }
    } else {
      // Select piece
      const piece = board[rank][file];
      if (piece) {
        setSelectedSquare(square);
        const moves = chess.moves({ square, verbose: true });
        setLegalMoves(moves.map(m => m.to));
      }
    }
  }, [selectedSquare, board, chess, disabled, onMove]);

  const isSquareHighlighted = (file: number, rank: number): boolean => {
    const square = FILES[file] + RANKS[rank];
    return highlightSquares.includes(square);
  };

  const isSquareSelected = (file: number, rank: number): boolean => {
    const square = FILES[file] + RANKS[rank];
    return square === selectedSquare;
  };

  const isLegalMove = (file: number, rank: number): boolean => {
    const square = FILES[file] + RANKS[rank];
    return legalMoves.includes(square);
  };

  const getPieceStyle = (file: number, rank: number) => {
    if (animatingPiece?.from === FILES[file] + RANKS[rank]) {
      return { opacity: 0 };
    }
    if (animatingPiece?.to === FILES[file] + RANKS[rank]) {
      return { opacity: 1 };
    }
    return {};
  };

  const displayRanks = flipped ? [...RANKS].reverse() : RANKS;
  const displayFiles = flipped ? [...FILES].reverse() : FILES;

  return (
    <div className="flex flex-col gap-4">
      {/* Rank labels */}
      <div className="flex gap-0">
        <div className="w-8" />
        {displayFiles.map((file) => (
          <div key={file} className="w-12 h-12 flex items-center justify-center text-sm font-medium text-muted-foreground">
            {file}
          </div>
        ))}
      </div>

      {/* Board */}
      <div className="flex gap-0">
        {/* File labels */}
        <div className="flex flex-col gap-0">
          {displayRanks.map((rank) => (
            <div key={rank} className="w-8 h-12 flex items-center justify-center text-sm font-medium text-muted-foreground">
              {rank}
            </div>
          ))}
        </div>

        {/* Squares */}
        <div className="inline-block border-2 border-primary rounded-lg overflow-hidden shadow-lg">
          {displayRanks.map((rank, rankIdx) => (
            <div key={rank} className="flex gap-0">
              {displayFiles.map((file, fileIdx) => {
                const actualRank = flipped ? 7 - rankIdx : rankIdx;
                const actualFile = flipped ? 7 - fileIdx : fileIdx;
                const piece = board[actualRank][actualFile];
                const isLight = (actualFile + actualRank) % 2 === 0;
                const isSelected = isSquareSelected(actualFile, actualRank);
                const isHighlighted = isSquareHighlighted(actualFile, actualRank);
                const isLegal = isLegalMove(actualFile, actualRank);

                return (
                  <button
                    key={`${file}${rank}`}
                    onClick={() => handleSquareClick(actualFile, actualRank)}
                    className={`
                      w-12 h-12 flex items-center justify-center text-3xl font-bold
                      transition-all duration-200 ease-out cursor-pointer relative
                      ${isLight ? 'bg-amber-100' : 'bg-amber-700'}
                      ${isSelected ? 'ring-4 ring-primary shadow-inner' : ''}
                      ${isHighlighted ? 'ring-4 ring-secondary' : ''}
                      ${isLegal ? 'ring-2 ring-primary ring-inset' : ''}
                      hover:opacity-80
                    `}
                    disabled={disabled}
                  >
                    {piece && (
                      <span style={getPieceStyle(actualFile, actualRank)}>
                        {PIECE_UNICODE[piece.color + piece.type]}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Chessboard;
