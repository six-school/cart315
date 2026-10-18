import type { z } from "zod";

import type { AnyRouter } from "./router.ts";

export type RouterInputs<R extends AnyRouter> = { [K in keyof R]: z.input<R[K]["input"]> };

export type RpcClient<R extends AnyRouter> = {
  [K in keyof R]: (input: RouterInputs<R>[K]) => void;
};

type Emitter = { emit(event: string, payload: unknown): unknown };

export function createRPCClient<R extends AnyRouter>(socket: Emitter): RpcClient<R> {
  // The RPC names only exist in the type, so any property is a call.
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  return new Proxy({} as RpcClient<R>, {
    get: (_, name) =>
      typeof name === "string" && name !== "then"
        ? (input: unknown) => {
            socket.emit(name, input);
          }
        : undefined,
  });
}
