import React, { useState } from 'react';
import { Repertoire, RepertoireFolder } from '@/lib/chess-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronRight, ChevronDown, Folder, BookOpen, Plus, Trash2, Edit2 } from 'lucide-react';

interface RepertoireSidebarProps {
  repertoires: Repertoire[];
  folders: RepertoireFolder[];
  selectedRepertoireId?: string;
  onSelectRepertoire?: (id: string) => void;
  onCreateFolder?: (name: string) => void;
  onCreateRepertoire?: (name: string, folderId: string) => void;
  onDeleteRepertoire?: (id: string) => void;
  onDeleteFolder?: (id: string) => void;
  onRenameRepertoire?: (id: string, name: string) => void;
  onRenameFolder?: (id: string, name: string) => void;
}

interface FolderState {
  [key: string]: boolean;
}

export const RepertoireSidebar: React.FC<RepertoireSidebarProps> = ({
  repertoires,
  folders,
  selectedRepertoireId,
  onSelectRepertoire,
  onCreateFolder,
  onCreateRepertoire,
  onDeleteRepertoire,
  onDeleteFolder,
  onRenameRepertoire,
  onRenameFolder,
}) => {
  const [expandedFolders, setExpandedFolders] = useState<FolderState>({ root: true });
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [showNewRepertoireDialog, setShowNewRepertoireDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newRepertoireName, setNewRepertoireName] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState('root');
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameName, setRenameName] = useState('');

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onCreateFolder?.(newFolderName);
      setNewFolderName('');
      setShowNewFolderDialog(false);
    }
  };

  const handleCreateRepertoire = () => {
    if (newRepertoireName.trim()) {
      onCreateRepertoire?.(newRepertoireName, selectedFolderId);
      setNewRepertoireName('');
      setShowNewRepertoireDialog(false);
    }
  };

  const handleRename = (id: string, isFolder: boolean) => {
    if (renameName.trim()) {
      if (isFolder) {
        onRenameFolder?.(id, renameName);
      } else {
        onRenameRepertoire?.(id, renameName);
      }
      setRenameId(null);
      setRenameName('');
    }
  };

  const getRootRepertoires = () => {
    return repertoires.filter(r => r.folderId === 'root');
  };

  const getFolderRepertoires = (folderId: string) => {
    return repertoires.filter(r => r.folderId === folderId);
  };

  const getRootFolders = () => {
    return folders.filter(f => !f.parentId);
  };

  const renderRepertoires = (items: Repertoire[]) => {
    return items.map(rep => (
      <div
        key={rep.id}
        className={`
          flex items-center gap-2 px-3 py-2 rounded cursor-pointer transition-colors
          ${selectedRepertoireId === rep.id
            ? 'bg-primary text-primary-foreground'
            : 'hover:bg-muted'
          }
        `}
      >
        <BookOpen className="h-4 w-4 flex-shrink-0" />
        <div
          className="flex-1 min-w-0"
          onClick={() => onSelectRepertoire?.(rep.id)}
        >
          {renameId === rep.id ? (
            <Input
              value={renameName}
              onChange={(e) => setRenameName(e.target.value)}
              onBlur={() => handleRename(rep.id, false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRename(rep.id, false);
                if (e.key === 'Escape') setRenameId(null);
              }}
              autoFocus
              className="h-6 text-sm"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <p className="text-sm truncate">{rep.name}</p>
          )}
        </div>
        {renameId !== rep.id && (
          <div className="flex gap-1 opacity-0 hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                setRenameId(rep.id);
                setRenameName(rep.name);
              }}
            >
              <Edit2 className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteRepertoire?.(rep.id);
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    ));
  };

  const renderFolder = (folder: RepertoireFolder, level: number = 0) => {
    const isExpanded = expandedFolders[folder.id];
    const folderRepertoires = getFolderRepertoires(folder.id);

    return (
      <div key={folder.id}>
        <div
          className="flex items-center gap-2 px-3 py-2 hover:bg-muted rounded cursor-pointer transition-all duration-300 ease-out"
          style={{ paddingLeft: `${12 + level * 12}px` }}
        >
          <button
            onClick={() => toggleFolder(folder.id)}
            className="p-0 h-4 w-4 flex items-center justify-center"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
          <Folder className="h-4 w-4 flex-shrink-0 text-primary" />
          <div className="flex-1 min-w-0">
            {renameId === folder.id ? (
              <Input
                value={renameName}
                onChange={(e) => setRenameName(e.target.value)}
                onBlur={() => handleRename(folder.id, true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRename(folder.id, true);
                  if (e.key === 'Escape') setRenameId(null);
                }}
                autoFocus
                className="h-6 text-sm"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <p className="text-sm truncate">{folder.name}</p>
            )}
          </div>
          {renameId !== folder.id && (
            <div className="flex gap-1 opacity-0 hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setRenameId(folder.id);
                  setRenameName(folder.name);
                }}
              >
                <Edit2 className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteFolder?.(folder.id);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        {isExpanded && (
          <div>
            {renderRepertoires(folderRepertoires)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <h2 className="text-heading text-sidebar-primary mb-3">Repertoires</h2>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowNewFolderDialog(true)}
            className="flex-1"
          >
            <Folder className="h-3 w-3 mr-1" />
            Folder
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setSelectedFolderId('root');
              setShowNewRepertoireDialog(true);
            }}
            className="flex-1 bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground"
          >
            <Plus className="h-3 w-3 mr-1" />
            New
          </Button>
        </div>
      </div>

      {/* Repertoire List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {/* Root repertoires */}
          {getRootRepertoires().length > 0 && (
            <div className="mb-2">
              {renderRepertoires(getRootRepertoires())}
            </div>
          )}

          {/* Folders */}
          {getRootFolders().map(folder => renderFolder(folder))}

          {repertoires.length === 0 && folders.length === 0 && (
            <p className="text-sm text-sidebar-foreground/50 italic p-3">
              No repertoires yet. Create one to get started!
            </p>
          )}
        </div>
      </ScrollArea>

      {/* New Folder Dialog */}
      <Dialog open={showNewFolderDialog} onOpenChange={setShowNewFolderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Folder name"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            autoFocus
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNewFolderDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateFolder}
              disabled={!newFolderName.trim()}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Repertoire Dialog */}
      <Dialog open={showNewRepertoireDialog} onOpenChange={setShowNewRepertoireDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Repertoire</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Repertoire name"
            value={newRepertoireName}
            onChange={(e) => setNewRepertoireName(e.target.value)}
            autoFocus
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNewRepertoireDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateRepertoire}
              disabled={!newRepertoireName.trim()}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RepertoireSidebar;
