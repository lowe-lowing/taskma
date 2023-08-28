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
import { trpc } from "@/lib/trpc";
import type { BoardRole } from "@prisma/client";
import { TRPCClientError } from "@trpc/client";
import Circle from "@uiw/react-color-circle";
import { Plus } from "lucide-react";
import { useState, type FC } from "react";
import toast from "react-hot-toast";

interface CreateCategoryDialogProps {
  boardId: string;
  userRole: BoardRole;
  refetch: () => void;
}

const CreateCategoryDialog: FC<CreateCategoryDialogProps> = ({ boardId, userRole, refetch }) => {
  const [input, setInput] = useState("");
  const [hex, setHex] = useState("#F44E3B");

  const { mutate: createCategory, isLoading } = trpc.board.createTaskCategory.useMutation({
    onSuccess: () => {
      refetch();
      setInput("");
      setHex("#F44E3B");
      closeDialog();
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
        <Button
          variant={"ghost"}
          size={"sm"}
          className="flex gap-1 p-1 pr-2"
          disabled={userRole === "Viewer"}
        >
          <Plus size={22} /> Create Category
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-semibold">Create New Category</DialogTitle>
        </DialogHeader>
        <Input
          placeholder="Category Name"
          name="name"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <Circle
          colors={[
            "#F44E3B",
            "#FE9200",
            "#FCDC00",
            "#DBDF00",
            "#A4DD00",
            "#68CCCA",
            "#73D8FF",
            "#AEA1FF",
            "#FDA1FF",
          ]}
          className="ml-3 flex justify-center"
          color={hex}
          onChange={(color) => {
            setHex(color.hex);
          }}
        />

        <DialogFooter>
          <Button
            type="submit"
            disabled={input.length < 3 || isLoading}
            isLoading={isLoading}
            onClick={() =>
              createCategory({
                boardId,
                name: input,
                color: hex,
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

export default CreateCategoryDialog;
