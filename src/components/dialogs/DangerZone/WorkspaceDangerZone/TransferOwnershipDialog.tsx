import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  closeDialog,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import UserAvatar from "@/components/UserAvatar";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import { trpc } from "@/lib/trpc";
import { Workspace } from "@prisma/client";
import debounce from "lodash.debounce";
import type { User } from "next-auth";
import { usePathname, useRouter } from "next/navigation";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

interface TransferOwnershipDialogProps {
  workspace: Workspace;
  membershipId: string;
  trigger: React.ReactNode;
}

export const TransferOwnershipDialog: FC<TransferOwnershipDialogProps> = ({
  workspace,
  membershipId,
  trigger,
}) => {
  const [input, setInput] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const {
    data: queryResults,
    refetch,
    isFetched,
    isFetching,
  } = trpc.workspace.getAdminsByName.useQuery(
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

  const { mutateAsync: transferOwnership, isLoading } =
    trpc.workspace.transferOwnership.useMutation({
      onSuccess: () => {
        closeDialog();
        toast.success("Successfully transferred ownership.");
      },
      onError: () => {
        toast.error("Something went wrong. Please try again later.");
      },
    });

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-semibold">
            Transfer Ownership of {workspace.name}
          </DialogTitle>
        </DialogHeader>
        <Command
          className="relative z-50 max-w-lg overflow-visible rounded-lg border"
          ref={ref}
        >
          <CommandInput
            className="border-none outline-none ring-0 focus:border-none focus:outline-none"
            placeholder="Search admins..."
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
                      onSelect={() => {
                        setSelectedUser(user);
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
          {selectedUser && (
            <Button
              variant={"ghost"}
              className="flex w-fit items-center rounded-xl bg-secondary p-1 px-2"
              onClick={() => setSelectedUser(null)}
            >
              <UserAvatar user={selectedUser} className="mr-1 h-6 w-6" />
              <div className="text-sm">{selectedUser.name}</div>
            </Button>
          )}
        </div>
        <DialogFooter>
          <Button
            type="submit"
            disabled={selectedUser === null}
            isLoading={isLoading}
            onClick={() =>
              selectedUser?.id &&
              transferOwnership({
                workspaceId: workspace.id,
                membershipId,
                userToTransferId: selectedUser.id,
              })
            }
          >
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
