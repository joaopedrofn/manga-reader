import { z } from "zod";
import { publicProcedure, router } from "../index";

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

const ChapterSchema = z.object({
  id: z.string(),
  type: z.literal("chapter"),
  attributes: z.object({
    title: z.string().nullable(),
    volume: z.string().nullable(),
    chapter: z.string().nullable(),
    pages: z.number(),
    translatedLanguage: z.string(),
    uploader: z.string().optional(),
    externalUrl: z.string().nullable().optional(),
    publishAt: z.string(),
    readableAt: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    version: z.number(),
  }),
  relationships: z.array(z.object({
    id: z.string(),
    type: z.string(),
    attributes: z.record(z.any()).optional(),
  })).optional(),
});

const CoverSchema = z.object({
  id: z.string(),
  type: z.literal("cover_art"),
  attributes: z.object({
    description: z.string().optional(),
    volume: z.string().nullable().optional(),
    fileName: z.string(),
    locale: z.string().optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
    version: z.number(),
  }),
});

const MangaListResponseSchema = z.object({
  result: z.literal("ok"),
  response: z.literal("collection"),
  data: z.array(MangaSchema),
  limit: z.number(),
  offset: z.number(),
  total: z.number(),
});

const MangaDetailResponseSchema = z.object({
  result: z.literal("ok"),
  response: z.literal("entity"),
  data: MangaSchema,
});

const ChapterListResponseSchema = z.object({
  result: z.literal("ok"),
  response: z.literal("collection"),
  data: z.array(ChapterSchema),
  limit: z.number(),
  offset: z.number(),
  total: z.number(),
});

const AtHomeResponseSchema = z.object({
  result: z.literal("ok"),
  baseUrl: z.string(),
  chapter: z.object({
    hash: z.string(),
    data: z.array(z.string()),
    dataSaver: z.array(z.string()),
  }),
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

  getById: publicProcedure
    .input(z.object({
      id: z.string(),
      includes: z.array(z.string()).optional(),
    }))
    .query(async ({ input }) => {
      try {
        const searchParams = new URLSearchParams();
        
        // Add includes for reference expansion (like cover_art)
        if (input.includes && input.includes.length > 0) {
          input.includes.forEach(include => {
            searchParams.append("includes[]", include);
          });
        }
        
        const url = `${process.env.MANGADEX_API_URL}/manga/${input.id}?${searchParams.toString()}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`MangaDex API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Validate the response
        const validatedData = MangaDetailResponseSchema.parse(data);
        
        // Extract cover information if included
        let coverUrl: string | null = null;
        if (validatedData.data.relationships) {
          const coverRelation = validatedData.data.relationships.find(rel => rel.type === "cover_art");
          if (coverRelation && coverRelation.attributes) {
            const coverData = CoverSchema.parse(coverRelation);
            // Construct cover URL as per MangaDex API docs
            coverUrl = `${process.env.MANGADEX_UPLOADS_URL}/covers/${validatedData.data.id}/${coverData.attributes.fileName}.256.jpg`;
          }
        }
        
        return {
          manga: validatedData.data,
          coverUrl,
        };
      } catch (error) {
        console.error("Error fetching manga details:", error);
        throw new Error("Failed to fetch manga details");
      }
    }),

  getChapters: publicProcedure
    .input(z.object({
      mangaId: z.string(),
      limit: z.number().min(1).max(100).optional().default(50),
      offset: z.number().min(0).optional().default(0),
      translatedLanguage: z.array(z.string()).optional().default(["en"]),
      order: z.object({
        chapter: z.enum(["asc", "desc"]).optional(),
        volume: z.enum(["asc", "desc"]).optional(),
        createdAt: z.enum(["asc", "desc"]).optional(),
        updatedAt: z.enum(["asc", "desc"]).optional(),
        publishAt: z.enum(["asc", "desc"]).optional(),
        readableAt: z.enum(["asc", "desc"]).optional(),
      }).optional().default({ chapter: "asc" }),
    }))
    .query(async ({ input }) => {
      try {
        const searchParams = new URLSearchParams();
        
        // Add pagination
        searchParams.set("limit", input.limit.toString());
        searchParams.set("offset", input.offset.toString());
        
        // Add translated language filter
        if (input.translatedLanguage && input.translatedLanguage.length > 0) {
          input.translatedLanguage.forEach(lang => {
            searchParams.append("translatedLanguage[]", lang);
          });
        }
        
        // Add ordering
        if (input.order) {
          Object.entries(input.order).forEach(([key, value]) => {
            if (value) {
              searchParams.set(`order[${key}]`, value);
            }
          });
        }
        
        // Include scanlation groups and users for additional info
        searchParams.append("includes[]", "scanlation_group");
        searchParams.append("includes[]", "user");
        
        const url = `${process.env.MANGADEX_API_URL}/manga/${input.mangaId}/feed?${searchParams.toString()}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`MangaDex API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Validate the response
        const validatedData = ChapterListResponseSchema.parse(data);
        
        return {
          chapters: validatedData.data,
          pagination: {
            limit: validatedData.limit,
            offset: validatedData.offset,
            total: validatedData.total,
          },
        };
      } catch (error) {
        console.error("Error fetching chapters:", error);
        throw new Error("Failed to fetch chapters");
      }
    }),

  getChapterPages: publicProcedure
    .input(z.object({
      chapterId: z.string(),
      dataSaver: z.boolean().optional().default(false),
    }))
    .query(async ({ input }) => {
      try {
        // First, get chapter details if needed (for metadata)
        const chapterResponse = await fetch(`${process.env.MANGADEX_API_URL}/chapter/${input.chapterId}`);
        if (!chapterResponse.ok) {
          throw new Error(`Failed to fetch chapter details: ${chapterResponse.status}`);
        }
        const chapterData = await chapterResponse.json();
        const chapter = ChapterSchema.parse(chapterData.data);

        // Get the at-home server info for this chapter
        const atHomeUrl = `${process.env.MANGADEX_API_URL}/at-home/server/${input.chapterId}`;
        const atHomeResponse = await fetch(atHomeUrl);
        
        if (!atHomeResponse.ok) {
          throw new Error(`MangaDex at-home API error: ${atHomeResponse.status} ${atHomeResponse.statusText}`);
        }
        
        const atHomeData = await atHomeResponse.json();
        const validatedAtHome = AtHomeResponseSchema.parse(atHomeData);
        
        // Construct page URLs
        const quality = input.dataSaver ? "data-saver" : "data";
        const pages = input.dataSaver ? validatedAtHome.chapter.dataSaver : validatedAtHome.chapter.data;
        
        const pageUrls = pages.map(filename => 
          `${validatedAtHome.baseUrl}/${quality}/${validatedAtHome.chapter.hash}/${filename}`
        );
        
        return {
          chapter,
          pages: pageUrls,
          totalPages: pages.length,
        };
      } catch (error) {
        console.error("Error fetching chapter pages:", error);
        throw new Error("Failed to fetch chapter pages");
      }
    }),
}); 