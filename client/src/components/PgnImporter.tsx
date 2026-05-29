import React, { useState } from 'react';
import { ChessMove } from '@/lib/chess-utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { Chess } from 'chess.js';

interface PgnImporterProps {
  onImport?: (name: string, moves: ChessMove[]) => void;
  onCancel?: () => void;
}

interface ParsedGame {
  name: string;
  moves: ChessMove[];
  whitePlayer?: string;
  blackPlayer?: string;
  event?: string;
}

export const PgnImporter: React.FC<PgnImporterProps> = ({
  onImport,
  onCancel,
}) => {
  const [pgnText, setPgnText] = useState('');
  const [parsedGames, setParsedGames] = useState<ParsedGame[]>([]);
  const [selectedGameIndex, setSelectedGameIndex] = useState(0);
  const [customName, setCustomName] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const parsePgn = (pgn: string): ParsedGame[] => {
    const games: ParsedGame[] = [];
    
    // Split by game (typically separated by blank lines or game markers)
    const gameStrings = pgn.split(/\n\s*\n/);

    for (const gameStr of gameStrings) {
      if (!gameStr.trim()) continue;

      try {
        // Extract headers
        const headerRegex = /\[(\w+)\s+"([^"]+)"\]/g;
        const headers: Record<string, string> = {};
        let match;

        while ((match = headerRegex.exec(gameStr)) !== null) {
          headers[match[1]] = match[2];
        }

        // Extract moves
        const movesText = gameStr.replace(/\[.*?\]/g, '').trim();
        const chess = new Chess();
        const moves: ChessMove[] = [];

        // Parse moves using chess.js
        const movePattern = /\b[KQRBN]?[a-h]?[1-8]?x?[a-h][1-8](?:=[QRBN])?[+#]?/g;
        const moveMatches = movesText.match(movePattern) || [];

        for (const moveStr of moveMatches) {
          try {
            const move = chess.move(moveStr, { sloppy: true });
            if (move) {
              moves.push({
                from: move.from,
                to: move.to,
                promotion: move.promotion,
              });
            }
          } catch (e) {
            // Skip invalid moves
          }
        }

        if (moves.length > 0) {
          const gameName = headers.Event || headers.Opening || `Game ${games.length + 1}`;
          games.push({
            name: gameName,
            moves,
            whitePlayer: headers.White,
            blackPlayer: headers.Black,
            event: headers.Event,
          });
        }
      } catch (e) {
        console.error('Error parsing game:', e);
      }
    }

    return games;
  };

  const handleParse = () => {
    if (!pgnText.trim()) {
      toast.error('Please paste PGN text');
      return;
    }

    try {
      const games = parsePgn(pgnText);
      if (games.length === 0) {
        toast.error('No valid games found in PGN');
        return;
      }

      setParsedGames(games);
      setSelectedGameIndex(0);
      setCustomName(games[0].name);
      setShowPreview(true);
    } catch (e) {
      toast.error('Failed to parse PGN');
    }
  };

  const handleImport = () => {
    const game = parsedGames[selectedGameIndex];
    if (!game || !customName.trim()) {
      toast.error('Please select a game and enter a name');
      return;
    }

    onImport?.(customName, game.moves);
    setPgnText('');
    setParsedGames([]);
    setCustomName('');
    setShowPreview(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setPgnText(content);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4">
      <div className="card-organic p-6">
        <h3 className="text-heading text-primary mb-4">Import PGN</h3>
        
        <div className="space-y-4">
          {/* File Upload */}
          <div>
            <label className="text-sm font-medium mb-2 block">Upload PGN File</label>
            <input
              type="file"
              accept=".pgn,.txt"
              onChange={handleFileUpload}
              className="w-full"
            />
          </div>

          {/* Or Paste */}
          <div>
            <label className="text-sm font-medium mb-2 block">Or Paste PGN Text</label>
            <Textarea
              placeholder="Paste PGN here..."
              value={pgnText}
              onChange={(e) => setPgnText(e.target.value)}
              rows={8}
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleParse}
              disabled={!pgnText.trim()}
              className="flex-1 bg-secondary hover:bg-secondary/90 text-secondary-foreground"
            >
              <Upload className="h-4 w-4 mr-2" />
              Parse PGN
            </Button>
            <Button
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Import Game</DialogTitle>
          </DialogHeader>

          {parsedGames.length > 0 && (
            <div className="space-y-4">
              {/* Game Selection */}
              {parsedGames.length > 1 && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Select Game</label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {parsedGames.map((game, idx) => (
                      <Card
                        key={idx}
                        className={`p-3 cursor-pointer transition-colors ${
                          selectedGameIndex === idx
                            ? 'card-organic bg-primary text-primary-foreground'
                            : 'card-organic hover:bg-muted'
                        }`}
                        onClick={() => {
                          setSelectedGameIndex(idx);
                          setCustomName(game.name);
                        }}
                      >
                        <p className="font-semibold">{game.name}</p>
                        <p className="text-sm opacity-75">
                          {game.whitePlayer} vs {game.blackPlayer}
                        </p>
                        <p className="text-xs opacity-50">
                          {game.moves.length} moves
                        </p>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Game Details */}
              {parsedGames[selectedGameIndex] && (
                <div className="card-organic p-4 space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">White</p>
                    <p className="font-semibold">
                      {parsedGames[selectedGameIndex].whitePlayer || 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Black</p>
                    <p className="font-semibold">
                      {parsedGames[selectedGameIndex].blackPlayer || 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Moves</p>
                    <p className="font-semibold">
                      {parsedGames[selectedGameIndex].moves.length}
                    </p>
                  </div>
                </div>
              )}

              {/* Custom Name */}
              <div>
                <label className="text-sm font-medium mb-2 block">Repertoire Name</label>
                <Input
                  placeholder="Enter repertoire name"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPreview(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={!customName.trim() || parsedGames.length === 0}
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
            >
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PgnImporter;
