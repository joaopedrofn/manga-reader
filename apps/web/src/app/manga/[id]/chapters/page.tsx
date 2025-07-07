"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { trpc } from "@/utils/trpc";
import { 
  Button, 
  Input, 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  Skeleton,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/ui";
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  ChevronLeft, 
  ChevronRight,
  Calendar,
  FileText,
  Hash,
  Eye
} from "lucide-react";
import Image from "next/image";

const PAGE_SIZE_OPTIONS = [25, 50, 75, 100];

type SortField = "chapter" | "volume" | "createdAt" | "updatedAt" | "publishAt" | "readableAt";
type SortOrder = "asc" | "desc";

interface SortConfig {
  field: SortField;
  order: SortOrder;
}

export default function MangaChaptersPage() {
  const params = useParams();
  const router = useRouter();
  const mangaId = params.id as string;
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: "chapter", order: "asc" });
  
  const offset = (currentPage - 1) * pageSize;
  
  // Fetch manga details
  const { data: mangaData, isLoading: mangaLoading, error: mangaError } = useQuery(
    trpc.mangas.getById.queryOptions({
      id: mangaId,
      includes: ["cover_art"],
    })
  );
  
  // Fetch chapters
  const { data: chaptersData, isLoading: chaptersLoading, error: chaptersError } = useQuery(
    trpc.mangas.getChapters.queryOptions({
      mangaId,
      limit: pageSize,
      offset,
      order: { [sortConfig.field]: sortConfig.order },
    })
  );
  
  const totalPages = chaptersData ? Math.ceil(chaptersData.pagination.total / pageSize) : 1;
  
  const handleSort = (field: SortField) => {
    setSortConfig(prev => ({
      field,
      order: prev.field === field && prev.order === "asc" ? "desc" : "asc"
    }));
    setCurrentPage(1);
  };
  
  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  
  const getPageNumbers = () => {
    const pages = [];
    const showPages = 5;
    const halfShow = Math.floor(showPages / 2);
    
    let startPage = Math.max(currentPage - halfShow, 1);
    let endPage = Math.min(startPage + showPages - 1, totalPages);
    
    if (endPage - startPage + 1 < showPages) {
      startPage = Math.max(endPage - showPages + 1, 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };
  
  const getSortIcon = (field: SortField) => {
    if (sortConfig.field !== field) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return sortConfig.order === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };
  
  if (mangaError || chaptersError) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="text-center space-y-4">
          <p className="text-destructive text-lg font-medium">Failed to load manga chapters</p>
          <p className="text-muted-foreground">Please try again later</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }
  
  const manga = mangaData?.manga;
  const title = manga?.attributes.title.en || Object.values(manga?.attributes.title || {})[0] || "Unknown Title";
  const description = manga?.attributes.description?.en || Object.values(manga?.attributes.description || {})[0] || "";
  
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Manga Header */}
      <div className="mb-8">
        {mangaLoading ? (
          <div className="flex gap-6 mb-6">
            <Skeleton className="h-48 w-32 rounded-lg" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        ) : (
          <Card className="p-6">
            <div className="flex gap-6">
              {mangaData?.coverUrl && (
                <div className="relative h-48 w-32 flex-shrink-0">
                  <Image
                    src={mangaData.coverUrl}
                    alt={title}
                    fill
                    className="object-cover rounded-lg"
                    sizes="(max-width: 128px) 100vw, 128px"
                  />
                </div>
              )}
              <div className="flex-1 space-y-4">
                <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                {description && (
                  <p className="text-muted-foreground leading-relaxed">
                    {description.length > 300 ? `${description.substring(0, 300)}...` : description}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  {manga?.attributes.status && (
                    <span className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                      {manga.attributes.status.charAt(0).toUpperCase() + manga.attributes.status.slice(1)}
                    </span>
                  )}
                  {manga?.attributes.publicationDemographic && (
                    <span className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm font-medium">
                      {manga.attributes.publicationDemographic.charAt(0).toUpperCase() + manga.attributes.publicationDemographic.slice(1)}
                    </span>
                  )}
                  {manga?.attributes.year && (
                    <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm font-medium">
                      {manga.attributes.year}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
      
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Sort by:</span>
          <Button
            variant={sortConfig.field === "chapter" ? "default" : "outline"}
            size="sm"
            onClick={() => handleSort("chapter")}
            className="flex items-center gap-2"
          >
            <Hash className="h-4 w-4" />
            Chapter {getSortIcon("chapter")}
          </Button>
          <Button
            variant={sortConfig.field === "publishAt" ? "default" : "outline"}
            size="sm"
            onClick={() => handleSort("publishAt")}
            className="flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            Published {getSortIcon("publishAt")}
          </Button>
          <Button
            variant={sortConfig.field === "createdAt" ? "default" : "outline"}
            size="sm"
            onClick={() => handleSort("createdAt")}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Created {getSortIcon("createdAt")}
          </Button>
        </div>
        
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-sm font-medium">Per page:</span>
          <select
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            className="px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
          >
            {PAGE_SIZE_OPTIONS.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Results Info */}
      {chaptersData && !chaptersLoading && (
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-muted-foreground">
            Showing <span className="font-medium">{chaptersData.chapters.length}</span> of{" "}
            <span className="font-medium">{chaptersData.pagination.total}</span> chapters
          </div>
          {chaptersData.pagination.total > 0 && (
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
          )}
        </div>
      )}
      
      {/* Chapters List */}
      <div className="space-y-4 mb-8">
        {chaptersLoading ? (
          Array.from({ length: pageSize }).map((_, index) => (
            <div key={index} className="p-4 border border-border rounded-lg">
              <div className="flex items-center justify-between">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            </div>
          ))
        ) : chaptersData?.chapters.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="text-center space-y-4">
              <p className="text-lg font-medium">No chapters found</p>
              <p className="text-muted-foreground">This manga doesn't have any chapters available</p>
            </div>
          </div>
        ) : (
          chaptersData?.chapters.map((chapter) => (
            <Card key={chapter.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">
                      {chapter.attributes.volume && `Vol. ${chapter.attributes.volume} `}
                      {chapter.attributes.chapter && `Ch. ${chapter.attributes.chapter}`}
                      {chapter.attributes.title && ` - ${chapter.attributes.title}`}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {chapter.attributes.pages} pages
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(chapter.attributes.publishAt)}
                      </span>
                      <span className="uppercase font-medium">
                        {chapter.attributes.translatedLanguage}
                      </span>
                    </div>
                    
                    {/* Scanlation group credits */}
                    {chapter.relationships && chapter.relationships.some(rel => rel.type === "scanlation_group") && (
                      <div className="text-xs text-muted-foreground/70 mt-1">
                        by {chapter.relationships
                          .filter(rel => rel.type === "scanlation_group")
                          .map(group => group.attributes?.name || "Unknown Group")
                          .join(", ")}
                      </div>
                    )}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => router.push(`/manga/${mangaId}/chapters/${chapter.id}/read`)}
                  >
                    Read
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>
      
      {/* Pagination */}
      {chaptersData && totalPages > 1 && (
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-10"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            
            <div className="flex items-center gap-1">
              {getPageNumbers().map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  onClick={() => handlePageChange(page)}
                  className="h-10 w-10"
                >
                  {page}
                </Button>
              ))}
            </div>
            
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="h-10"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground">
            Go to page:
            <Input
              type="number"
              min={1}
              max={totalPages}
              value={currentPage}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const page = parseInt(e.target.value);
                if (page >= 1 && page <= totalPages) {
                  handlePageChange(page);
                }
              }}
              className="w-20 mx-2 text-center"
            />
            of {totalPages}
          </div>
        </div>
      )}
      
      {/* Footer Credits */}
      <div className="mt-12 text-center text-xs text-muted-foreground/60 pb-8">
        <p>
          Data provided by{" "}
          <a 
            href="https://mangadex.org" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            MangaDex
          </a>
          {" • "}Thanks to all scanlation groups for their hard work
        </p>
      </div>
    </div>
  );
} 