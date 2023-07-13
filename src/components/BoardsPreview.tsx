import { Board, Workspace } from "@prisma/client";
import { FC } from "react";
import BoardCard from "./BoardCard";
import NewBoardCard from "./NewBoardCard";

interface BoardsPreviewProps {
  boards: Board[] | undefined;
  workspace: Workspace;
}

const BoardsPreview: FC<BoardsPreviewProps> = ({ boards, workspace }) => {
  return (
    <div className="grid h-fit grid-cols-3 gap-1">
      {boards?.map((board) => (
        <BoardCard key={board.id} board={board} workspaceId={workspace.id} />
      ))}
      <NewBoardCard workspace={workspace} />
    </div>
  );
};

export default BoardsPreview;
