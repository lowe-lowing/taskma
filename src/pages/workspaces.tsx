import { type InferGetServerSidePropsType } from "next";
import Head from "next/head";
import Navbar from "@/components/Navbar";
import { ssrSession } from "@/lib/ssrSession";
import { trpc } from "@/lib/trpc";
import SideView from "@/components/SideView";
import MainGrid from "@/components/utils/MainGrid";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import UserAvatar from "@/components/UserAvatar";
import Link from "next/link";
import toast from "react-hot-toast";

export default function Page({
  data: session,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const {
    data: workspaces,
    refetch: refresh1,
    isLoading: workspacesLoading,
  } = trpc.workspace.getWorkspacesWithBoardsByUser.useQuery();

  const { data: publicWorkspaces, refetch: refresh2 } =
    trpc.workspace.getPublicWorkspaces.useQuery();

  const {
    mutate: join,
    isLoading: joinLoading,
    isSuccess,
  } = trpc.workspace.joinPublicWorkspace.useMutation({
    onSuccess: () => {
      toast.success("Joined!");
      refresh1();
      refresh2();
    },
  });

  return (
    <>
      <Head>
        <title>Public Workspaces</title>
      </Head>
      <Navbar session={session} workspaces={workspaces} isLoading={workspacesLoading} />
      <main className="m-2 flex justify-center">
        <MainGrid>
          <SideView workspaces={workspaces} isLoading={workspacesLoading} />
          <div className="space-y-5">
            {/* TODO: make prettier ui & skeleton */}
            {publicWorkspaces?.map((workspace) => (
              <div key={workspace.id}>
                <div className="flex items-center justify-between p-1">
                  <h1 className="text-2xl font-bold">{workspace.name}</h1>
                  {workspace.hasJoined ? (
                    <Link href={`/workspace/${workspace.id}/boards`}>
                      <Button size={"sm"}>Go to</Button>
                    </Link>
                  ) : (
                    <Button
                      size={"sm"}
                      onClick={() => join({ workspaceId: workspace.id })}
                      isLoading={joinLoading}
                      disabled={joinLoading || isSuccess}
                    >
                      Join
                    </Button>
                  )}
                </div>
                <Separator />
                <div className="space-y-1">
                  <div className="flex gap-1 text-lg">
                    <p className="font-bold">Owner: </p>
                    <div className="flex items-center gap-1">
                      <UserAvatar className="h-6 w-6" user={workspace.owner} />
                      <p>{workspace.owner.name}</p>
                    </div>
                  </div>
                  <p className="text-lg">
                    <span className="font-bold">Description: </span>
                    {workspace.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </MainGrid>
      </main>
    </>
  );
}

export const getServerSideProps = ssrSession;
