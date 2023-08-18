import { router } from "../trpc";
import { authRouter } from "./auth";
import { boardRouter } from "./boards";
import { laneRouter } from "./lanes";
import { pusherRouter } from "./pusher";
import { taskRouter } from "./tasks";
import { workspaceRouter } from "./workspaces";

export const appRouter = router({
  auth: authRouter,
  workspace: workspaceRouter,
  board: boardRouter,
  lane: laneRouter,
  task: taskRouter,
  pusher: pusherRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
