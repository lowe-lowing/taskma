import SideView from "@/components/SideView";
import MainGrid from "@/components/utils/MainGrid";
import { trpc } from "@/lib/trpc";
import { NextPage } from "next";
import { useRouter } from "next/router";

const Settings: NextPage = () => {
  const workspaceId = useRouter().query.workspaceId as string;
  const { data: workspaces } = trpc.workspace.getWorkspacesByUser.useQuery();
  const workspace = workspaces?.find((w) => w.id === workspaceId);

  return (
    <main className="m-2 flex justify-center overflow-hidden">
      <MainGrid>
        <SideView workspaces={workspaces} />
        <div className="w-full">{workspace?.id}</div>
      </MainGrid>
    </main>
  );
};

export default Settings;
