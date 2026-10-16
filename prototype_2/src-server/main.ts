import { stat } from "node:fs/promises";
import { Server } from "socket.io";

import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { secureHeaders } from "hono/secure-headers";
import { csrf } from "hono/csrf";
import { jwt, type JwtVariables } from "hono/jwt";

import * as schemas from "../src/shared.ts";

const PORT = parseInt(process.env["PORT"]!);
if (isNaN(PORT)) throw new Error("Expected PORT");

const app = new Hono();

// app.use(
//   '/api/auth/*',
//   jwt({ secret: 'it-is-very-secret', alg: 'HS256' })
// )

app.use(csrf());
app.use(secureHeaders());

const server = serve({ fetch: app.fetch, port: PORT });
console.log("Restarted");

const io = new Server(server, {
  transports: ["websocket", "webtransport", "polling"],
  // cookie: {},
  // allowRequest: ((req, cb) => {}),
  cleanupEmptyChildNamespaces: true,
  connectTimeout: 10_000,
  pingInterval: 3_000,
  pingTimeout: 10_000,
});

io.on("connection", (socket) => {
  console.log("connection", socket.id, socket.conn.transport.name);

  socket.on("disconnect", (reason) => {
    console.log("disconnected", socket.id, reason);
  });
});

// HACK
setInterval(() => {
  console.log("Client count:", io.engine.clientsCount);
}, 5000);

// astro vite server proxies to us in dev, in prod we drive + serve the files
if (process.env["NODE_ENV"] !== "development") {
  if (!(await stat("dist")).isDirectory()) {
    throw new Error("Expected dist/ dir in prod");
  }
  app.use("/*", serveStatic({ root: "./dist" }));
}

process.on("SIGINT", () => {
  console.log("Received SIGINT");
  io.close().catch((err) => {
    console.error(err);
    process.exit(1);
  });
  server.close();
  process.exit(0);
});
process.on("SIGTERM", async () => {
  console.log("Received SIGTERM");
  io.close().catch((err) => {
    console.error(err);
    process.exit(1);
  });
  server.close((err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    process.exit(0);
  });
});
