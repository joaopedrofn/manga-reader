"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { trpc } from "@/utils/trpc";
import { MangaCard, Button, Input, Skeleton } from "@/ui";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";

const ITEMS_PER_PAGE = 12;

export function MangaList() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  const { data, isLoading, error } = useQuery(
    trpc.mangas.list.queryOptions({
      limit: ITEMS_PER_PAGE,
      offset,
      title: searchQuery || undefined,
    })
  );

  const totalPages = data ? Math.ceil(data.pagination.total / ITEMS_PER_PAGE) : 1;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchInput("");
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

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="text-center space-y-4">
          <p className="text-destructive text-lg font-medium">Failed to load manga</p>
          <p className="text-muted-foreground">Please try again later</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      {/* Search Section */}
      <div className="bg-card rounded-lg border p-6 shadow-sm">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search manga titles..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10 h-12 text-base"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button type="submit" className="h-12 px-6">
              Search
            </Button>
          </div>
          
          {searchQuery && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Searching for:</span>
              <span className="font-medium bg-secondary px-2 py-1 rounded">
                {searchQuery}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClearSearch}
                className="h-6 px-2"
              >
                Clear
              </Button>
            </div>
          )}
        </form>
      </div>

      {/* Results Info */}
      {data && !isLoading && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing <span className="font-medium">{data.mangas.length}</span> of{" "}
            <span className="font-medium">{data.pagination.total}</span> results
          </div>
          {data.pagination.total > 0 && (
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
          )}
        </div>
      )}

      {/* Manga Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
            <div key={index} className="space-y-3">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : data?.mangas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="text-center space-y-4">
            <p className="text-lg font-medium">
              {searchQuery ? `No manga found for "${searchQuery}"` : "No manga found"}
            </p>
            <p className="text-muted-foreground">
              {searchQuery ? "Try adjusting your search terms" : "Check back later for new content"}
            </p>
            {searchQuery && (
              <Button
                variant="outline"
                onClick={handleClearSearch}
                className="mt-4"
              >
                Clear Search
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {data?.mangas.map((manga) => (
            <MangaCard 
              key={manga.id} 
              manga={manga} 
              onClick={() => router.push(`/manga/${manga.id}/chapters`)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && totalPages > 1 && (
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
        </div>
      )}
      
      {/* Footer Credits */}
      <div className="mt-16 text-center text-xs text-muted-foreground/60 pb-8">
        <p>
          Manga data provided by{" "}
          <a 
            href="https://mangadex.org" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            MangaDex
          </a>
          {" • "}Supporting the manga community
        </p>
      </div>
    </div>
  );
} 