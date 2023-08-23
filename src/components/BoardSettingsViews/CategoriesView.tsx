import CreateCategoryDialog from "@/components/dialogs/CreateCategoryDialog";
import EditCategoryDialog from "@/components/dialogs/EditCategoryDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { BoardWithCategories } from "@/server/trpc/router/boards";
import { UserBoard } from "@prisma/client";
import { Edit, Trash2 } from "lucide-react";
import { type FC } from "react";
import toast from "react-hot-toast";

interface CategoriesViewProps {
  board: BoardWithCategories | undefined | null;
  boardLoading: boolean;
  membership: UserBoard | undefined | null;
  membershipLoading: boolean;
  refetchBoard: () => void;
}

const CategoriesView: FC<CategoriesViewProps> = ({
  board,
  boardLoading,
  membership,
  membershipLoading,
  refetchBoard,
}) => {
  const { mutate: deleteCategory } = trpc.board.deleteTaskCategory.useMutation({
    onSuccess: () => {
      refetchBoard();
    },
    onError: () => {
      toast.error("Something went wrong, please try again later.");
    },
  });
  return boardLoading || membershipLoading ? (
    // TODO: Add skeleton
    <div>Loading...</div>
  ) : (board && membership) || (board && board.isPublic) ? (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-xl">Categories</p>
        {membership?.Role !== "Viewer" && (
          <CreateCategoryDialog
            boardId={board.id}
            refetch={refetchBoard}
            userRole={membership?.Role || "Viewer"}
          />
        )}
      </div>
      <Separator className="mb-1 mt-2" />
      <div className="flex flex-col gap-1">
        {board.TaskCategories?.map((category) => (
          <div className="flex flex-col gap-1" key={category.id}>
            <div className="flex items-center justify-between">
              <Badge
                className="w-fit text-base"
                style={{ backgroundColor: category.color }}
              >
                {category.name}
              </Badge>
              {membership?.Role !== "Viewer" && (
                <div className="flex items-center">
                  <EditCategoryDialog
                    category={category}
                    refetch={refetchBoard}
                    trigger={
                      <Button variant={"ghost"} size={"icon"}>
                        <Edit />
                      </Button>
                    }
                  />

                  <Button
                    variant={"ghost"}
                    size={"icon"}
                    onClick={() => deleteCategory({ categoryId: category.id })}
                  >
                    <Trash2 />
                  </Button>
                </div>
              )}
            </div>
            <Separator />
          </div>
        ))}
      </div>
    </div>
  ) : (
    <div>Not Found</div>
  );
};

export default CategoriesView;
