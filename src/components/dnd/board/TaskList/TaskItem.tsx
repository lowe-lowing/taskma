import EditTaskDialog from "@/components/dialogs/EditTaskDialog";
import { Button } from "@/components/ui/button";
import UserAvatar from "@/components/UserAvatar";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { type Task } from "@prisma/client";
import { Edit, Loader2, Trash2 } from "lucide-react";
import moment from "moment";
import React from "react";
import { type DraggableProvided } from "react-beautiful-dnd";
import { toast } from "react-hot-toast";
import { FullTask } from "../../types";

type TaskItemProps = {
  task: FullTask;
  isDragging: boolean;
  isGroupedOver: boolean;
  provided?: DraggableProvided;
  index: number;
  updateUi: () => void;
};
function TaskItem({
  task,
  isDragging,
  provided,
  index,
  updateUi,
}: TaskItemProps) {
  const { mutate: deleteTask } = trpc.task.deleteTask.useMutation({
    onSuccess: () => {
      updateUi();
    },
  });

  const { mutate: addAsignedUser, isLoading } =
    trpc.task.addAsignedUser.useMutation({
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
      <div
        className={cn(
          "box-border flex select-none rounded-lg border-transparent bg-background p-2",
          {
            "bg-green-100 shadow-md dark:bg-gray-700": isDragging,
          }
        )}
        data-is-dragging={isDragging}
        data-testid={task.id}
        data-index={index}
      >
        <div className="flex flex-grow basis-full flex-col">
          <p className="overflow-hidden">{task.Title}</p>
          {task.DueDate && (
            <p className="text-xs text-gray-500">
              Due Date: {moment(task.DueDate).format("MMM Do")}
            </p>
          )}
        </div>
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
        <div className="flex flex-grow basis-full flex-col">
          <div
            className="grid gap-1"
            style={{
              gridTemplateColumns: "4fr 1fr",
            }}
          >
            <p className="overflow-hidden">{task.Title}</p>
            <div className="flex items-start">
              <EditTaskDialog
                updateUi={updateUi}
                task={task}
                trigger={
                  <Button variant={"ghost"} size={"sm"} className="p-1">
                    <Edit size={20} />
                  </Button>
                }
              />
              <Button
                variant={"ghost"}
                size={"sm"}
                className="p-1"
                onClick={() => deleteTask({ taskId: task.id })}
              >
                <Trash2 size={20} />
              </Button>
            </div>
          </div>
          {task.DueDate && (
            <p className="text-xs text-gray-500">
              Due Date: {moment(task.DueDate).format("MMM Do")}
            </p>
          )}
          <div className="flex gap-0.5">
            {task.UserTasks.map((userTask) => (
              <UserAvatar
                key={userTask.id}
                user={userTask.User}
                className="h-6 w-6"
              />
            ))}
            {isLoading && <Loader2 className="h-6 w-6 animate-spin" />}
          </div>
        </div>
      </div>
    );
  }
}

export default React.memo(TaskItem);
