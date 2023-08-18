import { router, protectedProcedure } from "../trpc";
import Pusher from "pusher";
import { z } from "zod";
import { env } from "@/env/server.mjs";

const pusher = new Pusher({
  appId: env.PUSHER_APP_ID,
  key: env.PUSHER_KEY,
  secret: env.PUSHER_SECRET,
  cluster: env.PUSHER_CLUSTER,
});

export type UpdateUiPusherResponse = {
  userId: string;
  boardId: string;
};

export const pusherRouter = router({
  updateBoardUi: protectedProcedure
    .input(z.object({ boardId: z.string() }))
    .mutation(async ({ ctx, input: { boardId } }) => {
      await pusher.trigger("board", "update-ui", {
        userId: ctx.session.user.id,
        boardId,
      } as UpdateUiPusherResponse);
      return true;
    }),
});
