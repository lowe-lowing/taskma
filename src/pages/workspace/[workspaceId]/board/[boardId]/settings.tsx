import BoardDangerZone from "@/components/BoardDangerZone";
import BoardMember from "@/components/BoardMember";
import { InviteBoardDialogDialog } from "@/components/dialogs/InviteBoardDialog";
import { BoardSettingsForm } from "@/components/forms/BoardSettingsForm";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import BackButton from "@/components/utils/BackButton";
import { BoardContainer } from "@/components/utils/BoardContainer";
import { ssrSession } from "@/lib/ssrSession";
import { trpc } from "@/lib/trpc";
import { KanbanSquare } from "lucide-react";
import { InferGetServerSidePropsType } from "next";
import Head from "next/head";
import { useRouter } from "next/router";

export default function Page({
  data: session,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
  const workspaceId = router.query.workspaceId as string;
  const boardId = router.query.boardId as string;

  const {
    data: board,
    isLoading: boardLoading,
    refetch: refetchBoard,
  } = trpc.board.getBoardById.useQuery({ boardId }, { enabled: !!boardId });

  const {
    data: members,
    isLoading: membersLoading,
    refetch: refetchMembers,
  } = trpc.board.getUsersInBoard.useQuery({ boardId }, { enabled: !!boardId });

  const { data: loggedInUserMembership, isLoading: membershipLoading } =
    trpc.board.getUserMembership.useQuery({ boardId }, { enabled: !!boardId });

  return (
    <>
      <Head>
        <title>Settings</title>
      </Head>
      <Navbar session={session} />
      <main className="pt-1">
        <BoardContainer className="flex items-center justify-between px-1">
          <BackButton href={`/workspace/${workspaceId}/board/${boardId}`} />
          <h2 className="mr-6">
            Board: {board && !boardLoading ? board.Name : "Not found"}
          </h2>
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
        <BoardContainer>
          {/* TODO: add loading skeleton here */}
          {boardLoading || membersLoading || membershipLoading ? (
            <div>Loading...</div>
          ) : board && members && loggedInUserMembership ? (
            <div className="space-y-4">
              <BoardSettingsForm
                board={board}
                userRole={loggedInUserMembership.Role}
                refetchBoard={refetchBoard}
              />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h2>Members</h2>
                  <InviteBoardDialogDialog
                    board={board}
                    refetchMembers={refetchMembers}
                  />
                </div>
                <Separator />
                {members.map((membership) => (
                  <BoardMember
                    key={membership.User.id}
                    membership={membership}
                    session={session}
                    userRole={loggedInUserMembership.Role}
                    refetchMembers={refetchMembers}
                  />
                ))}
              </div>
              <BoardDangerZone
                board={board}
                membership={loggedInUserMembership}
              />
            </div>
          ) : (
            <div>Not Found</div>
          )}
        </BoardContainer>
      </main>
    </>
  );
}

export const getServerSideProps = ssrSession;
