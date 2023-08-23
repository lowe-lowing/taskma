import { cn } from "@/lib/utils";
import { type Workspace } from "@prisma/client";
import { Globe, KanbanSquare, KanbanSquareDashed } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type FC } from "react";
import { CreateWorkspaceDialog } from "./dialogs/CreateWorkspaceDialog";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { WorkspacesAccordion } from "./WorkspacesAccordion";
import SideViewSkeleton from "./skeletons/SideViewSkeleton";

interface SideViewProps {
  workspaces: Workspace[] | undefined;
  isLoading?: boolean;
  isMobileOnlyView?: boolean;
}

const SideView: FC<SideViewProps> = ({
  workspaces,
  isLoading,
  isMobileOnlyView,
}) => {
  const pathname = usePathname();

  return (
    <div
      className={cn("w-40 space-y-1", {
        "max-sm:hidden": !isMobileOnlyView,
        "w-full pt-4": isMobileOnlyView,
      })}
    >
      <div className="flex flex-col gap-1">
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
        <Link href={"/workspaces"}>
          <Button
            variant={"ghost"}
            size={"sm"}
            className={cn("flex w-full justify-start gap-1", {
              "bg-secondary": pathname === "/workspaces",
            })}
          >
            <Globe size={16} />
            Public Workspaces
          </Button>
        </Link>
        <Link href={"/templates"}>
          <Button
            variant={"ghost"}
            size={"sm"}
            className={cn("flex w-full justify-start gap-1", {
              "bg-secondary": pathname === "/templates",
            })}
          >
            <KanbanSquareDashed size={16} />
            Templates
          </Button>
        </Link>
      </div>
      <Separator />
      <div className="ml-0.5 flex flex-row items-center justify-between">
        <p className="text-xs leading-none">Workspaces</p>
        <CreateWorkspaceDialog />
      </div>
      {isLoading ? (
        <SideViewSkeleton />
      ) : workspaces && workspaces.length > 0 ? (
        <WorkspacesAccordion workspaces={workspaces} />
      ) : (
        <div>No workspaces</div>
      )}
    </div>
  );
};

export default SideView;
