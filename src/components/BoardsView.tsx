import { trpc } from "@/lib/trpc";
import type { Board, Workspace } from "@prisma/client";
import { TRPCClientError } from "@trpc/client";
import { useRouter } from "next/navigation";
import { type FC, useState } from "react";
import toast from "react-hot-toast";
import { Balancer } from "react-wrap-balancer";
import BoardsPreview from "./BoardsPreview";
import BoardsViewSkeleton from "./skeletons/BoardsViewSkeleton";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { WorkspaceButtonsRow } from "./WorkspaceButtonsRow";

interface BoardsProps {
  workspaces:
    | (Workspace & {
        Boards: Board[];
      })[]
    | undefined;
  isLoading: boolean;
}

const BoardsView: FC<BoardsProps> = ({ workspaces, isLoading }) => {
  const [workspaceNameInput, setWorkspaceNameInput] = useState("");

  const router = useRouter();
  const { mutate: createWorkspace } =
    trpc.workspace.createWorkspace.useMutation({
      onSuccess: () => {
        router.refresh();
      },
      onError: (error) => {
        if (error instanceof TRPCClientError) {
          if (error.data.httpStatus === 400) {
            const err = JSON.parse(error.message);
            return toast.error(err[0].message);
          }
        }
        toast.error("Something went wrong. Please try again later.");
      },
    });

  return (
    <div className="flex w-full flex-col gap-4">
      {isLoading ? (
        <BoardsViewSkeleton />
      ) : workspaces && workspaces.length > 0 ? (
        workspaces.map((workspace) => (
          <div key={workspace.id} className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Balancer>{workspace.name}</Balancer>
              <WorkspaceButtonsRow workspaceId={workspace.id} />
            </div>
            <Separator />
            <BoardsPreview boards={workspace.Boards} workspace={workspace} />
          </div>
        ))
      ) : (
        <div>
          <Label htmlFor="name">Create your first workspace</Label>
          <Input
            name="name"
            placeholder="Workspace name"
            value={workspaceNameInput}
            onChange={(e) => setWorkspaceNameInput(e.target.value)}
          />
          <Button
            variant="default"
            className="mt-2"
            onClick={() =>
              createWorkspace({
                name: workspaceNameInput,
              })
            }
          >
            Create
          </Button>
        </div>
      )}
    </div>
  );
};

export default BoardsView;
