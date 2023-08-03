import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Plus, X } from "lucide-react";
import { FC, useState } from "react";
import { LaneWithTasks } from "../../types";

interface AddLaneHandlerProps {
  boardId: string;
  lanesLength: number;
  setLanes: React.Dispatch<React.SetStateAction<LaneWithTasks[]>>;
  updateUi: () => void;
}

const AddLaneHandler: FC<AddLaneHandlerProps> = ({
  boardId,
  lanesLength,
  setLanes,
  updateUi,
}) => {
  const [newLaneName, setNewLaneName] = useState("");
  const [isCreatingNewLane, setIsCreatingNewLane] = useState(false);

  const { mutateAsync: createLane, isLoading } =
    trpc.lane.createLane.useMutation({
      onSuccess: () => {
        updateUi();
      },
    });

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLanes((prev) => [
      ...prev,
      {
        id: `new_lane_${lanesLength}`,
        Name: newLaneName,
        Tasks: [],
        Order: lanesLength,
        boardId: boardId,
      },
    ]);
    setIsCreatingNewLane(false);
    setNewLaneName("");
    createLane({
      boardId: boardId,
      name: newLaneName,
      order: lanesLength,
    });
  };

  const handleClose = () => {
    setIsCreatingNewLane(false);
    setNewLaneName("");
  };

  return (
    <div className="mr-auto">
      {isCreatingNewLane ? (
        <form
          onSubmit={handleAdd}
          className="relative flex w-48 flex-col justify-center gap-1 p-0"
        >
          <Input
            type="text"
            placeholder="Add Lane"
            value={newLaneName}
            onChange={(e) => setNewLaneName(e.target.value)}
            className="z-10 border-2 pr-16 focus-visible:ring-0 focus-visible:ring-offset-0"
            autoFocus
          />
          <Button
            size={"sm"}
            className="absolute bottom-0 right-5 top-0 z-20 my-auto w-fit text-xs "
            isLoading={isLoading}
          >
            Add
          </Button>
          <X
            size={16}
            className="absolute bottom-0 right-1 top-0 z-20 my-auto w-fit cursor-pointer text-xs"
            onClick={handleClose}
          />
        </form>
      ) : (
        <Button
          size={"md"}
          onClick={() => setIsCreatingNewLane(true)}
          className="whitespace-nowrap"
        >
          Add Lane{" "}
          <span>
            <Plus size={16} />
          </span>
        </Button>
      )}
    </div>
  );
};

export default AddLaneHandler;
