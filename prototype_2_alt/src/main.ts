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

  mouse: [number, number];
  attention: { weight: { none: number; cursor: number } };
};

declare let State: GameState;

declare let t: number;
// elapsed game time (slower than wall time if game slows down!)
t = 0;

type AttentionTarget = "cursor" | "none";
const ATTENTION_TRANSITION_DURATION = 0.16;

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

    mouse: [0, 0],
    attention: { weight: { none: 1, cursor: 0 } },
  };
};

_update = (dt: number) => {
  // cap delta time (slow framerate instead of allowing massive frameskip to occur)
  // eslint-disable-next-line no-param-reassign
  if (dt > 0.0333) dt = 0.0333;
  t += dt;

  State.mouse = input.mouse();
  const [mx] = State.mouse;

  const mouseNoticeThresholdX = State.petX + 100;
  const target = input.mouse_over() && mx < mouseNoticeThresholdX ? "cursor" : "none";
  const step = dt / ATTENTION_TRANSITION_DURATION;
  for (const [k, v] of Object.entries(State.attention.weight)) {
    const next = util.clamp(v + (k === target ? step : -step), 0, 1);
    State.attention.weight[k as AttentionTarget] = next;
  }

  // if (State.mouse[0] > UI_X && input.mouse_held(input.MOUSE_LEFT)) {
  //   State.mood = util.clamp(util.remap(State.mouse[0], UI_X, usagi.GAME_W, 0, 1), 0, 1);
  // }

  // State.activityTimeLeft -= 1;
  // if (State.activityTimeLeft <= 0) {
  // }
};

const HEAD_SIZE = 60;
const EYE_SIZE = 12;
const PUPIL_SIZE = 7;
const PUPIL_COL = COLOR.W_AUBERGINE;

_draw = () => {
  gfx.clear(COLOR.Y_WINE);

  // wall/backdrop
  gfx.rect_fill(0, 0, usagi.GAME_W, usagi.GAME_H * 0.65, COLOR.X_PLUM);

  drawUI(); // behind the pet
  drawPet();
};

const UI_X = 320;
const UI_Y = 10;
const BAR_WIDTH = 140;
const SPACING = 24;
const UI_SCALE = [COLOR.D_BLUSH, COLOR.G_DUSTY_ROSE, COLOR.C_BONE, COLOR.F_SAGE, COLOR.A_PALE_LIME];

function drawUI() {
  const { day, month, hour, minute } = State;
  gfx.text_ex(`${day} ${MONTHS[month]}, ${hour}h${minute}`, UI_X, UI_Y, 2, 0, COLOR.A_PALE_LIME, 1);

  type StatArgs = [text: string, amount: number, preference: "low" | "neutral" | "high"];

  const drawStat = ([text, amount, preference]: StatArgs, row: number, col: number) => {
    const mapped = (() => {
      // prettier-ignore
      // eslint-disable-next-line default-case
      switch (preference) {
        case "low": return 1 - amount;
        case "neutral": return 1 - Math.abs(amount - 0.5) * 2;
        case "high": return amount;
      }
    })();
    const barColor = UI_SCALE[Math.floor(util.clamp(mapped, 0, 0.99) * UI_SCALE.length)];

    const x = UI_X + col * (BAR_WIDTH + SPACING);
    gfx.text_ex(text, x, UI_Y + row * SPACING, 2, 0, COLOR.A_PALE_LIME, 1);
    gfx.rect_fill(x, UI_Y + (row + 1) * SPACING, BAR_WIDTH, 16, COLOR.N_STEEL, 1);
    gfx.rect_fill(x, UI_Y + (row + 1) * SPACING, BAR_WIDTH * amount, 16, barColor, 1);
  };

  const { bodyTemp, stress, anxiety, fatigue, hunger, mood } = State;
  const statGrid: [StatArgs, StatArgs][] = [
    [
      [`Temperature`, bodyTemp, "neutral"],
      [`Stress`, stress, "low"],
    ],
    [
      [`Anxiety`, anxiety, "low"],
      [`Fatigue`, fatigue, "low"],
    ],
    [
      [`Hunger`, hunger, "low"],
      [`Mood`, mood, "high"],
    ],
  ];

  let row = 1;
  for (const [l, r] of statGrid) {
    drawStat(l, row, 0);
    drawStat(r, row, 1);
    row += 2;
  }
}

