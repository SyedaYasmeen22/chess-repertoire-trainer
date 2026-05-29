import React, { useState, useCallback } from 'react';
import { Chess } from 'chess.js';
import { ChessMove, movesToPgn } from '@/lib/chess-utils';
import Chessboard from './Chessboard';
import MoveList from './MoveList';
import OpeningInfo from './OpeningInfo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { RotateCcw, Save, RotateCw } from 'lucide-react';
import { playMove } from '@/lib/sounds';

interface RecordingModeProps {
  onSave?: (name: string, moves: ChessMove[]) => void;
  onCancel?: () => void;
}

export const RecordingMode: React.FC<RecordingModeProps> = ({
  onSave,
  onCancel,
}) => {
  const [moves, setMoves] = useState<ChessMove[]>([]);
  const [chess] = useState(() => new Chess());
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [repertoireName, setRepertoireName] = useState('');
  const [flipped, setFlipped] = useState(false);

  const handleMove = useCallback((move: ChessMove) => {
    playMove();
    setMoves(prev => [...prev, move]);
  }, []);

  const handleFlip = useCallback(() => {
    playMove();
    setFlipped(!flipped);
  }, [flipped]);

  const handleUndo = useCallback(() => {
    if (moves.length > 0) {
      playMove();
      setMoves(prev => prev.slice(0, -1));
      chess.undo();
    }
  }, [moves, chess]);

  const handleReset = useCallback(() => {
    if (moves.length > 0) {
      playMove();
    }
    setMoves([]);
    chess.reset();
  }, [moves, chess]);

  const handleSave = useCallback(() => {
    if (repertoireName.trim() && moves.length > 0) {
      playMove();
      onSave?.(repertoireName, moves);
      setShowSaveDialog(false);
      setRepertoireName('');
      handleReset();
    }
  }, [repertoireName, moves, onSave, handleReset]);

  // Reconstruct FEN from moves
  const getCurrentFen = (): string => {
    const tempChess = new Chess();
    for (const move of moves) {
      tempChess.move(move, { sloppy: true });
    }
    return tempChess.fen();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chessboard */}
        <div className="lg:col-span-2">
          <div className="card-organic p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-heading text-primary">Recording Mode</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={handleFlip}
              >
                <RotateCw className="h-4 w-4 mr-2" />
                Flip
              </Button>
            </div>
            <Chessboard
              fen={getCurrentFen()}
              onMove={handleMove}
              flipped={flipped}
            />
          </div>
        </div>

        {/* Move List and Controls */}
        <div className="flex flex-col gap-4">
          <OpeningInfo moves={moves} />
          
          <div className="card-organic p-4 flex-1">
            <MoveList
              moves={moves}
              title="Recorded Moves"
              onClear={handleReset}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              onClick={handleUndo}
              disabled={moves.length === 0}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Undo
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={moves.length === 0}
            >
              Reset Board
            </Button>
            <Button
              onClick={() => setShowSaveDialog(true)}
              disabled={moves.length === 0}
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Repertoire
            </Button>
            <Button
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
          </div>

          {/* Stats */}
          <div className="card-organic p-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Moves:</span>
                <span className="font-semibold">{moves.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Move Pairs:</span>
                <span className="font-semibold">{Math.ceil(moves.length / 2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">PGN:</span>
              </div>
              <p className="text-xs font-mono bg-muted p-2 rounded break-all">
                {movesToPgn(moves) || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Repertoire</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Repertoire Name
              </label>
              <Input
                placeholder="e.g., Sicilian Defense - Main Line"
                value={repertoireName}
                onChange={(e) => setRepertoireName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Moves: {moves.length}</p>
              <p>PGN: {movesToPgn(moves)}</p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSaveDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!repertoireName.trim()}
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RecordingMode;
