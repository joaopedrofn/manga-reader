import { z } from "zod";
import { publicProcedure, router } from "../lib/trpc";

// MangaDex API types
const MangaSchema = z.object({
  id: z.string(),
  type: z.literal("manga"),
  attributes: z.object({
    title: z.record(z.string()),
    altTitles: z.array(z.record(z.string())).optional(),
    description: z.record(z.string()).optional(),
    isLocked: z.boolean().optional(),
    links: z.record(z.string()).optional(),
    originalLanguage: z.string().optional(),
    lastVolume: z.string().optional().nullable(),
    lastChapter: z.string().optional().nullable(),
    publicationDemographic: z.enum(["shounen", "shoujo", "josei", "seinen"]).nullable().optional(),
    status: z.enum(["ongoing", "completed", "hiatus", "cancelled"]).optional(),
    year: z.number().nullable().optional(),
    contentRating: z.enum(["safe", "suggestive", "erotica", "pornographic"]).optional(),
    tags: z.array(z.object({
      id: z.string(),
      type: z.literal("tag"),
      attributes: z.object({
        name: z.record(z.string()),
        description: z.record(z.string()).optional(),
        group: z.string(),
        version: z.number(),
      }),
    })).optional(),
    state: z.enum(["draft", "submitted", "published", "rejected"]).optional(),
    chapterNumbersResetOnNewVolume: z.boolean().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
    version: z.number().optional(),
    availableTranslatedLanguages: z.array(z.string()).optional(),
    latestUploadedChapter: z.string().optional(),
  }),
  relationships: z.array(z.object({
    id: z.string(),
    type: z.string(),
    attributes: z.record(z.any()).optional(),
  })).optional(),
});

const MangaListResponseSchema = z.object({
  result: z.literal("ok"),
  response: z.literal("collection"),
  data: z.array(MangaSchema),
  limit: z.number(),
  offset: z.number(),
  total: z.number(),
});

export const mangasRouter = router({
  list: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).optional().default(20),
      offset: z.number().min(0).optional().default(0),
      title: z.string().optional(),
      includedTags: z.array(z.string()).optional(),
      excludedTags: z.array(z.string()).optional(),
      status: z.array(z.enum(["ongoing", "completed", "hiatus", "cancelled"])).optional(),
      publicationDemographic: z.array(z.enum(["shounen", "shoujo", "josei", "seinen"])).optional(),
      contentRating: z.array(z.enum(["safe", "suggestive", "erotica", "pornographic"])).optional(),
      order: z.record(z.enum(["asc", "desc"])).optional(),
    }))
    .query(async ({ input }) => {
      try {
        const searchParams = new URLSearchParams();
        
        // Add pagination
        searchParams.set("limit", input.limit.toString());
        searchParams.set("offset", input.offset.toString());
        
        // Add search filters
        if (input.title) {
          searchParams.set("title", input.title);
        }
        
        if (input.includedTags && input.includedTags.length > 0) {
          input.includedTags.forEach(tag => {
            searchParams.append("includedTags[]", tag);
          });
        }
        
        if (input.excludedTags && input.excludedTags.length > 0) {
          input.excludedTags.forEach(tag => {
            searchParams.append("excludedTags[]", tag);
          });
        }
        
        if (input.status && input.status.length > 0) {
          input.status.forEach(status => {
            searchParams.append("status[]", status);
          });
        }
        
        if (input.publicationDemographic && input.publicationDemographic.length > 0) {
          input.publicationDemographic.forEach(demo => {
            searchParams.append("publicationDemographic[]", demo);
          });
        }
        
        if (input.contentRating && input.contentRating.length > 0) {
          input.contentRating.forEach(rating => {
            searchParams.append("contentRating[]", rating);
          });
        }
        
        // Add ordering
        if (input.order) {
          Object.entries(input.order).forEach(([key, value]) => {
            searchParams.set(`order[${key}]`, value);
          });
        }
        
        const url = `${process.env.MANGADEX_API_URL}/manga?${searchParams.toString()}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`MangaDex API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Validate the response
        const validatedData = MangaListResponseSchema.parse(data);
        
        return {
          mangas: validatedData.data,
          pagination: {
            limit: validatedData.limit,
            offset: validatedData.offset,
            total: validatedData.total,
          },
        };
      } catch (error) {
        console.error("Error fetching manga list:", error);
        throw new Error("Failed to fetch manga list");
      }
    }),
}); 