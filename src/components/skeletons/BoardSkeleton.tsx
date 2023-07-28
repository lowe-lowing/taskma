import { Settings } from "lucide-react";
import router from "next/router";
import React from "react";
import BackButton from "../utils/BackButton";
import { BoardContainer } from "../utils/BoardContainer";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";

const BoardSkeleton = ({ workspaceId }: { workspaceId: string }) => {
  return (
    <>
      <BoardContainer className="flex items-center justify-between gap-5 px-1">
        <BackButton href={`/workspace/${workspaceId}/boards`} />
        <Skeleton className="h-full w-full" />
        <Button
          variant={"ghost"}
          size={"sm"}
          className="p-1"
          onClick={() => router.push(`${location.href}/settings`)}
        >
          <Settings size={20} />
        </Button>
      </BoardContainer>
      <Separator className="my-1" />
    </>
  );
};

export default BoardSkeleton;
