import { FC } from "react";

interface MainGridProps {
  children: React.ReactNode;
}

const MainGrid: FC<MainGridProps> = ({ children }) => {
  return (
    <div
      className="min-w-full gap-2 sm:grid sm:min-w-[90%] md:min-w-[80%] lg:min-w-[65%] xl:min-w-[55%]"
      style={{
        gridTemplateColumns: "auto 1fr",
      }}
    >
      {children}
    </div>
  );
};

export default MainGrid;
