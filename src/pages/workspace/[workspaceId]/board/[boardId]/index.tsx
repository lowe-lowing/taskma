import Navbar from "@/components/Navbar";
import Board from "@/components/dnd/board/Board";
import BoardSkeleton from "@/components/skeletons/BoardSkeleton";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import BackButton from "@/components/utils/BackButton";
import { BoardContainer } from "@/components/utils/BoardContainer";
import { ssrSession } from "@/lib/ssrSession";
import { trpc } from "@/lib/trpc";
import { Settings } from "lucide-react";
import { type InferGetServerSidePropsType } from "next";
import Head from "next/head";
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
        if (error?.data?.code === "UNAUTHORIZED") {
          return false;
        }
        return true;
      },
    }
  );

  const { data: loggedInUserMembership, isLoading: membershipLoading } =
    trpc.board.getUserMembership.useQuery({ boardId }, { enabled: !!boardId });

  return (
    <>
      <Head>
        <title>{board?.Name}</title>
      </Head>
      <Navbar session={session} />
      <main className="relative flex h-[calc(100dvh-50px)] flex-col items-center overflow-x-hidden pt-1 sm:h-[calc(100dvh-42px)]">
        {isLoading || membershipLoading ? (
          <BoardSkeleton workspaceId={workspaceId} />
        ) : board && loggedInUserMembership ? (
          <>
            <BoardContainer className="flex items-center justify-between px-0 sm:px-1">
              <BackButton href={`/workspace/${workspaceId}/boards`} />
              <h2 className="mr-6">Board: {board?.Name}</h2>
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
            <Board
              initial={board.Lanes}
              boardId={boardId}
              containerHeight={500}
              refetchLanes={refetchLanes}
              isCombineEnabled={false}
              UserBoardRole={loggedInUserMembership.Role}
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
