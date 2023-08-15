import type { UserWorkspace, Workspace } from "@prisma/client";
import { type FC } from "react";
import { LeaveDialog } from "./dialogs/DangerZone/LeaveDialog";
import { DeleteWorkspaceDialog } from "./dialogs/DangerZone/WorkspaceDangerZone/DeleteWorkspaceDialog";
import { TransferOwnershipDialog } from "./dialogs/DangerZone/WorkspaceDangerZone/TransferOwnershipDialog";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";

interface WorkspaceDangerZoneProps {
  workspace: Workspace;
  membership: UserWorkspace;
}

const WorkspaceDangerZone: FC<WorkspaceDangerZoneProps> = ({
  workspace,
  membership,
}) => {
  const { Role: userRole, id: membershipId } = membership;
  return (
    <div>
      <p className="mb-1">Danger zone</p>
      <div className="flex flex-col gap-2 rounded-md border border-destructive p-3 ">
        <DangerButtonContainer>
          <div className="space-y-1 leading-none">
            <p>Leave Workspace</p>
            {userRole === "Owner" ? (
              <p className="text-sm text-destructive">
                You need to transfer ownership before leaving this workspace.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                You will lose access to this workspace.
              </p>
            )}
          </div>
          <LeaveDialog
            type="workspace"
            membership={membership}
            trigger={
              <Button
                type="button"
                disabled={userRole === "Owner"}
                variant={"destructive"}
              >
                Leave
              </Button>
            }
          />
        </DangerButtonContainer>
        <Separator />
        <DangerButtonContainer>
          <div className="space-y-1 leading-none">
            <p>Transfer Ownership</p>
            <p className="text-sm text-muted-foreground">
              Transfer ownership to another admin.
            </p>
          </div>
          <TransferOwnershipDialog
            workspace={workspace}
            membershipId={membershipId}
            trigger={
              <Button
                type="button"
                disabled={userRole !== "Owner"}
                variant={"destructive"}
              >
                Transfer
              </Button>
            }
          />
        </DangerButtonContainer>
        <Separator />
        <DangerButtonContainer>
          <div className="space-y-1 leading-none">
            <p>Delete Workspace</p>
            <p className="text-sm text-muted-foreground">
              This action is irreversible.
            </p>
          </div>
          <DeleteWorkspaceDialog
            workspace={workspace}
            userRole={userRole}
            trigger={
              <Button
                type="button"
                disabled={userRole !== "Owner"}
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

export default WorkspaceDangerZone;

const DangerButtonContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="flex justify-between gap-2">{children}</div>
);
