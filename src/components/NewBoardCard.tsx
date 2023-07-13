import { Workspace } from "@prisma/client";
import { Plus } from "lucide-react";
import { FC } from "react";
import CreateBoardDialog from "./dialogs/CreateBoardDialog";
import { Card, CardContent } from "./ui/card";

interface NewBoardCardProps {
  workspace: Workspace;
}

const NewBoardCard: FC<NewBoardCardProps> = ({ workspace }) => {
  return (
    <Card className="aspect-video">
      <CreateBoardDialog
        workspace={workspace}
        trigger={
          <CardContent className="flex h-full cursor-pointer items-center justify-center p-0">
            <p className="text-xs">New Board</p>
            <Plus size={14} />
          </CardContent>
        }
      />
    </Card>
  );
};

export default NewBoardCard;
