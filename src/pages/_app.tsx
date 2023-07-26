import { type AppType } from "next/app";
import { getServerSession, type Session } from "next-auth";
import { getSession, SessionProvider, useSession } from "next-auth/react";

import { trpc } from "../lib/trpc";

import "../styles/globals.css";
import Navbar from "@/components/Navbar";
import { AccordionContext } from "@/hooks/useAccordionContext";
import { useState } from "react";
import { Toaster } from "react-hot-toast";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  const [value, setValue] = useState<string[]>([]);

  return (
    <SessionProvider session={session}>
      {/* <Navbar /> */}
      <Toaster position="bottom-right" />
      <AccordionContext.Provider value={{ value, setValue }}>
        <Component {...pageProps} />
      </AccordionContext.Provider>
    </SessionProvider>
  );
};

export default trpc.withTRPC(MyApp);
