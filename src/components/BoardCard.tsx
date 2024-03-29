import { trpc } from "@/lib/trpc";
import { type Board as PrismaBoard } from "@prisma/client";
import Link from "next/link";
import { type FC } from "react";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";

interface BoardCardProps {
  board: PrismaBoard;
  workspaceId: string;
}

const BoardCard: FC<BoardCardProps> = ({ board, workspaceId }) => {
  const { data: lanes } = trpc.lane.getLanes.useQuery({ boardId: board.id });
  return (
    <Link href={`/workspace/${workspaceId}/board/${board.id}`}>
      <Card className="aspect-video overflow-hidden">
        <CardHeader className="p-1">
          <CardTitle className="flex w-full justify-between">
            <p className="text-xs">{board.Name}</p>
            {board.isPublic && (
              <Badge className="h-fit w-fit bg-green-500 px-1.5 text-[10px]">Public</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-row gap-1 p-0 pl-1">
          {lanes?.map((lane) => (
            <Card
              className={"h-fit w-10 rounded-sm bg-secondary dark:border-gray-700"}
              key={lane.id}
            >
              <CardHeader className="flex h-3 w-10 flex-row items-center p-0">
                <p className="truncate pl-0.5 text-[8px] leading-none">{lane.Name}</p>
              </CardHeader>
              <CardContent className="p-0">
                <Separator className="bg-gray-300 dark:bg-gray-700" />
                <div className="flex flex-col gap-0.5 p-0.5">
                  {lane.Tasks.map((task) => (
                    <div key={task.id} className="flex items-center rounded-sm bg-background p-0.5">
                      <p className="truncate text-[5px] leading-none">{task.Title}</p>
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
