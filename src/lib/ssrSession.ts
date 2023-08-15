import { type GetServerSideProps } from "next";
import { type Session } from "next-auth";
import { type GetSessionParams, getSession } from "next-auth/react";

export const ssrSession: GetServerSideProps<{
  data: Session | null;
}> = async (ctx: GetSessionParams) => {
  const session = await getSession(ctx);
  return { props: { data: session } };
};
