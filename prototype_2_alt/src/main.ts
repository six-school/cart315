import { noise1D } from "./noise";
import { COLOR } from "./palette";
import { curve, ellipse } from "./shapes";

type GameState = {
  petX: number;
  petY: number;

  bodyTemp: number;
  stress: number;
  anxiety: number;
  fatigue: number;
  bankBalance: number;

  apartmentTemp: number;
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
  return {
    name: "house mouse",
    game_id: "com.usagiengine.SIX_PET",
    game_width: 640,
    game_height: 360,
  };
};

// F5 to reset
_init = () => {
  // music.stop();
  State = {
    petX: 150,
    petY: 170,

    bodyTemp: 0.5,
    stress: 0.2,
    anxiety: 0.4,
    fatigue: 0.3,
    bankBalance: 1000,

    apartmentTemp: 0.5,
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
const PUPIL_SIZE = 7;
const PUPIL_COL = COLOR.W_AUBERGINE;

_draw = () => {
  gfx.clear(COLOR.Z_INK);

  const { petX, petY } = State;

  const y = petY + (osc01(0.5) + noise1D(t + 1000)) * 5;

  // body
  const bodyX = petX + 20;
  const bodyY = petY + 20 + (osc01(0.5, 0.34) + noise1D(t + 4325)) * 5;
  const BODY_SIZE = 65;
  gfx.circ_fill(bodyX, bodyY, BODY_SIZE, COLOR.J_PERIWINKLE);

  const floor = petY + 110;
  // legs
  curve(bodyX - 30, bodyY + BODY_SIZE - 10, bodyX - 50, floor, -0.3, 9, COLOR.J_PERIWINKLE);
  curve(bodyX + 30, bodyY + BODY_SIZE - 10, bodyX + 60, floor, 0.3, 9, COLOR.J_PERIWINKLE);
  ellipse(bodyX - 55, floor, 10, 5, 10, COLOR.J_PERIWINKLE);
  ellipse(bodyX + 65, floor, 10, 5, 10, COLOR.J_PERIWINKLE);

  // head
  gfx.circ_fill(petX, y, HEAD_SIZE, COLOR.J_PERIWINKLE);

  // some fake parallax
  const faceOffsetX = util.remap(noise1D(t + 12020), -1, 1, 0, -10);
  const faceX = petX;
  const faceY = y;

  // ears
  gfx.circ_fill(petX + 46 + faceOffsetX * 0.5, y - HEAD_SIZE + 10, 30, COLOR.J_PERIWINKLE);
  gfx.circ_fill(petX + 46 + faceOffsetX * 0.5, y - HEAD_SIZE + 5, 15, COLOR.N_STEEL);
  gfx.circ_fill(petX - 20 - faceOffsetX, y - HEAD_SIZE + 5, 30, COLOR.J_PERIWINKLE);
  gfx.circ_fill(petX - 20 - faceOffsetX, y - HEAD_SIZE, 15, COLOR.N_STEEL);

  const eyeLeftX = faceX + faceOffsetX * 0.2 - (HEAD_SIZE - EYE_SIZE - 9);
  const eyeLeftY = faceY;
  const eyeRightX = faceX + faceOffsetX + (HEAD_SIZE - EYE_SIZE - 9);
  const eyeRightY = faceY + 5;

  // eyes
  if (noise1D(t * 2) > 0.6) {
    gfx.line_ex(eyeLeftX - 12, eyeLeftY, eyeLeftX + 12, eyeLeftY, 4, PUPIL_COL);
    gfx.line_ex(eyeRightX - 12, eyeRightY, eyeRightX + 12, eyeRightY, 4, PUPIL_COL);
  } else {
    gfx.circ_fill(eyeLeftX - 4, eyeLeftY, PUPIL_SIZE, PUPIL_COL);
    gfx.circ_fill(eyeRightX + 4, eyeRightY, PUPIL_SIZE, PUPIL_COL);
  }

  // brows
  const concern = noise1D(t / 3 + 3924) * 0.4;
  curve(eyeLeftX - 12, eyeLeftY - 18, eyeLeftX + 12, eyeLeftY - 16, concern, 7, PUPIL_COL);
  curve(eyeRightX - 12, eyeRightY - 18, eyeRightX + 12, eyeRightY - 16, concern, 7, PUPIL_COL);

  // mouth
  const happiness = util.remap(noise1D(t / 3 + 2398), -1, 1, -0.2, -0.8);

  const mouthX = faceX + faceOffsetX * 0.6;
  gfx.circ_fill(mouthX - 10, faceY + 35 + osc(0.6) * 2, 4, COLOR.D_BLUSH);
  curve(mouthX - 30, faceY + 24, mouthX - 10, faceY + 26, -0.9, 5, PUPIL_COL);
  curve(mouthX - 10, faceY + 26, mouthX + 10, faceY + 28, -0.9, 5, PUPIL_COL);

  gfx.circ_fill(mouthX - 12, faceY + 18, 10, COLOR.N_STEEL);

  // nose
  // gfx.tri_fill(petX - 5, y - 5, petX - 28, y + 27, petX + 5, y + 30, COLOR.F_SAGE);
};
