import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { type Workspace } from "@prisma/client";
import { Menu } from "lucide-react";
import { type FC } from "react";
import SideView from "./SideView";

interface SideViewSheetProps {
  workspaces: Workspace[] | undefined;
  isLoading?: boolean;
}

const SideViewSheet: FC<SideViewSheetProps> = ({ isLoading, workspaces }) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Menu />
      </SheetTrigger>
      <SheetContent side={"left"} className="px-4">
        <SideView workspaces={workspaces} isLoading={isLoading} isMobileOnlyView />
      </SheetContent>
    </Sheet>
  );
};

export default SideViewSheet;
