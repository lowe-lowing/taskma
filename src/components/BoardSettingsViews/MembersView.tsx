import BoardMember from "@/components/BoardMember";
import { InviteBoardDialog } from "@/components/dialogs/InviteBoardDialog";
import { Separator } from "@/components/ui/separator";
import type { UserBoardWithUser } from "@/server/trpc/router/boards";
import type { Board, UserBoard } from "@prisma/client";
import type { Session } from "next-auth";
import { type FC } from "react";

interface MembersViewProps {
  board: Board | undefined | null;
  boardLoading: boolean;
  members: UserBoardWithUser[] | undefined | null;
  membersLoading: boolean;
  refetchMembers: () => void;
  loggedInUserMembership: UserBoard | undefined | null;
  membershipLoading: boolean;
  session: Session | null;
}

const MembersView: FC<MembersViewProps> = ({
  board,
  boardLoading,
  members,
  membersLoading,
  refetchMembers,
  loggedInUserMembership,
  membershipLoading,
  session,
}) => {
  return boardLoading || membersLoading || membershipLoading ? (
    // TODO: Add skeleton
    <div>Loading...</div>
  ) : (board && members && loggedInUserMembership) || (board && members && board.isPublic) ? (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xl">Members</p>
        <InviteBoardDialog
          board={board}
          refetchMembers={refetchMembers}
          userRole={loggedInUserMembership?.Role || "Viewer"}
        />
      </div>
      <Separator />
      {members.map((membership) => (
        <BoardMember
          key={membership.User.id}
          membership={membership}
          session={session}
          userRole={loggedInUserMembership?.Role || "Viewer"}
          refetchMembers={refetchMembers}
        />
      ))}
    </div>
  ) : (
    <div>Not Found</div>
  );
};

export default MembersView;
