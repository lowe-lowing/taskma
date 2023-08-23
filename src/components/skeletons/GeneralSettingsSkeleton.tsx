import { Skeleton } from "../ui/skeleton";

const GeneralSettingsSkeleton = () => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-5 w-8 rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
      <Skeleton className="h-24 w-full rounded-md" />
      <Skeleton className="h-10 w-14 rounded-md" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-16 rounded-md" />
        <Skeleton className="h-28 w-full rounded-md" />
      </div>
    </div>
  );
};

export default GeneralSettingsSkeleton;
