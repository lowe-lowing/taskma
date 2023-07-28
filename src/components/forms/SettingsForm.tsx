import { zodResolver } from "@hookform/resolvers/zod";
import { Workspace } from "@prisma/client";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "react-hot-toast";

export const WorkspaceSettingsValidationSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Name is required with atleast 3 letters" })
    .max(50),
  description: z.string().max(250),
  public: z.boolean(),
});

type ValidationSchema = z.infer<typeof WorkspaceSettingsValidationSchema>;

export const SettingsForm = ({ workspace }: { workspace: Workspace }) => {
  const { data: userRole, isLoading: userRoleLoading } =
    trpc.workspace.getUserRole.useQuery({
      workspaceId: workspace.id,
    });

  const { mutate: updateSettings, isLoading: updateSettingsLoading } =
    trpc.workspace.updateSettings.useMutation({
      onSuccess: () => {
        toast("Successfully saved the settings.");
      },
      onError: () => {
        toast.error("Something went wrong. Please try again later.");
      },
    });

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ValidationSchema>({
    resolver: zodResolver(WorkspaceSettingsValidationSchema),
    defaultValues: {
      name: workspace.Name,
      description: workspace.Description,
      public: workspace.Public,
    },
  });

  const onSubmit: SubmitHandler<ValidationSchema> = (data) =>
    updateSettings({ workspaceId: workspace.id, data });

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
      {/* Leave Workspace (everyone) */}
      {/* Name (only admin & owner) */}
      {/* Description (only admin & owner) */}
      {/* color theme? (only admin & owner) */}
      {/* Privacy? (only admin & owner) */}
      {/* Transfer Ownership (only owner) */}
      {/* Delete Workspace (only owner) */}
      <div>
        <Label htmlFor="title">Name</Label>
        <Input id="title" placeholder="Name" {...register("name")} />
        {errors.name?.message}
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Description"
          {...register("description")}
        />
        {errors.description?.message}
      </div>
      <div>
        <Label htmlFor="public">Public</Label>
        <Input
          type="checkbox"
          id="public"
          {...register("public")}
          className="w-fit"
        />
      </div>
      <Button
        type="submit"
        disabled={!isDirty}
        isLoading={updateSettingsLoading}
      >
        Save
      </Button>
      <div>
        <p>Danger zone</p>
        <div className="flex flex-col gap-2 rounded-md border-2 border-red-500 p-2">
          <Button
            type="button"
            className="w-fit bg-red-500 text-white"
            disabled={userRole === "Owner" || userRoleLoading}
          >
            Leave workspace
          </Button>
          <Button
            type="button"
            className="w-fit bg-red-500 text-white"
            disabled={userRole !== "Owner" || userRoleLoading}
          >
            Transfer ownership
          </Button>
          <Button
            type="button"
            className="w-fit bg-red-500 text-white"
            disabled={userRole !== "Owner" || userRoleLoading}
          >
            Delete workspace
          </Button>
        </div>
      </div>
    </form>
  );
};
