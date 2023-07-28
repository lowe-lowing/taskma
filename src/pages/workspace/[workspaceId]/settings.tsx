import Navbar from "@/components/Navbar";
import SideView from "@/components/SideView";
import { SettingsForm } from "@/components/forms/SettingsForm";
import MainGrid from "@/components/utils/MainGrid";
import { ssrSession } from "@/lib/ssrSession";
import { trpc } from "@/lib/trpc";
import { InferGetServerSidePropsType } from "next";
import Head from "next/head";
import { useRouter } from "next/router";

export default function Page({
  data: session,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
  const workspaceId = router.query.workspaceId as string;
  const { data: workspaces, isLoading } =
    trpc.workspace.getWorkspacesWithBoardsByUser.useQuery();
  const workspace = workspaces?.find((w) => w.id === workspaceId);

  return (
    <>
      <Head>
        <title>Settings</title>
      </Head>
      <Navbar session={session} />
      <main className="m-2 flex justify-center overflow-hidden">
        <MainGrid>
          <SideView workspaces={workspaces} isLoading={isLoading} />
          <div className="w-full">
            {workspace && <SettingsForm workspace={workspace} />}
          </div>
        </MainGrid>
      </main>
    </>
  );
}

export const getServerSideProps = ssrSession;
