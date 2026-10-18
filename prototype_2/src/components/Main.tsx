import { useEffect, useState } from "react";

import { socket } from "./client";

import type { ServerToHostMessages } from "~/shared";

export const Main = () => {
  const [connected, setConnected] = useState(socket.connected);
  const [hostState, setHostState] = useState<ServerToHostMessages>({
    t: "loading",
  });

  useEffect(() => {
    //
  }, []);

  return <div>hi from host</div>;
};
