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
import { trpc } from "@/lib/trpc";
import type { UserBoard, UserWorkspace } from "@prisma/client";
import { useRouter } from "next/navigation";
import { type FC } from "react";
import toast from "react-hot-toast";

type LeaveDialogProps =
  | {
      type: "workspace";
      membership: UserWorkspace;
      trigger: React.ReactNode;
    }
  | {
      type: "board";
      membership: UserBoard | undefined | null;
      trigger: React.ReactNode;
    };

export const LeaveDialog: FC<LeaveDialogProps> = ({
  type,
  membership,
  trigger,
}) => {
  const router = useRouter();

  const { mutate: leaveWorkspace, isLoading: leaveWorkspaceLoading } =
    trpc.workspace.leaveWorkspace.useMutation({
      onSuccess: () => {
        router.push(`/boards`);
      },
      onError: () => {
        toast.error("Something went wrong. Please try again later.");
      },
    });

  const { mutate: leaveBoard, isLoading: leaveBoardLoading } =
    trpc.board.leaveBoard.useMutation({
      onSuccess: () => {
        router.push(`/boards`);
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
            Are you sure you want to leave?
          </DialogTitle>
        </DialogHeader>
        <DialogFooter>
          <div className="flex w-full justify-between">
            <Button variant={"outline"} onClick={() => closeDialog()}>
              Cancel
            </Button>
            <Button
              isLoading={leaveWorkspaceLoading || leaveBoardLoading}
              onClick={() =>
                (type === "board" &&
                  membership &&
                  leaveBoard({ membershipId: membership.id })) ||
                (type === "workspace" &&
                  leaveWorkspace({
                    userRole: membership.Role,
                    membershipId: membership.id,
                  }))
              }
            >
              Leave {type === "board" ? "Board" : "Workspace"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
