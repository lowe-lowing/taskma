import * as React from "react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type FC, useState } from "react";
import { WorkspaceRole } from "@prisma/client";
import { trpc } from "@/lib/trpc";
import { toast } from "react-hot-toast";

type RoleDropDownProps = {
  workspaceId: string;
  userToChangeId: string;
  memberShipId: string;
  initialRole: WorkspaceRole;
  refetchMembers: () => void;
};

const WorkspaceRoleDropDown: FC<RoleDropDownProps> = ({
  workspaceId,
  userToChangeId,
  memberShipId,
  initialRole,
  refetchMembers,
}) => {
  const [role, setRole] = useState(initialRole);

  const { mutate, isLoading } = trpc.workspace.changeUserRole.useMutation({
    onSuccess: () => refetchMembers(),
    onError: () => {
      setRole(initialRole);
      toast.error("Something went wrong. Please try again later.");
    },
  });

  return (
    <Select
      value={role}
      onValueChange={async (newRole: WorkspaceRole) => {
        setRole(newRole);
        mutate({
          userToChangeId,
          workspaceId,
          memberShipId,
          role: newRole,
        });
      }}
    >
      <SelectTrigger className="w-[140px]" isLoading={isLoading}>
        <SelectValue placeholder="Select a role" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value={WorkspaceRole.Admin}>
            {WorkspaceRole.Admin}
          </SelectItem>
          <SelectItem value={WorkspaceRole.Member}>
            {WorkspaceRole.Member}
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default WorkspaceRoleDropDown;
