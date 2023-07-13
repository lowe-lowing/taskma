import BoardsPreview from "@/components/BoardsPreview";
import SideView from "@/components/SideView";
import { Separator } from "@/components/ui/separator";
import MainGrid from "@/components/utils/MainGrid";
import { trpc } from "@/lib/trpc";
import { Workspace } from "@prisma/client";
import { NextPage } from "next";
import { useRouter } from "next/router";

const Boards: NextPage = () => {
  const workspaceId = useRouter().query.workspaceId as string;
  const { data: workspaces, isLoading } =
    trpc.workspace.getWorkspacesByUser.useQuery();
  const workspace = workspaces?.find((w: Workspace) => w.id === workspaceId);

  // TODO: Add loading state
  return (
    <main className="m-2 flex justify-center overflow-hidden">
      <MainGrid>
        <SideView workspaces={workspaces} />
        {!isLoading && !workspace ? (
          <div className="p-4">
            <h1 className="text-2xl font-semibold">Workspace not found</h1>
          </div>
        ) : (
          <div>
            <h1>{workspace?.Name} - Boards</h1>
            <Separator className="my-2" />
            {workspace && (
              <BoardsPreview boards={workspace?.Boards} workspace={workspace} />
            )}
          </div>
        )}
      </MainGrid>
    </main>
  );
};

export default Boards;
