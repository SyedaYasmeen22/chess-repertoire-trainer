import React from 'react';
import { Chess } from 'chess.js';
import { ChessMove } from '@/lib/chess-utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface MoveListProps {
  moves: ChessMove[];
  currentMoveIndex?: number;
  onMoveClick?: (index: number) => void;
  onClear?: () => void;
  title?: string;
}

export const MoveList: React.FC<MoveListProps> = ({
  moves,
  currentMoveIndex = -1,
  onMoveClick,
  onClear,
  title = 'Moves',
}) => {
  // Convert moves to algebraic notation
  const getMoveNotation = (moveIndex: number): string => {
    const chess = new Chess();
    let notation = '';

    for (let i = 0; i <= moveIndex; i++) {
      const move = chess.move(moves[i], { sloppy: true });
      if (!move) break;
      notation = move.san;
    }

    return notation;
  };

  const moveGroups: string[][] = [];
  for (let i = 0; i < moves.length; i += 2) {
    const white = getMoveNotation(i);
    const black = i + 1 < moves.length ? getMoveNotation(i + 1) : '';
    moveGroups.push([white, black]);
  }

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex items-center justify-between">
        <h3 className="text-heading text-primary">{title}</h3>
        {onClear && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="h-7 w-7 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1 pr-4">
        <div className="space-y-1">
          {moveGroups.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No moves yet</p>
          ) : (
            moveGroups.map((group, groupIdx) => (
              <div key={groupIdx} className="flex gap-2 text-sm font-mono">
                <span className="w-8 text-muted-foreground flex-shrink-0">
                  {groupIdx + 1}.
                </span>
                <button
                  onClick={() => onMoveClick?.(groupIdx * 2)}
                  className={`
                    px-2 py-1 rounded transition-colors text-left flex-1
                    ${currentMoveIndex === groupIdx * 2
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                    }
                  `}
                >
                  {group[0]}
                </button>
                {group[1] && (
                  <button
                    onClick={() => onMoveClick?.(groupIdx * 2 + 1)}
                    className={`
                      px-2 py-1 rounded transition-colors text-left flex-1
                      ${currentMoveIndex === groupIdx * 2 + 1
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                      }
                    `}
                  >
                    {group[1]}
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default MoveList;
