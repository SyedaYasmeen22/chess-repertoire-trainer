import { useState, useCallback, useEffect } from 'react';
import { nanoid } from 'nanoid';
import { Repertoire, RepertoireFolder, ChessMove } from '@/lib/chess-utils';
import {
  getRepertoires,
  saveRepertoires,
  getFolders,
  saveFolders,
  upsertRepertoire,
  deleteRepertoire,
  upsertFolder,
  deleteFolder,
} from '@/lib/storage';

export const useRepertoireManager = () => {
  const [repertoires, setRepertoires] = useState<Repertoire[]>([]);
  const [folders, setFolders] = useState<RepertoireFolder[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data from storage on mount
  useEffect(() => {
    setRepertoires(getRepertoires());
    setFolders(getFolders());
    setLoading(false);
  }, []);

  // Create new repertoire
  const createRepertoire = useCallback((
    name: string,
    folderId: string = 'root',
    moves: ChessMove[] = []
  ): Repertoire => {
    const repertoire: Repertoire = {
      id: nanoid(),
      name,
      folderId,
      moves,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      stats: {
        attempts: 0,
        successes: 0,
        difficulty: 'medium',
      },
    };

    upsertRepertoire(repertoire);
    setRepertoires(prev => [...prev, repertoire]);

    return repertoire;
  }, []);

  // Update repertoire
  const updateRepertoire = useCallback((
    id: string,
    updates: Partial<Repertoire>
  ): void => {
    const repertoire = repertoires.find(r => r.id === id);
    if (!repertoire) return;

    const updated = {
      ...repertoire,
      ...updates,
      updatedAt: Date.now(),
    };

    upsertRepertoire(updated);
    setRepertoires(prev =>
      prev.map(r => r.id === id ? updated : r)
    );
  }, [repertoires]);

  // Delete repertoire
  const removeRepertoire = useCallback((id: string): void => {
    deleteRepertoire(id);
    setRepertoires(prev => prev.filter(r => r.id !== id));
  }, []);

  // Create folder
  const createFolder = useCallback((
    name: string,
    parentId?: string
  ): RepertoireFolder => {
    const folder: RepertoireFolder = {
      id: nanoid(),
      name,
      parentId,
      createdAt: Date.now(),
    };

    upsertFolder(folder);
    setFolders(prev => [...prev, folder]);

    return folder;
  }, []);

  // Update folder
  const updateFolder = useCallback((
    id: string,
    updates: Partial<RepertoireFolder>
  ): void => {
    const folder = folders.find(f => f.id === id);
    if (!folder) return;

    const updated = {
      ...folder,
      ...updates,
    };

    upsertFolder(updated);
    setFolders(prev =>
      prev.map(f => f.id === id ? updated : f)
    );
  }, [folders]);

  // Delete folder
  const removeFolder = useCallback((id: string): void => {
    deleteFolder(id);
    setFolders(prev => prev.filter(f => f.id !== id));

    // Move repertoires from deleted folder to root
    setRepertoires(prev =>
      prev.map(r =>
        r.folderId === id ? { ...r, folderId: 'root' } : r
      )
    );
  }, []);

  // Move repertoire to folder
  const moveRepertoire = useCallback((
    repertoireId: string,
    folderId: string
  ): void => {
    updateRepertoire(repertoireId, { folderId });
  }, [updateRepertoire]);

  // Get repertoires in folder
  const getRepertoiresByFolder = useCallback((folderId: string): Repertoire[] => {
    return repertoires.filter(r => r.folderId === folderId);
  }, [repertoires]);

  // Get folder by ID
  const getFolder = useCallback((id: string): RepertoireFolder | undefined => {
    return folders.find(f => f.id === id);
  }, [folders]);

  // Get all root-level folders
  const getRootFolders = useCallback((): RepertoireFolder[] => {
    return folders.filter(f => !f.parentId);
  }, [folders]);

  // Update repertoire stats
  const updateStats = useCallback((
    id: string,
    correct: boolean
  ): void => {
    const repertoire = repertoires.find(r => r.id === id);
    if (!repertoire) return;

    const newStats = {
      ...repertoire.stats,
      attempts: repertoire.stats.attempts + 1,
      successes: correct ? repertoire.stats.successes + 1 : repertoire.stats.successes,
      lastAttempt: Date.now(),
    };

    // Update difficulty based on success rate
    const successRate = newStats.successes / newStats.attempts;
    if (successRate < 0.5) {
      newStats.difficulty = 'hard';
    } else if (successRate < 0.8) {
      newStats.difficulty = 'medium';
    } else {
      newStats.difficulty = 'easy';
    }

    updateRepertoire(id, { stats: newStats });
  }, [repertoires, updateRepertoire]);

  return {
    repertoires,
    folders,
    loading,
    createRepertoire,
    updateRepertoire,
    removeRepertoire,
    createFolder,
    updateFolder,
    removeFolder,
    moveRepertoire,
    getRepertoiresByFolder,
    getFolder,
    getRootFolders,
    updateStats,
  };
};

export default useRepertoireManager;
