import { assertNever } from "./util";

import type { GameState as NormalState } from "./normal";
import type { GameState as SpeedState } from "./speed";
import type { GameState as RPGState } from "./rpg";

type MenuState = { mode: "menu"; selected: number };

type GameState = MenuState | NormalState | RPGState | SpeedState;

declare let State: GameState;

declare let t: number;
// elapsed game time (slower than wall time if game slows down!)
t = 0;

// TODO: just derive from imported games?
const gameList: [string, string][] = [
  ["normal", "Normal Pong"],
  ["speed", "Speed Pong"],
  ["rpg", "RPG Pong"],
];

_config = () => {
  return { name: "pong", game_id: "com.usagiengine.SIX_PONG" };
};

// F5 to reset
_init = () => {
  initMenu();
  // (require("./rpg") as typeof import("./rpg"))._init();
};

_update = (dt: number) => {
  // cap delta time (slow framerate instead of allowing massive frameskip to occur)
  // eslint-disable-next-line no-param-reassign
  if (dt > 0.0333) dt = 0.0333;
  t += dt;

  // TODO: proceduralize, don't write by hand
  switch (State.mode) {
    case "menu":
      updateMenu(dt, State);
      break;
    case "normal":
      (require("./normal") as typeof import("./normal"))._update(dt);
      break;
    case "speed":
      (require("./speed") as typeof import("./speed"))._update(dt);
      break;
    case "rpg":
      (require("./rpg") as typeof import("./rpg"))._update(dt);
      break;
    default:
      assertNever(State);
  }
};

_draw = () => {
  switch (State.mode) {
    case "menu":
      drawMenu(State);
      break;
    case "normal":
      (require("./normal") as typeof import("./normal"))._draw();
      break;
    case "speed":
      (require("./speed") as typeof import("./speed"))._draw();
      break;
    case "rpg":
      (require("./rpg") as typeof import("./rpg"))._draw();
      break;
    default:
      assertNever(State);
  }
};

function initMenu() {
  State = {
    mode: "menu",
    selected: 0,
  };
}

// eslint-disable-next-line @typescript-eslint/no-shadow
function updateMenu(dt: number, State: MenuState) {
  if (input.key_pressed(input.KEY_W) || input.key_pressed(input.KEY_UP)) {
    State.selected -= 1;
    if (State.selected < 0) State.selected = gameList.length - 1;
  } else if (input.key_pressed(input.KEY_S) || input.key_pressed(input.KEY_DOWN)) {
    State.selected = (State.selected + 1) % gameList.length;
  } else if (input.key_pressed(input.KEY_SPACE)) {
    require(gameList[State.selected][0])._init();
  }
}

// eslint-disable-next-line @typescript-eslint/no-shadow
function drawMenu(State: MenuState) {
  gfx.clear(gfx.COLOR_BLACK);

  gfx.text("Six's Cool Pongs", 5, 0, gfx.COLOR_WHITE);

  gfx.text("->", 5, 15 + State.selected * 10, gfx.COLOR_WHITE);

  for (const [i, [id, name]] of gameList.entries()) {
    gfx.text(name, 20, 15 + i * 10, gfx.COLOR_WHITE);
  }
}
