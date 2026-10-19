import { assertNever } from "./util";

type GameState = { x: number };

declare let State: GameState;

declare let t: number;
// elapsed game time (slower than wall time if game slows down!)
t = 0;

_config = () => {
  return { name: "pet", game_id: "com.usagiengine.SIX_PET" };
};

// F5 to reset
_init = () => {
  // music.stop();
  // sfx.stop_all();
  // TODO: set state
};

_update = (dt: number) => {
  // cap delta time (slow framerate instead of allowing massive frameskip to occur)
  // eslint-disable-next-line no-param-reassign
  if (dt > 0.0333) dt = 0.0333;
  t += dt;

  // TODO: game logic
};

_draw = () => {
  // TODO: draw

  gfx.circ_ex(usagi.GAME_W / 2, usagi.GAME_H / 2, 20, 2, gfx.COLOR_RED);
};
