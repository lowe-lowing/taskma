import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

export const boardRouter = router({
  getBoardById: protectedProcedure
    .input(z.object({ boardId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.board.findUnique({
        where: { id: input.boardId },
        include: {
          Lanes: {
            orderBy: { Order: "asc" },
            include: { Tasks: { orderBy: { Order: "asc" } } },
          },
        },
      });
    }),
  // getBoards: protectedProcedure.input(z.object({workspaceRole})).query(({ ctx, input }) => {
  //   return ctx.prisma.board.findMany({
  //     where: {
  //       Workspace: {
  //         UserWorkspaces: { every: { UserId: ctx.session.user.id } },
  //       },
  //     },
  //     include: { Workspace: true },
  //   });
  // }),
  // getBoardsByWorkspace: protectedProcedure
  //   .input(z.object({ workspaceId: z.string() }))
  //   .query(({ ctx, input }) => {
  //     return ctx.prisma.board.findMany({
  //       where: { Workspace: { id: input.workspaceId } },
  //     });
  //   }),
  createBoard: protectedProcedure
    .input(
      z.object({ name: z.string().min(3).max(50), workspaceId: z.string() })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.board.create({
        data: {
          Name: input.name,
          Workspace: { connect: { id: input.workspaceId } },
        },
      });
    }),
});
