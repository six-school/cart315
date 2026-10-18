import { z } from "zod";

export type Rpc<Ctx, Schema extends z.ZodType> = {
  input: Schema;
  handler: (ctx: Ctx, input: z.output<Schema>) => void;
};

export type AnyRouter = Record<string, Rpc<any, any>>;

export type ContextOf<R extends AnyRouter> =
  R[keyof R] extends Rpc<infer Ctx, z.ZodType> ? Ctx : never;

export function initRouter<Ctx>() {
  return {
    input: <Schema extends z.ZodType>(input: Schema) => ({
      rpc: (handler: Rpc<Ctx, Schema>["handler"]): Rpc<Ctx, Schema> => ({ input, handler }),
    }),
    router: <R extends Record<string, Rpc<Ctx, z.ZodType>>>(rpcs: R): R => rpcs,
  };
}

type Listener = { on(event: string, listener: (payload: unknown) => void): unknown };

export function serveRouter<R extends AnyRouter>(
  socket: Listener,
  router: R,
  ctx: ContextOf<R>,
  { label, after }: { label: string; after?: () => void },
) {
  for (const [name, { input, handler }] of Object.entries(router)) {
    socket.on(name, (payload) => {
      const parsed = input.safeParse(payload);
      if (!parsed.success) {
        console.warn(`Ignored an invalid "${name}" in ${label}:\n${z.prettifyError(parsed.error)}`);
        return;
      }
      handler(ctx, parsed.data);
      after?.();
    });
  }
}
