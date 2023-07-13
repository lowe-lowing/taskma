import { LaneWithTasks } from "@/components/dnd/types";
import { z } from "zod";
import { protectedProcedure, router } from "../trpc";

export type OriginalData = Array<LaneWithTasks>;

export const laneRouter = router({
  getLanes: protectedProcedure
    .input(z.object({ boardId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.lane.findMany({
        where: { boardId: input.boardId },
        orderBy: { Order: "asc" },
        include: {
          Tasks: { orderBy: { Order: "asc" } },
        },
      });
    }),
  createLane: protectedProcedure
    .input(
      z.object({ boardId: z.string(), name: z.string(), order: z.number() })
    )
    .mutation(async ({ ctx, input }) => {
      const { boardId, name, order } = input;
      return ctx.prisma.lane.create({
        data: {
          Board: { connect: { id: boardId } },
          Name: name,
          Order: order,
        },
      });
    }),
  deleteLane: protectedProcedure
    .input(z.object({ laneId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.lane.delete({
        where: { id: input.laneId },
      });
    }),
  updateLaneName: protectedProcedure
    .input(
      z.object({
        laneId: z.string(),
        name: z
          .string()
          .min(1, "Title must contain at least 1 character")
          .max(30),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.lane.update({
        where: { id: input.laneId },
        data: { Name: input.name },
      });
    }),
  updateLaneOrder: protectedProcedure
    .input(
      z.object({
        newLanes: z.array(
          z.object({
            id: z.string(),
            Order: z.number(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.$transaction(
        input.newLanes.map((lane, i) =>
          ctx.prisma.lane.update({
            where: { id: lane.id },
            data: { Order: i },
          })
        )
      );
    }),
});
