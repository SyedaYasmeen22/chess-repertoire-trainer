import { Repertoire, RepertoireFolder } from './chess-utils';

const STORAGE_KEYS = {
  REPERTOIRES: 'chess-repertoires',
  FOLDERS: 'chess-folders',
  TRAINING_SESSIONS: 'chess-training-sessions',
};

/**
 * Get all repertoires from storage
 */
export function getRepertoires(): Repertoire[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.REPERTOIRES);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error reading repertoires:', e);
    return [];
  }
}

/**
 * Save repertoires to storage
 */
export function saveRepertoires(repertoires: Repertoire[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.REPERTOIRES, JSON.stringify(repertoires));
  } catch (e) {
    console.error('Error saving repertoires:', e);
  }
}

/**
 * Add or update a repertoire
 */
export function upsertRepertoire(repertoire: Repertoire): void {
  const repertoires = getRepertoires();
  const index = repertoires.findIndex(r => r.id === repertoire.id);

  if (index >= 0) {
    repertoires[index] = repertoire;
  } else {
    repertoires.push(repertoire);
  }

  saveRepertoires(repertoires);
}

/**
 * Delete a repertoire
 */
export function deleteRepertoire(id: string): void {
  const repertoires = getRepertoires().filter(r => r.id !== id);
  saveRepertoires(repertoires);
}

/**
 * Get all folders from storage
 */
export function getFolders(): RepertoireFolder[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.FOLDERS);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error reading folders:', e);
    return [];
  }
}

/**
 * Save folders to storage
 */
export function saveFolders(folders: RepertoireFolder[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(folders));
  } catch (e) {
    console.error('Error saving folders:', e);
  }
}

/**
 * Add or update a folder
 */
export function upsertFolder(folder: RepertoireFolder): void {
  const folders = getFolders();
  const index = folders.findIndex(f => f.id === folder.id);

  if (index >= 0) {
    folders[index] = folder;
  } else {
    folders.push(folder);
  }

  saveFolders(folders);
}

/**
 * Delete a folder
 */
export function deleteFolder(id: string): void {
  const folders = getFolders().filter(f => f.id !== id);
  saveFolders(folders);
}

/**
 * Export all data as JSON
 */
export function exportAllData(): string {
  const data = {
    repertoires: getRepertoires(),
    folders: getFolders(),
    exportedAt: new Date().toISOString(),
  };

  return JSON.stringify(data, null, 2);
}

/**
 * Import data from JSON
 */
export function importData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);

    if (data.repertoires && Array.isArray(data.repertoires)) {
      saveRepertoires(data.repertoires);
    }

    if (data.folders && Array.isArray(data.folders)) {
      saveFolders(data.folders);
    }

    return true;
  } catch (e) {
    console.error('Error importing data:', e);
    return false;
  }
}

/**
 * Clear all data
 */
export function clearAllData(): void {
  localStorage.removeItem(STORAGE_KEYS.REPERTOIRES);
  localStorage.removeItem(STORAGE_KEYS.FOLDERS);
  localStorage.removeItem(STORAGE_KEYS.TRAINING_SESSIONS);
}
