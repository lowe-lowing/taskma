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
import { Workspace } from "@prisma/client";
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

interface InviteWorkspaceDialogProps {
  workspace: Workspace;
}

export const InviteWorkspaceDialog: FC<InviteWorkspaceDialogProps> = ({
  workspace,
}) => {
  const [input, setInput] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const router = useRouter();
  const pathname = usePathname();

  const {
    data: queryResults,
    refetch,
    isFetched,
    isFetching,
  } = trpc.workspace.getUsersToInviteByName.useQuery(
    {
      name: input,
      workspaceId: workspace.id,
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

  useEffect(() => {
    setInput("");
    setSelectedUsers([]);
  }, [pathname]);

  const { mutateAsync: inviteMutation } =
    trpc.workspace.inviteToWorkspace.useMutation({
      onSuccess: (data) => {
        toast.success(`${data.length > 1 ? "Users" : "User"} invited`);
        if (pathname.endsWith(`${workspace.id}/members`)) {
          router.refresh();
        } else {
          closeDialog();
        }
      },
      onError: () => {
        toast.error("Something went wrong. Please try again later.");
      },
    });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div
          className="cursor-pointer rounded-md p-0.5 transition-all hover:scale-125 hover:bg-primary-foreground"
          onClick={(e) => e.stopPropagation()}
        >
          <Plus size={14} />
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-semibold">
            Invite People to '{workspace.Name}'
          </DialogTitle>
        </DialogHeader>
        <Command
          className="relative z-50 max-w-lg overflow-visible rounded-lg border"
          ref={ref}
        >
          <CommandInput
            className="border-none outline-none ring-0 focus:border-none focus:outline-none"
            placeholder="Search users..."
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
            onClick={() =>
              inviteMutation({
                users: selectedUsers,
                workspaceId: workspace.id,
              })
            }
          >
            Invite users
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
