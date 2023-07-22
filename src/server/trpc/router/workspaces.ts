import { BoardRole, WorkspaceRole } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

const zodWorkspaceRole = z.union([
  z.literal(WorkspaceRole.Owner),
  z.literal(WorkspaceRole.Admin),
  z.literal(WorkspaceRole.Member),
]);

export const workspaceRouter = router({
  getWorkspaceById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.workspace.findUnique({
        where: { id: input.id },
      });
    }),
  getWorkspacesWithBoardsByUser: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const workspaces = await ctx.prisma.workspace.findMany({
      where: { UserWorkspaces: { some: { UserId: userId } } },
      include: {
        Boards: { include: { UserBoards: true } },
        UserWorkspaces: true,
      },
    });
    // TODO: might change so that every board connection is created instead of just the ones that only are members
    return workspaces.map((workspace) => {
      const role = workspace.UserWorkspaces.find(
        (userWorkspace) => userWorkspace.UserId === userId
      )!.Role;
      if (role === WorkspaceRole.Member) {
        // only including the boards if the user has a connected UserBoard (aka is a member of the board)
        workspace.Boards = workspace.Boards.filter((board) =>
          board.UserBoards.find((userBoard) => userBoard.userId === userId)
        );
      }
      return workspace;
    });
  }),
  createWorkspace: protectedProcedure
    .input(z.object({ name: z.string().min(3).max(50) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.userWorkspace.create({
        data: {
          User: { connect: { id: ctx.session.user.id } },
          Workspace: { create: { Name: input.name } },
          Role: "Owner",
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
        include: {
          UserWorkspace: true,
        },
      });
    }),
  getUsersToInviteByName: protectedProcedure
    .input(z.object({ name: z.string(), workspaceId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.user.findMany({
        where: {
          name: { contains: input.name, mode: "insensitive" },
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
              Role: "Member",
            },
          })
        )
      );
    }),
});
