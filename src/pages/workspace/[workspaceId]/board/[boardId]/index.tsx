import Board from "@/components/dnd/board/Board";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import BackButton from "@/components/utils/BackButton";
import { trpc } from "@/lib/trpc";
import { Settings } from "lucide-react";
import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";

const BoardView: NextPage = () => {
  const router = useRouter();
  const boardId = router.query.boardId as string;

  const { data: board, refetch: refetchLanes } =
    trpc.board.getBoardById.useQuery(
      {
        boardId,
      },
      { enabled: !!boardId }
    );

  return (
    <>
      <Head>
        <title>{board?.Name}</title>
      </Head>
      <main className="relative flex h-[calc(100vh-40px)] flex-col items-center overflow-x-hidden pt-1">
        <div className="flex w-full items-center justify-between px-1 sm:justify-evenly">
          <BackButton />
          <h2>Board: {board?.Name}</h2>
          <Button
            variant={"ghost"}
            size={"sm"}
            className="p-1"
            onClick={() => router.push(`${location.href}/settings`)}
          >
            <Settings size={20} />
          </Button>
        </div>
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
};

export default BoardView;
