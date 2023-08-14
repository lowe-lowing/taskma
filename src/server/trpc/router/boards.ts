import { BoardRole, type Prisma, type UserBoard } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../trpc";

const zodBoardRole = z.union([
  z.literal(BoardRole.Creator),
  z.literal(BoardRole.Admin),
  z.literal(BoardRole.Editor),
  z.literal(BoardRole.Viewer),
]);

export type BoardRoleType = z.infer<typeof zodBoardRole>;

export type UserBoardWithUser = Prisma.UserBoardGetPayload<{
  include: { User: true };
}>;

export const boardRouter = router({
  getBoardById: protectedProcedure
    .input(z.object({ boardId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.board.findUnique({
        where: { id: input.boardId },
      });
    }),
  getBoardFull: protectedProcedure
    .input(z.object({ boardId: z.string() }))
    .query(async ({ ctx, input }) => {
      const memberShipExists = await ctx.prisma.userBoard.findFirst({
        where: { userId: ctx.session.user.id, boardId: input.boardId },
      });

      if (!memberShipExists)
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User is not a member of this board",
        });

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
  createBoard: protectedProcedure
    .input(
      z.object({ Name: z.string().min(3).max(50), workspaceId: z.string() })
    )
    .mutation(async ({ ctx, input }) => {
      const { Name, workspaceId } = input;
      const userId = ctx.session.user.id;
      const otherAdmins = await ctx.prisma.userWorkspace
        .findMany({
          where: {
            workspaceId,
            Role: { not: "Member" },
            NOT: { userId },
          },
        })
        .then((admins) =>
          admins.map(
            (admin) =>
              ({
                Role: "Admin",
                userId: admin.userId,
                addedBy: "BoardCreation",
              } as UserBoard)
          )
        );

      return ctx.prisma.board.create({
        data: {
          Name,
          workspaceId,
          UserBoards: {
            createMany: {
              data: [
                { Role: "Creator", userId, addedBy: "BoardCreation" },
                ...otherAdmins,
              ],
            },
          },
        },
      });
    }),
  getUsersInBoard: protectedProcedure
    .input(z.object({ boardId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.userBoard.findMany({
        where: { boardId: input.boardId },
        include: { User: true },
      });
    }),
  getUserMembership: protectedProcedure
    .input(z.object({ boardId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.userBoard.findFirst({
        where: { userId: ctx.session.user.id, boardId: input.boardId },
      });
    }),
  changeUserRole: protectedProcedure
    .input(z.object({ memberShipId: z.string(), role: zodBoardRole }))
    .mutation(async ({ ctx, input }) => {
      const { memberShipId, role } = input;
      return ctx.prisma.userBoard.update({
        where: { id: memberShipId },
        data: { Role: role },
      });
    }),
  getUsersToInviteByName: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        workspaceId: z.string(),
        boardId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { name, workspaceId, boardId } = input;
      return ctx.prisma.user.findMany({
        where: {
          name: { contains: name, mode: "insensitive" },
          UserWorkspace: {
            some: { workspaceId },
          },
          NOT: { UserBoards: { some: { boardId } } },
        },
      });
    }),
  inviteToBoard: protectedProcedure
    .input(
      z.object({
        boardId: z.string(),
        users: z.array(z.object({ id: z.string() })),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { boardId, users } = input;
      return ctx.prisma.$transaction(
        users.map((user) =>
          ctx.prisma.userBoard.create({
            data: {
              User: { connect: { id: user.id } },
              Board: { connect: { id: boardId } },
              Role: "Editor",
              addedBy: "Invite",
            },
          })
        )
      );
    }),
  updateSettings: protectedProcedure
    .input(
      z.object({
        boardId: z.string(),
        Name: z.string().min(3).max(50),
        isPublic: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { boardId, Name, isPublic } = input;
      return ctx.prisma.board.update({
        where: { id: boardId },
        data: { Name, isPublic },
      });
    }),
  deleteBoard: protectedProcedure
    .input(z.object({ boardId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { boardId } = input;
      // only admins can delete boards maybe do a check for that
      return ctx.prisma.board.delete({
        where: { id: boardId },
      });
    }),
  leaveBoard: protectedProcedure
    .input(z.object({ membershipId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.userBoard.delete({
        where: { id: input.membershipId },
      });
    }),
});

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
