import { trpc } from "@/lib/trpc";
import { Task } from "@prisma/client";
import { useState } from "react";
import toast from "react-hot-toast";
import { AiOutlineCloseCircle } from "react-icons/ai";
import Modal from "react-modal";
import { Button } from "../ui/button";

const customStyles = {
  content: {
    // top: "40%",
    // left: "50%",
    // right: "auto",
    // bottom: "auto",
    // marginRight: "-50%",
    // transform: "translate(-50%, -50%)",
  },
};

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
          background: "bg-background",
        },
        overlay: { background: "rgba(0, 0, 0, .5)" },
      }}
    >
      <form onSubmit={handleEdit} className="flex w-fit flex-col">
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={changeHandler}
          required
        />
        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={changeHandler}
        />
        <div className="flex w-full items-center">
          <input
            type="date"
            name="dueDate"
            placeholder="Due Date"
            value={form.dueDate}
            onChange={changeHandler}
          />
          <AiOutlineCloseCircle
            className="cursor-pointer"
            onClick={() => setForm((prev) => ({ ...prev, dueDate: "" }))}
          />
        </div>
        <Button type="submit" className="w-fit p-[3px]">
          Save
        </Button>
      </form>
      <button onClick={closeModal}>close</button>
    </Modal>
  );
};
