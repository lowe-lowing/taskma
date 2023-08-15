import BoardsView from "@/components/BoardsView";
import Navbar from "@/components/Navbar";
import SideView from "@/components/SideView";
import MainGrid from "@/components/utils/MainGrid";
import { ssrSession } from "@/lib/ssrSession";
import { trpc } from "@/lib/trpc";
import { type InferGetServerSidePropsType } from "next";
import Head from "next/head";

export default function Page({
  data: session,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { data: workspaces, isLoading } =
    trpc.workspace.getWorkspacesWithBoardsByUser.useQuery();
  return (
    <>
      <Head>
        <title>Dashboard</title>
      </Head>
      <Navbar session={session} workspaces={workspaces} isLoading={isLoading} />
      <main className="m-2 flex justify-center overflow-hidden">
        <MainGrid>
          <SideView workspaces={workspaces} isLoading={isLoading} />
          <BoardsView workspaces={workspaces} isLoading={isLoading} />
        </MainGrid>
      </main>
    </>
  );
}

export const getServerSideProps = ssrSession;
