import { InferGetServerSidePropsType } from "next";
import { signIn } from "next-auth/react";
import Head from "next/head";

import Navbar from "@/components/Navbar";
import { ssrSession } from "@/lib/ssrSession";
import { useRouter } from "next/router";
import { Balancer } from "react-wrap-balancer";
import { Button } from "../components/ui/button";

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
      <main className="flex min-h-[calc(100vh-40px)] w-full flex-col items-center justify-between">
        <div className="flex max-w-[90%] flex-col items-center space-y-4 py-4 md:max-w-[80%] lg:max-w-[65%] xl:max-w-[55%]">
          <h1 className="whitespace-nowrap text-5xl font-extrabold leading-normal text-gray-700 max-sm:text-4xl">
            Welcome to <span className="text-purple-300">Taskma</span>
          </h1>
          {session?.user ? (
            <Button onClick={() => router.push("/boards")} className="m-5">
              Go to Dashboard
            </Button>
          ) : (
            <Button onClick={() => signIn()} className="m-5">
              Get Started
            </Button>
          )}
          <Balancer className="text-center text-xl">
            Your Ultimate Task Management Solution! Effortlessly conquer your
            to-do list and boost your productivity with Taskma. Our intuitive
            and powerful task management application is designed to streamline
            your daily tasks, help you stay organized, and supercharge your
            efficiency.
          </Balancer>
          <ul className="list-disc rounded-md bg-secondary p-2 pl-6">
            <p className="text-2xl">Key Features:</p>
            <li>
              <span className="font-bold">Task Tracking:</span> Easily create,
              manage, and prioritize tasks. Never let important deadlines slip
              through the cracks again.
            </li>
            <li>
              <span className="font-bold">Collaborative Workspace:</span>{" "}
              Seamlessly collaborate with team members, friends, or family.
              Delegate tasks, share updates, and achieve goals together.
            </li>
            <li>
              <span className="font-bold">Cross-Platform Sync:</span> Access
              your tasks anytime, anywhere. Synchronize effortlessly across all
              your devices and never miss a beat.
            </li>
            <li>
              <span className="font-bold">Data Security:</span> Rest easy
              knowing your information is safe and protected. We prioritize your
              privacy with top-notch security measures.
            </li>
          </ul>
          <Balancer className="text-center text-xl">
            {`Whether you're a busy professional, a student juggling multiple
            assignments, or someone striving for a more organized life, Taskma
            is here to transform the way you manage tasks.`}
          </Balancer>
          <Balancer className="text-center text-xl">
            Join thousands of satisfied users who have already taken control of
            their time and achieved their goals with Taskma. Experience the
            future of task management today!
          </Balancer>
        </div>
        <footer className="w-full border-t bg-secondary p-2 text-center">
          <div>
            <p className="text-xl">Created By Lowe Löwing</p>
            <p className="text-lg">
              Contact me at{" "}
              <span className="underline">lowe.lowing@gmail.com</span>
            </p>
            <p className="text-lg">
              Or visit my website{" "}
              <a href="https://lowelowing.se">lowelowing.se</a>
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}

export const getServerSideProps = ssrSession;
