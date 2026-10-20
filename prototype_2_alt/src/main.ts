import { noise1D } from "./noise";
import { COLOR } from "./palette";
import { curve } from "./shapes";
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
    petY: 120,
  };
};

_update = (dt: number) => {
  // cap delta time (slow framerate instead of allowing massive frameskip to occur)
  // eslint-disable-next-line no-param-reassign
  if (dt > 0.0333) dt = 0.0333;
  t += dt;

  // TODO: game logic
};

const HEAD_SIZE = 60;
const EYE_SIZE = 12;
const EYE_COL = COLOR.B_PEACH;
const PUPIL_SIZE = 4;
const PUPIL_COL = COLOR.W_AUBERGINE;

_draw = () => {
  gfx.clear(COLOR.Z_INK);

  const { petX, petY } = State;

  const y = petY + (osc01(0.5) + noise1D(t + 1000)) * 5;

  const eyeLeftX = petX - (HEAD_SIZE - EYE_SIZE - 9);
  const eyeLeftY = y;
  const eyeRightX = petX + (HEAD_SIZE - EYE_SIZE - 9);
  const eyeRightY = y + 5;

  const bodyY = petY + (osc01(0.5, 0.34) + noise1D(t + 4325)) * 5;
  gfx.circ_fill(petX + 20, bodyY + 70, 70, COLOR.K_GREY);

  // head

  gfx.circ_fill(petX, y, HEAD_SIZE, COLOR.J_PERIWINKLE);

  // eyes
  gfx.line_ex(eyeLeftX - 12, eyeLeftY - 20, eyeLeftX + 12, eyeLeftY - 18, 6, PUPIL_COL);
  gfx.line_ex(eyeRightX - 12, eyeRightY - 20, eyeRightX + 12, eyeRightY - 19, 6, PUPIL_COL);
  if (noise1D(t * 2) > 0.6) {
    gfx.line_ex(eyeLeftX - 12, eyeLeftY, eyeLeftX + 12, eyeLeftY, 4, PUPIL_COL);
    gfx.line_ex(eyeRightX - 12, eyeRightY, eyeRightX + 12, eyeRightY, 4, PUPIL_COL);
  } else {
    gfx.circ_fill(eyeLeftX, eyeLeftY, EYE_SIZE, EYE_COL);
    gfx.circ_fill(eyeRightX, eyeRightY, EYE_SIZE, EYE_COL);
    gfx.circ_fill(eyeLeftX - 4, eyeLeftY, PUPIL_SIZE, PUPIL_COL);
    gfx.circ_fill(eyeRightX + 4, eyeRightY, PUPIL_SIZE, PUPIL_COL);
  }

  // mouth
  const happiness = noise1D(t / 3 + 2398) * 0.4;
  curve(petX - 25, y + 39, petX + 4, y + 41, happiness, 4, PUPIL_COL);

  // nose
  gfx.tri_fill(petX - 5, y - 5, petX - 28, y + 27, petX + 5, y + 30, COLOR.F_SAGE);
};
