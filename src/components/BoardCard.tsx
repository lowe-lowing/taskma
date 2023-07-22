import { trpc } from "@/lib/trpc";
import { Board as PrismaBoard } from "@prisma/client";
import Link from "next/link";
import { FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";

interface BoardCardProps {
  board: PrismaBoard;
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
        <CardContent className="flex flex-row gap-1 p-0 pl-1">
          {lanes?.map((lane) => (
            <Card
              className={
                "h-fit w-10 rounded-sm bg-secondary dark:border-gray-700"
              }
            >
              <CardHeader className="flex h-3 w-10 flex-row items-center p-0">
                <p className="truncate pl-0.5 text-[8px] leading-none">
                  {lane.Name}
                </p>
              </CardHeader>
              <CardContent className="p-0">
                <Separator className="bg-primary-foreground" />
                <div className="flex flex-col gap-0.5 p-0.5">
                  {lane.Tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center rounded-sm bg-background p-0.5"
                    >
                      <p className="truncate text-[5px] leading-none">
                        {task.Title}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </Link>
  );
};

export default BoardCard;
