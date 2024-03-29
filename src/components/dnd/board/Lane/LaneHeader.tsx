import { type LaneWithTasks } from "@/components/dnd/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import { trpc } from "@/lib/trpc";
import { BoardRole } from "@prisma/client";
import { TRPCClientError } from "@trpc/client";
import { Trash2 } from "lucide-react";
import { type FC, useRef, useState } from "react";
import toast from "react-hot-toast";
import { AiOutlineEdit } from "react-icons/ai";

interface LaneHeaderProps {
  lane: LaneWithTasks;
  UserBoardRole: BoardRole;
  updateUi: () => void;
}

const LaneHeader: FC<LaneHeaderProps> = ({ lane, UserBoardRole, updateUi }) => {
  const [newLaneName, setNewLaneName] = useState(lane.Name);
  const [laneNameState, setLaneNameState] = useState(lane.Name);
  const [isEditingName, setIsEditingName] = useState(false);

  const { mutateAsync: deleteLane } = trpc.lane.deleteLane.useMutation({
    onSuccess: () => {
      updateUi();
    },
  });

  const { mutate: updateLaneName } = trpc.lane.updateLaneName.useMutation({
    onSuccess: () => {
      setLaneNameState(newLaneName);
      setIsEditingName(false);
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
  const handleEditLaneName = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    updateLaneName({ laneId: lane.id, name: newLaneName });
  };

  const ref = useRef<HTMLFormElement>(null);
  useOnClickOutside(ref, () => {
    setIsEditingName(false);
    setNewLaneName(laneNameState);
  });

  return (
    <div
      className="grid items-center gap-1 p-0.5"
      style={{
        gridTemplateColumns: UserBoardRole === BoardRole.Viewer ? "1fr" : "4fr 1fr",
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
            className="-mt-0.5 h-8 w-full p-1 pr-6 focus-visible:ring-0 focus-visible:ring-offset-0"
            autoFocus
          />
          <Button
            variant={"ghost"}
            size={"sm"}
            className="absolute right-1 top-0 z-20 my-auto w-fit p-[3px] text-[12px]"
          >
            Save
          </Button>
        </form>
      ) : (
        <p className="overflow-hidden text-lg">{laneNameState}</p>
      )}
      {UserBoardRole !== BoardRole.Viewer && (
        <div className="flex items-center">
          <AiOutlineEdit
            size={20}
            className="cursor-pointer"
            onClick={() => setIsEditingName((prev) => !prev)}
          />
          <Trash2
            className="cursor-pointer"
            onClick={() => deleteLane({ laneId: lane.id })}
            size={20}
          />
        </div>
      )}
    </div>
  );
};

export default LaneHeader;
