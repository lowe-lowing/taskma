import { Button } from "@/components/ui/button";
import { Loader2, XCircle } from "lucide-react";
import { Fragment, type FC } from "react";
import AsignedToCommand from "@/components/AsignedToCommand";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import UserAvatar from "@/components/UserAvatar";
import type { FullTask } from "@/components/dnd/types";
import { trpc } from "@/lib/trpc";
import toast from "react-hot-toast";

interface AsignUsersProps {
  boardId: string;
  task: FullTask;
  updateUi: () => void;
}

const AsignUsers: FC<AsignUsersProps> = ({ boardId, task, updateUi }) => {
  const { mutate: addAsignedUser, isLoading: addAsignedUserLoading } =
    trpc.task.addAsignedUser.useMutation({
      onSuccess: () => {
        updateUi();
      },
      onError: () => {
        toast.error("Something went wrong, please try again later.");
      },
    });
  const handleAdd = (userId: string) => {
    addAsignedUser({ taskId: task.id, userId });
  };

  const {
    mutate: removeAsignedUser,
    isLoading: removeAsignedUserLoading,
    variables,
  } = trpc.task.removeAsignedUser.useMutation({
    onSuccess: () => {
      updateUi();
    },
    onError: () => {
      toast.error("Something went wrong, please try again later.");
    },
  });

  return (
    <div>
      <Label htmlFor="asigned">Asigned To</Label>
      <AsignedToCommand boardId={boardId as string} taskId={task.id} handleAdd={handleAdd} />
      <div className="mt-1 space-y-1">
        {task.UserTasks.map((userTask) => (
          <Fragment key={userTask.id}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 pl-2">
                <UserAvatar key={userTask.id} user={userTask.User} className="h-7 w-7" />
                {userTask.User.name}
              </div>
              <Button
                type="button"
                variant={"ghost"}
                size={"icon"}
                onClick={() => removeAsignedUser({ taskUserId: userTask.id })}
              >
                {removeAsignedUserLoading && variables?.taskUserId === userTask.id ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <XCircle />
                )}
              </Button>
            </div>
            <Separator />
          </Fragment>
        ))}
        {addAsignedUserLoading && (
          <div>
            <Skeleton className="h-10 w-full" />
            <Separator />
          </div>
        )}
      </div>
    </div>
  );
};

export default AsignUsers;
