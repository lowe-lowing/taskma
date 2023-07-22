import SideView from "@/components/SideView";
import MainGrid from "@/components/utils/MainGrid";
import { trpc } from "@/lib/trpc";
import { NextPage } from "next";
import Head from "next/head";

const Settings: NextPage = () => {
  const { data: workspaces } =
    trpc.workspace.getWorkspacesWithBoardsByUser.useQuery();

  return (
    <>
      <Head>
        <title>Settings</title>
      </Head>
      <main className="m-2 flex justify-center overflow-hidden">
        <MainGrid>
          <SideView workspaces={workspaces} />
          <div className="w-full"></div>
        </MainGrid>
      </main>
    </>
  );
};

export default Settings;
