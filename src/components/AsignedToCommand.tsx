import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import { trpc } from "@/lib/trpc";
import { UserBoard } from "@prisma/client";
import debounce from "lodash.debounce";
import { User } from "next-auth";
import { useCallback, useEffect, useRef, useState, type FC } from "react";
import toast from "react-hot-toast";
import { Button } from "./ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import UserAvatar from "./UserAvatar";

interface AsignedToCommandProps {
  boardId: string;
  taskId: string;
  handleAdd: (userId: string) => void;
}

const AsignedToCommand: FC<AsignedToCommandProps> = ({
  boardId,
  taskId,
  handleAdd,
}) => {
  const [input, setInput] = useState("");

  const {
    data: queryResults,
    refetch,
    isFetched,
    isFetching,
  } = trpc.task.searchUsersAsignToTask.useQuery(
    {
      name: input,
      boardId,
      taskId,
    },
    {
      enabled: input.length > 0,
    }
  );

  const request = debounce(() => refetch(), 300);
  const debounceRequest = useCallback(() => {
    request();
  }, []);

  const ref = useRef(null);
  useOnClickOutside(ref, () => {
    setInput("");
  });

  return (
    <Command
      className="relative z-50 max-w-lg overflow-visible rounded-lg border"
      ref={ref}
    >
      <CommandInput
        className="border-none outline-none ring-0 focus:border-none focus:outline-none"
        placeholder="Search users to asign this task to"
        isLoading={isFetching}
        value={input}
        onValueChange={(value) => {
          setInput(value);
          debounceRequest();
        }}
      />
      {input.length > 0 && (
        <CommandList className="absolute inset-x-0 top-full rounded-b-md bg-background shadow-md">
          {isFetched && <CommandEmpty>No results found</CommandEmpty>}
          {queryResults && queryResults.length > 0 && (
            <CommandGroup heading="Users">
              {queryResults?.map((user) => (
                <CommandItem
                  key={user.id}
                  onSelect={() => {
                    handleAdd(user.id);
                    setInput("");
                  }}
                  value={user.name || undefined}
                >
                  <Button variant={"ghost"} size={"sm"}>
                    <UserAvatar user={user} className="mr-1 h-6 w-6" />
                    <div className="text-sm">{user.name}</div>
                  </Button>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      )}
    </Command>
  );
};

export default AsignedToCommand;
