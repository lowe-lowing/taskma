import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { BoardRole, UserBoard } from "@prisma/client";

const zodBoardRole = z.union([
  z.literal(BoardRole.Creator),
  z.literal(BoardRole.Admin),
  z.literal(BoardRole.Editor),
  z.literal(BoardRole.Viewer),
]);

export type BoardRoleType = z.infer<typeof zodBoardRole>;

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
  getUserRole: protectedProcedure
    .input(z.object({ boardId: z.string() }))
    .query(async ({ ctx, input }) => {
      const memberShip = await ctx.prisma.userBoard.findFirst({
        where: { userId: ctx.session.user.id, boardId: input.boardId },
      });
      return memberShip?.Role;
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
      const userId = ctx.session.user.id;
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
