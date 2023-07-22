import SideView from "@/components/SideView";
import UserAvatar from "@/components/UserAvatar";
import MainGrid from "@/components/utils/MainGrid";
import { trpc } from "@/lib/trpc";
import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";

const Members: NextPage = () => {
  const workspaceId = useRouter().query.workspaceId as string;
  const { data: workspaces } =
    trpc.workspace.getWorkspacesWithBoardsByUser.useQuery();
  const { data: members } = trpc.workspace.getUsersInWorkspace.useQuery({
    workspaceId,
  });

  return (
    <>
      <Head>
        <title>Members</title>
      </Head>
      <main className="m-2 flex justify-center overflow-hidden">
        <MainGrid>
          <SideView workspaces={workspaces} />
          <div className="w-full">
            {members?.map((user) => (
              <div className="flex justify-between">
                <div className="flex items-center gap-2">
                  <UserAvatar
                    user={{
                      name: user.name || null,
                      image: user.image || null,
                    }}
                    className="h-8 w-8 sm:h-6 sm:w-6"
                  />
                  <div className="flex flex-col space-y-1 leading-none">
                    {user.name && <p className="font-medium">{user.name}</p>}
                    {user.email && (
                      <p className="w-[200px] truncate text-sm">{user.email}</p>
                    )}
                  </div>
                </div>
                <div>Role</div>
              </div>
            ))}
          </div>
        </MainGrid>
      </main>
    </>
  );
};

export default Members;
