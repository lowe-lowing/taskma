import * as React from "react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FC, useState } from "react";
import { BoardRole } from "@prisma/client";
import { trpc } from "@/lib/trpc";
import { toast } from "react-hot-toast";

type RoleDropDownProps = {
  memberShipId: string;
  initialRole: BoardRole;
  refetchMembers: () => void;
};

const BoardRoleDropdown: FC<RoleDropDownProps> = ({
  memberShipId,
  initialRole,
  refetchMembers,
}) => {
  const [role, setRole] = useState(initialRole);

  const { mutate } = trpc.board.changeUserRole.useMutation({
    onSuccess: () => refetchMembers(),
    onError: () => {
      setRole(initialRole);
      toast.error("Something went wrong. Please try again later.");
    },
  });

  return (
    <Select
      value={role}
      onValueChange={(newRole: BoardRole) => {
        setRole(newRole);
        mutate({ memberShipId, role: newRole });
      }}
    >
      <SelectTrigger className="w-[120px]">
        <SelectValue placeholder="Select a role" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value={BoardRole.Admin}>{BoardRole.Admin}</SelectItem>
          <SelectItem value={BoardRole.Editor}>{BoardRole.Editor}</SelectItem>
          <SelectItem value={BoardRole.Viewer}>{BoardRole.Viewer}</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default BoardRoleDropdown;
