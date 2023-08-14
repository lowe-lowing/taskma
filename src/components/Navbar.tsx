import useDarkMode from "@/hooks/useDarkMode";
import { Moon, Sheet, Sun } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { FC } from "react";
import { Button } from "./ui/button";
import UserAccountNav from "./UserAccountNav";
import type { Session } from "next-auth";
import SideViewSheet from "./SideViewSheet";
import { Workspace } from "@prisma/client";
import { cn } from "@/lib/utils";

interface NavbarProps {
  session: Session | null;
  // passing workspace and isLoading means that the SideViewSheet will be rendered on small screens
  workspaces?: Workspace[] | undefined;
  isLoading?: boolean;
}

const Navbar: FC<NavbarProps> = ({ session, isLoading, workspaces }) => {
  const [darkTheme, setDarkTheme] = useDarkMode();
  const handleMode = () => setDarkTheme(!darkTheme);

  return (
    <div className="flex items-center justify-center border-b bg-secondary">
      <div className="flex w-full max-w-4xl items-center justify-between p-2">
        <p
          className={cn({
            "max-sm:hidden": !!workspaces,
          })}
        >
          Taskma
        </p>
        <div
          className={cn("flex gap-2 sm:hidden", {
            hidden: !workspaces,
          })}
        >
          <SideViewSheet isLoading={isLoading} workspaces={workspaces} />
          <Link href={"/boards"}>Taskma</Link>
        </div>
        <div className="flex flex-row items-center gap-2">
          {session?.user ? (
            <UserAccountNav user={session.user} />
          ) : (
            <Button
              size={"sm"}
              className="max-sm:text-lg"
              onClick={() => signIn()}
            >
              Sign in
            </Button>
          )}
          <span onClick={handleMode} className="cursor-pointer">
            {darkTheme ? (
              <Sun className="h-8 w-8 sm:h-6 sm:w-6" />
            ) : (
              <Moon className="h-8 w-8 sm:h-6 sm:w-6" />
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
