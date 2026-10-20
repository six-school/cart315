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
  gfx.clear(COLOR.Y_WINE);

  // wall/backdrop
  gfx.rect_fill(0, 0, usagi.GAME_W, usagi.GAME_H * 0.65, COLOR.X_PLUM);

  const { petX, petY } = State;

  const x = petX + noise1D(t / 2 + 39458) * 14; // TODO: scale speed/magnitude by anxiousness?
  const y = petY + (osc01(0.5) + noise1D(t + 1000)) * 5;

  const floor = petY + 110;

  const bodyX = x + 20;
  const bodyY = petY + 20 + (osc01(0.5, 0.34) + noise1D(t + 4325)) * 5;
  const BODY_SIZE = 65;

  // shadow
  ellipse(bodyX, floor, BODY_SIZE * 1.2, BODY_SIZE * 0.3, 60, COLOR.Z_INK, 1);
  ellipse(x, floor, HEAD_SIZE * 1.2, HEAD_SIZE * 0.3, 60, COLOR.Z_INK, 1);

  // body
  gfx.circ_fill(bodyX, bodyY, BODY_SIZE, COLOR.J_PERIWINKLE);

  // can't use x with noise applied, we want em to stay fixed
  // conceptually `x + 20` matches what's in bodyX tho
  const footLeft = petX + 20 - 50;
  const footRight = petX + 20 + 60;
  // legs
  curve(bodyX - 30, bodyY + BODY_SIZE - 10, footLeft, floor, -0.3, 9, COLOR.J_PERIWINKLE);
  curve(bodyX + 30, bodyY + BODY_SIZE - 10, footRight, floor, 0.3, 9, COLOR.J_PERIWINKLE);
  ellipse(footLeft - 5, floor, 10, 5, 10, COLOR.J_PERIWINKLE);
  ellipse(footRight + 5, floor, 10, 5, 10, COLOR.J_PERIWINKLE);

  const [mx, my] = input.mouse();
  const mouseNoticeThresholdX = petX + 100;
  const focalpoint = input.mouse_over() && mx < mouseNoticeThresholdX ? "cursor" : "nothing";

  // some fake parallax
  const faceOffsetX =
    focalpoint === "cursor"
      ? util.remap(mx, 0, mouseNoticeThresholdX, -20, 10)
      : util.remap(noise1D(t + 12020), -1, 1, 0, -10);

  const faceOffsetY = focalpoint === "cursor" ? util.remap(my, 0, usagi.GAME_H, -20, 20) : 0;

  // head
  gfx.circ_fill(
    x + (focalpoint === "cursor" ? faceOffsetX * 0.3 : 0),
    y,
    HEAD_SIZE,
    COLOR.J_PERIWINKLE,
  );

  const faceX = x;
  const faceY = y - 20;

  const earLeftX = x - 20 - faceOffsetX;
  const earRightX = x + 46 + faceOffsetX * 0.5;
  const earY = y + faceOffsetY * -0.2 - HEAD_SIZE;
  // ears
  gfx.circ_fill(earLeftX, earY - 15, 30, COLOR.J_PERIWINKLE);
  gfx.circ_fill(earLeftX, earY - 15, 15, COLOR.N_STEEL);
  gfx.circ_fill(earRightX, earY - 10, 30, COLOR.J_PERIWINKLE);
  gfx.circ_fill(earRightX, earY - 10, 15, COLOR.N_STEEL);

  const eyeLeftX = faceX + faceOffsetX * 0.5 - (HEAD_SIZE - EYE_SIZE - 9);
  const eyeLeftY = faceY + faceOffsetY;
  const eyeRightX = faceX + faceOffsetX + (HEAD_SIZE - EYE_SIZE - 20);
  const eyeRightY = faceY + faceOffsetY + 5;

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
  const mouthX = faceX + faceOffsetX * 0.6;
  const mouthMidY = faceY + faceOffsetY + 26;
  // tongue
  gfx.circ_fill(mouthX - 10, mouthMidY + 9 + osc(0.6) * 2, 4, COLOR.D_BLUSH);
  // :3
  curve(mouthX - 30, mouthMidY - 2, mouthX - 10, mouthMidY, -0.9, 5, PUPIL_COL);
  curve(mouthX - 10, mouthMidY, mouthX + 10, mouthMidY + 2, -0.9, 5, PUPIL_COL);

  // nose
  gfx.circ_fill(mouthX - 12, faceY + faceOffsetY + 18, 10, COLOR.N_STEEL);

  // highlight the cursor when noticed
  if (focalpoint === "cursor") {
    const lineCount = 12;
    const innerDist = 15 + osc01(0.5) * 5;
    const outerDist = 26 + osc01(0.5, 52) * 5;
    for (let i = 0; i < lineCount; i++) {
      const a = (i / lineCount) * Math.PI * 2 + t / 2;
      const dx = Math.cos(a);
      const dy = Math.sin(a);
      gfx.line_ex(
        mx + dx * innerDist,
        my + dy * innerDist,
        mx + dx * outerDist,
        my + dy * outerDist,
        4,
        COLOR.B_PEACH,
        0.5 + osc01(0.5) * 0.25,
      );
    }
  }
};
