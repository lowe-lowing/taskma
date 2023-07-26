import { cn } from "@/lib/utils";
import { FC } from "react";

interface BoardContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const BoardContainer: FC<BoardContainerProps> = ({
  children,
  className,
}) => {
  return (
    <div className={cn("mx-auto w-[90%] sm:w-[70%] md:w-[50%]", className)}>
      {children}
    </div>
  );
};
