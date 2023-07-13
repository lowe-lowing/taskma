import { trpc } from "@/lib/trpc";
import { Board } from "@prisma/client";
import Link from "next/link";
import { FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface BoardCardProps {
  board: Board;
  workspaceId: string;
}

// TODO: Make this look like the real boards
const BoardCard: FC<BoardCardProps> = ({ board, workspaceId }) => {
  const { data: lanes } = trpc.lane.getLanes.useQuery({ boardId: board.id });
  return (
    <Link href={`/workspace/${workspaceId}/board/${board.id}`}>
      <Card className="aspect-video overflow-hidden">
        <CardHeader className="p-1">
          <CardTitle className="text-xs">{board.Name}</CardTitle>
        </CardHeader>
        <CardContent className="p-0 pl-1">
          <div className="flex flex-row gap-0.5">
            {lanes?.map((lane) => (
              <div key={lane.id} className="flex flex-col gap-0.5">
                <div className="h-1 w-4 bg-secondary" />
                {lane.Tasks.map((task) => (
                  <div key={task.id} className="h-2 w-4 bg-secondary" />
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default BoardCard;
