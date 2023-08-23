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
import { TRPCClientError } from "@trpc/client";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FC, useState } from "react";
import toast from "react-hot-toast";

export const CreateWorkspaceDialog: FC = () => {
  const [input, setInput] = useState("");
  const router = useRouter();

  const { mutateAsync: createWorkspace, isLoading } =
    trpc.workspace.createWorkspace.useMutation({
      onSuccess: ({ workspaceId }) => {
        router.push(`/workspace/${workspaceId}/boards`);
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
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant={"ghost"}
          size={"sm"}
          className="p-0.5 transition-all hover:scale-125 hover:bg-primary-foreground"
        >
          <Plus size={14} />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-semibold">
            Create New Workspace
          </DialogTitle>
        </DialogHeader>
        <form
          id="create-workspace-form"
          onSubmit={(e) => {
            e.preventDefault();
            createWorkspace({
              name: input,
            });
          }}
        >
          <Input
            placeholder="Workspace Name"
            name="name"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </form>
        <DialogFooter>
          <Button
            type="submit"
            form="create-workspace-form"
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
