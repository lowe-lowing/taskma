import { type TemplateBoard } from "@/server/trpc/router/boards";
import { type Workspace } from "@prisma/client";
import { type FC } from "react";
import CreateBoardFromTemplateDialog from "./dialogs/CreateBoardFromTemplateDialog";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";

interface TemplateBoardCardProps {
  template: TemplateBoard;
  workspaces: Workspace[];
}

const TemplateBoardCard: FC<TemplateBoardCardProps> = ({ template, workspaces }) => {
  return (
    <Card className="group relative aspect-video cursor-pointer overflow-hidden">
      <CreateBoardFromTemplateDialog
        template={template}
        workspaces={workspaces}
        trigger={
          <div className="absolute grid h-full w-full place-items-center bg-background/70 opacity-0 transition-all duration-300 group-hover:opacity-100">
            <p className="text-lg">Use Template</p>
          </div>
        }
      />
      <CardHeader className="p-1">
        <CardTitle className="space-y-1">
          <p className="text-xs">{template.Name}</p>
          {template.TaskCategories?.length > 0 && (
            <div className="flex gap-1">
              {template.TaskCategories?.map((category) => (
                <Badge
                  key={category.id}
                  className="whitespace-nowrap px-1.5 text-[10px] leading-none"
                  style={{ backgroundColor: category.color }}
                >
                  {category.name}
                </Badge>
              ))}
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="mt-1 flex flex-row gap-1 p-0 pl-1">
        {template.Lanes?.map((lane) => (
          <Card className={"h-fit w-20 rounded-sm bg-secondary dark:border-gray-700"} key={lane.id}>
            <CardHeader className="flex h-4 w-20 flex-row items-center p-0">
              <p className="truncate pl-0.5 text-[9px] leading-none">{lane.Name}</p>
            </CardHeader>
            <CardContent className="p-0">
              <Separator className="bg-gray-300 dark:bg-gray-700" />
              <div className="flex flex-col gap-0.5 p-0.5">
                {lane.Tasks.map((task) => (
                  <div key={task.id} className="flex items-center rounded-sm bg-background p-2" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
};

export default TemplateBoardCard;
