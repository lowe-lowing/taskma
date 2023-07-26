import { InferGetServerSidePropsType, type NextPage } from "next";
import { getSession, GetSessionParams, signIn } from "next-auth/react";
import Head from "next/head";

import { User } from "next-auth";
import { useRouter } from "next/router";
import { Button } from "../components/ui/button";
import Navbar from "@/components/Navbar";
import { ssrSession } from "@/lib/ssrSession";

export default function Page({
  data: session,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
  return (
    <>
      <Head>
        <title>Home Page</title>
        <meta
          name="description"
          content="Taskma, the greatest taskmanager you can find"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navbar session={session} />
      <main className="flex flex-col items-center">
        <h1 className="text-5xl font-extrabold leading-normal text-gray-700 md:text-[5rem]">
          Welcome to <span className="text-purple-300">Taskma</span>
        </h1>
        <p>This is a platform for task management for your self or your team</p>
        {session?.user ? (
          <Button onClick={() => router.push("/boards")} className="m-5">
            Go to Dashboard
          </Button>
        ) : (
          <Button onClick={() => signIn()} className="m-5">
            Get Started
          </Button>
        )}
      </main>
    </>
  );
}

export const getServerSideProps = ssrSession;
