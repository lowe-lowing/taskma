import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import type { TemplateBoard } from "@/server/trpc/router/boards";
import { useRouter } from "next/navigation";
import { useState, type FC } from "react";
import toast from "react-hot-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { Workspace } from "@prisma/client";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

const FormSchema = z.object({
  name: z.string().min(3).max(50),
  workspaceId: z.string({
    required_error: "Please select a workspace.",
  }),
});

interface CreateBoardFromTemplateDialogProps {
  template: Pick<TemplateBoard, "id" | "Name">;
  workspaces: Pick<Workspace, "id" | "name">[];
  trigger: React.ReactNode;
}

const CreateBoardFromTemplateDialog: FC<CreateBoardFromTemplateDialogProps> = ({
  template,
  workspaces,
  trigger,
}) => {
  const router = useRouter();

  const { mutate: createFromTemplate, isLoading } = trpc.board.createFromTemplate.useMutation({
    onSuccess: ({ id, workspaceId }) => {
      router.push(`/workspace/${workspaceId}/board/${id}`);
    },
    onError: () => {
      toast.error("Something went wrong. Please try again later.");
    },
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  function onSubmit({ name, workspaceId }: z.infer<typeof FormSchema>) {
    createFromTemplate({
      templateId: template.id,
      Name: name,
      workspaceId,
    });
  }

  const [open, setOpen] = useState(false);

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <div>
              <p>Create new Board using template:</p>
              <p>{`${template.Name}`}</p>
            </div>
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form id="create-board-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Board name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-1">
              <Label>Workspace</Label>
              <FormField
                control={form.control}
                name="workspaceId"
                render={({ field }) => (
                  <FormItem className="flex flex-col space-y-1">
                    <Popover open={open} onOpenChange={() => setOpen(!open)}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value
                              ? workspaces.find((workspace) => workspace.id === field.value)?.name
                              : "Select workspace"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      {/* width here need to be changed if dialog width changes */}
                      <PopoverContent className="w-[375px] p-0">
                        <Command>
                          <CommandInput placeholder="Search workspace..." />
                          <CommandEmpty>No workspace found.</CommandEmpty>
                          <CommandGroup>
                            {workspaces.map((workspace) => (
                              <CommandItem
                                value={workspace.name}
                                key={workspace.id}
                                onSelect={() => {
                                  form.setValue("workspaceId", workspace.id);
                                  setOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    workspace.id === field.value ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {workspace.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormDescription className="max-sm:text-xs">
                      This is the workspace that the board will be created in.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
        <DialogFooter>
          <Button type="submit" form="create-board-form" isLoading={isLoading}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateBoardFromTemplateDialog;
