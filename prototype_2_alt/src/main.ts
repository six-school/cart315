import { noise1D } from "./noise";
import { COLOR } from "./palette";
import { assertNever } from "./util";

type GameState = {
  petX: number;
  petY: number;
};

declare let State: GameState;

declare let t: number;
// elapsed game time (slower than wall time if game slows down!)
t = 0;

/* oscillate between -1 and 1 freq times per sec*/
const osc = (freq: number, phase = 0) => Math.sin((t + phase) * freq * Math.PI * 2);
/* oscillate between 0 to 1 freq times per sec*/
const osc01 = (freq: number, phase = 0) => (osc(freq, phase) + 1) / 2;

_config = () => {
  return { name: "pet", game_id: "com.usagiengine.SIX_PET", game_width: 640, game_height: 360 };
};

// F5 to reset
_init = () => {
  // music.stop();
  State = {
    petX: 190,
    petY: 40,
  };
};

_update = (dt: number) => {
  // cap delta time (slow framerate instead of allowing massive frameskip to occur)
  // eslint-disable-next-line no-param-reassign
  if (dt > 0.0333) dt = 0.0333;
  t += dt;

  // TODO: game logic
};

_draw = () => {
  gfx.clear(COLOR.Z_INK);

  const { petX, petY } = State;

  const y = 90 + osc01(0.5) * 5;

  const HEAD_SIZE = 60;
  const EYE_SIZE = 12;
  const PUPIL_SIZE = 4;

  gfx.circ_fill(petX, y, HEAD_SIZE, COLOR.E_LAVENDER);

  if (noise1D(t) > 0.9) {
    //
  } else {
    gfx.circ_fill(petX - (HEAD_SIZE - EYE_SIZE - 9), y, EYE_SIZE, COLOR.B_PEACH);
    gfx.circ_fill(petX - (HEAD_SIZE - EYE_SIZE - 9) - 4, y, PUPIL_SIZE, COLOR.W_AUBERGINE);
    gfx.circ_fill(petX + (HEAD_SIZE - EYE_SIZE - 9), y + 5, EYE_SIZE, COLOR.B_PEACH);
    gfx.circ_fill(petX + (HEAD_SIZE - EYE_SIZE - 9) + 4, y + 5, PUPIL_SIZE, COLOR.W_AUBERGINE);
  }
};
