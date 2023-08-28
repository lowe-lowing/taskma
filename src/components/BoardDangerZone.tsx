import type { Board, BoardRole, UserBoard } from "@prisma/client";
import { type FC } from "react";
import { DeleteBoardDialog } from "./dialogs/DangerZone/BoardDangerZone/DeleteBoardDialog";
import { LeaveDialog } from "./dialogs/DangerZone/LeaveDialog";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";

interface BoardDangerZoneProps {
  board: Board;
  membership: UserBoard | undefined | null;
  userRole: BoardRole;
}

const BoardDangerZone: FC<BoardDangerZoneProps> = ({ board, membership, userRole }) => {
  return (
    <div>
      <p className="mb-1">Danger zone</p>
      <div className="flex flex-col gap-2 rounded-md border border-destructive p-3 ">
        <DangerButtonContainer>
          <div className="space-y-1 leading-none">
            <p>Leave Board</p>
            <p className="text-sm text-muted-foreground">You will lose access to this workspace.</p>
          </div>
          <LeaveDialog
            type="board"
            membership={membership}
            trigger={
              <Button type="button" variant={"destructive"} disabled={!membership}>
                Leave
              </Button>
            }
          />
        </DangerButtonContainer>
        <Separator />
        <DangerButtonContainer>
          <div className="space-y-1 leading-none">
            <p>Delete Board</p>
            <p className="text-sm text-muted-foreground">This action is irreversible.</p>
          </div>
          <DeleteBoardDialog
            board={board}
            trigger={
              <Button
                type="button"
                disabled={userRole === "Editor" || userRole === "Viewer"}
                variant={"destructive"}
              >
                Delete
              </Button>
            }
          />
        </DangerButtonContainer>
      </div>
    </div>
  );
};

export default BoardDangerZone;

const DangerButtonContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="flex justify-between gap-2">{children}</div>
);
