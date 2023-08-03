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
import { Task } from "@prisma/client";
import { FC, useState } from "react";
import toast from "react-hot-toast";
import { AiOutlineCloseCircle } from "react-icons/ai";
import DatePicker from "../DatePicker";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

interface EditTaskDialogProps {
  trigger: React.ReactNode;
  task: Task;
  updateUi: () => void;
}

const EditTaskDialog: FC<EditTaskDialogProps> = ({
  trigger,
  task,
  updateUi,
}) => {
  const [form, setForm] = useState({
    title: task.Title,
    description: task.Description || "",
    dueDate: task.DueDate,
  });

  const changeHandler = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const { mutate: editTaskMutation, isLoading } =
    trpc.task.editTask.useMutation({
      onSuccess: () => {
        updateUi();
        toast.success("Task successfully edited!");
        closeDialog();
      },
      onError: (error) => {
        toast.error("Something went wrong. Please try again later.");
      },
    });

  const handleEdit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const { title, description, dueDate } = form;
    editTaskMutation({
      taskId: task.id,
      title,
      description,
      dueDate,
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        className="sm:max-w-[425px]"
        overlayClassName="backdrop-blur-none bg-background/50"
      >
        <form onSubmit={handleEdit} id="taskForm">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              name="title"
              value={form.title}
              onChange={changeHandler}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              name="description"
              value={form.description}
              onChange={changeHandler}
            />
          </div>
          <div>
            <Label htmlFor="dueDate">Due Date</Label>
            <div className="flex w-full items-center gap-1">
              <DatePicker
                date={form.dueDate || undefined}
                setDate={(date) =>
                  setForm((prev) => ({ ...prev, dueDate: date || null }))
                }
              />
              {form.dueDate !== null && (
                <AiOutlineCloseCircle
                  size={20}
                  className="cursor-pointer"
                  onClick={() =>
                    setForm((prev) => ({ ...prev, dueDate: null }))
                  }
                />
              )}
            </div>
          </div>
        </form>
        <DialogFooter>
          <Button
            type="submit"
            className="w-full p-[3px]"
            form="taskForm"
            isLoading={isLoading}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditTaskDialog;
