import { Button } from "@/components/ui/button";
import {
  closeDialog,
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
import { zodResolver } from "@hookform/resolvers/zod";
import type { Workspace, WorkspaceRole } from "@prisma/client";
import { useRouter } from "next/navigation";
import { FC } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

interface DeleteWorkspaceDialogProps {
  trigger: React.ReactNode;
  workspace: Workspace;
  userRole: WorkspaceRole;
}

export const DeleteWorkspaceDialog: FC<DeleteWorkspaceDialogProps> = ({
  trigger,
  workspace,
  userRole,
}) => {
  const router = useRouter();

  const WorkspaceDeleteValidationSchema = z.object({
    name: z.literal(workspace.name),
    verify: z.literal("delete this workspace"),
  });
  type ValidationSchema = z.infer<typeof WorkspaceDeleteValidationSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ValidationSchema>({
    resolver: zodResolver(WorkspaceDeleteValidationSchema),
  });

  const { mutate: deleteWorkspace, isLoading } =
    trpc.workspace.deleteWorkspace.useMutation({
      onSuccess: () => {
        router.push(`/boards`);
      },
      onError: () => {
        toast.error("Something went wrong. Please try again later.");
      },
    });

  const onSubmit: SubmitHandler<ValidationSchema> = () =>
    deleteWorkspace({ userRole, workspaceId: workspace.id });

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-semibold">Delete Workspace</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <p>
            This workspace will be deleted, along with all of its Boards and
            Todos
          </p>
          <p className="w-full rounded-sm bg-destructive p-2 text-sm">
            Warning: This action is not reversible. Please be certain.
          </p>
          <form onSubmit={handleSubmit(onSubmit)} id="verification">
            <div>
              <Label htmlFor="name" className="text-muted-foreground">
                Enter the workspace name{" "}
                <span className="text-primary">{workspace.name}</span> to
                continue:
              </Label>
              <Input id="name" {...register("name")} />
            </div>
            <div>
              <Label htmlFor="verify" className="text-muted-foreground">
                To verify, type{" "}
                <span className="text-primary">delete this workspace</span>{" "}
                below:
              </Label>
              <Input id="verify" {...register("verify")} />
            </div>
          </form>
        </div>
        <DialogFooter>
          <div className="flex w-full justify-between">
            <Button variant={"outline"} onClick={() => closeDialog()}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="verification"
              disabled={!!errors.name || !!errors.verify}
              isLoading={isLoading}
            >
              Continue
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};