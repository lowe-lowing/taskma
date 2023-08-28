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
import type { TaskCategory } from "@prisma/client";
import { TRPCClientError } from "@trpc/client";
import Circle from "@uiw/react-color-circle";
import { useState, type FC } from "react";
import toast from "react-hot-toast";

interface EditCategoryDialogProps {
  category: TaskCategory;
  trigger: React.ReactNode;
  refetch: () => void;
}

const EditCategoryDialog: FC<EditCategoryDialogProps> = ({ category, trigger, refetch }) => {
  const [input, setInput] = useState(category.name);
  const [hex, setHex] = useState(category.color);

  const { mutate: createCategory, isLoading } = trpc.board.updateTaskCategory.useMutation({
    onSuccess: ({ name, color }) => {
      refetch();
      closeDialog();
      setInput(name);
      setHex(color);
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
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-semibold">{`Edit Category "${category.name}"`}</DialogTitle>
        </DialogHeader>
        <form
          id="categoryForm"
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            createCategory({
              categoryId: category.id,
              name: input,
              color: hex,
            });
          }}
        >
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
        </form>
        <DialogFooter>
          <Button
            type="submit"
            form="categoryForm"
            disabled={input.length < 3 || isLoading}
            isLoading={isLoading}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditCategoryDialog;
