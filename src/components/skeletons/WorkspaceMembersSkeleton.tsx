import { Separator } from "../ui/separator";
import { Skeleton } from "../ui/skeleton";

const WorkspaceMembersSkeleton = () => {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton className="h-6 w-full rounded-md" />
      <Separator />
      <Skeleton className="h-10 w-full rounded-md" />
      <Skeleton className="h-10 w-full rounded-md" />
      <Skeleton className="h-10 w-full rounded-md" />
    </div>
  );
};

export default WorkspaceMembersSkeleton;
