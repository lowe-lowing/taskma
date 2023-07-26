import { InviteBoardDialogDialog } from "@/components/dialogs/InviteBoardDialog";
import BoardRoleDropdown from "@/components/dropdowns/BoardRoleDropdown";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import UserAvatar from "@/components/UserAvatar";
import BackButton from "@/components/utils/BackButton";
import { BoardContainer } from "@/components/utils/BoardContainer";
import { ssrSession } from "@/lib/ssrSession";
import { trpc } from "@/lib/trpc";
import { BoardRoleType } from "@/server/trpc/router/boards";
import { KanbanSquare, Plus } from "lucide-react";
import { InferGetServerSidePropsType } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Page({
  data: session,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
  const workspaceId = router.query.workspaceId as string;
  const boardId = router.query.boardId as string;

  const { data: board, isLoading } = trpc.board.getBoardById.useQuery(
    { boardId },
    { enabled: !!boardId }
  );
  const { data: members, refetch: refetchMembers } =
    trpc.board.getUsersInBoard.useQuery({ boardId }, { enabled: !!boardId });

  // let loggedInUserRole: BoardRoleType = "Editor";
  // useEffect(() => {
  //   if (members) {
  //     loggedInUserRole = members.find(
  //       (member) => member.User.id === session?.user?.id
  //     )!.Role;
  //   }
  // }, [members]);
  const { data: loggedInUserRole } = trpc.board.getUserRole.useQuery(
    { boardId },
    { enabled: !!workspaceId }
  );

  // TODO: better handling of this
  // if (isLoading) return <div>Loading...</div>;
  // if (!board) return <div>Not Found</div>;

  return (
    <>
      <Head>
        <title>Settings</title>
      </Head>
      <Navbar session={session} />
      <main className="pt-1">
        <BoardContainer className="flex items-center justify-between px-1">
          <BackButton href={`/workspace/${workspaceId}/board/${boardId}`} />
          <h2>Board: {board ? board.Name : "Not found"}</h2>
          <Button
            variant={"ghost"}
            size={"sm"}
            className="p-1"
            onClick={() => router.push(location.href.replace("/settings", ""))}
          >
            <KanbanSquare size={20} />
          </Button>
        </BoardContainer>
        <Separator className="my-1" />
        <BoardContainer className="flex flex-col gap-4">
          {board ? (
            <>
              <div>
                <Label htmlFor="title">Title</Label>
                {/* <Input id="title" placeholder="Title" value={board?.Name} /> */}
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
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <h2>Members</h2>
                  <InviteBoardDialogDialog
                    board={board}
                    refetchMembers={refetchMembers}
                  />
                </div>
                <Separator />
                {members?.map(({ User, Role, id: memberShipId }) => {
                  const isLoggedInUser = User.id === session?.user?.id;
                  return (
                    <div key={User.id}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <UserAvatar
                            user={{
                              name: User.name || null,
                              image: User.image || null,
                            }}
                            className="h-8 w-8 sm:h-6 sm:w-6"
                          />
                          <div className="flex flex-col space-y-1 leading-none">
                            <p className="font-medium">
                              {User.name} {isLoggedInUser && "(you)"}
                            </p>
                            <p className="w-[200px] truncate text-sm">
                              {User.email}
                            </p>
                          </div>
                        </div>
                        {loggedInUserRole === "Editor" ||
                        loggedInUserRole === "Viewer" ||
                        isLoggedInUser ||
                        Role === "Creator" ? (
                          <p>{Role}</p>
                        ) : (
                          <BoardRoleDropdown
                            memberShipId={memberShipId}
                            initialRole={Role}
                            refetchMembers={refetchMembers}
                          />
                        )}
                      </div>
                      <Separator className="mt-2" />
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div>Not Found</div>
          )}
        </BoardContainer>
      </main>
    </>
  );
}

export const getServerSideProps = ssrSession;
