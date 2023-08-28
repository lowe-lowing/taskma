import CategoriesView from "@/components/BoardSettingsViews/CategoriesView";
import GeneralView from "@/components/BoardSettingsViews/GeneralView";
import MembersView from "@/components/BoardSettingsViews/MembersView";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BackButton from "@/components/utils/BackButton";
import { BoardContainer } from "@/components/utils/BoardContainer";
import { ssrSession } from "@/lib/ssrSession";
import { trpc } from "@/lib/trpc";
import { KanbanSquare } from "lucide-react";
import { type InferGetServerSidePropsType } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

export default function Page({
  data: session,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
  const workspaceId = router.query.workspaceId as string;
  const boardId = router.query.boardId as string;

  const {
    data: board,
    isLoading: boardLoading,
    refetch: refetchBoard,
  } = trpc.board.getBoardById.useQuery({ boardId }, { enabled: !!boardId });

  const {
    data: members,
    isLoading: membersLoading,
    refetch: refetchMembers,
  } = trpc.board.getUsersInBoard.useQuery({ boardId }, { enabled: !!boardId });

  const { data: loggedInUserMembership, isLoading: membershipLoading } =
    trpc.board.getUserMembership.useQuery({ boardId }, { enabled: !!boardId });

  const handleTabChange = (newTab: string) => {
    router.replace({
      pathname: `/workspace/${workspaceId}/board/${boardId}/settings`,
      query: { tab: newTab },
    });
  };

  return (
    <>
      <Head>
        <title>Categories</title>
      </Head>
      <Navbar session={session} />
      <main className="pt-1">
        <BoardContainer className="flex items-center justify-between px-1">
          <BackButton href={`/workspace/${workspaceId}/board/${boardId}`} />
          <h2 className="mr-6">Board: {board && !boardLoading ? board.Name : "Not found"}</h2>
          <Link href={`/workspace/${workspaceId}/board/${boardId}`}>
            <Button variant={"ghost"} size={"sm"} className="p-1">
              <KanbanSquare size={20} />
            </Button>
          </Link>
        </BoardContainer>
        <Separator className="my-1" />
        <div className="m-2 flex justify-center">
          <Tabs
            defaultValue={(router.query.tab as string) || "general"}
            className="w-full gap-4 sm:grid sm:w-[90%] sm:gap-2 md:w-[80%] lg:w-[65%] xl:w-[55%]"
            style={{
              gridTemplateColumns: "auto 1fr",
            }}
          >
            <TabsList className="grid w-full max-sm:grid-cols-3 sm:flex sm:h-fit sm:w-32 sm:flex-col">
              <TabsTrigger
                value="general"
                className="w-full"
                onClick={() => handleTabChange("general")}
              >
                General
              </TabsTrigger>
              <TabsTrigger
                value="members"
                className="w-full"
                onClick={() => handleTabChange("members")}
              >
                Members
              </TabsTrigger>
              <TabsTrigger
                value="categories"
                className="w-full"
                onClick={() => handleTabChange("categories")}
              >
                Categories
              </TabsTrigger>
            </TabsList>
            <TabsContent value="general" className="sm:mt-0">
              <GeneralView
                board={board}
                boardLoading={boardLoading}
                refetchBoard={refetchBoard}
                membership={loggedInUserMembership}
                membershipLoading={membershipLoading}
              />
            </TabsContent>
            <TabsContent value="members" className="sm:mt-0">
              <MembersView
                board={board}
                boardLoading={boardLoading}
                members={members}
                membersLoading={membersLoading}
                refetchMembers={refetchMembers}
                loggedInUserMembership={loggedInUserMembership}
                membershipLoading={membershipLoading}
                session={session}
              />
            </TabsContent>
            <TabsContent value="categories" className="sm:mt-0">
              <CategoriesView
                board={board}
                boardLoading={boardLoading}
                membership={loggedInUserMembership}
                membershipLoading={membershipLoading}
                refetchBoard={refetchBoard}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  );
}

export const getServerSideProps = ssrSession;
