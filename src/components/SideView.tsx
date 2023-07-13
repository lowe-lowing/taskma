import { cn } from "@/lib/utils";
import { Workspace } from "@prisma/client";
import { KanbanSquare } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FC } from "react";
import { CreateWorkspaceDialog } from "./dialogs/CreateWorkspaceDialog";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { WorkspacesAccordion } from "./WorkspacesAccordion";

interface SideViewProps {
  workspaces: Workspace[] | undefined;
}

const SideView: FC<SideViewProps> = ({ workspaces }) => {
  const pathname = usePathname();

  return (
    <div className="w-40">
      <Link href={"/boards"}>
        <Button
          variant={"ghost"}
          size={"sm"}
          className={cn("flex w-full justify-start gap-1", {
            "bg-secondary": pathname === "/boards",
          })}
        >
          <KanbanSquare size={16} />
          Boards
        </Button>
      </Link>
      <Separator className="my-1" />
      <div className="ml-0.5 flex flex-row items-center justify-between">
        <p className="text-xs leading-none">Workspaces</p>
        <CreateWorkspaceDialog />
      </div>
      {/* TODO: add loading state */}
      {workspaces && workspaces.length > 0 ? (
        <WorkspacesAccordion workspaces={workspaces} />
      ) : (
        <div>No workspaces</div>
      )}
    </div>
  );
};

export default SideView;
