import { clientEnv } from "@/env/schema.mjs";
import Pusher from "pusher-js";
import { useEffect } from "react";

const pusher = new Pusher(clientEnv.NEXT_PUBLIC_PUSHER_KEY as string, {
  cluster: clientEnv.NEXT_PUBLIC_PUSHER_CLUSTER as string,
});

export function usePusher<T>(channel: string, event: string, func: (data: T) => void) {
  useEffect(() => {
    const chann = pusher.subscribe(channel);

    chann.bind(event, (data: T) => {
      func(data);
    });

    return () => {
      pusher.unsubscribe(channel);
    };
  }, []);
}
