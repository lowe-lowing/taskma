import Navbar from "@/components/Navbar";
import SideView from "@/components/SideView";
import UserAvatar from "@/components/UserAvatar";
import { InviteWorkspaceDialog } from "@/components/dialogs/InviteWorkspaceDialog";
import WorkspaceRoleDropDown from "@/components/dropdowns/WorkspaceRoleDropDown";
import WorkspaceMembersSkeleton from "@/components/skeletons/WorkspaceMembersSkeleton";
import { Separator } from "@/components/ui/separator";
import MainGrid from "@/components/utils/MainGrid";
import { ssrSession } from "@/lib/ssrSession";
import { trpc } from "@/lib/trpc";
import { type InferGetServerSidePropsType } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { WorkspaceButtonsRow } from "@/components/WorkspaceButtonsRow";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Balancer } from "react-wrap-balancer";

export default function Page({
  data: session,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const workspaceId = useRouter().query.workspaceId as string;

  const { data: workspaces, isLoading: workspaceLoading } =
    trpc.workspace.getWorkspacesByUser.useQuery();

  const workspace = workspaces?.find((w) => w.id === workspaceId);

  const {
    data: members,
    refetch: refetchMembers,
    isLoading: membersLoading,
  } = trpc.workspace.getUsersInWorkspace.useQuery({ workspaceId }, { enabled: !!workspaceId });

  const { data: loggedInUserRole } = trpc.workspace.getMemberShip.useQuery(
    { workspaceId },
    { enabled: !!workspaceId }
  );

  return (
    <>
      <Head>
        <title>Members</title>
      </Head>
      <Navbar session={session} workspaces={workspaces} isLoading={workspaceLoading} />
      <main className="m-2 flex justify-center overflow-hidden">
        <MainGrid>
          <SideView workspaces={workspaces} isLoading={workspaceLoading} />
          {workspaceLoading || membersLoading ? (
            <WorkspaceMembersSkeleton />
          ) : workspace && members ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Balancer>{workspace.name} - Members</Balancer>
                  <InviteWorkspaceDialog
                    workspace={workspace}
                    trigger={
                      <Button size={"sm"} variant={"ghost"} className="p-1">
                        <Plus className="h-5 w-5 sm:h-4 sm:w-4" />
                      </Button>
                    }
                  />
                </div>
                <WorkspaceButtonsRow workspaceId={workspace.id} />
              </div>
              <Separator />
              {members.map(({ User, Role, id: memberShipId }) => {
                const isLoggedInUser = User.id === session?.user?.id;
                return (
                  <div key={User.id} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <UserAvatar
                          user={{
                            name: User.name || null,
                            image: User.image || null,
                          }}
                          className="h-8 w-8 sm:h-6 sm:w-6"
                        />
                        <div className="flex flex-col space-y-1 leading-none">
                          <p className="font-medium">
                            {User.name} {isLoggedInUser && "(you)"}
                          </p>
                          <p className="w-[200px] truncate text-sm">{User.email}</p>
                        </div>
                      </div>
                      {loggedInUserRole?.Role === "Member" || isLoggedInUser || Role === "Owner" ? (
                        <p>{Role}</p>
                      ) : (
                        <WorkspaceRoleDropDown
                          workspaceId={workspaceId}
                          userToChangeId={User.id}
                          memberShipId={memberShipId}
                          initialRole={Role}
                          refetchMembers={refetchMembers}
                        />
                      )}
                    </div>
                    <Separator />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4">
              <h1 className="text-2xl font-semibold">Workspace not found</h1>
            </div>
          )}
        </MainGrid>
      </main>
    </>
  );
}

export const getServerSideProps = ssrSession;
