"use client"
import { MangaList } from "@/components/manga-list";

export default function Home() {
  return (
    <main className="flex-1 bg-gradient-to-br from-background to-muted pt-14 -mt-14">
      <div className="container mx-auto max-w-7xl px-4 py-8 md:py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Discover Amazing Manga
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Explore thousands of manga titles from MangaDex. Find your next favorite series and dive into incredible stories.
          </p>
        </div>
        
        <MangaList />
      </div>
    </main>
  );
}
