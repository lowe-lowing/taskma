import React from "react";
import { WorkspaceButtonsRow } from "../BoardsView";
import { Skeleton } from "../ui/skeleton";
import { Separator } from "../ui/separator";
import { Card } from "../ui/card";
import { KanbanSquare, Users, Settings } from "lucide-react";
import { Button } from "../ui/button";

const BoardsViewSkeleton = () => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between gap-4">
        <Skeleton className="max-w-1/2 h-6 w-full rounded-md" />
        <div className="flex gap-1">
          <Skeleton>
            <Button
              variant={"secondary"}
              size={"sm"}
              className="gap-0.5 text-xs"
            >
              <KanbanSquare size={12} />
              Boards
            </Button>
          </Skeleton>
          <Skeleton>
            <Button
              variant={"secondary"}
              size={"sm"}
              className="gap-0.5 text-xs"
            >
              <Users size={12} />
              Members
            </Button>
          </Skeleton>
          <Skeleton>
            <Button
              variant={"secondary"}
              size={"sm"}
              className="gap-0.5 text-xs"
            >
              <Settings size={12} />
              Settings
            </Button>
          </Skeleton>
        </div>
      </div>
      <Separator />
      <div className="grid h-fit grid-cols-3 gap-1">
        <Card className="aspect-video">
          <Skeleton className="h-full w-full" />
        </Card>
        <Card className="aspect-video">
          <Skeleton className="h-full w-full" />
        </Card>
        <Card className="aspect-video">
          <Skeleton className="h-full w-full" />
        </Card>
      </div>
    </div>
  );
};

export default BoardsViewSkeleton;
