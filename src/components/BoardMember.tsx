import { type UserBoardWithUser } from "@/server/trpc/router/boards";
import { type BoardRole } from "@prisma/client";
import { type Session } from "next-auth";
import { type FC } from "react";
import BoardRoleDropdown from "./dropdowns/BoardRoleDropdown";
import { Separator } from "./ui/separator";
import UserAvatar from "./UserAvatar";

interface BoardMemberProps {
  membership: UserBoardWithUser;
  session: Session | null;
  userRole: BoardRole;
  refetchMembers: () => void;
}

const BoardMember: FC<BoardMemberProps> = ({
  membership: { User, Role, id: memberShipId },
  session,
  userRole,
  refetchMembers,
}) => {
  const isLoggedInUser = User.id === session?.user?.id;
  console.log(userRole);

  return (
    <div key={User.id}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserAvatar
            user={{
              name: User.name || null,
              image: User.image || null,
            }}
            className="h-8 w-8 sm:h-6 sm:w-6"
          />
          <div className="flex flex-col space-y-1 leading-none">
            <p className="font-medium">
              {User.name} {isLoggedInUser && "(you)"}
            </p>
            <p className="w-[200px] truncate text-sm">{User.email}</p>
          </div>
        </div>
        {userRole === "Editor" ||
        userRole === "Viewer" ||
        isLoggedInUser ||
        Role === "Creator" ? (
          <p>{Role}</p>
        ) : (
          <BoardRoleDropdown
            memberShipId={memberShipId}
            initialRole={Role}
            refetchMembers={refetchMembers}
          />
        )}
      </div>
      <Separator className="mt-2" />
    </div>
  );
};

export default BoardMember;
