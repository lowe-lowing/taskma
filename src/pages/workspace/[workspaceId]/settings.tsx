import Navbar from "@/components/Navbar";
import SideView from "@/components/SideView";
import { WorkspaceSettingsForm } from "@/components/forms/WorkspaceSettingsForm";
import MainGrid from "@/components/utils/MainGrid";
import { ssrSession } from "@/lib/ssrSession";
import { trpc } from "@/lib/trpc";
import { InferGetServerSidePropsType } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { WorkspaceButtonsRow } from "@/components/WorkspaceButtonsRow";
import { Separator } from "@/components/ui/separator";
import WorkspaceDangerZone from "@/components/WorkspaceDangerZone";

export default function Page({
  data: session,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
  const workspaceId = router.query.workspaceId as string;
  const { data: workspaces, isLoading } =
    trpc.workspace.getWorkspacesByUser.useQuery();
  const workspace = workspaces?.find((w) => w.id === workspaceId);

  const { data: membership, isLoading: userRoleLoading } =
    trpc.workspace.getMemberShip.useQuery(
      {
        workspaceId,
      },
      { enabled: !!workspaceId }
    );

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
            {/* TODO: maybe add loading skeleton */}
            {workspace && membership && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p>{workspace.name} - Settings</p>
                  <WorkspaceButtonsRow workspaceId={workspace.id} />
                </div>
                <Separator />
                <WorkspaceSettingsForm
                  workspace={workspace}
                  userRole={membership.Role}
                />
                <WorkspaceDangerZone
                  workspace={workspace}
                  membership={membership}
                />
              </div>
            )}
          </div>
        </MainGrid>
      </main>
    </>
  );
}

export const getServerSideProps = ssrSession;
