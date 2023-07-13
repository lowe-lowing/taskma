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
import { TRPCClientError } from "@trpc/client";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { FC, useState } from "react";
import toast from "react-hot-toast";

export const CreateWorkspaceDialog: FC = () => {
  const [input, setInput] = useState("");
  const router = useRouter();

  const { mutate: createWorkspace } = trpc.workspace.addWorkspace.useMutation({
    onSuccess: ({ WorkspaceId }) => {
      router.push(`/workspace/${WorkspaceId}/boards`);
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
    <Dialog>
      <DialogTrigger asChild>
        <div
          className="rounded-md p-0.5 transition-all hover:scale-125 hover:bg-primary-foreground"
          onClick={(e) => e.stopPropagation()}
        >
          <Plus size={14} />
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-semibold">
            Create New Workspace
          </DialogTitle>
        </DialogHeader>
        <div>
          <Label htmlFor="name">Workspace Name</Label>
          <Input
            placeholder="Workspace Name"
            name="name"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button
            type="submit"
            disabled={input.length < 3}
            onClick={() =>
              createWorkspace({
                name: input,
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
