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
import type { Board, Workspace, WorkspaceRole } from "@prisma/client";
import { useRouter } from "next/navigation";
import { FC } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Balancer } from "react-wrap-balancer";
import { z } from "zod";

interface DeleteBoardDialogProps {
  trigger: React.ReactNode;
  board: Board;
  //   userRole: WorkspaceRole;
}

export const DeleteBoardDialog: FC<DeleteBoardDialogProps> = ({
  trigger,
  board,
  //   userRole,
}) => {
  const router = useRouter();

  const BoardDeleteValidationSchema = z.object({
    name: z.literal(board.Name),
    verify: z.literal("delete this board"),
  });
  type ValidationSchema = z.infer<typeof BoardDeleteValidationSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ValidationSchema>({
    resolver: zodResolver(BoardDeleteValidationSchema),
  });

  const { mutate: deleteBoard, isLoading } = trpc.board.deleteBoard.useMutation(
    {
      onSuccess: () => {
        router.push(`/workspace/${board.workspaceId}/boards`);
      },
      onError: () => {
        toast.error("Something went wrong. Please try again later.");
      },
    }
  );

  const onSubmit: SubmitHandler<ValidationSchema> = () =>
    deleteBoard({ boardId: board.id });

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-semibold">Delete Board</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <p>
            This board will be deleted, along with all of its Boards and Todos
          </p>
          <p className="w-full rounded-sm bg-destructive p-2 text-sm">
            Warning: This action is not reversible. Please be certain.
          </p>
          <form onSubmit={handleSubmit(onSubmit)} id="verification">
            <div>
              <Label htmlFor="name" className="text-muted-foreground">
                Enter the board name{" "}
                <span className="text-primary">{board.Name}</span> to continue:
              </Label>
              <Input id="name" {...register("name")} />
            </div>
            <div>
              <Label htmlFor="verify" className="text-muted-foreground">
                To verify, type{" "}
                <span className="text-primary">delete this board</span> below:
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
