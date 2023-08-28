import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { type Workspace } from "@prisma/client";
import { useRouter } from "next/navigation";
import { type FC, useState } from "react";
import toast from "react-hot-toast";

interface CreateBoardDialogProps {
  trigger: React.ReactNode;
  workspace: Workspace;
}

const CreateBoardDialog: FC<CreateBoardDialogProps> = ({ workspace, trigger }) => {
  const [input, setInput] = useState("");
  const router = useRouter();

  const { mutate: createBoard, isLoading } = trpc.board.createBoard.useMutation({
    onSuccess: ({ id, workspaceId }) => {
      router.push(`/workspace/${workspaceId}/board/${id}`);
    },
    onError: () => {
      toast.error("Something went wrong. Please try again later.");
    },
  });
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-semibold">
            {`Create new Board in '${workspace.name}'`}
          </DialogTitle>
        </DialogHeader>
        <form
          id="create-board-form"
          onSubmit={(e) => {
            e.preventDefault();
            createBoard({
              Name: input,
              workspaceId: workspace.id,
            });
          }}
        >
          <Input
            placeholder="Board Name"
            name="name"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </form>
        <DialogFooter>
          <Button
            type="submit"
            form="create-board-form"
            disabled={input.length < 3 || isLoading}
            isLoading={isLoading}
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateBoardDialog;
