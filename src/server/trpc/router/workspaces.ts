import { WorkspaceRole } from "@prisma/client";
import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import { TRPCError } from "@trpc/server";

const zodWorkspaceRole = z.union([
  z.literal(WorkspaceRole.Owner),
  z.literal(WorkspaceRole.Admin),
  z.literal(WorkspaceRole.Member),
]);

const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const workspaceRouter = router({
  getWorkspaceById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.workspace.findUnique({
        where: { id: input.id },
      });
    }),
  getWorkspacesByUser: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    await wait(2000);
    return await ctx.prisma.workspace.findMany({
      where: { UserWorkspaces: { some: { userId } } },
    });
  }),
  getWorkspacesWithBoardsByUser: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const workspaces = await ctx.prisma.workspace.findMany({
      where: { UserWorkspaces: { some: { userId } } },
      include: {
        // TODO: add where clause here instead of the map below
        Boards: { include: { UserBoards: true } },
        UserWorkspaces: true,
      },
    });
    return workspaces.map((workspace) => {
      const role = workspace.UserWorkspaces.find(
        (userWorkspace) => userWorkspace.userId === userId
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
      return ctx.prisma.userWorkspace.findMany({
        where: {
          workspaceId: input.workspaceId,
        },
        include: {
          User: true,
        },
      });
    }),
  getUsersToInviteByName: protectedProcedure
    .input(z.object({ name: z.string(), workspaceId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { name, workspaceId } = input;
      return ctx.prisma.user.findMany({
        where: {
          name: { contains: name, mode: "insensitive" },
          NOT: {
            UserWorkspace: { some: { workspaceId } },
          },
        },
      });
    }),
  inviteToWorkspace: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        users: z.array(z.object({ id: z.string() })),
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
  getUserRole: protectedProcedure
    .input(z.object({ workspaceId: z.string() }))
    .query(async ({ ctx, input }) => {
      const memberShip = await ctx.prisma.userWorkspace.findFirst({
        where: { userId: ctx.session.user.id, workspaceId: input.workspaceId },
      });
      return memberShip?.Role;
    }),
  changeUserRole: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        userToChangeId: z.string(),
        memberShipId: z.string(),
        role: zodWorkspaceRole,
      })
    )
    .mutation(async ({ ctx, input }) => {
      // if workspace role changes from member to admin,
      // create userBoards on all boards in the workspace the user is not already in (with role admin) and
      // update the existing board memberships to admin

      // if workspace role changes from admin to member,
      // delete all the userBoards that where added by the role change
      // maybe add a property on the userBoard model called addedByRoleChange: boolean
      const { workspaceId, userToChangeId, memberShipId, role } = input;

      if (role === "Admin") {
        const boardsInWorkspaceNotAlreadyMember =
          await ctx.prisma.board.findMany({
            where: {
              workspaceId,
              NOT: { UserBoards: { some: { userId: userToChangeId } } },
            },
          });
        return ctx.prisma.$transaction([
          ...boardsInWorkspaceNotAlreadyMember.map((board) =>
            ctx.prisma.userBoard.create({
              data: {
                boardId: board.id,
                userId: userToChangeId,
                Role: "Admin",
                addedBy: "AdminRolechange",
              },
            })
          ),
          ctx.prisma.userWorkspace.update({
            where: { id: memberShipId },
            data: { Role: role },
          }),
        ]);
      } else if (role === "Member") {
        const boardsAddedByRoleChanger = await ctx.prisma.board.findMany({
          where: {
            workspaceId,
            UserBoards: {
              some: {
                userId: userToChangeId,
                addedBy: { in: ["AdminRolechange", "BoardCreation"] },
                Role: { not: "Creator" },
              },
            },
          },
          include: {
            UserBoards: { where: { userId: userToChangeId } },
          },
        });

        return ctx.prisma.$transaction([
          ...boardsAddedByRoleChanger.map((board) =>
            ctx.prisma.userBoard.delete({
              where: {
                id: board.UserBoards[0]?.id,
              },
            })
          ),
          ctx.prisma.userWorkspace.update({
            where: { id: memberShipId },
            data: { Role: role },
          }),
        ]);
      }
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid arguments passed",
      });
    }),
});
