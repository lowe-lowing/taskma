import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

export const workspaceRouter = router({
  getWorkspaceById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.workspace.findUnique({
        where: { id: input.id },
      });
    }),
  getWorkspacesByUser: protectedProcedure.query(({ ctx }) => {
    const userId = ctx.session.user.id;
    return ctx.prisma.workspace.findMany({
      where: { UserWorkspaces: { some: { UserId: userId } } },
      include: { Boards: true },
    });
  }),
  addWorkspace: protectedProcedure
    .input(z.object({ name: z.string().min(3).max(50) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.userWorkspace.create({
        data: {
          User: { connect: { id: ctx.session.user.id } },
          Workspace: { create: { Name: input.name } },
        },
      });
    }),
  getUsersInWorkspace: protectedProcedure
    .input(z.object({ workspaceId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.user.findMany({
        where: {
          UserWorkspace: {
            some: {
              WorkspaceId: input.workspaceId,
            },
          },
        },
      });
    }),
  getUsersToInviteByName: protectedProcedure
    .input(z.object({ name: z.string(), workspaceId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.user.findMany({
        where: {
          name: { contains: input.name },
          id: { not: ctx.session.user.id },
          AND: {
            NOT: {
              UserWorkspace: {
                some: {
                  WorkspaceId: input.workspaceId,
                },
              },
            },
          },
        },
      });
    }),
  inviteToWorkspace: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        users: z.array(
          z.object({
            id: z.string(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { workspaceId, users } = input;
      return ctx.prisma.$transaction(
        users.map((user) =>
          ctx.prisma.userWorkspace.create({
            data: {
              User: { connect: { id: user.id } },
              Workspace: { connect: { id: workspaceId } },
            },
          })
        )
      );
    }),
});
