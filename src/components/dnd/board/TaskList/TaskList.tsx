import { ListType, type LaneWithTasks } from "@/components/dnd/types";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { BoardRole, type TaskCategory } from "@prisma/client";
import { Draggable, Droppable } from "react-beautiful-dnd";
import AddTaskHandler from "./AddTaskHandler";
import TaskItem from "./TaskItem";

type TaskListProps = {
  lane: LaneWithTasks;
  isDraggingLane: boolean;
  ignoreContainerClipping?: boolean;
  isCombineEnabled: boolean;
  UserBoardRole: BoardRole;
  categories: TaskCategory[];
  setLanes: React.Dispatch<React.SetStateAction<LaneWithTasks[]>>;
  updateUi: () => void;
};

export default function TaskList({
  lane,
  isDraggingLane,
  ignoreContainerClipping,
  isCombineEnabled,
  UserBoardRole,
  categories,
  setLanes,
  updateUi,
}: TaskListProps) {
  const { id: listId, Tasks: tasks } = lane;
  if (UserBoardRole === BoardRole.Viewer) {
    return (
      <div className="h-[calc(100vh-200px)]">
        <Card className="w-60 rounded-t-none bg-secondary dark:border-gray-700">
          <CardContent className="p-0">
            <ScrollArea className="px-2 pb-2" thumbClassName="dark:bg-gray-700">
              <div className="mt-3 flex h-fit max-h-[calc(100vh-200px)] min-h-[1rem] select-none flex-col gap-2">
                {tasks.map((task, i) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    isDragging={false}
                    isGroupedOver={false}
                    index={i}
                    categories={categories}
                    updateUi={updateUi}
                  />
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            className={cn("w-60 rounded-t-none bg-secondary dark:border-gray-700", {
              "bg-green-100 dark:bg-gray-700": isDraggingLane,
            })}
          >
            <CardContent className="p-0">
              <ScrollArea className="px-2 pb-2" thumbClassName="dark:bg-gray-700">
                <div className="mt-3 flex h-fit max-h-[calc(100vh-200px)] min-h-[3rem] select-none flex-col gap-2">
                  {tasks.map((task, i) => (
                    <Draggable key={task.id} draggableId={task.id as string} index={i}>
                      {(dragProvided, dragSnapshot) => (
                        <TaskItem
                          key={task.id}
                          task={task}
                          isDragging={dragSnapshot.isDragging}
                          isGroupedOver={Boolean(dragSnapshot.combineTargetFor)}
                          provided={dragProvided}
                          index={i}
                          categories={categories}
                          updateUi={updateUi}
                          setLanes={setLanes}
                        />
                      )}
                    </Draggable>
                  ))}
                  {dropProvided.placeholder}
                  <AddTaskHandler lane={lane} setLanes={setLanes} updateUi={updateUi} />
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
          <div className="pointer-events-none -z-50 h-full w-full bg-transparent" />
        </div>
      )}
    </Droppable>
  );
}
