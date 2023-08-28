import { KanbanSquare, Users, Settings } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";

export const WorkspaceButtonsRow = ({ workspaceId }: { workspaceId?: string }) => (
  <div className="flex gap-1">
    <Link href={`/workspace/${workspaceId}/boards`}>
      <Button variant={"secondary"} size={"sm"} className="gap-0.5 text-xs">
        <KanbanSquare size={12} />
        Boards
      </Button>
    </Link>
    <Link href={`/workspace/${workspaceId}/members`}>
      <Button variant={"secondary"} size={"sm"} className="gap-0.5 text-xs">
        <Users size={12} />
        Members
      </Button>
    </Link>
    <Link href={`/workspace/${workspaceId}/settings`}>
      <Button variant={"secondary"} size={"sm"} className="gap-0.5 text-xs">
        <Settings size={12} />
        Settings
      </Button>
    </Link>
  </div>
);
