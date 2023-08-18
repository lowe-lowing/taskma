import { type NextApiRequest, type NextApiResponse } from "next";
import Pusher from "pusher";

const pusher = new Pusher({
  appId: "1654950",
  key: "b2ec6ffdc8e069a11620",
  secret: "83cef5601cdeffc890e9",
  cluster: "eu",
});

export type UpdateUiPusher = {
  userId: string;
  boardId: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { userId, boardId } = req.body;
    await pusher.trigger("taskma-ui", "update-ui", {
      userId,
      boardId,
    } as UpdateUiPusher);
    res.status(200);
  } else {
    res.status(404);
  }
}
