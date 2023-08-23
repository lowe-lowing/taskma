import type { Prisma } from "@prisma/client";

export type FullTask = Prisma.TaskGetPayload<{
  include: {
    UserTasks: { include: { User: true } };
    TaskCategory: true;
    TaskComments: { include: { User: true } };
  };
}>;

export type LaneWithTasks = Prisma.LaneGetPayload<{
  include: {
    Tasks: {
      include: {
        UserTasks: { include: { User: true } };
        TaskCategory: true;
        TaskComments: { include: { User: true } };
      };
    };
  };
}>;

export type FullBoard = Prisma.BoardGetPayload<{
  include: {
    TaskCategories: true;
    UserBoards: { include: { User: true } };
    Lanes: {
      include: {
        Tasks: {
          include: {
            UserTasks: { include: { User: true } };
            TaskCategory: true;
            TaskComments: { include: { User: true } };
          };
        };
      };
    };
  };
}>;

export enum ListType {
  LANE = "lane",
  TASK = "task",
}
