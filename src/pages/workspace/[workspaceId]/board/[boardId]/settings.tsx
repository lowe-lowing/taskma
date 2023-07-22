import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import UserAvatar from "@/components/UserAvatar";
import BackButton from "@/components/utils/BackButton";
import { trpc } from "@/lib/trpc";
import { KanbanSquare, Settings } from "lucide-react";
import Head from "next/head";
import { useRouter } from "next/router";
import { FC } from "react";

const settings: FC = () => {
  const router = useRouter();
  const boardId = router.query.boardId as string;

  const { data: board } = trpc.board.getBoardById.useQuery(
    {
      boardId,
    },
    { enabled: !!boardId }
  );
  const workspaceId = useRouter().query.workspaceId as string;
  const { data: members } = trpc.workspace.getUsersInWorkspace.useQuery({
    workspaceId,
  });
  return (
    <>
      <Head>
        <title>Settings</title>
      </Head>
      <main className="pt-1">
        <div className="mx-auto flex w-[90%] items-center justify-between px-1 sm:w-[70%] md:w-[50%]">
          <BackButton />
          <h2>Board: {board?.Name}</h2>
          <Button
            variant={"ghost"}
            size={"sm"}
            className="p-1"
            onClick={() => router.push(location.href.replace("/settings", ""))}
          >
            <KanbanSquare size={20} />
          </Button>
        </div>
        <Separator className="my-1" />
        <div className="mx-auto flex w-[90%] flex-col gap-4 sm:w-[70%] md:w-[50%]">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="Title" value={board?.Name} />
          </div>
          <div className="items-top flex space-x-2">
            <Checkbox id="terms1" />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="terms1"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Accessable to all workspace members
              </label>
              <p className="text-sm text-muted-foreground">
                "{board?.Name}" will be accessable to all workspace members
              </p>
            </div>
          </div>
          <h2>Members</h2>
          <Separator className="my-1" />
          {members?.map((user) => (
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <UserAvatar
                  user={{
                    name: user.name || null,
                    image: user.image || null,
                  }}
                  className="h-8 w-8 sm:h-6 sm:w-6"
                />
                <div className="flex flex-col space-y-1 leading-none">
                  {user.name && <p className="font-medium">{user.name}</p>}
                  {user.email && (
                    <p className="w-[200px] truncate text-sm">{user.email}</p>
                  )}
                </div>
              </div>
              {/* TODO: here it maybe would be easier to get the userBoards, which means i need to refactor backend code and create a userBoard for every user that has access to the board  */}
              {/* <div>{user.UserWorkspace}</div> */}
            </div>
          ))}
        </div>
      </main>
    </>
  );
};

export default settings;
