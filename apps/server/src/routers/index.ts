import {
  publicProcedure,
  router,
} from "../lib/trpc";
import { mangasRouter } from "./mangas";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return "OK";
  }),
  mangas: mangasRouter,
});
export type AppRouter = typeof appRouter;
