import { Button } from "@/components/ui/button";
import { closeDialog, Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { trpc } from "@/lib/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import type { TaskCategory } from "@prisma/client";
import { XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { type FC } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import DatePicker from "../../DatePicker";
import type { FullTask } from "../../dnd/types";
import { Badge } from "../../ui/badge";
import { Form, FormControl, FormField, FormItem } from "../../ui/form";
import { Label } from "../../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Textarea } from "../../ui/textarea";
import AsignUsers from "./components/AsignUsers";
import Comments from "./components/Comments";

const EditTaskValidationSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().nullable(),
  dueDate: z.date().nullable(),
  category: z.string().optional(),
});

type ValidationSchema = z.infer<typeof EditTaskValidationSchema>;

interface EditTaskDialogProps {
  trigger: React.ReactNode;
  task: FullTask;
  categories: TaskCategory[];
  updateUi: () => void;
}

const EditTaskDialog: FC<EditTaskDialogProps> = ({ trigger, task, categories, updateUi }) => {
  const router = useRouter();
  const { boardId, workspaceId } = router.query;
  const form = useForm<ValidationSchema>({
    resolver: zodResolver(EditTaskValidationSchema),
    defaultValues: {
      title: task.Title,
      description: task.Description,
      dueDate: task.DueDate,
      category: task.taskCategoryId || "unselected",
    },
  });
  const {
    register,
    handleSubmit,
    formState: { isDirty },
    control,
    resetField,
  } = form;

  const { mutate: editTaskMutation, isLoading } = trpc.task.editTask.useMutation({
    onSuccess: () => {
      updateUi();
      toast.success("Task successfully edited!");
      closeDialog();
    },
    onError: () => {
      toast.error("Something went wrong. Please try again later.");
    },
  });

  const onSubmit: SubmitHandler<ValidationSchema> = ({ title, description, dueDate, category }) =>
    editTaskMutation({
      taskId: task.id,
      title,
      description,
      dueDate,
      categoryId: category === "unselected" ? null : (category as string),
    });

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent overlayClassName="backdrop-blur-none bg-background/50" className="p-1">
        <ScrollArea className="max-h-[90vh] p-3">
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} id="taskForm" className="p-0.5">
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
                      <div className="flex w-full items-center gap-2">
                        <DatePicker date={field.value} setDate={field.onChange} />
                        {field.value && (
                          <XCircle
                            size={25}
                            className="cursor-pointer"
                            onClick={() => resetField("dueDate")}
                          />
                        )}
                      </div>
                    )}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                {categories.length > 0 ? (
                  <FormField
                    control={control}
                    name="category"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-1" ref={field.ref}>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="unselected">No category</SelectItem>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                <Badge style={{ backgroundColor: category.color }}>
                                  {category.name}
                                </Badge>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                ) : (
                  <Link href={`/workspace/${workspaceId}/board/${boardId}/settings/categories`}>
                    <Button variant={"outline"} className="w-full">
                      Create a category
                    </Button>
                  </Link>
                )}
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
            </form>
          </Form>
          <div className="p-0.5">
            <AsignUsers boardId={boardId as string} task={task} updateUi={updateUi} />
            <Comments
              boardId={boardId as string}
              taskId={task.id}
              comments={task.TaskComments}
              updateUi={updateUi}
            />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default EditTaskDialog;
