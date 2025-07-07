import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card"
import { Button } from "./button"

interface MangaCardProps {
  manga: {
    id: string;
    attributes: {
      title: Record<string, string>;
      description?: Record<string, string>;
      status?: string;
      publicationDemographic?: string | null;
      contentRating?: string;
      year?: number | null;
      tags?: Array<{
        id: string;
        attributes: {
          name: Record<string, string>;
          group: string;
        };
      }>;
    };
  };
  onClick?: () => void;
}

export function MangaCard({ manga, onClick }: MangaCardProps) {
  const title = manga.attributes.title.en || Object.values(manga.attributes.title)[0] || "Unknown Title";
  const description = manga.attributes.description?.en || Object.values(manga.attributes.description || {})[0] || "";
  
  // Get first few tags for display
  const displayTags = manga.attributes.tags?.slice(0, 3) || [];
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ongoing':
        return 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/25';
      case 'completed':
        return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25';
      case 'hiatus':
        return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg shadow-yellow-500/25';
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg shadow-gray-500/25';
    }
  };

  const getDemographicColor = (demographic: string) => {
    switch (demographic) {
      case 'shounen':
        return 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/25';
      case 'shoujo':
        return 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/25';
      case 'seinen':
        return 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/25';
      case 'josei':
        return 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-lg shadow-cyan-500/25';
      default:
        return 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/25';
    }
  };

  const getContentRatingColor = (rating: string) => {
    switch (rating) {
      case 'safe':
        return 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/25';
      case 'suggestive':
        return 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25';
      case 'erotica':
        return 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/25';
      case 'pornographic':
        return 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/25';
      default:
        return 'bg-gradient-to-r from-slate-500 to-slate-600 text-white shadow-lg shadow-slate-500/25';
    }
  };

  const getTagColors = () => {
    const colors = [
      'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-md shadow-violet-500/20',
      'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md shadow-blue-500/20',
      'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md shadow-green-500/20',
      'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md shadow-orange-500/20',
      'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md shadow-pink-500/20',
      'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md shadow-teal-500/20',
    ];
    return colors;
  };

  const tagColors = getTagColors();
  
  return (
    <Card className="group relative h-full overflow-hidden border-2 shadow-md hover:shadow-lg transition-all duration-500 hover:-translate-y-1">
      
      <CardHeader className="relative pb-3 z-10">
        <div className="flex items-start justify-between gap-3 mb-3">
          <CardTitle className="text-base font-bold line-clamp-2 leading-tight group-hover:text-primary transition-colors duration-300">
            {title}
          </CardTitle>
          {manga.attributes.year && (
            <div className="relative">
              <span className="text-xs font-semibold text-muted-foreground bg-gradient-to-r from-muted to-muted/80 px-3 py-1.5 rounded-full shrink-0 shadow-sm border">
                {manga.attributes.year}
              </span>
            </div>
          )}
        </div>
        
        <CardDescription className="flex flex-wrap items-center gap-2 text-sm">
          {manga.attributes.status && (
            <span className={`px-3 py-1.5 rounded-full text-xs font-bold tracking-wide ${getStatusColor(manga.attributes.status)} transform hover:scale-105 transition-transform duration-200`}>
              {manga.attributes.status.toUpperCase()}
            </span>
          )}
          {manga.attributes.publicationDemographic && (
            <span className={`px-3 py-1.5 rounded-full text-xs font-bold tracking-wide ${getDemographicColor(manga.attributes.publicationDemographic)} transform hover:scale-105 transition-transform duration-200`}>
              {manga.attributes.publicationDemographic.toUpperCase()}
            </span>
          )}
          {manga.attributes.contentRating && (
            <span className={`px-3 py-1.5 rounded-full text-xs font-bold tracking-wide ${getContentRatingColor(manga.attributes.contentRating)} transform hover:scale-105 transition-transform duration-200`}>
              {manga.attributes.contentRating.toUpperCase()}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="relative pt-0 space-y-4 z-10">
        {description && (
          <div className="relative">
            <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed group-hover:text-foreground/90 transition-colors duration-300">
              {description.length > 120 ? `${description.substring(0, 120)}...` : description}
            </p>        
          </div>
        )}
        
        {displayTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {displayTags.map((tag, index) => (
              <span
                key={tag.id}
                className={`px-3 py-1.5 text-xs font-semibold rounded-full cursor-default transform hover:scale-105 transition-all duration-200 ${tagColors[index % tagColors.length]}`}
              >
                {tag.attributes.name.en || Object.values(tag.attributes.name)[0]}
              </span>
            ))}
            {(manga.attributes.tags?.length || 0) > 3 && (
              <span className="px-3 py-1.5 text-xs font-semibold rounded-full bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-md shadow-gray-500/20 transform hover:scale-105 transition-transform duration-200">
                +{(manga.attributes.tags?.length || 0) - 3} more
              </span>
            )}
          </div>
        )}
        
        {onClick && (
          <div className="pt-4">
            <Button onClick={onClick} className="w-full" variant="outline">
              View Chapters
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 