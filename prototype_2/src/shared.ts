import { z, strictObject as o, literal as l } from "zod";

// Overall server game state.
export type GameState = {
  players: (PlayerInfo & { id: string; generation: number })[];
  paused: boolean;
} & (
  | { phase: "lobby"; ready: Record<string, boolean> }
  | { phase: "lobbyTransition" }
  | { phase: "battleIntro" }
  | { phase: "battle"; hp: Record<string, number>; enemies: EnemyInfo[] }
);

export const playerInfo = o({
  name: z.string(),
  hat: z.int().nonnegative(),
  clothes: z.int().nonnegative(),
  accessory: z.int().nonnegative(),
  skinTone: z.int().nonnegative(),
});

type PlayerInfo = z.infer<typeof playerInfo>;

export const playerLobbyData = playerInfo.extend({
  ready: z.boolean(),
});

export const playerBattleInfo = playerInfo.extend({
  hp: z.int().nonnegative(),
  items: o({}),
});

export const enemyInfo = o({
  name: z.string(),
  sprite: z.string(),
  hp: z.string(),
});

type EnemyInfo = z.infer<typeof enemyInfo>;

// -------------------------

export const hostToServerMessages = z.compile(
  z.union([
    o({ t: l("create") }),
    o({ t: l("pause") }),
    o({ t: l("unpause") }),
  ]),
);

export type HostToServerMessages = z.infer<typeof hostToServerMessages>;

export const serverToHostMessages = z.compile(
  z.union([
    // dummy state for initial render
    o({ t: l("loading") }),
    o({
      t: l("lobby"),
      paused: z.boolean(),
      players: z.array(playerLobbyData),
    }),
    o({ t: l("lobbyTransition") }),
    o({
      t: l("battleIntro"),
      paused: z.boolean(),
      players: z.array(playerInfo),
    }),
    o({
      t: l("battle"),
      paused: z.boolean(),
      players: z.array(playerBattleInfo),
      enemies: z.array(enemyInfo),
    }),
    o({ t: l("resolution"), paused: z.boolean(), results: o({}) }),
    o({ t: l("postgame"), paused: z.boolean(), results: o({}) }),
  ]),
);

export type ServerToHostMessages = z.infer<typeof serverToHostMessages>;

export const playerToServerMessages = z.compile(
  z.union([
    o({
      t: l("lobby"),
      playerData: playerLobbyData,
      // compare with the data we receive to check if it's stale
      generation: z.int().nonnegative(),
    }),
    o({ t: l("choice"), data: z.string() }),
  ]),
);

export type PlayerToServerMessages = z.infer<typeof playerToServerMessages>;

export const serverToPlayerMessages = z.compile(
  z.union([
    // dummy state for initial render
    o({ t: l("loading") }),
    o({
      t: l("lobby"),
      playerData: playerLobbyData,
      generation: z.int().nonnegative(),
    }),
    o({ t: l("lobbyTransition") }),
    o({ t: l("battleIntro"), items: o({}) }),
    o({ t: l("choice"), id: z.int().nonnegative(), choices: o({}) }),
    o({ t: l("message"), message: z.string() }),
  ]),
);

export type ServerToPlayerMessages = z.infer<typeof serverToPlayerMessages>;
