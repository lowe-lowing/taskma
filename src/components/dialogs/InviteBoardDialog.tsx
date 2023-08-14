import { Button } from "@/components/ui/button";
import {
  closeDialog,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import { trpc } from "@/lib/trpc";
import { Board, Workspace } from "@prisma/client";
import debounce from "lodash.debounce";
import { Plus } from "lucide-react";
import { User } from "next-auth";
import { usePathname, useRouter } from "next/navigation";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import UserAvatar from "../UserAvatar";

interface InviteBoardDialogProps {
  board: Board;
  refetchMembers: () => void;
}

export const InviteBoardDialogDialog: FC<InviteBoardDialogProps> = ({
  board,
  refetchMembers,
}) => {
  const [input, setInput] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  const {
    data: queryResults,
    refetch,
    isFetched,
    isFetching,
  } = trpc.board.getUsersToInviteByName.useQuery(
    {
      name: input,
      workspaceId: board.workspaceId!,
      boardId: board.id,
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

  const { mutateAsync: inviteMutation, isLoading } =
    trpc.board.inviteToBoard.useMutation({
      onSuccess: (data) => {
        toast.success(`${data.length > 1 ? "Users" : "User"} invited`);
        refetchMembers();
        closeDialog();
      },
      onError: () => {
        toast.error("Something went wrong. Please try again later.");
      },
    });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="p-1" variant={"ghost"} size={"sm"}>
          <Plus />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-semibold">
            {`Add members to '${board.Name}'`}
          </DialogTitle>
        </DialogHeader>
        <Command
          className="relative z-50 max-w-lg overflow-visible rounded-lg border"
          ref={ref}
        >
          <CommandInput
            className="border-none outline-none ring-0 focus:border-none focus:outline-none"
            placeholder="Search users in workspace..."
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
                  {queryResults?.map((user: User) => (
                    <CommandItem
                      key={user.id}
                      onSelect={(e) => {
                        setSelectedUsers((prev) => [...prev, user]);
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
        <div className="flex flex-wrap">
          {selectedUsers.map((user) => (
            <Button
              key={user.id}
              variant={"ghost"}
              className="flex w-fit items-center rounded-xl bg-secondary p-1 px-2"
              onClick={() => {
                setSelectedUsers((prev) =>
                  prev.filter((prevUser) => prevUser.id !== user.id)
                );
              }}
            >
              <UserAvatar user={user} className="mr-1 h-6 w-6" />
              <div className="text-sm">{user.name}</div>
            </Button>
          ))}
        </div>
        <DialogFooter>
          <Button
            type="submit"
            disabled={selectedUsers.length === 0}
            isLoading={isLoading}
            onClick={() =>
              inviteMutation({
                users: selectedUsers,
                boardId: board.id,
              })
            }
          >
            Add members
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
