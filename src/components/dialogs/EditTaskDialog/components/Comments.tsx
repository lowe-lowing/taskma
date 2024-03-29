import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import UserAvatar from "@/components/UserAvatar";
import { trpc } from "@/lib/trpc";
import type { Prisma } from "@prisma/client";
import { format } from "date-fns";
import { useState, type FC } from "react";
import toast from "react-hot-toast";
import { Mention, MentionsInput, type SuggestionDataItem } from "react-mentions";

type FullTaskComment = Prisma.TaskCommentGetPayload<{
  include: { User: true };
}>;

interface CommentsProps {
  boardId: string;
  taskId: string;
  comments: FullTaskComment[];
  updateUi: () => void;
}

const Comments: FC<CommentsProps> = ({ boardId, taskId, comments, updateUi }) => {
  const [value, setValue] = useState("");

  const { data: memberships } = trpc.board.getUsersInBoard.useQuery({
    boardId,
  });

  const { mutate: addComment } = trpc.task.comment.useMutation({
    onSuccess: () => {
      updateUi();
      setValue("");
    },
    onError: () => {
      toast.error("Something went wrong, please try again later.");
    },
  });

  // const { data: session } = useSession();
  // usePusher<FullTaskComment>("task-comment", taskId, (data) => {
  //   if (data.userId === session?.user?.id) return;
  // });

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          addComment({ content: value, taskId });
        }}
      >
        <Label htmlFor="comments">Comments</Label>
        <div
          className="grid w-full grid-cols-2 gap-1"
          style={{
            gridTemplateColumns: "1fr auto",
          }}
        >
          <MentionsInput
            id="comments"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            singleLine={true}
            style={mentionsInputStyle}
            autoComplete="off"
            className="overflow-hidden"
          >
            <Mention
              trigger="@"
              markup="@[__display__]"
              data={
                memberships?.map(({ User }) => ({
                  id: User.image,
                  display: User.name,
                })) as SuggestionDataItem[]
              }
              renderSuggestion={(suggestion, search, highlightedDisplay) => (
                <div className="flex items-center gap-1 rounded-md border border-border p-2">
                  <UserAvatar
                    user={{
                      name: suggestion.display,
                      image: suggestion.id as string,
                    }}
                    className="h-7 w-7"
                  />
                  <span>{suggestion.display}</span>
                </div>
              )}
              className="bg-blue-200 dark:bg-slate-600"
              style={{
                marginLeft: "-3px",
                padding: "2px",
              }}
            />
          </MentionsInput>
          <Button className="w-fit">Send</Button>
        </div>
      </form>
      <div className="mt-2 space-y-1">
        {comments.map((comment) => (
          <div key={comment.id} className="space-y-1">
            <div className="w-full">
              <div className="flex items-center gap-1">
                <UserAvatar user={comment.User} className="h-4 w-4" />
                <p className="text-xs">{comment.User.name}</p>
                <p className="text-xs text-muted-foreground">{format(comment.CreatedAt, "Pp")}</p>
              </div>
              <p className="break-all">{comment.content}</p>
            </div>
            <Separator />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Comments;

const mentionsInputStyle = {
  control: {
    display: "flex",
    height: 40,
    width: "100%",
    borderRadius: 4,
    border: "1px solid hsl(var(--input))",
    backgroundColor: "var(--background)",
    paddingLeft: 12,
    paddingRight: 12,
    paddingTop: 8,
    paddingBottom: 8,
    fontSize: 14,
    "&focus-visible": {
      outline: "none",
      ring: "2px solid hsl(var(--ring))",
      ringOffset: 2,
    },
  },
  input: {
    height: 40,
    paddingLeft: 12,
    paddingRight: 12,
    paddingTop: 8,
    paddingBottom: 8,
  },
  suggestions: {
    item: {
      backgroundColor: "hsl(var(--background))",
      "&focused": {
        backgroundColor: "hsl(var(--secondary))",
      },
    },
  },
};
