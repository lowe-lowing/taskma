import EditTaskDialog from "@/components/dialogs/EditTaskDialog/EditTaskDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import UserAvatar from "@/components/UserAvatar";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import type { TaskCategory } from "@prisma/client";
import { Edit, Loader2, Trash2 } from "lucide-react";
import moment from "moment";
import React, { type FC } from "react";
import { type DraggableProvided } from "react-beautiful-dnd";
import { toast } from "react-hot-toast";
import type { FullTask, LaneWithTasks } from "../../types";

type TaskItemProps = {
  task: FullTask;
  isDragging: boolean;
  isGroupedOver: boolean;
  provided?: DraggableProvided;
  index: number;
  categories: TaskCategory[];
  updateUi: () => void;
  setLanes?: React.Dispatch<React.SetStateAction<LaneWithTasks[]>>;
};

function TaskItem({
  task,
  isDragging,
  provided,
  index,
  categories,
  updateUi,
  setLanes,
}: TaskItemProps) {
  const { mutate: deleteTask } = trpc.task.deleteTask.useMutation({
    onMutate: ({ taskId }) => {
      setLanes?.((prev) => {
        const newLanes = [...prev];
        const laneIndex = newLanes.findIndex((lane) => lane.id === task.laneId);
        const taskIndex = newLanes[laneIndex]!.Tasks.findIndex((t) => t.id === taskId);
        newLanes[laneIndex]!.Tasks.splice(taskIndex, 1);
        return newLanes;
      });
    },
    onSuccess: () => {
      updateUi();
    },
  });

  const { mutate: addAsignedUser, isLoading } = trpc.task.addAsignedUser.useMutation({
    onSuccess: () => {
      updateUi();
    },
    onError: () => {
      toast.error("Something went wrong, please try again later.");
    },
  });

  function allowDrop(ev: React.DragEvent<HTMLDivElement>) {
    ev.preventDefault();
  }

  function drop(ev: React.DragEvent<HTMLDivElement>, id: string) {
    const userId = ev.dataTransfer.getData("userId");
    addAsignedUser({ taskId: id, userId });
    ev.preventDefault();
  }

  if (!provided) {
    return (
      <div className="box-border flex select-none rounded-lg border-transparent bg-background p-2">
        <Task task={task} isLoading={isLoading} viewOnly />
      </div>
    );
  } else {
    return (
      <div
        className={cn(
          "box-border flex select-none rounded-lg border-transparent bg-background p-2",
          {
            "bg-green-100 shadow-md dark:bg-gray-700": isDragging,
          }
        )}
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        data-is-dragging={isDragging}
        data-testid={task.id}
        data-index={index}
        onDrop={(e) => drop(e, task.id)}
        onDragOver={(e) => allowDrop(e)}
      >
        <Task
          viewOnly={false}
          task={task}
          isLoading={isLoading}
          categories={categories}
          deleteTask={deleteTask}
          updateUi={updateUi}
        />
      </div>
    );
  }
}

export default React.memo(TaskItem);

type TaskUnionProps =
  | {
      viewOnly: true;
      task: FullTask;
      isLoading: boolean;
    }
  | {
      viewOnly: false;
      task: FullTask;
      isLoading: boolean;
      categories: TaskCategory[];
      updateUi: () => void;
      deleteTask: ({ taskId }: { taskId: string }) => void;
    };

const Task: FC<TaskUnionProps> = (props) => {
  const { viewOnly, task, isLoading } = props;
  return (
    <div className="flex flex-grow basis-full flex-col">
      <div
        className="grid gap-1"
        style={{
          gridTemplateColumns: viewOnly ? "1fr" : "4fr 1fr",
        }}
      >
        <p className="overflow-hidden text-[0.9rem] leading-6">{task.Title}</p>
        {!viewOnly && (
          <div className="flex items-start">
            <EditTaskDialog
              updateUi={props.updateUi}
              task={task}
              categories={props.categories}
              trigger={
                <Button variant={"ghost"} size={"sm"} className="p-1">
                  <Edit size={20} />
                </Button>
              }
            />
            <Button
              variant={"ghost"}
              size={"sm"}
              className="p-1 hover:text-destructive dark:hover:text-red-700"
              onClick={() => props.deleteTask({ taskId: task.id })}
            >
              <Trash2 size={20} />
            </Button>
          </div>
        )}
      </div>
      <div className="space-y-1">
        {task.TaskCategory && (
          <Badge className={`w-fit`} style={{ backgroundColor: task.TaskCategory.color }}>
            {task.TaskCategory.name}
          </Badge>
        )}
        {task.DueDate && (
          <p className="text-xs">Due Date: {moment(task.DueDate).format("MMM Do")}</p>
        )}
        {task.UserTasks.length > 0 && (
          <div className="flex gap-0.5">
            {task.UserTasks.map((userTask) => (
              <UserAvatar key={userTask.id} user={userTask.User} className="h-6 w-6" />
            ))}
            {isLoading && <Loader2 className="h-6 w-6 animate-spin" />}
          </div>
        )}
      </div>
    </div>
  );
};
