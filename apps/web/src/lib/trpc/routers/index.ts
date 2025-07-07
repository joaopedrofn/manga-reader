import {
  publicProcedure,
  router,
} from "../index";
import { mangasRouter } from "./mangas";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return "OK";
  }),
  mangas: mangasRouter,
});

export type AppRouter = typeof appRouter; 