import { FC } from "react";

interface MainGridProps {
  children: React.ReactNode;
}

const MainGrid: FC<MainGridProps> = ({ children }) => {
  return (
    <div
      className="grid gap-2 max-sm:min-w-[90%] sm:min-w-[80%] md:min-w-[70%] lg:min-w-[60%] xl:min-w-[50%] 2xl:min-w-[40%]"
      style={{
        gridTemplateColumns: "auto 1fr",
      }}
    >
      {children}
    </div>
  );
};

export default MainGrid;
