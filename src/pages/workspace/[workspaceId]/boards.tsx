import BoardsPreview from "@/components/BoardsPreview";
import Navbar from "@/components/Navbar";
import SideView from "@/components/SideView";
import { WorkspaceButtonsRow } from "@/components/WorkspaceButtonsRow";
import BoardsViewSkeleton from "@/components/skeletons/BoardsViewSkeleton";
import { Separator } from "@/components/ui/separator";
import MainGrid from "@/components/utils/MainGrid";
import { ssrSession } from "@/lib/ssrSession";
import { trpc } from "@/lib/trpc";
import { Workspace } from "@prisma/client";
import { InferGetServerSidePropsType } from "next";
import Head from "next/head";
import { useRouter } from "next/router";

export default function Page({
  data: session,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const workspaceId = useRouter().query.workspaceId as string;
  const { data: workspaces, isLoading } =
    trpc.workspace.getWorkspacesWithBoardsByUser.useQuery();
  const workspace = workspaces?.find((w: Workspace) => w.id === workspaceId);

  return (
    <>
      <Head>
        <title>Boards</title>
      </Head>
      <Navbar session={session} />
      <main className="m-2 flex justify-center overflow-hidden">
        <MainGrid>
          <SideView workspaces={workspaces} isLoading={isLoading} />
          {isLoading ? (
            <BoardsViewSkeleton />
          ) : workspace ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <p>{workspace.Name} - Boards</p>
                <WorkspaceButtonsRow workspaceId={workspace.id} />
              </div>
              <Separator />
              {workspace && (
                <BoardsPreview
                  boards={workspace?.Boards}
                  workspace={workspace}
                />
              )}
            </div>
          ) : (
            <div className="p-4">
              <h1 className="text-2xl font-semibold">Workspace not found</h1>
            </div>
          )}
          {/* {!isLoading && !workspace ? (
            <div className="p-4">
              <h1 className="text-2xl font-semibold">Workspace not found</h1>
            </div>
          ) : (
            <div>
              <h1>{workspace?.Name} - Boards</h1>
              <Separator className="my-2" />
              {workspace && (
                <BoardsPreview
                  boards={workspace?.Boards}
                  workspace={workspace}
                />
              )}
            </div>
          )} */}
        </MainGrid>
      </main>
    </>
  );
}

export const getServerSideProps = ssrSession;
