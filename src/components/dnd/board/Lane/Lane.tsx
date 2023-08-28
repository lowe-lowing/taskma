import { Card, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { BoardRole, type TaskCategory } from "@prisma/client";
import { Draggable } from "react-beautiful-dnd";
import { type LaneWithTasks } from "../../types";
import TaskList from "../TaskList/TaskList";
import LaneHeader from "./LaneHeader";

type LaneProps = {
  lane: LaneWithTasks;
  index: number;
  UserBoardRole: BoardRole;
  categories: TaskCategory[];
  setLanes: React.Dispatch<React.SetStateAction<LaneWithTasks[]>>;
  updateUi: () => void;
};

const Lane = ({ lane, index, UserBoardRole, categories, setLanes, updateUi }: LaneProps) => {
  if (UserBoardRole === BoardRole.Viewer) {
    return (
      <div className="relative">
        <Card className="mb-0 w-60 rounded-b-none bg-secondary dark:border-gray-700">
          <CardHeader className="px-2 py-1">
            <LaneHeader lane={lane} UserBoardRole={UserBoardRole} updateUi={updateUi} />
          </CardHeader>
        </Card>
        <TaskList
          lane={lane}
          isDraggingLane={false}
          isCombineEnabled={false}
          UserBoardRole={UserBoardRole}
          categories={categories}
          setLanes={setLanes}
          updateUi={updateUi}
        />
      </div>
    );
  }
  return (
    <Draggable draggableId={lane.id} index={index}>
      {(provided, snapshot) => (
        <div ref={provided.innerRef} {...provided.draggableProps} className="relative">
          <Card
            className={cn("mb-0 w-60 rounded-b-none bg-secondary dark:border-gray-700", {
              "bg-green-100 dark:bg-gray-700": snapshot.isDragging,
            })}
            {...provided.dragHandleProps}
          >
            <CardHeader className="px-2 py-1">
              <LaneHeader lane={lane} UserBoardRole={UserBoardRole} updateUi={updateUi} />
            </CardHeader>
          </Card>
          <TaskList
            lane={lane}
            isDraggingLane={snapshot.isDragging}
            isCombineEnabled={false}
            UserBoardRole={UserBoardRole}
            categories={categories}
            setLanes={setLanes}
            updateUi={updateUi}
          />
        </div>
      )}
    </Draggable>
  );
};

export default Lane;
