import { usePusher } from "@/hooks/usePusher";
import { trpc } from "@/lib/trpc";
import { UpdateUiPusherResponse } from "@/server/trpc/router/pusher";
import { BoardRole } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { DragDropContext, Droppable, type DropResult } from "react-beautiful-dnd";
import { reorderLanes, reorderTasksBetweenLanes, reorderTasksSameLane } from "../reorder";
import { FullBoard, ListType, type LaneWithTasks } from "../types";
import AddLaneHandler from "./Lane/AddLaneHandler";
import Lane from "./Lane/Lane";

type BoardProps = {
  board: FullBoard;
  isCombineEnabled: boolean;
  containerHeight: number;
  UserBoardRole: BoardRole;
  refetchLanes: () => void;
};

const Board = ({
  board: { Lanes: initial, id: boardId, TaskCategories },
  isCombineEnabled,
  containerHeight,
  UserBoardRole,
  refetchLanes,
}: BoardProps) => {
  const [lanes, setLanes] = useState(initial);
  // if using refetchLanes the state will also update
  useEffect(() => {
    if (!initial) return;
    setLanes(initial);
  }, [initial]);

  const { data: session } = useSession();
  usePusher<UpdateUiPusherResponse>(boardId, "board-update-ui", (data) => {
    if (data.userId === session?.user?.id) return;
    refetchLanes();
  });

  const { mutate: updateLaneOrder } = trpc.lane.updateLaneOrder.useMutation({
    onSuccess: () => {
      updateBoardUi({ boardId });
    },
  });

  const { mutate: updateTaskOrderSameLane } = trpc.task.updateTaskOrderSameLane.useMutation({
    onSuccess: () => {
      updateBoardUi({ boardId });
    },
  });

  const { mutate: updateTaskOrderDifferentLane } =
    trpc.task.updateTaskOrderDifferentLane.useMutation({
      onSuccess: () => {
        updateBoardUi({ boardId });
      },
    });

  const { mutate: updateBoardUi } = trpc.pusher.updateBoardUi.useMutation();

  const updateUi = () => {
    refetchLanes();
    updateBoardUi({ boardId });
  };

  const onDragEnd = (result: DropResult) => {
    // dropped nowhere
    if (!result.destination) {
      return;
    }

    const source = result.source;
    const destination = result.destination;

    // did not move anywhere - can bail early
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    // if a lane is moved
    if (result.type === ListType.LANE) {
      const newLanes = reorderLanes(lanes, result);
      setLanes(newLanes);
      updateLaneOrder({ newLanes: newLanes });
    }
    // if a task is moved
    else if (result.type === ListType.TASK) {
      // moving to same list
      if (source.droppableId === destination.droppableId) {
        const taskList = reorderTasksSameLane(lanes, result);
        setLanes((prev) =>
          prev.map((lane) => (lane.id === source.droppableId ? { ...lane, Tasks: taskList } : lane))
        );
        updateTaskOrderSameLane({ newTasks: taskList });
      }

      // moving to different list
      if (source.droppableId !== destination.droppableId) {
        const { oldTasksOrdered, newTasksOrdered, taskToMove } = reorderTasksBetweenLanes(
          lanes,
          result
        );
        setLanes((prev) =>
          prev.map((lane) => {
            if (lane.id === source.droppableId) {
              return { ...lane, Tasks: oldTasksOrdered };
            }
            if (lane.id === destination.droppableId) {
              return { ...lane, Tasks: newTasksOrdered };
            }
            return lane;
          })
        );

        updateTaskOrderDifferentLane({
          newLaneId: destination.droppableId,
          tasksToUpdate: [...oldTasksOrdered, ...newTasksOrdered],
          taskToMoveId: taskToMove!.id,
        });
      }
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex h-full w-screen gap-2 overflow-x-auto p-2 px-4">
        {UserBoardRole !== BoardRole.Viewer ? (
          <>
            <Droppable
              droppableId="board"
              type={ListType.LANE}
              direction="horizontal"
              ignoreContainerClipping={Boolean(containerHeight)}
              isCombineEnabled={isCombineEnabled}
            >
              {(provided) => (
                <div
                  className="ml-auto flex gap-2"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {lanes.map((lane, index) => (
                    <Lane
                      key={lane.id}
                      lane={lane}
                      index={index}
                      UserBoardRole={UserBoardRole}
                      categories={TaskCategories}
                      setLanes={setLanes}
                      updateUi={updateUi}
                    />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
            <AddLaneHandler
              boardId={boardId}
              lanesLength={initial.length}
              setLanes={setLanes}
              updateUi={updateUi}
            />
          </>
        ) : (
          <div className="mx-auto flex gap-2">
            {lanes.map((lane, index) => (
              <Lane
                key={lane.id}
                lane={lane}
                index={index}
                UserBoardRole={UserBoardRole}
                categories={TaskCategories}
                setLanes={setLanes}
                updateUi={updateUi}
              />
            ))}
          </div>
        )}
      </div>
    </DragDropContext>
  );
};

export default Board;
