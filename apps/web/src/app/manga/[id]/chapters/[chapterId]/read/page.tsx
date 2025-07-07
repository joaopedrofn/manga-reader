"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/ui";
import { ChevronLeft, ChevronRight, X, Info, ArrowLeft } from "lucide-react";
import Image from "next/image";

export default function ChapterReadPage() {
  const params = useParams();
  const router = useRouter();
  const mangaId = params.id as string;
  const chapterId = params.chapterId as string;
  
  const [currentPage, setCurrentPage] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Fetch chapter pages
  const { data: chapterData, isLoading, error } = useQuery(
    trpc.mangas.getChapterPages.queryOptions({
      chapterId,
      dataSaver: false,
    })
  );

  // Fetch manga details for context
  const { data: mangaData } = useQuery(
    trpc.mangas.getById.queryOptions({
      id: mangaId,
      includes: ["cover_art"],
    })
  );

  const totalPages = chapterData?.totalPages || 0;
  const currentPageUrl = chapterData?.pages[currentPage];

  // Navigation functions
  const goToNextPage = useCallback(() => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1);
      setImageLoading(true);
    }
  }, [currentPage, totalPages]);

  const goToPreviousPage = useCallback(() => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
      setImageLoading(true);
    }
  }, [currentPage]);

  const toggleDetails = useCallback(() => {
    setShowDetails(prev => !prev);
  }, []);

     // Keyboard navigation
   useEffect(() => {
     const handleKeyPress = (e: KeyboardEvent) => {
       switch (e.key) {
         case "ArrowLeft":
         case "a":
         case "A":
           e.preventDefault();
           goToPreviousPage();
           break;
         case "ArrowRight":
         case "d":
         case "D":
           e.preventDefault();
           goToNextPage();
           break;
         case " ": // Spacebar
         case "s":
         case "S":
         case "Enter":
           e.preventDefault();
           toggleDetails();
           break;
         case "Escape":
           e.preventDefault();
           if (showDetails) {
             setShowDetails(false);
           } else {
             router.back();
           }
           break;
         case "Home":
           e.preventDefault();
           setCurrentPage(0);
           setImageLoading(true);
           break;
         case "End":
           e.preventDefault();
           setCurrentPage(totalPages - 1);
           setImageLoading(true);
           break;
       }
     };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [goToNextPage, goToPreviousPage, toggleDetails, showDetails, router]);

  // Handle click zones
  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    
    // Divide into three zones: left (30%), middle (40%), right (30%)
    const leftZone = width * 0.3;
    const rightZone = width * 0.7;
    
    if (x < leftZone) {
      goToPreviousPage();
    } else if (x > rightZone) {
      goToNextPage();
    } else {
      toggleDetails();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4 mx-auto"></div>
          <p>Loading chapter...</p>
        </div>
      </div>
    );
  }

  if (error || !chapterData) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-white text-center space-y-4">
          <p className="text-xl">Failed to load chapter</p>
          <p className="text-muted-foreground">Please try again later</p>
          <Button onClick={() => router.back()} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const manga = mangaData?.manga;
  const chapter = chapterData.chapter;
  const mangaTitle = manga?.attributes.title.en || Object.values(manga?.attributes.title || {})[0] || "Unknown Title";
  const chapterTitle = chapter.attributes.title || `Chapter ${chapter.attributes.chapter}`;
  
  // Extract scanlation group info
  const scanlationGroups = chapter.relationships?.filter(rel => rel.type === "scanlation_group") || [];
  const uploader = chapter.relationships?.find(rel => rel.type === "user");

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* Reading Header - only visible when details are shown */}
      {showDetails && (
        <div className="absolute top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md p-4 border-b border-white/10">
          <div className="flex items-center justify-between text-white">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="text-white hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Chapters
            </Button>
            
            <div className="text-center flex-1 mx-4">
              <h1 className="text-lg font-bold truncate">{mangaTitle}</h1>
              <p className="text-sm text-gray-300 truncate">
                {chapter.attributes.volume && `Vol. ${chapter.attributes.volume} `}
                Ch. {chapter.attributes.chapter}
                {chapterTitle && ` - ${chapterTitle}`}
              </p>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(false)}
              className="text-white hover:bg-white/20 transition-colors"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Main reading area */}
      <div className="relative w-full h-full">
        {currentPageUrl && (
          <div
            className="relative w-full h-full cursor-pointer select-none"
            onClick={handleImageClick}
          >
            <Image
              src={currentPageUrl}
              alt={`Page ${currentPage + 1}`}
              fill
              className="object-contain"
              priority
              onLoad={() => setImageLoading(false)}
              onError={() => setImageLoading(false)}
            />
            
            {/* Loading overlay */}
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            )}
            
            {/* End of chapter credits */}
            {currentPage === totalPages - 1 && !showDetails && (
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center">
                <div className="bg-black/80 backdrop-blur-sm rounded-lg p-4 text-white max-w-sm">
                  <p className="text-sm mb-2">End of Chapter</p>
                  {scanlationGroups.length > 0 && (
                    <p className="text-xs text-gray-300 mb-2">
                      Thanks to: {scanlationGroups.map(group => group.attributes?.name || "Unknown Group").join(", ")}
                    </p>
                  )}
                  <p className="text-xs text-gray-400">
                    Read on{" "}
                    <a 
                      href={`https://mangadex.org/chapter/${chapterId}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-orange-400 hover:text-orange-300 underline"
                    >
                      MangaDeX
                    </a>
                  </p>
                </div>
              </div>
            )}
            
            {/* Click zone indicators (only visible when details are shown) */}
            {showDetails && (
              <>
                <div className="absolute left-0 top-0 bottom-0 w-[30%] bg-blue-500/20 border-r border-blue-500/50">
                  <div className="absolute bottom-4 left-4 text-white text-sm bg-black/50 px-2 py-1 rounded">
                    Previous
                  </div>
                </div>
                <div className="absolute left-[30%] top-0 bottom-0 w-[40%] bg-green-500/20 border-x border-green-500/50">
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black/50 px-2 py-1 rounded">
                    Details
                  </div>
                </div>
                <div className="absolute right-0 top-0 bottom-0 w-[30%] bg-blue-500/20 border-l border-blue-500/50">
                  <div className="absolute bottom-4 right-4 text-white text-sm bg-black/50 px-2 py-1 rounded">
                    Next
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Bottom progress bar - only visible when details are shown */}
      {showDetails && (
        <div className="absolute bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm p-4">
          <div className="flex items-center justify-between text-white mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={goToPreviousPage}
              disabled={currentPage === 0}
              className="text-white hover:bg-white/20"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <div className="text-center">
              <span className="text-sm">
                Page {currentPage + 1} of {totalPages}
              </span>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={goToNextPage}
              disabled={currentPage === totalPages - 1}
              className="text-white hover:bg-white/20"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentPage + 1) / totalPages) * 100}%` }}
            />
          </div>
          
          {/* Chapter info */}
          <div className="mt-3 text-xs text-gray-300 text-center space-y-2">
            <div className="flex items-center justify-center gap-4">
              <span>{chapter.attributes.pages} pages total</span>
              <span>•</span>
              <span>{chapter.attributes.translatedLanguage.toUpperCase()}</span>
              <span>•</span>
              <span>{formatDate(chapter.attributes.publishAt)}</span>
            </div>
            
            {/* Credits section */}
            <div className="space-y-1">
              {scanlationGroups.length > 0 && (
                <p className="text-xs text-gray-400">
                  Scanlated by: {scanlationGroups.map(group => group.attributes?.name || "Unknown Group").join(", ")}
                </p>
              )}
              <p className="text-xs text-gray-500">
                Powered by{" "}
                <a 
                  href="https://mangadex.org" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-orange-400 hover:text-orange-300 transition-colors underline"
                >
                  MangaDex
                </a>
              </p>
            </div>
            
            <div className="text-gray-400 pt-1">
              <p className="text-xs">
                Left click: Previous • Right click: Next • Middle click or Space: Toggle details • Esc: Back
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Minimal page indicator (always visible) */}
      {!showDetails && (
        <div className="absolute top-4 right-4 z-40 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
          {currentPage + 1} / {totalPages}
        </div>
      )}

      {/* Help button (always visible) */}
      {!showDetails && (
        <div className="absolute top-4 left-4 z-40">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleDetails}
            className="text-white hover:bg-white/20 bg-black/50 backdrop-blur-sm"
          >
            <Info className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
} 