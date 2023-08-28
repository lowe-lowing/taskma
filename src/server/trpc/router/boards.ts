import type { Lane, TaskCategory, Prisma, UserBoard } from "@prisma/client";
import { BoardRole } from "@prisma/client";
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

export type BoardWithCategories = Prisma.BoardGetPayload<{
  include: { TaskCategories: true };
}>;

export type TemplateBoard = Prisma.BoardGetPayload<{
  include: {
    TaskCategories: true;
    Lanes: {
      orderBy: { Order: "asc" };
      include: {
        Tasks: {
          orderBy: { Order: "asc" };
        };
      };
    };
  };
}>;

export const boardRouter = router({
  getBoardById: protectedProcedure
    .input(z.object({ boardId: z.string() }))
    .query(async ({ ctx, input }) => {
      const memberShipExists = await ctx.prisma.userBoard.findFirst({
        where: { userId: ctx.session.user.id, boardId: input.boardId },
      });

      const boardPublic = await ctx.prisma.board
        .findFirst({
          where: { id: input.boardId },
        })
        .then((board) => board?.isPublic);

      if (!memberShipExists && !boardPublic)
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User is not a member of this board",
        });

      return ctx.prisma.board.findUnique({
        where: { id: input.boardId },
        include: { TaskCategories: true },
      });
    }),
  getBoardFull: protectedProcedure
    .input(z.object({ boardId: z.string() }))
    .query(async ({ ctx, input }) => {
      const memberShipExists = await ctx.prisma.userBoard.findFirst({
        where: { userId: ctx.session.user.id, boardId: input.boardId },
      });

      const boardPublic = await ctx.prisma.board
        .findFirst({
          where: { id: input.boardId },
        })
        .then((board) => board?.isPublic);

      if (!memberShipExists && !boardPublic)
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User is not a member of this board",
        });

      return ctx.prisma.board.findUnique({
        where: { id: input.boardId },
        include: {
          TaskCategories: true,
          UserBoards: { include: { User: true } },
          Lanes: {
            orderBy: { Order: "asc" },
            include: {
              Tasks: {
                orderBy: { Order: "asc" },
                include: {
                  UserTasks: { include: { User: true } },
                  TaskCategory: true,
                  TaskComments: {
                    include: { User: true },
                    orderBy: { CreatedAt: "asc" },
                  },
                },
              },
            },
          },
        },
      });
    }),
  getTemplates: protectedProcedure.query(async ({ ctx, input }) => {
    return ctx.prisma.board.findMany({
      where: { template: true },
      include: {
        TaskCategories: true,
        Lanes: {
          orderBy: { Order: "asc" },
          include: {
            Tasks: {
              orderBy: { Order: "asc" },
            },
          },
        },
      },
    });
  }),
  createBoard: protectedProcedure
    .input(z.object({ Name: z.string().min(3).max(50), workspaceId: z.string() }))
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
              data: [{ Role: "Creator", userId, addedBy: "BoardCreation" }, ...otherAdmins],
            },
          },
        },
      });
    }),
  createFromTemplate: protectedProcedure
    .input(
      z.object({
        Name: z.string().min(3).max(50),
        workspaceId: z.string(),
        templateId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { Name, workspaceId, templateId } = input;
      const template = await ctx.prisma.board.findUnique({
        where: { id: templateId },
        include: { TaskCategories: true, Lanes: true },
      });
      if (!template)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Template not found",
        });

      const parsedLanes = template.Lanes.map((lane: Partial<Lane>) => {
        delete lane.boardId;
        delete lane.id;
        return lane as Lane;
      });
      const parsedCategories = template.TaskCategories.map((category: Partial<TaskCategory>) => {
        delete category.boardId;
        delete category.id;
        return category as TaskCategory;
      });

      return ctx.prisma.board.create({
        data: {
          Name,
          workspaceId,
          Lanes: { createMany: { data: parsedLanes } },
          TaskCategories: { createMany: { data: parsedCategories } },
          UserBoards: {
            create: {
              userId: ctx.session.user.id,
              Role: "Creator",
              addedBy: "BoardCreation",
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
      // FIXME: only admins can delete boards maybe do a check for that
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

  // TASK CATEGORY
  createTaskCategory: protectedProcedure
    .input(
      z.object({
        boardId: z.string(),
        name: z.string().min(1).max(50),
        color: z.string(),
      })
    )
    .mutation(async ({ ctx, input: { boardId, name, color } }) => {
      return ctx.prisma.taskCategory.create({
        data: { boardId, name, color },
      });
    }),
  updateTaskCategory: protectedProcedure
    .input(
      z.object({
        categoryId: z.string(),
        name: z.string().min(1).max(50),
        color: z.string(),
      })
    )
    .mutation(async ({ ctx, input: { categoryId, name, color } }) => {
      return ctx.prisma.taskCategory.update({
        where: { id: categoryId },
        data: { name, color },
      });
    }),
  deleteTaskCategory: protectedProcedure
    .input(z.object({ categoryId: z.string() }))
    .mutation(async ({ ctx, input: { categoryId } }) => {
      return ctx.prisma.taskCategory.delete({
        where: { id: categoryId },
      });
    }),
  // ----------------
});
