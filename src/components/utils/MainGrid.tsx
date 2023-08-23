import { type FC } from "react";

interface MainGridProps {
  children: React.ReactNode;
}

const MainGrid: FC<MainGridProps> = ({ children }) => {
  return (
    <div
      className="w-full gap-4 sm:grid sm:w-[90%] md:w-[80%] lg:w-[65%] xl:w-[55%]"
      style={{
        gridTemplateColumns: "auto 1fr",
      }}
    >
      {children}
    </div>
  );
};

export default MainGrid;
