import React, { useMemo } from 'react';
import { ChessMove } from '@/lib/chess-utils';
import { Card } from '@/components/ui/card';
import { detectOpening, getOpeningDescription } from '@/lib/openings';
import { Chess } from 'chess.js';

interface OpeningInfoProps {
  moves: ChessMove[];
}

export const OpeningInfo: React.FC<OpeningInfoProps> = ({ moves }) => {
  const openingInfo = useMemo(() => {
    if (moves.length === 0) {
      return {
        name: 'Starting Position',
        description: 'The initial chess position',
        moveCount: 0,
      };
    }

    // Convert moves to coordinate notation
    const moveCoords = moves.map(m => m.from + m.to);
    const openingName = detectOpening(moveCoords);
    const description = getOpeningDescription(openingName);

    return {
      name: openingName,
      description,
      moveCount: moves.length,
    };
  }, [moves]);

  return (
    <Card className="card-organic p-4">
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-primary mb-1">Opening</h3>
          <p className="text-lg font-bold text-primary">{openingInfo.name}</p>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-muted-foreground mb-1">Description</h4>
          <p className="text-sm text-foreground">{openingInfo.description}</p>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total Moves:</span>
          <span className="font-semibold">{openingInfo.moveCount}</span>
        </div>
      </div>
    </Card>
  );
};

export default OpeningInfo;
