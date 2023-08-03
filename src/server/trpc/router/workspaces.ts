import { WorkspaceSettingsValidationSchema } from "@/components/forms/WorkspaceSettingsForm";
import { WorkspaceRole } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../trpc";

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
  getWorkspacesByUser: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    return await ctx.prisma.workspace.findMany({
      where: { UserWorkspaces: { some: { userId } } },
    });
  }),
  getWorkspacesWithBoardsByUser: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const workspaces = await ctx.prisma.workspace.findMany({
      where: { UserWorkspaces: { some: { userId } } },
      include: {
        Boards: { where: { UserBoards: { some: { userId } } } },
        // UserWorkspaces: true,
      },
    });
    return workspaces;
    // return workspaces.map((workspace) => {
    //   const role = workspace.UserWorkspaces.find(
    //     (userWorkspace) => userWorkspace.userId === userId
    //   )!.Role;
    //   if (role === WorkspaceRole.Member) {
    //     // if role == member only including the boards if the user has a connected UserBoard (aka is a member of the board)
    //     workspace.Boards = workspace.Boards.filter((board) =>
    //       board.UserBoards.find((userBoard) => userBoard.userId === userId)
    //     );
    //   }
    //   return workspace;
    // });
  }),
  createWorkspace: protectedProcedure
    .input(z.object({ name: z.string().min(3).max(50) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.userWorkspace.create({
        data: {
          User: { connect: { id: ctx.session.user.id } },
          Workspace: { create: { name: input.name } },
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
        // FIXME: maybe order by joinedAt or other properties
        orderBy: {
          User: {
            name: "asc",
          },
        },
      });
    }),
  getAdmins: protectedProcedure
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
  updateSettings: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        data: WorkspaceSettingsValidationSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { workspaceId, data } = input;
      return ctx.prisma.workspace.update({
        where: { id: workspaceId },
        data,
      });
    }),
  getMemberShip: protectedProcedure
    .input(z.object({ workspaceId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.userWorkspace.findFirst({
        where: { userId: ctx.session.user.id, workspaceId: input.workspaceId },
      });
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
  // Danger Zone
  deleteWorkspace: protectedProcedure
    .input(z.object({ workspaceId: z.string(), userRole: zodWorkspaceRole }))
    .mutation(async ({ ctx, input }) => {
      const { workspaceId, userRole } = input;
      if (userRole === "Owner") {
        return ctx.prisma.workspace.delete({
          where: { id: workspaceId },
        });
      }
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Only owner can delete workspace",
      });
    }),
  leaveWorkspace: protectedProcedure
    .input(z.object({ userRole: zodWorkspaceRole, membershipId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userRole, membershipId } = input;
      if (userRole === "Owner") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Owner cannot leave workspace",
        });
      }
      return ctx.prisma.userWorkspace.delete({
        where: { id: membershipId },
      });
    }),
  getAdminsByName: protectedProcedure
    .input(z.object({ name: z.string(), workspaceId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { name, workspaceId } = input;
      return ctx.prisma.user.findMany({
        where: {
          name: { contains: name, mode: "insensitive" },
          UserWorkspace: { some: { workspaceId, Role: "Admin" } },
        },
      });
    }),
  transferOwnership: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        userToTransferId: z.string(),
        membershipId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { workspaceId, userToTransferId, membershipId } = input;
      const userWorkspace = await ctx.prisma.userWorkspace.findFirst({
        where: { userId: userToTransferId, workspaceId },
      });
      if (userWorkspace?.Role !== "Admin") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User is not an admin",
        });
      }

      return ctx.prisma.$transaction([
        ctx.prisma.userWorkspace.update({
          where: { id: membershipId },
          data: { Role: "Admin" },
        }),
        ctx.prisma.userWorkspace.update({
          where: { id: userWorkspace?.id },
          data: { Role: "Owner" },
        }),
      ]);
    }),
  // -----------------
});
