import { Lane, Task } from "@prisma/client";

export interface LaneWithTasks extends Lane {
  Tasks: Task[];
}

export enum ListType {
  LANE = "lane",
  TASK = "task",
}
