import { type DropResult } from "react-beautiful-dnd";
import { type LaneWithTasks } from "./types";

export const reorderLanes = (lanes: LaneWithTasks[], result: DropResult) => {
  const newLanes = [...lanes];
  // removes the column from its current place
  const [laneToMove] = newLanes.splice(result.source.index, 1);
  // adds it to the new destination
  newLanes.splice(result.destination!.index, 0, laneToMove!);
  newLanes.map((col, i) => ({ ...col, Order: i }));
  return newLanes;
};

export const reorderTasksSameLane = (
  lanes: LaneWithTasks[],
  result: DropResult
) => {
  const { source, destination } = result;
  const taskList = [
    ...lanes.find((col) => col.id === source.droppableId)!.Tasks,
  ];
  // removes the task from its current place
  const [taskToMove] = taskList.splice(source.index, 1);
  // adds it to the new destination
  taskList.splice(destination!.index, 0, taskToMove!);
  // updates the Order property of each task
  const updateOrder = taskList.map((task, i) => ({ ...task, Order: i }));
  return updateOrder;
};

export const reorderTasksBetweenLanes = (
  lanes: LaneWithTasks[],
  result: DropResult
) => {
  const { source, destination } = result;
  const currentTaskList = [
    ...lanes.find((col) => col.id === source.droppableId)!.Tasks,
  ];
  const destinationTaskList = [
    ...lanes.find((col) => col.id === destination!.droppableId)!.Tasks,
  ];
  // removes the task from its current place
  const [taskToMove] = currentTaskList.splice(source.index, 1);
  // adds it to the new destination
  destinationTaskList.splice(destination!.index, 0, taskToMove!);
  // updates the Order property of each task in both lists
  const newTasksOrdered = destinationTaskList.map((task, i) => ({
    ...task,
    Order: i,
  }));
  const oldTasksOrdered = currentTaskList.map((task, i) => ({
    ...task,
    Order: i,
  }));
  return { oldTasksOrdered, newTasksOrdered, taskToMove };
};
