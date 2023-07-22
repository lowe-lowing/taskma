import { trpc } from "@/lib/trpc";
import { Board, Workspace } from "@prisma/client";
import { TRPCClientError } from "@trpc/client";
import { KanbanSquare, Settings, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { FC, useState } from "react";
import toast from "react-hot-toast";
import BoardsPreview from "./BoardsPreview";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";

interface BoardsProps {
  workspaces:
    | (Workspace & {
        Boards: Board[];
      })[]
    | undefined;
}

// TODO: add loading state
const BoardsView: FC<BoardsProps> = ({ workspaces }) => {
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
    <div className="flex w-full flex-col gap-1">
      {workspaces && workspaces.length > 0 ? (
        workspaces.map((workspace) => (
          <div key={workspace.id}>
            <div className="flex justify-between">
              <p>{workspace.Name}</p>
              <div className="flex gap-1">
                <Button
                  variant={"secondary"}
                  size={"sm"}
                  className="gap-0.5 text-xs"
                >
                  <KanbanSquare size={12} />
                  Boards
                </Button>
                <Button
                  variant={"secondary"}
                  size={"sm"}
                  className="gap-0.5 text-xs"
                >
                  <Users size={12} />
                  Members
                </Button>
                <Button
                  variant={"secondary"}
                  size={"sm"}
                  className="gap-0.5 text-xs"
                >
                  <Settings size={12} />
                  Settings
                </Button>
              </div>
            </div>
            <Separator className="my-1" />
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
