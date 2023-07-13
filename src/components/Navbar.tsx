import useDarkMode from "@/hooks/useDarkMode";
import { Moon, Sun } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { FC } from "react";
import { Button } from "./ui/button";
import UserAccountNav from "./UserAccountNav";

interface NavbarProps {}

const Navbar: FC<NavbarProps> = ({}) => {
  const [darkTheme, setDarkTheme] = useDarkMode();
  const handleMode = () => setDarkTheme(!darkTheme);

  const { data: session } = useSession();
  return (
    <div className="flex items-center justify-center bg-secondary">
      <div className="flex w-full max-w-4xl items-center justify-between p-2">
        <Link href={"/boards"}>Taskma</Link>
        <div className="flex flex-row items-center gap-2">
          {session?.user ? (
            <UserAccountNav user={session.user} />
          ) : (
            <Button variant={"secondary"} size={"sm"} onClick={() => signIn()}>
              Sign in
            </Button>
          )}
          <span onClick={handleMode} className="cursor-pointer">
            {darkTheme ? <Sun /> : <Moon />}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