function drawPet() {
  const {
    petX,
    petY,
    mood,
    mouse: [mx, my],
    attention,
  } = State;

  const adjX = petX + noise1D(t / 2 + 39458) * 14; // TODO: scale speed/magnitude by anxiousness?
  const adjY = petY + (osc01(0.5) + noise1D(t + 1000)) * 5;

  const floor = petY + 110;

  const bodyX = adjX + 20;
  const bodyY = petY + 20 + (osc01(0.5, 0.34) + noise1D(t + 4325)) * 5;
  const BODY_SIZE = 65;

  // shadow
  ellipse(bodyX, floor, BODY_SIZE * 1.2, BODY_SIZE * 0.3, 60, COLOR.Z_INK, 1);
  ellipse(adjX, floor, HEAD_SIZE * 1.2, HEAD_SIZE * 0.3, 60, COLOR.Z_INK, 1);

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

  // TODO: duplicated in _update(), should be generalized as bounds for noticing anything
  const mouseNoticeThresholdX = petX + 100;

  // way more complicated than it needs to be on the expectation that we'll have
  // multiple possible targets at some point (when we'll also need to do a
  // weighted sum to get the final position)
  const attentionX = util.clamp(mx, 0, mouseNoticeThresholdX);
  const attentionY = my;

  // some fake parallax
  const faceOffsetX = util.lerp(
    util.remap(noise1D(t + 12020), -1, 1, 0, -10),
    util.remap(attentionX, 0, mouseNoticeThresholdX, -20, 10),
    attention.weight.cursor,
  );
  const faceOffsetY = util.lerp(
    0,
    util.remap(attentionY, 0, usagi.GAME_H, -20, 20),
    attention.weight.cursor,
  );

  const faceX = adjX;
  const faceY = adjY - 20;

  const earLeftX = adjX - 20 - faceOffsetX * 0.6;
  const earRightX = adjX + 46 + faceOffsetX * 0.5;
  const earY = adjY + faceOffsetY * -0.2 - HEAD_SIZE;
  // ears
  gfx.circ_fill(earLeftX, earY - 15, 30, COLOR.J_PERIWINKLE);
  gfx.circ_fill(earLeftX, earY - 15, 15, COLOR.N_STEEL);
  gfx.circ_fill(earRightX, earY - 10, 30, COLOR.J_PERIWINKLE);
  gfx.circ_fill(earRightX, earY - 10, 15, COLOR.N_STEEL);

  // head
  gfx.circ_fill(adjX + faceOffsetX * 0.3, adjY, HEAD_SIZE, COLOR.J_PERIWINKLE);

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
  const concern = util.remap(mood, 0, 1, -0.6, 0.6) + noise1D(t / 3 + 3924) * 0.2;
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
  if (attention.weight.cursor > 0) {
    const [x, y] = [mx, my];
    const lineCount = 12;
    for (let i = 0; i < lineCount; i++) {
      const oscScale = i % 2 === 0 ? 2 : 3;
      const innerDist = 21 + osc(0.5) * oscScale;
      const outerDist = 32 + osc(0.5) * oscScale;

      const a = (i / lineCount) * Math.PI * 2 + t / 2;
      const dx = Math.cos(a);
      const dy = Math.sin(a);
      gfx.line_ex(
        x + dx * innerDist,
        y + dy * innerDist,
        x + dx * outerDist,
        y + dy * outerDist,
        4,
        COLOR.B_PEACH,
        (0.5 + osc01(0.5) * 0.25) * attention.weight.cursor,
      );
    }
  }
}
