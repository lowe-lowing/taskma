import { type AppType } from "next/app";
import { getServerSession, type Session } from "next-auth";
import { getSession, SessionProvider, useSession } from "next-auth/react";

import { trpc } from "../lib/trpc";

import "../styles/globals.css";
import { AccordionContext } from "@/hooks/useAccordionContext";
import { useState } from "react";
import { Toaster } from "react-hot-toast";
import NextTopLoader from "nextjs-toploader";
import useDarkMode from "@/hooks/useDarkMode";

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

export default trpc.withTRPC(MyApp);
