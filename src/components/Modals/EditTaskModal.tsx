import { trpc } from "@/lib/trpc";
import { Task } from "@prisma/client";
import { useState } from "react";
import toast from "react-hot-toast";
import { AiOutlineCloseCircle } from "react-icons/ai";
import Modal from "react-modal";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { X } from "lucide-react";

type EditTaskModalProps = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  task: Task;
  refetchLanes: () => void;
};

// TODO: Start working on a better design
export const EditTaskModal: React.FC<EditTaskModalProps> = ({
  isOpen,
  setIsOpen,
  task,
  refetchLanes,
}) => {
  const [form, setForm] = useState({
    title: task.Title,
    description: task.Description || "",
    dueDate: task.DueDate?.toLocaleDateString() || "",
  });

  const changeHandler = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const { mutateAsync: editTaskMutation } = trpc.task.editTask.useMutation();
  const handleEdit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const { title, description, dueDate } = form;
    const res = await editTaskMutation({
      taskId: task.id,
      title,
      description,
      dueDate: new Date(dueDate),
    });
    if (res.id) {
      refetchLanes();
      toast.success("Task successfully edited!");
      closeModal();
    } else {
      toast.error("Something went wrong. Please try again later.");
    }
  };

  const closeModal = () => setIsOpen(false);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={closeModal}
      contentLabel="Example Modal"
      style={{
        content: {
          margin: "auto",
          width: "fit-content",
          height: "fit-content",
          padding: "0px",
        },
        overlay: { background: "rgba(0, 0, 0, .5)" },
      }}
    >
      <form
        onSubmit={handleEdit}
        className="relative flex w-fit flex-col gap-2 bg-secondary p-5"
      >
        <Button
          variant={"ghost"}
          size={"icon"}
          onClick={closeModal}
          className="absolute right-1 top-1 hover:bg-background"
        >
          <X />
        </Button>
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            type="text"
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

          <div className="flex w-full items-center">
            <Input
              type="date"
              name="dueDate"
              placeholder="Due Date"
              value={form.dueDate}
              onChange={changeHandler}
            />
            {form.dueDate !== "" && (
              <AiOutlineCloseCircle
                className="cursor-pointer"
                onClick={() => setForm((prev) => ({ ...prev, dueDate: "" }))}
              />
            )}
          </div>
        </div>
        <Button type="submit" className="p-[3px]">
          Save
        </Button>
      </form>
    </Modal>
  );
};
