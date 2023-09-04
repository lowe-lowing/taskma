import { cn } from "@/lib/utils";
import { Settings, Tags, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/router";
import { type FC } from "react";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";

// seems to be unused
const BoardSettingsSideView: FC = () => {
  const router = useRouter();
  const { boardId, workspaceId } = router.query;
  const pathname = usePathname();

  return (
    <div className={cn("flex h-fit w-40 flex-row gap-1 rounded-md bg-secondary p-1 sm:flex-col")}>
      <Link href={`/workspace/${workspaceId}/board/${boardId}/settings`}>
        <Button
          variant={"ghost"}
          size={"sm"}
          className={cn("flex w-full justify-start gap-1 text-lg hover:bg-background", {
            "bg-background": pathname.endsWith("general"),
          })}
        >
          <Settings />
          General
        </Button>
      </Link>
      <Separator className="bg-background" />
      <Link href={`/workspace/${workspaceId}/board/${boardId}/settings/members`}>
        <Button
          variant={"ghost"}
          size={"sm"}
          className={cn("flex w-full justify-start gap-1 text-lg hover:bg-background", {
            "bg-background": pathname.endsWith("members"),
          })}
        >
          <Users />
          Members
        </Button>
      </Link>
      <Separator className="bg-background" />
      <Link href={`/workspace/${workspaceId}/board/${boardId}/settings/categories`}>
        <Button
          variant={"ghost"}
          size={"sm"}
          className={cn("flex w-full justify-start gap-1 text-lg hover:bg-background", {
            "bg-background": pathname.endsWith("categories"),
          })}
        >
          <Tags />
          Categories
        </Button>
      </Link>
    </div>
  );
};

export default BoardSettingsSideView;
