// Reading progress types
export interface ChapterProgress {
  chapterId: string;
  currentPage: number;
  totalPages: number;
  completed: boolean;
  lastReadAt: number; // timestamp
  chapterNumber?: string;
  chapterTitle?: string;
}

export interface MangaProgress {
  mangaId: string;
  mangaTitle: string;
  coverUrl?: string;
  chapters: Record<string, ChapterProgress>;
  lastChapterRead?: string;
  lastReadAt: number;
  totalChaptersAvailable?: number; // Total chapters in the manga
}

export interface ReadingProgressData {
  mangas: Record<string, MangaProgress>;
  lastUpdated: number;
}

const STORAGE_KEY = "manga-reading-progress";

// Get reading progress from localStorage
export function getReadingProgress(): ReadingProgressData {
  if (typeof window === "undefined") {
    return { mangas: {}, lastUpdated: Date.now() };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return { mangas: {}, lastUpdated: Date.now() };
    }
    
    const parsed = JSON.parse(stored) as ReadingProgressData;
    return parsed;
  } catch (error) {
    console.error("Error loading reading progress:", error);
    return { mangas: {}, lastUpdated: Date.now() };
  }
}

// Save reading progress to localStorage
export function saveReadingProgress(progress: ReadingProgressData): void {
  if (typeof window === "undefined") return;

  try {
    progress.lastUpdated = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error("Error saving reading progress:", error);
  }
}

// Update chapter progress
export function updateChapterProgress(
  mangaId: string,
  mangaTitle: string,
  chapterData: {
    chapterId: string;
    currentPage: number;
    totalPages: number;
    chapterNumber?: string;
    chapterTitle?: string;
  },
  coverUrl?: string,
  totalChaptersAvailable?: number
): void {
  const progress = getReadingProgress();
  
  // Initialize manga progress if it doesn't exist
  if (!progress.mangas[mangaId]) {
    progress.mangas[mangaId] = {
      mangaId,
      mangaTitle,
      coverUrl,
      chapters: {},
      lastReadAt: Date.now(),
      totalChaptersAvailable,
    };
  }

  // Update manga info
  const mangaProgress = progress.mangas[mangaId];
  mangaProgress.mangaTitle = mangaTitle;
  mangaProgress.lastReadAt = Date.now();
  mangaProgress.lastChapterRead = chapterData.chapterId;
  if (coverUrl) mangaProgress.coverUrl = coverUrl;
  if (totalChaptersAvailable !== undefined) mangaProgress.totalChaptersAvailable = totalChaptersAvailable;

  // Update chapter progress
  const chapterProgress: ChapterProgress = {
    chapterId: chapterData.chapterId,
    currentPage: chapterData.currentPage,
    totalPages: chapterData.totalPages,
    completed: chapterData.currentPage >= chapterData.totalPages - 1,
    lastReadAt: Date.now(),
    chapterNumber: chapterData.chapterNumber,
    chapterTitle: chapterData.chapterTitle,
  };

  mangaProgress.chapters[chapterData.chapterId] = chapterProgress;
  
  saveReadingProgress(progress);
}

// Get manga progress
export function getMangaProgress(mangaId: string): MangaProgress | null {
  const progress = getReadingProgress();
  return progress.mangas[mangaId] || null;
}

// Get chapter progress
export function getChapterProgress(mangaId: string, chapterId: string): ChapterProgress | null {
  const mangaProgress = getMangaProgress(mangaId);
  return mangaProgress?.chapters[chapterId] || null;
}

// Get recently read mangas
export function getRecentlyReadMangas(limit: number = 10): MangaProgress[] {
  const progress = getReadingProgress();
  return Object.values(progress.mangas)
    .filter(manga => manga.lastChapterRead) // Only mangas with reading progress
    .sort((a, b) => b.lastReadAt - a.lastReadAt) // Sort by most recent
    .slice(0, limit);
}

// Mark chapter as completed
export function markChapterCompleted(mangaId: string, chapterId: string): void {
  const progress = getReadingProgress();
  const mangaProgress = progress.mangas[mangaId];
  
  if (mangaProgress?.chapters[chapterId]) {
    mangaProgress.chapters[chapterId].completed = true;
    mangaProgress.chapters[chapterId].lastReadAt = Date.now();
    mangaProgress.lastReadAt = Date.now();
    saveReadingProgress(progress);
  }
}

// Get reading statistics
export function getReadingStats() {
  const progress = getReadingProgress();
  const mangas = Object.values(progress.mangas);
  
  const totalMangas = mangas.length;
  const totalChapters = mangas.reduce((sum, manga) => sum + Object.keys(manga.chapters).length, 0);
  const completedChapters = mangas.reduce(
    (sum, manga) => sum + Object.values(manga.chapters).filter(ch => ch.completed).length,
    0
  );
  
  return {
    totalMangas,
    totalChapters,
    completedChapters,
    readingProgress: totalChapters > 0 ? (completedChapters / totalChapters) * 100 : 0,
  };
}

// Clear all reading progress (for settings/reset)
export function clearReadingProgress(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

// Export reading progress (for backup)
export function exportReadingProgress(): string {
  const progress = getReadingProgress();
  return JSON.stringify(progress, null, 2);
}

// Import reading progress (for restore)
export function importReadingProgress(data: string): boolean {
  try {
    const parsed = JSON.parse(data) as ReadingProgressData;
    saveReadingProgress(parsed);
    return true;
  } catch (error) {
    console.error("Error importing reading progress:", error);
    return false;
  }
}

// Update total chapter count for a manga (call this when visiting chapters page)
export function updateMangaTotalChapters(
  mangaId: string,
  mangaTitle: string,
  totalChapters: number,
  coverUrl?: string
): void {
  const progress = getReadingProgress();
  
  // Initialize manga progress if it doesn't exist
  if (!progress.mangas[mangaId]) {
    progress.mangas[mangaId] = {
      mangaId,
      mangaTitle,
      coverUrl,
      chapters: {},
      lastReadAt: Date.now(),
      totalChaptersAvailable: totalChapters,
    };
  } else {
    // Update existing manga info
    const mangaProgress = progress.mangas[mangaId];
    mangaProgress.mangaTitle = mangaTitle;
    mangaProgress.totalChaptersAvailable = totalChapters;
    if (coverUrl) mangaProgress.coverUrl = coverUrl;
  }
  
  saveReadingProgress(progress);
} 