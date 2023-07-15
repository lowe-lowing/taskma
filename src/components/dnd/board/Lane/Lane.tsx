import { Card, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Draggable } from "react-beautiful-dnd";
import { LaneWithTasks } from "../../types";
import TaskList from "../TaskList/TaskList";
import LaneHeader from "./LaneHeader";

type LaneProps = {
  lane: LaneWithTasks;
  index: any;
  isCombineEnabled: any;
  refetchLanes: () => void;
};

const Lane = ({ lane, index, isCombineEnabled, refetchLanes }: LaneProps) => {
  return (
    <Draggable draggableId={lane.id} index={index}>
      {(provided, snapshot) => (
        <div ref={provided.innerRef} {...provided.draggableProps}>
          <Card
            className={cn(
              "mb-0 w-60 rounded-b-none bg-secondary dark:border-gray-700",
              {
                "bg-green-100 dark:bg-gray-700": snapshot.isDragging,
              }
            )}
            {...provided.dragHandleProps}
          >
            <CardHeader className="px-2 py-1">
              <LaneHeader
                lane={lane}
                provided={provided}
                refetchLanes={refetchLanes}
              />
            </CardHeader>
          </Card>
          <TaskList
            lane={lane}
            tasks={lane.Tasks}
            isDraggingLane={snapshot.isDragging}
            listId={lane.id}
            isCombineEnabled={Boolean(isCombineEnabled)}
            ignoreContainerClipping={undefined}
            refetchLanes={refetchLanes}
          />
        </div>
      )}
    </Draggable>
  );
};

export default Lane;
