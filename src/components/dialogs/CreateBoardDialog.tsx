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
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Workspace } from "@prisma/client";
import { useRouter } from "next/navigation";
import { FC, useState } from "react";
import toast from "react-hot-toast";

interface CreateBoardDialogProps {
  trigger: React.ReactNode;
  workspace: Workspace;
}

const CreateBoardDialog: FC<CreateBoardDialogProps> = ({
  workspace,
  trigger,
}) => {
  const [input, setInput] = useState("");
  const router = useRouter();

  const { mutate: createBoard } = trpc.board.addBoard.useMutation({
    onSuccess: ({ id, workspaceId }) => {
      router.push(`/workspace/${workspaceId}/board/${id}`);
    },
    onError: (error) => {
      toast.error("Something went wrong. Please try again later.");
    },
  });
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-semibold">
            Create new Board in '{workspace.Name}'
          </DialogTitle>
        </DialogHeader>
          <Input
            placeholder="Board Name"
            name="name"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        <DialogFooter>
          <Button
            type="submit"
            disabled={input.length < 3}
            onClick={() =>
              createBoard({
                name: input,
                workspaceId: workspace.id,
              })
            }
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateBoardDialog;
