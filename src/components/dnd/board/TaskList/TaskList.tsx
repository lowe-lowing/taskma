import { LaneWithTasks, ListType } from "@/components/dnd/types";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Task } from "@prisma/client";
import { Draggable, Droppable } from "react-beautiful-dnd";
import AddTaskHandler from "./AddTaskHandler";
import TaskItem from "./TaskItem";

type TaskListProps = {
  lane: LaneWithTasks;
  tasks: Task[];
  isDraggingLane: boolean;
  ignoreContainerClipping: any;
  isCombineEnabled: any;
  listId: string;
  refetchLanes: () => void;
};

export default function TaskList({
  lane,
  tasks,
  isDraggingLane,
  ignoreContainerClipping,
  isCombineEnabled,
  listId,
  refetchLanes,
}: TaskListProps) {
  return (
    <Droppable
      droppableId={listId}
      type={ListType.TASK}
      ignoreContainerClipping={ignoreContainerClipping}
      isCombineEnabled={isCombineEnabled}
    >
      {(dropProvided, dropSnapshot) => (
        <div
          style={{
            display: "grid",
            gridTemplateRows: "auto 1fr",
          }}
          {...dropProvided.droppableProps}
          ref={dropProvided.innerRef}
          className="h-[calc(100vh-200px)]"
        >
          <Card
            className={cn(
              "w-60 rounded-t-none bg-secondary dark:border-gray-700",
              {
                "bg-green-100 dark:bg-gray-700": isDraggingLane,
              }
            )}
          >
            <CardContent className="p-0">
              <ScrollArea
                className="px-3 pb-3"
                thumbClassName="dark:bg-gray-700"
              >
                <div className="mt-3 flex h-fit max-h-[calc(100vh-200px)] min-h-[3rem] select-none flex-col gap-2">
                  {tasks.map((task, i) => (
                    <Draggable
                      key={task.id}
                      draggableId={task.id as string}
                      index={i}
                    >
                      {(dragProvided, dragSnapshot) => (
                        <TaskItem
                          key={task.id}
                          task={task}
                          isDragging={dragSnapshot.isDragging}
                          isGroupedOver={Boolean(dragSnapshot.combineTargetFor)}
                          provided={dragProvided}
                          index={i}
                          refetchLanes={refetchLanes}
                        />
                      )}
                    </Draggable>
                  ))}
                  {dropProvided.placeholder}
                  <AddTaskHandler lane={lane} refetchLanes={refetchLanes} />
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
          <div className="h-full w-full bg-background pointer-events-none" />
        </div>
      )}
    </Droppable>
  );
}
