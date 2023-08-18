import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

export const taskRouter = router({
  getTasks: protectedProcedure
    .input(z.object({ laneId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.task.findMany({
        where: { Lane: { id: input.laneId } },
        orderBy: { Order: "asc" },
      });
    }),
  createTask: protectedProcedure
    .input(
      z.object({
        laneId: z.string(),
        order: z.number(),
        title: z
          .string()
          .min(1, "Title must contain at least 1 character")
          .max(100),
      })
    )
    .mutation(async ({ ctx, input: { laneId, order, title } }) => {
      return ctx.prisma.task.create({
        data: { Lane: { connect: { id: laneId } }, Order: order, Title: title },
      });
    }),
  deleteTask: protectedProcedure
    .input(z.object({ taskId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.task.delete({
        where: { id: input.taskId },
      });
    }),
  updateTaskOrderSameLane: protectedProcedure
    .input(
      z.object({
        newTasks: z.array(
          z.object({
            id: z.string(),
            Order: z.number(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.$transaction(
        input.newTasks.map((task) =>
          ctx.prisma.task.update({
            where: { id: task.id },
            data: { Order: task.Order },
          })
        )
      );
    }),
  updateTaskOrderDifferentLane: protectedProcedure
    .input(
      z.object({
        taskToMoveId: z.string(),
        newLaneId: z.string(),
        tasksToUpdate: z.array(
          z.object({
            id: z.string(),
            Order: z.number(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.$transaction([
        // update laneId of taskToMove
        ctx.prisma.task.update({
          where: { id: input.taskToMoveId },
          data: { Lane: { connect: { id: input.newLaneId } } },
        }),
        // update order of all tasks
        ...input.tasksToUpdate.map((task) =>
          ctx.prisma.task.update({
            where: { id: task.id },
            data: { Order: task.Order },
          })
        ),
      ]);
    }),
  editTask: protectedProcedure
    .input(
      z.object({
        taskId: z.string(),
        title: z.string(),
        description: z.string().nullable(),
        dueDate: z.date().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.task.update({
        where: { id: input.taskId },
        data: {
          Title: input.title,
          Description: input.description,
          DueDate: input.dueDate,
        },
      });
    }),
  searchUsersAsignToTask: protectedProcedure
    .input(
      z.object({ name: z.string(), boardId: z.string(), taskId: z.string() })
    )
    .query(async ({ ctx, input }) => {
      const { name, boardId, taskId } = input;
      // find all users in the board but not already assigned to the task
      const users = await ctx.prisma.user.findMany({
        where: {
          name: { contains: name, mode: "insensitive" },
          UserBoards: { some: { boardId } },
          UserTasks: { none: { taskId } },
        },
      });
      return users;
    }),

  addAsignedUser: protectedProcedure
    .input(z.object({ taskId: z.string(), userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { taskId, userId } = input;
      return ctx.prisma.userTask.create({
        data: { taskId, userId },
      });
    }),
  removeAsignedUser: protectedProcedure
    .input(z.object({ taskUserId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.userTask.delete({
        where: { id: input.taskUserId },
      });
    }),
});
