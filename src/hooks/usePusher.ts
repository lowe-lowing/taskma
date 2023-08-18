import { clientEnv } from "@/env/schema.mjs";
import { UpdateUiPusherResponse } from "@/server/trpc/router/pusher";
import Pusher from "pusher-js";
import { useEffect } from "react";

const pusher = new Pusher(clientEnv.NEXT_PUBLIC_PUSHER_KEY as string, {
  cluster: clientEnv.NEXT_PUBLIC_PUSHER_CLUSTER as string,
});

export const usePusher = (
  channel: string,
  event: string,
  func: (data: UpdateUiPusherResponse) => void
) => {
  useEffect(() => {
    const chann = pusher.subscribe(channel);

    chann.bind(event, (data: UpdateUiPusherResponse) => {
      func(data);
    });

    return () => {
      pusher.unsubscribe(channel);
    };
  }, []);
};
