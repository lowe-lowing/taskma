import React from "react";
import { Skeleton } from "../ui/skeleton";
import { ChevronDown } from "lucide-react";

const SideViewSkeleton = () => {
  return (
    <div className="mt-1 flex flex-col gap-1">
      <Dropdown />
      <Dropdown />
      <Dropdown />
    </div>
  );
};

export default SideViewSkeleton;

const Dropdown = () => {
  return (
    <Skeleton className="h-6 w-full rounded-md" />
    // FIXME: make this look better
    //   <div className="flex flex-row-reverse p-0.5">
    //     <ChevronDown />
    //   </div>
    // </Skeleton>
  );
};
