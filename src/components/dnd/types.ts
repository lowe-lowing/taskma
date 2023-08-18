import type { Prisma } from "@prisma/client";

export type FullTask = Prisma.TaskGetPayload<{
  include: {
    UserTasks: { include: { User: true } };
  };
}>;

export type LaneWithTasks = Prisma.LaneGetPayload<{
  include: {
    Tasks: {
      include: { UserTasks: true };
    };
  };
}>;

export enum ListType {
  LANE = "lane",
  TASK = "task",
}
