import React, { useState, useCallback, useEffect } from 'react';
import { Chess } from 'chess.js';
import { ChessMove, Repertoire } from '@/lib/chess-utils';
import Chessboard from './Chessboard';
import MoveList from './MoveList';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RotateCcw, RotateCw, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { playSuccess, playError, playMove, playCompletion } from '@/lib/sounds';
import OpeningInfo from './OpeningInfo';

interface TrainingModeProps {
  repertoire: Repertoire;
  onComplete?: (stats: { mistakes: number; time: number }) => void;
  onCancel?: () => void;
}

type TrainingState = 'waiting' | 'playing' | 'correct' | 'incorrect' | 'completed';

export const TrainingMode: React.FC<TrainingModeProps> = ({
  repertoire,
  onComplete,
  onCancel,
}) => {
  const [state, setState] = useState<TrainingState>('playing');
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [startTime] = useState(Date.now());
  const [chess] = useState(() => new Chess());
  const [flipped, setFlipped] = useState(false);
  const [highlightSquares, setHighlightSquares] = useState<string[]>([]);

  const expectedMove = repertoire.moves[currentMoveIndex];
  const isComplete = currentMoveIndex >= repertoire.moves.length;

  // Show expected move
  useEffect(() => {
    if (expectedMove && state === 'playing') {
      setHighlightSquares([expectedMove.from, expectedMove.to]);
    }
  }, [expectedMove, state]);

  const handleMove = useCallback((move: ChessMove) => {
    if (state !== 'playing' || !expectedMove) return;

    // Check if move matches expected
    if (move.from === expectedMove.from && move.to === expectedMove.to) {
      // Correct move
      playSuccess();
      setState('correct');
      setTimeout(() => {
        if (currentMoveIndex + 1 >= repertoire.moves.length) {
          playCompletion();
          setState('completed');
          const time = Date.now() - startTime;
          onComplete?.({ mistakes, time });
        } else {
          setCurrentMoveIndex(prev => prev + 1);
          setState('playing');
          setHighlightSquares([]);
        }
      }, 500);
    } else {
      // Wrong move - reject and show correct move
      playError();
      setState('incorrect');
      setMistakes(prev => prev + 1);
      
      toast.error('Wrong move! Try again.');
      
      setTimeout(() => {
        setState('playing');
      }, 1500);
    }
  }, [state, expectedMove, currentMoveIndex, repertoire.moves.length, startTime, mistakes, onComplete]);

  const handleReset = useCallback(() => {
    setCurrentMoveIndex(0);
    setMistakes(0);
    setState('playing');
    chess.reset();
    setHighlightSquares([]);
  }, [chess]);

  // Reconstruct FEN from moves
  const getCurrentFen = (): string => {
    const tempChess = new Chess();
    for (let i = 0; i < currentMoveIndex; i++) {
      tempChess.move(repertoire.moves[i], { sloppy: true });
    }
    return tempChess.fen();
  };

  const accuracy = repertoire.moves.length > 0
    ? Math.round(((repertoire.moves.length - mistakes) / repertoire.moves.length) * 100)
    : 0;

  const timeElapsed = Math.floor((Date.now() - startTime) / 1000);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chessboard */}
        <div className="lg:col-span-2">
          <div className="card-organic p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-heading text-primary">Training Mode</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFlipped(!flipped)}
              >
                <RotateCw className="h-4 w-4 mr-2" />
                Flip
              </Button>
            </div>
            <Chessboard
              fen={getCurrentFen()}
              onMove={handleMove}
              flipped={flipped}
              highlightSquares={highlightSquares}
              disabled={state !== 'playing'}
            />
            
            {/* Feedback */}
            {state === 'correct' && (
              <div className="mt-4 p-4 bg-secondary/10 text-secondary rounded-lg flex items-center gap-2">
                <Check className="h-5 w-5" />
                <span>Correct! Continue...</span>
              </div>
            )}
            {state === 'incorrect' && (
              <div className="mt-4 p-4 bg-destructive/10 text-destructive rounded-lg flex items-center gap-2">
                <X className="h-5 w-5" />
                <span>Wrong move. Try again.</span>
              </div>
            )}
            {state === 'completed' && (
              <div className="mt-4 p-4 bg-secondary/10 text-secondary rounded-lg">
                <p className="font-semibold">Repertoire Completed!</p>
                <p className="text-sm mt-1">Accuracy: {accuracy}% | Mistakes: {mistakes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Stats and Controls */}
        <div className="flex flex-col gap-4">
          {/* Opening Info */}
          <OpeningInfo moves={repertoire.moves} />

          {/* Repertoire Info */}
          <Card className="card-organic p-4">
            <h3 className="text-heading text-primary mb-3">{repertoire.name}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Progress:</span>
                <span className="font-semibold">{currentMoveIndex} / {repertoire.moves.length}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div
                  className="bg-secondary h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(currentMoveIndex / repertoire.moves.length) * 100}%`,
                  }}
                />
              </div>
            </div>
          </Card>

          {/* Stats */}
          <Card className="card-organic p-4">
            <h3 className="text-sm font-semibold text-primary mb-3">Session Stats</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Accuracy:</span>
                <span className={`font-semibold ${accuracy >= 80 ? 'text-secondary' : accuracy >= 50 ? 'text-primary' : 'text-destructive'}`}>
                  {accuracy}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mistakes:</span>
                <span className="font-semibold">{mistakes}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time:</span>
                <span className="font-semibold">{timeElapsed}s</span>
              </div>
            </div>
          </Card>

          {/* Move List */}
          <div className="card-organic p-4 flex-1">
            <MoveList
              moves={repertoire.moves}
              currentMoveIndex={currentMoveIndex - 1}
            />
          </div>

          {/* Controls */}
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={currentMoveIndex === 0 && mistakes === 0}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            {isComplete && (
              <Button
                onClick={onCancel}
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
              >
                Done
              </Button>
            )}
            <Button
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingMode;
