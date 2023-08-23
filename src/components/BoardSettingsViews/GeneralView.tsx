import { Board, UserBoard } from "@prisma/client";
import { type FC } from "react";
import BoardDangerZone from "../BoardDangerZone";
import { BoardSettingsForm } from "../forms/BoardSettingsForm";
import GeneralSettingsSkeleton from "../skeletons/GeneralSettingsSkeleton";

interface GeneralViewProps {
  board: Board | undefined | null;
  boardLoading: boolean;
  refetchBoard: () => void;
  membership: UserBoard | undefined | null;
  membershipLoading: boolean;
}

const GeneralView: FC<GeneralViewProps> = ({
  board,
  boardLoading,
  refetchBoard,
  membership,
  membershipLoading,
}) => {
  return boardLoading || membershipLoading ? (
    <GeneralSettingsSkeleton />
  ) : (board && membership) || (board && board.isPublic) ? (
    <div className="space-y-4">
      <BoardSettingsForm
        board={board}
        userRole={membership?.Role || "Viewer"}
        refetchBoard={refetchBoard}
      />
      <BoardDangerZone
        board={board}
        membership={membership}
        userRole={membership?.Role || "Viewer"}
      />
    </div>
  ) : (
    <div>Not Found</div>
  );
};

export default GeneralView;
