import Board from "@/components/dnd/board/Board";
import Navbar from "@/components/Navbar";
import BoardSkeleton from "@/components/skeletons/BoardSkeleton";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import UserAvatar from "@/components/UserAvatar";
import BackButton from "@/components/utils/BackButton";
import { BoardContainer } from "@/components/utils/BoardContainer";
import { ssrSession } from "@/lib/ssrSession";
import { trpc } from "@/lib/trpc";
import { Settings } from "lucide-react";
import { type InferGetServerSidePropsType } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

export default function Page({
  data: session,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
  const boardId = router.query.boardId as string;
  const workspaceId = router.query.workspaceId as string;

  const {
    data: board,
    refetch: refetchLanes,
    isLoading,
    error,
  } = trpc.board.getBoardFull.useQuery(
    { boardId },
    {
      enabled: !!boardId,
      refetchOnWindowFocus: false,
      retry(failureCount, error) {
        if (error?.data?.code === "UNAUTHORIZED") return false;
        return true;
      },
    }
  );

  const { data: loggedInUserMembership, isLoading: membershipLoading } =
    trpc.board.getUserMembership.useQuery({ boardId }, { enabled: !!boardId });

  function drag(ev: React.DragEvent<HTMLSpanElement>, userId: string) {
    ev.dataTransfer.setData("userId", userId);
  }

  return (
    <>
      <Head>
        <title>{board?.Name}</title>
      </Head>
      <Navbar session={session} />
      <main className="relative flex h-[calc(100dvh-50px)] flex-col items-center overflow-x-hidden pt-1 sm:h-[calc(100dvh-42px)]">
        {isLoading || membershipLoading ? (
          <BoardSkeleton workspaceId={workspaceId} />
        ) : (board && loggedInUserMembership) || (board && board.isPublic) ? (
          <>
            <BoardContainer className="flex items-center justify-between px-0 sm:px-1">
              <BackButton href={`/workspace/${workspaceId}/boards`} />
              <h2 className="mr-6">Board: {board?.Name}</h2>
              <div className="flex items-center gap-2">
                <div className="hidden gap-1 sm:flex">
                  {board.UserBoards.map((userBoard) => (
                    <UserAvatar
                      key={userBoard.id}
                      user={userBoard.User}
                      draggable={true}
                      onDragStart={(ev) => drag(ev, userBoard.User.id)}
                      className="mr-1 h-8 w-8"
                    />
                  ))}
                </div>
                <Link href={`${location.href}/settings`}>
                  <Button variant={"ghost"} size={"sm"} className="p-1">
                    <Settings size={20} />
                  </Button>
                </Link>
              </div>
            </BoardContainer>
            <Separator className="my-1" />
            <Board
              board={board}
              containerHeight={500}
              isCombineEnabled={false}
              UserBoardRole={loggedInUserMembership?.Role || "Viewer"}
              refetchLanes={refetchLanes}
            />
          </>
        ) : error?.data?.code === "UNAUTHORIZED" ? (
          <div className="mx-auto flex items-center gap-4">
            <BackButton href={`/workspace/${workspaceId}/boards`} />
            <h2>You are not a member of this board</h2>
          </div>
        ) : (
          <div className="mx-auto flex items-center gap-4">
            <BackButton href={`/workspace/${workspaceId}/boards`} />
            <h2>Board Not Found</h2>
          </div>
        )}
      </main>
    </>
  );
}

export const getServerSideProps = ssrSession;
