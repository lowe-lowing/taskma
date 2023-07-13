import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useAccordionContext } from "@/hooks/useAccordionContext";
import { cn } from "@/lib/utils";
import { Workspace } from "@prisma/client";
import { KanbanSquare, Plus, Settings, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/router";
import { FC, ReactNode, useEffect } from "react";
import { InviteDialog } from "./dialogs/InviteDialog";
import { Button } from "./ui/button";

interface Props {
  workspaces: Workspace[];
}

export const WorkspacesAccordion: FC<Props> = ({ workspaces }) => {
  const workspaceId = useRouter().query.workspaceId as string;
  const context = useAccordionContext();
  useEffect(() => {
    context?.setValue([...new Set([workspaceId, ...context?.value])]);
  }, []);
  return (
    <Accordion
      value={context?.value}
      onValueChange={context?.setValue}
      type="multiple"
      className="flex w-full flex-col gap-1"
    >
      {workspaces.map((workspace) => (
        <AccordionItem key={workspace.id} value={workspace.id}>
          <AccordionTrigger className="text-sm">
            {workspace.Name}
          </AccordionTrigger>
          <AccordionContent>
            <div className="mt-1 flex flex-col gap-1">
              <WorkspaceLink href={`/workspace/${workspace.id}/boards`}>
                <KanbanSquare size={14} />
                Boards
              </WorkspaceLink>
              <WorkspaceLink href={`/workspace/${workspace.id}/members`}>
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Users size={14} />
                    Members
                  </div>
                  <div onClick={(e) => e.stopPropagation()}>
                    <InviteDialog workspace={workspace} />
                  </div>
                </div>
              </WorkspaceLink>
              <WorkspaceLink href={`/workspace/${workspace.id}/settings`}>
                <Settings size={14} />
                Settings
              </WorkspaceLink>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

type ChildrenProps = {
  children: ReactNode;
  href: string;
};
const WorkspaceLink: FC<ChildrenProps> = ({ children, href }) => {
  const router = useRouter();
  return (
    <Button
      variant={"ghost"}
      size={"sm"}
      className={cn("flex w-full flex-row justify-start gap-1 pl-4 text-xs", {
        "bg-secondary": href === usePathname(),
      })}
      onClick={() => router.push(href)}
    >
      {children}
    </Button>
  );
};
