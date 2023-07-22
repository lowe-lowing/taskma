import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/router";
import { FC } from "react";
import { Button } from "../ui/button";

interface BackButtonProps {
  className?: string;
  href?: string;
}

const BackButton: FC<BackButtonProps> = ({ className, href }) => {
  const router = useRouter();
  return (
    <Button
      variant={"ghost"}
      size={"sm"}
      className={cn("", className)}
      onClick={() => (href ? router.push(href) : window.history.back())}
    >
      <ArrowLeft size={16} />
      Back
    </Button>
  );
};

export default BackButton;
