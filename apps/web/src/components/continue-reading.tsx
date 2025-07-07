"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, Button } from "@/ui";
import { BookOpen, Clock, ArrowRight, Play, List } from "lucide-react";
import { getRecentlyReadMangas, type MangaProgress } from "@/lib/reading-progress";
import Image from "next/image";

export function ContinueReading() {
  const router = useRouter();
  const [recentMangas, setRecentMangas] = React.useState<MangaProgress[]>([]);

  React.useEffect(() => {
    // Load recent mangas from localStorage
    const recent = getRecentlyReadMangas(6);
    setRecentMangas(recent);
  }, []);

  if (recentMangas.length === 0) {
    return null; // Don't show the section if no reading progress
  }

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return `${days}d ago`;
    }
  };

  const getLastChapterInfo = (manga: MangaProgress) => {
    if (!manga.lastChapterRead) return null;
    const lastChapter = manga.chapters[manga.lastChapterRead];
    return lastChapter;
  };

  const getContinueReadingUrl = (manga: MangaProgress) => {
    // Always go to the last read chapter, even if completed
    if (manga.lastChapterRead) {
      return `/manga/${manga.mangaId}/chapters/${manga.lastChapterRead}/read`;
    }
    // Fallback to chapters list if no chapter has been read
    return `/manga/${manga.mangaId}/chapters`;
  };

  const getViewChaptersUrl = (manga: MangaProgress) => {
    return `/manga/${manga.mangaId}/chapters`;
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Continue Reading</h2>
          <p className="text-muted-foreground">
            Pick up where you left off
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {recentMangas.map((manga) => {
           const lastChapter = getLastChapterInfo(manga);
           const readChapters = Object.keys(manga.chapters).length;
           const completedChapters = Object.values(manga.chapters).filter((ch: any) => ch.completed).length;
           const inProgressChapters = readChapters - completedChapters;
           const totalChapters = manga.totalChaptersAvailable;
           const hasFullProgress = totalChapters !== undefined;
           const overallProgress = hasFullProgress ? Math.round((completedChapters / totalChapters) * 100) : 0;

          return (
            <Card 
              key={manga.mangaId} 
              className="group hover:shadow-lg transition-all duration-300"
            >
              <CardHeader className="pb-3">
                <div className="flex gap-4">
                  {manga.coverUrl && (
                    <div className="relative h-24 w-16 flex-shrink-0">
                      <Image
                        src={manga.coverUrl}
                        alt={manga.mangaTitle}
                        fill
                        className="object-cover rounded-md"
                        sizes="(max-width: 64px) 100vw, 64px"
                      />
                    </div>
                  )}
                  
                  <div className="flex-1 space-y-2">
                    <CardTitle className="text-base line-clamp-2 group-hover:text-primary transition-colors">
                      {manga.mangaTitle}
                    </CardTitle>
                    
                    <div className="space-y-1 text-sm text-muted-foreground">
                      {lastChapter && (
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          <span>
                            Ch. {lastChapter.chapterNumber || 'Unknown'}
                            {lastChapter.completed ? ' (Completed)' : 
                             ` (Page ${lastChapter.currentPage + 1}/${lastChapter.totalPages})`}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatTimeAgo(manga.lastReadAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                                 {/* Reading statistics */}
                 <div className="space-y-2">
                   <div className="flex items-center justify-between text-xs">
                     <span className="text-muted-foreground">
                       {hasFullProgress ? 'Overall Progress' : 'Reading Progress'}
                     </span>
                     <span className="font-medium">
                       {hasFullProgress ? `${overallProgress}%` : `${readChapters} chapters`}
                     </span>
                   </div>
                   
                   {/* Progress bar */}
                   {hasFullProgress ? (
                     /* Full progress bar with actual percentage */
                     <div className="w-full bg-gray-200 rounded-full h-2">
                       <div 
                         className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                         style={{ width: `${overallProgress}%` }}
                       />
                     </div>
                   ) : (
                     /* Simple breakdown for chapters started */
                     <div className="flex gap-1">
                       {completedChapters > 0 && (
                         <div className="flex-1 bg-green-500 rounded-full h-2" />
                       )}
                       {inProgressChapters > 0 && (
                         <div className="flex-1 bg-blue-500 rounded-full h-2" />
                       )}
                       {readChapters === 0 && (
                         <div className="w-full bg-gray-200 rounded-full h-2" />
                       )}
                     </div>
                   )}
                   
                   <div className="text-xs text-muted-foreground">
                     {hasFullProgress ? (
                       <span>{completedChapters} of {totalChapters} chapters completed</span>
                     ) : (
                       <div className="space-y-1">
                         {completedChapters > 0 && (
                           <div className="flex items-center gap-2">
                             <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                             <span>{completedChapters} completed</span>
                           </div>
                         )}
                         {inProgressChapters > 0 && (
                           <div className="flex items-center gap-2">
                             <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                             <span>{inProgressChapters} in progress</span>
                           </div>
                         )}
                       </div>
                     )}
                   </div>
                 </div>

                {/* Action buttons */}
                <div className="flex gap-2 mt-4">
                  <Button 
                    className="flex-1 bg-primary hover:bg-primary/90 transition-colors"
                    onClick={() => router.push(getContinueReadingUrl(manga))}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {lastChapter && !lastChapter.completed ? 'Continue' : 'Read Again'}
                  </Button>
                  <Button 
                    variant="outline"
                    className="flex-1"
                    onClick={() => router.push(getViewChaptersUrl(manga))}
                  >
                    <List className="h-4 w-4 mr-2" />
                    Chapters
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
} 