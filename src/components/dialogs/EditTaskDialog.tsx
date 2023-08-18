import { Button } from "@/components/ui/button";
import {
  closeDialog,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Trash2, XCircle } from "lucide-react";
import { useRouter } from "next/router";
import { Fragment, type FC } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import AsignedToCommand from "../AsignedToCommand";
import DatePicker from "../DatePicker";
import { FullTask } from "../dnd/types";
import { FormField } from "../ui/form";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Skeleton } from "../ui/skeleton";
import { Textarea } from "../ui/textarea";
import UserAvatar from "../UserAvatar";

const EditTaskValidationSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().nullable(),
  dueDate: z.date().nullable(),
});
type ValidationSchema = z.infer<typeof EditTaskValidationSchema>;

interface EditTaskDialogProps {
  trigger: React.ReactNode;
  task: FullTask;
  updateUi: () => void;
}

const EditTaskDialog: FC<EditTaskDialogProps> = ({
  trigger,
  task,
  updateUi,
}) => {
  const router = useRouter();
  const { boardId } = router.query;
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    control,
    resetField,
  } = useForm<ValidationSchema>({
    resolver: zodResolver(EditTaskValidationSchema),
    defaultValues: {
      title: task.Title,
      description: task.Description,
      dueDate: task.DueDate,
    },
  });

  const { mutate: editTaskMutation, isLoading } =
    trpc.task.editTask.useMutation({
      onSuccess: () => {
        updateUi();
        toast.success("Task successfully edited!");
        closeDialog();
      },
      onError: () => {
        toast.error("Something went wrong. Please try again later.");
      },
    });

  const onSubmit: SubmitHandler<ValidationSchema> = ({
    title,
    description,
    dueDate,
  }) => editTaskMutation({ taskId: task.id, title, description, dueDate });

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
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent overlayClassName="backdrop-blur-none bg-background/50">
        <form onSubmit={handleSubmit(onSubmit)} id="taskForm">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input {...register("title")} required />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea {...register("description")} />
          </div>
          <div>
            <Label htmlFor="dueDate">Due Date</Label>
            <div className="flex w-full items-center gap-1">
              <FormField
                control={control}
                name="dueDate"
                render={({ field }) => (
                  <>
                    <DatePicker date={field.value} setDate={field.onChange} />
                    {field.value && (
                      <XCircle
                        size={20}
                        className="cursor-pointer"
                        onClick={() => resetField("dueDate")}
                      />
                    )}
                  </>
                )}
              />
            </div>
          </div>
          <Button
            type="submit"
            className="my-2 w-full p-[3px]"
            form="taskForm"
            isLoading={isLoading}
            disabled={!isDirty}
          >
            Save
          </Button>
          <div>
            <Label htmlFor="asigned">Asigned To</Label>
            <AsignedToCommand
              boardId={boardId as string}
              taskId={task.id}
              handleAdd={handleAdd}
            />
            <div className="mt-1 space-y-1">
              {task.UserTasks.map((userTask) => (
                <Fragment key={userTask.id}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 pl-2">
                      <UserAvatar
                        key={userTask.id}
                        user={userTask.User}
                        className="h-7 w-7"
                      />
                      {userTask.User.name}
                    </div>
                    <Button
                      type="button"
                      variant={"ghost"}
                      size={"icon"}
                      onClick={() =>
                        removeAsignedUser({ taskUserId: userTask.id })
                      }
                    >
                      {removeAsignedUserLoading &&
                      variables?.taskUserId === userTask.id ? (
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
                <>
                  <Skeleton className="h-10 w-full" />
                  <Separator />
                </>
              )}
            </div>
          </div>
        </form>
        {/* <DialogFooter> */}
        {/* </DialogFooter> */}
      </DialogContent>
    </Dialog>
  );
};

export default EditTaskDialog;
