import React, { useState, useEffect } from 'react';
import { Repertoire } from '@/lib/chess-utils';
import useRepertoireManager from '@/hooks/useRepertoireManager';
import RepertoireSidebar from '@/components/RepertoireSidebar';
import RecordingMode from '@/components/RecordingMode';
import TrainingMode from '@/components/TrainingMode';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Download, Upload, Settings, Moon, Sun, BarChart3 } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from 'sonner';
import {
  exportAllData,
  importData,
} from '@/lib/storage';
import { pgnToMoves } from '@/lib/chess-utils';
import ProgressDashboard from '@/components/ProgressDashboard';

type AppMode = 'dashboard' | 'recording' | 'training' | 'import' | 'stats';

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const {
    repertoires,
    folders,
    createRepertoire,
    updateRepertoire,
    removeRepertoire,
    createFolder,
    updateFolder,
    removeFolder,
    updateStats,
  } = useRepertoireManager();

  const [appMode, setAppMode] = useState<AppMode>('dashboard');
  const [selectedRepertoireId, setSelectedRepertoireId] = useState<string | undefined>(undefined);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importPgn, setImportPgn] = useState('');
  const [importName, setImportName] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const selectedRepertoire = selectedRepertoireId ? repertoires.find(r => r.id === selectedRepertoireId) : undefined;

  const handleRecordingSave = (name: string, moves: any[]) => {
    createRepertoire(name, 'root', moves);
    setAppMode('dashboard');
    toast.success(`Repertoire "${name}" created!`);
  };

  const handleTrainingComplete = (stats: { mistakes: number; time: number }) => {
    if (selectedRepertoireId) {
      const correct = stats.mistakes === 0;
      updateStats(selectedRepertoireId, correct);
      toast.success(
        `Training complete! Accuracy: ${Math.round(((selectedRepertoire?.moves.length || 0) - stats.mistakes) / (selectedRepertoire?.moves.length || 1) * 100)}%`
      );
    }
    setAppMode('dashboard');
  };

  const handleImportPgn = () => {
    if (!importPgn.trim() || !importName.trim()) {
      toast.error('Please enter both PGN and name');
      return;
    }

    try {
      const moves = pgnToMoves(importPgn);
      if (moves.length === 0) {
        toast.error('No valid moves found in PGN');
        return;
      }

      createRepertoire(importName, 'root', moves);
      setImportPgn('');
      setImportName('');
      setShowImportDialog(false);
      setAppMode('dashboard');
      toast.success(`Repertoire "${importName}" imported!`);
    } catch (e) {
      toast.error('Failed to parse PGN');
    }
  };

  const handleExport = () => {
    const data = exportAllData();
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(data));
    element.setAttribute('download', `chess-repertoires-${new Date().toISOString().split('T')[0]}.json`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Repertoires exported!');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        if (importData(content)) {
          toast.success('Repertoires imported successfully!');
          window.location.reload();
        } else {
          toast.error('Failed to import repertoires');
        }
      } catch (e) {
        toast.error('Invalid file format');
      }
    };
    reader.readAsText(file);
  };

  const stats = {
    totalRepertoires: repertoires.length,
    totalFolders: folders.length,
    totalMoves: repertoires.reduce((sum, r) => sum + r.moves.length, 0),
    averageAccuracy: repertoires.length > 0
      ? Math.round(
          repertoires.reduce((sum, r) => sum + (r.stats.attempts > 0 ? (r.stats.successes / r.stats.attempts) * 100 : 0), 0) /
          repertoires.filter(r => r.stats.attempts > 0).length
        )
      : 0,
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border sticky top-0 z-40 bg-background/95 backdrop-blur">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">
              ♔
            </div>
            <h1 className="text-display text-primary">Chess Repertoire Trainer</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-6">
        {appMode === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="card-organic p-4">
                <div className="text-sm text-muted-foreground mb-1">Repertoires</div>
                <div className="text-3xl font-bold text-primary">{stats.totalRepertoires}</div>
              </Card>
              <Card className="card-organic p-4">
                <div className="text-sm text-muted-foreground mb-1">Folders</div>
                <div className="text-3xl font-bold text-primary">{stats.totalFolders}</div>
              </Card>
              <Card className="card-organic p-4">
                <div className="text-sm text-muted-foreground mb-1">Total Moves</div>
                <div className="text-3xl font-bold text-primary">{stats.totalMoves}</div>
              </Card>
              <Card className="card-organic p-4">
                <div className="text-sm text-muted-foreground mb-1">Avg Accuracy</div>
                <div className="text-3xl font-bold text-secondary">{stats.averageAccuracy}%</div>
              </Card>
            </div>

            {/* Main Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Sidebar */}
              <div className="lg:col-span-1">
                <RepertoireSidebar
                  repertoires={repertoires}
                  folders={folders}
                  selectedRepertoireId={selectedRepertoireId}
                  onSelectRepertoire={setSelectedRepertoireId}
                  onCreateFolder={(name) => createFolder(name)}
                  onCreateRepertoire={(name, folderId) => {
                    createRepertoire(name, folderId);
                  }}
                  onDeleteRepertoire={removeRepertoire}
                  onDeleteFolder={removeFolder}
                  onRenameRepertoire={(id, name) => updateRepertoire(id, { name })}
                  onRenameFolder={(id, name) => updateFolder(id, { name })}
                />
              </div>

              {/* Main Panel */}
              <div className="lg:col-span-3">
                {selectedRepertoire ? (
                  <Card className="card-organic p-6">
                    <div className="space-y-4">
                      <div>
                        <h2 className="text-display text-primary mb-2">{selectedRepertoire.name}</h2>
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Moves</p>
                            <p className="text-2xl font-bold text-primary">{selectedRepertoire.moves.length}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Attempts</p>
                            <p className="text-2xl font-bold text-primary">{selectedRepertoire.stats.attempts}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Accuracy</p>
                            <p className="text-2xl font-bold text-secondary">
                              {selectedRepertoire.stats.attempts > 0
                                ? Math.round((selectedRepertoire.stats.successes / selectedRepertoire.stats.attempts) * 100)
                                : 0}%
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button
                          onClick={() => setAppMode('training')}
                          className="flex-1 bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                        >
                          Start Training
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => removeRepertoire(selectedRepertoire.id)}
                        >
                          Delete
                        </Button>
                      </div>

                      <div className="pt-4 border-t border-border">
                        <h3 className="text-heading text-primary mb-2">Moves</h3>
                        <p className="text-sm font-mono bg-muted p-3 rounded break-all">
                          {selectedRepertoire.moves.map((m, i) => `${m.from}${m.to}`).join(' ')}
                        </p>
                      </div>
                    </div>
                  </Card>
                ) : (
                  <Card className="card-organic p-12 text-center">
                    <p className="text-muted-foreground mb-4">Select a repertoire or create a new one to get started</p>
                    <Button
                      onClick={() => setAppMode('recording')}
                      className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                    >
                      Create New Repertoire
                    </Button>
                  </Card>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-center flex-wrap">
              <Button
                onClick={() => setAppMode('recording')}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Record New Repertoire
              </Button>
              <Button
                variant="outline"
                onClick={() => setAppMode('stats')}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Progress
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowImportDialog(true)}
              >
                <Upload className="h-4 w-4 mr-2" />
                Import PGN
              </Button>
              <Button
                variant="outline"
                onClick={handleExport}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        )}

        {appMode === 'recording' && (
          <RecordingMode
            onSave={handleRecordingSave}
            onCancel={() => setAppMode('dashboard')}
          />
        )}

        {appMode === 'training' && selectedRepertoire && (
          <TrainingMode
            repertoire={selectedRepertoire}
            onComplete={handleTrainingComplete}
            onCancel={() => setAppMode('dashboard')}
          />
        )}

        {appMode === 'stats' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-display text-primary">Progress Dashboard</h2>
              <Button
                variant="outline"
                onClick={() => setAppMode('dashboard')}
              >
                Back
              </Button>
            </div>
            <ProgressDashboard repertoires={repertoires} />
          </div>
        )}
      </main>

      {/* Import PGN Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Import PGN</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Repertoire Name</label>
              <Input
                placeholder="e.g., Sicilian Defense - Main Line"
                value={importName}
                onChange={(e) => setImportName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">PGN Text</label>
              <Textarea
                placeholder="Paste PGN here..."
                value={importPgn}
                onChange={(e) => setImportPgn(e.target.value)}
                rows={8}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowImportDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleImportPgn}
              disabled={!importName.trim() || !importPgn.trim()}
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
            >
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Data Management</h3>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleExport}
              >
                <Download className="h-4 w-4 mr-2" />
                Export All Data
              </Button>
              <div className="mt-2">
                <label className="text-sm font-medium">Import Data</label>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportFile}
                  className="w-full mt-1"
                />
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Theme</h3>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={toggleTheme}
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="h-4 w-4 mr-2" />
                    Light Mode
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4 mr-2" />
                    Dark Mode
                  </>
                )}
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setShowSettings(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
