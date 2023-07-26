import Navbar from "@/components/Navbar";
import Board from "@/components/dnd/board/Board";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import BackButton from "@/components/utils/BackButton";
import { BoardContainer } from "@/components/utils/BoardContainer";
import { ssrSession } from "@/lib/ssrSession";
import { trpc } from "@/lib/trpc";
import { Settings } from "lucide-react";
import { InferGetServerSidePropsType } from "next";
import Head from "next/head";
import { useRouter } from "next/router";

export default function Page({
  data: session,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
  const boardId = router.query.boardId as string;
  const workspaceId = router.query.workspaceId as string;

  const { data: board, refetch: refetchLanes } =
    trpc.board.getBoardFull.useQuery(
      {
        boardId,
      },
      { enabled: !!boardId }
    );

  // TODO: make loading skeleton & maybe some unauthorized page & not found page
  return (
    <>
      <Head>
        <title>{board?.Name}</title>
      </Head>
      <Navbar session={session} />
      <main className="relative flex h-[calc(100vh-40px)] flex-col items-center overflow-x-hidden pt-1">
        <BoardContainer className="flex items-center justify-between px-1">
          <BackButton href={`/workspace/${workspaceId}/boards`} />
          <h2>Board: {board?.Name}</h2>
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
        {board?.Lanes ? (
          <Board
            initial={board.Lanes}
            boardId={boardId}
            containerHeight={500}
            useClone={false}
            withScrollableColumns={false}
            refetchLanes={refetchLanes}
            isCombineEnabled={false}
          />
        ) : (
          <div>loading</div>
        )}
      </main>
    </>
  );
}

export const getServerSideProps = ssrSession;
