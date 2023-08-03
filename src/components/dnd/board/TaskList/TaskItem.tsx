import EditTaskDialog from "@/components/dialogs/EditTaskDialog";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { Task } from "@prisma/client";
import { Edit, Trash2 } from "lucide-react";
import moment from "moment";
import React from "react";
import { DraggableProvided } from "react-beautiful-dnd";

type TaskItemProps = {
  task: Task;
  isDragging: any;
  isGroupedOver: any;
  provided?: DraggableProvided;
  index: any;
  updateUi: () => void;
};
function TaskItem({
  task,
  isDragging,
  provided,
  index,
  updateUi,
}: TaskItemProps) {
  const { mutateAsync: deleteTask } = trpc.task.deleteTask.useMutation({
    onSuccess: () => {
      updateUi();
    },
  });

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
        </div>
      </div>
    );
  }
}

export default React.memo(TaskItem);

// const CloneBadge = styled.divBox`
//   background: #79f2c0;
//   bottom: ${grid / 2}px;
//   border: 2px solid #57d9a3;
//   border-radius: 50%;
//   box-sizing: border-box;
//   font-size: 10px;
//   position: absolute;
//   right: -${imageSize / 3}px;
//   top: -${imageSize / 3}px;
//   transform: rotate(40deg);
//   height: ${imageSize}px;
//   width: ${imageSize}px;
//   display: flex;
//   justify-content: center;
//   align-items: center;
// `;
