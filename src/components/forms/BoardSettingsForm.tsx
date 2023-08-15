import { trpc } from "@/lib/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Board, BoardRole } from "@prisma/client";
import { type FC } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { z } from "zod";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "../ui/form";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface BoardSettingsFormProps {
  board: Board;
  userRole: BoardRole;
  refetchBoard: () => void;
}

export const BoardSettingsForm: FC<BoardSettingsFormProps> = ({
  board,
  userRole,
  refetchBoard,
}) => {
  const { mutate: updateSettings, isLoading: updateSettingsLoading } =
    trpc.board.updateSettings.useMutation({
      onSuccess: ({ Name, isPublic }) => {
        form.reset({ Name, isPublic });
        toast.success("Successfully saved settings.");
        refetchBoard();
      },
      onError: () => {
        toast.error("Something went wrong. Please try again later.");
      },
    });

  const form = useForm<ValidationSchema>({
    resolver: zodResolver(BoardSettingsValidationSchema),
    defaultValues: {
      Name: board.Name,
      isPublic: board.isPublic,
    },
  });
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    control,
  } = form;

  const onSubmit: SubmitHandler<ValidationSchema> = (data) =>
    updateSettings({ boardId: board.id, ...data });

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <Label htmlFor="title">Name</Label>
          <Input
            id="title"
            placeholder="Name"
            {...register("Name")}
            disabled={userRole === "Editor" || userRole === "Viewer"}
          />
          <p className="text-destructive">{errors.Name?.message}</p>
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
                    disabled={userRole === "Editor" || userRole === "Viewer"}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Public board</FormLabel>
                  <FormDescription>
                    This workspace is currently{" "}
                    {board.isPublic ? "public" : "private"}, and will be
                    accessible to all members of the workspace.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>
        <Button
          type="submit"
          disabled={!isDirty}
          isLoading={updateSettingsLoading}
        >
          Save
        </Button>
      </form>
    </Form>
  );
};

export const BoardSettingsValidationSchema = z.object({
  Name: z
    .string()
    .min(3, { message: "Name is required with atleast 3 letters" })
    .max(50),
  isPublic: z.boolean(),
});

type ValidationSchema = z.infer<typeof BoardSettingsValidationSchema>;
