import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { TRPCClientError } from "@trpc/client";
import { Plus, X } from "lucide-react";
import { type FC, useRef, useState } from "react";
import toast from "react-hot-toast";
import { type LaneWithTasks } from "../../types";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";

interface AddTaskHandlerProps {
  lane: LaneWithTasks;
  setLanes: React.Dispatch<React.SetStateAction<LaneWithTasks[]>>;
  updateUi: () => void;
}

const AddTaskHandler: FC<AddTaskHandlerProps> = ({ lane, setLanes, updateUi }) => {
  const [newTaskName, setNewTaskName] = useState("");
  const [isCreatingNewTask, setIsCreatingNewTask] = useState(false);

  const { mutateAsync: createTask, isLoading } = trpc.task.createTask.useMutation({
    onSuccess: () => {
      updateUi();
    },
    onError: (error) => {
      if (error instanceof TRPCClientError) {
        if (error.data.httpStatus === 400) {
          const err = JSON.parse(error.message);
          return toast.error(err[0].message);
        }
      }
      toast.error("Something went wrong. Please try again later.");
    },
  });

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLanes((prev) => {
      const newLanes = [...prev];
      const laneIndex = newLanes.findIndex((l) => l.id === lane.id);
      newLanes[laneIndex]?.Tasks.push({
        id: `new_task_${lane.Tasks.length}`,
        Title: newTaskName,
        Order: lane.Tasks.length,
        laneId: lane.id,
        Description: "",
        CreatedAt: new Date(),
        UpdatedAt: new Date(),
        DueDate: null,
        UserTasks: [],
        TaskCategory: null,
        taskCategoryId: null,
        TaskComments: [],
      });
      return newLanes;
    });
    setIsCreatingNewTask(false);
    setNewTaskName("");
    createTask({
      laneId: lane.id,
      title: newTaskName,
      order: lane.Tasks.length,
    });
  };

  const handleClose = () => {
    setIsCreatingNewTask(false);
    setNewTaskName("");
  };

  const ref = useRef<HTMLFormElement>(null);
  useOnClickOutside(ref, handleClose);

  return (
    <div>
      {isCreatingNewTask ? (
        <form
          onSubmit={handleAdd}
          className="relative flex flex-col justify-center gap-1 p-0"
          ref={ref}
        >
          <Input
            type="text"
            placeholder="Add Task"
            value={newTaskName}
            onChange={(e) => setNewTaskName(e.target.value)}
            className="z-10 border-2 pr-16 focus-visible:ring-0 focus-visible:ring-offset-0"
            autoFocus
          />
          <Button
            variant={"ghost"}
            size={"sm"}
            className="absolute bottom-0 right-5 top-0 z-20 my-auto w-fit text-xs "
            isLoading={isLoading}
          >
            Add
          </Button>
          <Button
            size={"sm"}
            variant={"ghost"}
            className="absolute bottom-0 right-1 top-0 z-20 my-auto w-fit cursor-pointer p-0.5 text-xs"
            onClick={handleClose}
          >
            <X size={16} />
          </Button>
        </form>
      ) : (
        <Button size={"sm"} onClick={() => setIsCreatingNewTask(true)}>
          Add Task{" "}
          <span>
            <Plus size={16} />
          </span>
        </Button>
      )}
    </div>
  );
};

export default AddTaskHandler;
