import { io } from "socket.io-client";

export const socket = io({
  transports: ["websocket", "webtransport", "polling"],
});

socket.on("connect", () => {
  console.log("connected", socket.id);
});

socket.on("disconnect", () => {
  console.log("disconnected");
});
