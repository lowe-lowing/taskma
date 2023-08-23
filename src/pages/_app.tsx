import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";

import { trpc } from "../lib/trpc";

import { AccordionContext } from "@/hooks/useAccordionContext";
import useDarkMode from "@/hooks/useDarkMode";
import NextTopLoader from "nextjs-toploader";
import { useState } from "react";
import { Toaster } from "react-hot-toast";
import "../styles/globals.css";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  const [value, setValue] = useState<string[]>([]);
  const [darkmode] = useDarkMode();
  return (
    <>
      <NextTopLoader color={`${darkmode ? "white" : "black"}`} />
      <Toaster position="bottom-right" />
      <SessionProvider session={session}>
        <AccordionContext.Provider value={{ value, setValue }}>
          <Component {...pageProps} />
        </AccordionContext.Provider>
      </SessionProvider>
    </>
  );
};
// TODO: add comments on tasks

export default trpc.withTRPC(MyApp);
