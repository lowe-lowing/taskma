import BoardsView from "@/components/BoardsView";
import SideView from "@/components/SideView";
import MainGrid from "@/components/utils/MainGrid";
import { trpc } from "@/lib/trpc";
import { NextPage } from "next";
import Head from "next/head";

const Boards: NextPage = () => {
  const { data: workspaces } =
    trpc.workspace.getWorkspacesWithBoardsByUser.useQuery();
  return (
    <>
      <Head>
        <title>Dashboard</title>
      </Head>
      <main className="m-2 flex justify-center overflow-hidden">
        <MainGrid>
          <SideView workspaces={workspaces} />
          <BoardsView workspaces={workspaces} />
        </MainGrid>
      </main>
    </>
  );
};

export default Boards;
