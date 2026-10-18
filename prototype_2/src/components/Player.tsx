import { useState } from "react";

import { socket } from "./client";
import type { ServerToPlayerMessages } from "~/shared";

export const Player = () => {
  const [connected, setConnected] = useState(socket.connected);
  const [playerState, setPlayerState] = useState<ServerToPlayerMessages>({
    t: "loading",
  });

  return <div>hi from client</div>;
};
