import { trpc } from "@/lib/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Workspace, WorkspaceRole } from "@prisma/client";
import { type FC } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { z } from "zod";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "../ui/form";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

interface WorkspaceSettingsFormProps {
  workspace: Workspace;
  userRole: WorkspaceRole;
}

export const WorkspaceSettingsForm: FC<WorkspaceSettingsFormProps> = ({ workspace, userRole }) => {
  const { mutate: updateSettings, isLoading: updateSettingsLoading } =
    trpc.workspace.updateSettings.useMutation({
      onSuccess: ({ name, description, isPublic }) => {
        form.reset({ name, description, isPublic });
        toast.success("Successfully saved settings.");
      },
      onError: () => {
        toast.error("Something went wrong. Please try again later.");
      },
    });

  const form = useForm<ValidationSchema>({
    resolver: zodResolver(WorkspaceSettingsValidationSchema),
    defaultValues: {
      name: workspace.name,
      description: workspace.description,
      isPublic: workspace.isPublic,
    },
  });
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    control,
  } = form;

  const onSubmit: SubmitHandler<ValidationSchema> = (data) =>
    updateSettings({ workspaceId: workspace.id, data });

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <Label htmlFor="title">Name</Label>
          <Input
            id="title"
            placeholder="Name"
            {...register("name")}
            disabled={userRole === "Member"}
          />
          <p className="text-destructive">{errors.name?.message}</p>
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Description"
            {...register("description")}
            disabled={userRole === "Member"}
          />
          <p className="text-destructive">{errors.description?.message}</p>
        </div>
        <div>
          <FormField
            control={control}
            name="isPublic"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={userRole === "Member"}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Public workspace</FormLabel>
                  <FormDescription>
                    This workspace is currently {workspace.isPublic ? "public" : "private"}.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" disabled={!isDirty} isLoading={updateSettingsLoading}>
          Save
        </Button>
      </form>
    </Form>
  );
};

export const WorkspaceSettingsValidationSchema = z.object({
  name: z.string().min(3, { message: "Name is required with atleast 3 letters" }).max(50),
  description: z.string().max(250),
  isPublic: z.boolean(),
});

type ValidationSchema = z.infer<typeof WorkspaceSettingsValidationSchema>;
