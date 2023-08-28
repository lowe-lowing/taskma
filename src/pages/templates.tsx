import { type InferGetServerSidePropsType } from "next";
import Head from "next/head";

import CreateBoardFromTemplateDialog from "@/components/dialogs/CreateBoardFromTemplateDialog";
import Navbar from "@/components/Navbar";
import SideView from "@/components/SideView";
import TemplateBoardCard from "@/components/TemplateBoardCard";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import MainGrid from "@/components/utils/MainGrid";
import { ssrSession } from "@/lib/ssrSession";
import { trpc } from "@/lib/trpc";
import { ArrowUp } from "lucide-react";
import { Fragment } from "react";

export default function Page({
  data: session,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { data: workspaces, isLoading } = trpc.workspace.getWorkspacesByUser.useQuery();

  const { data: boards } = trpc.board.getTemplates.useQuery();
  return (
    <>
      <Head>
        <title>Templates</title>
      </Head>
      <Navbar session={session} workspaces={workspaces} isLoading={isLoading} />
      <main className="m-2 flex justify-center">
        <MainGrid>
          <SideView workspaces={workspaces} isLoading={isLoading} />
          <div className="space-y-2">
            <p className="text-2xl">Templates</p>
            <Separator />
            {boards && workspaces && (
              <div className="grid h-fit grid-cols-1 gap-1 lg:grid-cols-2">
                {boards.map((template) => (
                  <Fragment key={template.id}>
                    <TemplateBoardCard template={template} workspaces={workspaces} />
                    <CreateBoardFromTemplateDialog
                      template={template}
                      workspaces={workspaces}
                      trigger={
                        <Button className="mb-2 space-x-1 sm:hidden" variant={"default"}>
                          <p>Create new Board From this template</p>
                          <ArrowUp />
                        </Button>
                      }
                    />
                  </Fragment>
                ))}
              </div>
            )}
          </div>
        </MainGrid>
      </main>
    </>
  );
}

export const getServerSideProps = ssrSession;
