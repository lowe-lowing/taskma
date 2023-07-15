import { LaneWithTasks } from "@/components/dnd/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import { trpc } from "@/lib/trpc";
import { TRPCClientError } from "@trpc/client";
import { Trash2 } from "lucide-react";
import { FC, useRef, useState } from "react";
import { DraggableProvided } from "react-beautiful-dnd";
import toast from "react-hot-toast";
import { AiOutlineEdit } from "react-icons/ai";

interface LaneHeaderProps {
  lane: LaneWithTasks;
  provided: DraggableProvided;
  refetchLanes: () => void;
}

const LaneHeader: FC<LaneHeaderProps> = ({ lane, provided, refetchLanes }) => {
  const [newLaneName, setNewLaneName] = useState(lane.Name);
  const [laneNameState, setLaneNameState] = useState(lane.Name);
  const [isEditingName, setIsEditingName] = useState(false);

  const { mutateAsync: deleteLane } = trpc.lane.deleteLane.useMutation();
  const handleDelete = async (laneId: string) => {
    await deleteLane({ laneId });
    refetchLanes();
  };

  const { mutate: updateLaneName } = trpc.lane.updateLaneName.useMutation({
    onSuccess: () => {
      setLaneNameState(newLaneName);
      setIsEditingName(false);
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
  const handleEditLaneName = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    updateLaneName({ laneId: lane.id, name: newLaneName });
  };

  const ref = useRef<HTMLFormElement>(null);
  useOnClickOutside(ref, () => {
    setIsEditingName(false);
    setNewLaneName(laneNameState);
  });

  // FIXME: maybe make this only a form with input
  return (
    <div
      className="grid gap-1 p-1"
      style={{
        gridTemplateColumns: "4fr 1fr",
      }}
    >
      {isEditingName ? (
        <form
          onSubmit={handleEditLaneName}
          aria-label={`${lane.Name} quote list`}
          className="relative"
          ref={ref}
        >
          <Input
            type="text"
            placeholder="Lane Title"
            value={newLaneName}
            onChange={(e) => setNewLaneName(e.target.value)}
            className="-mt-1 h-7 w-40 p-1 pr-12 focus-visible:ring-0 focus-visible:ring-offset-0"
            autoFocus
          />
          <Button
            variant={"ghost"}
            size={"sm"}
            className="absolute bottom-0 right-3 top-0 z-20 my-auto -mt-0.5 w-fit p-[3px] text-[10px]"
          >
            Save
          </Button>
        </form>
      ) : (
        <p className="overflow-hidden text-lg leading-none">{laneNameState}</p>
      )}
      <div className="flex items-start">
        <AiOutlineEdit
          size={20}
          className="cursor-pointer"
          onClick={() => setIsEditingName((prev) => !prev)}
        />
        <Trash2
          className="cursor-pointer"
          onClick={() => handleDelete(lane.id)}
          size={20}
        />
      </div>
    </div>
  );
};

export default LaneHeader;
