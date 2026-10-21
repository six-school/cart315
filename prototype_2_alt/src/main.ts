import { noise1D } from "./noise";
import { COLOR } from "./palette";
import { curve, ellipse } from "./shapes";

type GameState = {
  petX: number;
  petY: number;

  // all in the domain 0-1
  bodyTemp: number;
  stress: number;
  anxiety: number;
  fatigue: number;
  hunger: number;
  mood: number;

  bankBalance: number;
  employmentStatus: { t: "jobless" } | { t: "employed"; salary: number; firingRisk: number };
  activity:
    { t: "idle" } | { t: "jobsearch" } | { t: "working" } | { t: "eating" } | { t: "sleeping" };
  activityTimeLeft: number;

  month: number;
  day: number;
  hour: number;
  minute: number;
  monthlyRent: number;
  groceryCost: number;
  apartmentTemp: number; // 0-1
  humidity: number; // 0-1
};

declare let State: GameState;

declare let t: number;
// elapsed game time (slower than wall time if game slows down!)
t = 0;

const MONTHS = [
  "Pluviôse",
  "Ventôse",
  "Germinal",
  "Floréal",
  "Prairial",
  "Messidor",
  "Thermidor",
  "Fructidor",
  "Vendémiaire",
  "Brumaire",
  "Frimaire",
  "Nivôse",
] as const;

/* oscillate between -1 and 1 `freq` times per sec, offset by `phase` % (0-1) */
const osc = (freq: number, phase = 0) => Math.sin((t * freq + phase) * Math.PI * 2);
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
    hunger: 0.2,
    mood: 0.75,

    bankBalance: 32,
    employmentStatus: { t: "jobless" },
    activity: { t: "idle" },
    activityTimeLeft: 15,

    month: 10,
    day: 20,
    hour: 17,
    minute: 45,
    monthlyRent: 10,
    groceryCost: 2,
    apartmentTemp: 0.4,
    humidity: 0.45,
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

  // behind the pet!!
  drawUI();
  drawPet();
};

const UI_X = 320;
const UI_Y = 10;
const BAR_WIDTH = 300;
const SPACING = 24;
const UI_SCALE = [COLOR.D_BLUSH, COLOR.G_DUSTY_ROSE, COLOR.C_BONE, COLOR.F_SAGE, COLOR.A_PALE_LIME];

function drawUI() {
  let row = 0;
  const label = (text: string) => {
    gfx.text_ex(text, UI_X, UI_Y + row * SPACING, 2, 0, COLOR.A_PALE_LIME, 1);
    row++;
  };
  const bar = (amount: number, color: number) => {
    gfx.rect_fill(UI_X, UI_Y + row * SPACING, BAR_WIDTH, 16, COLOR.N_STEEL, 1);
    gfx.rect_fill(UI_X, UI_Y + row * SPACING, BAR_WIDTH * amount, 16, color, 1);
    row++;
  };
  const stat = (text: string, amount: number, preference: "low" | "neutral" | "high") => {
    const mapped = (() => {
      // prettier-ignore
      // eslint-disable-next-line default-case
      switch (preference) {
        case "low": return 1 - amount;
        case "neutral": return 1 - Math.abs(amount - 0.5) * 2;
        case "high": return amount;
      }
    })();
    const color = UI_SCALE[Math.floor(util.clamp(mapped, 0, 0.99) * UI_SCALE.length)];
    label(text);
    bar(amount, color);
  };

  const { day, month, hour, minute } = State;
  label(`${day} ${MONTHS[month]}, ${hour}h${minute}`);

  const { bodyTemp, stress, anxiety, fatigue, hunger, mood } = State;
  stat(`Temperature`, bodyTemp, "neutral");
  stat(`Stress`, stress, "low");
  stat(`Anxiety`, anxiety, "low");
  stat(`Fatigue`, fatigue, "low");
  stat(`Hunger`, hunger, "low");
  stat(`Mood`, mood, "high");
}

function drawPet() {
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
    for (let i = 0; i < lineCount; i++) {
      const oscScale = i % 2 === 0 ? 2 : 3;
      const innerDist = 21 + osc(0.5) * oscScale;
      const outerDist = 32 + osc(0.5) * oscScale;

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
}
