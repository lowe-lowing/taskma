import { createNextApiHandler } from "@trpc/server/adapters/next";

import { env } from "../../../env/server.mjs";
import { createContext } from "../../../server/trpc/context";
import { appRouter } from "../../../server/trpc/router/_app";

export const config = {
  runtime: "edge",
};

// export API handler
export default createNextApiHandler({
  router: appRouter,
  createContext,
  onError:
    env.NODE_ENV === "development"
      ? ({ path, error }) => {
          console.error(`❌ tRPC failed on ${path}: ${error}`);
        }
      : undefined,
  // responseMeta(opts) {
  //   const { ctx, paths, errors, type } = opts;
  //   // checking that no procedures errored
  //   const allOk = errors.length === 0;
  //   // checking we're doing a query request
  //   const isQuery = type === "query";
  //   if (allOk && isQuery) {
  //     // cache request for 1 day + revalidate once every second
  //     const ONE_DAY_IN_SECONDS = 60 * 60 * 24;
  //     return {
  //       headers: {
  //         "cache-control": `s-maxage=1, stale-while-revalidate=${ONE_DAY_IN_SECONDS}`,
  //       },
  //     };
  //   }
  //   return {};
  // },
});
