import { noise1D } from "./noise";
import { COLOR } from "./palette";
import { curve, ellipse } from "./shapes";
import { randomInArray } from "./util";

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

  log: string[];

  debug: boolean;
};

declare let State: GameState;

declare let t: number;
// elapsed game time (slower than wall time if game slows down!)
t = 0;

type StatusField = "bodyTemp" | "stress" | "anxiety" | "fatigue" | "hunger" | "mood";
type AttentionTarget = "cursor" | "none";
const ATTENTION_TRANSITION_DURATION = 0.16;
const ACTIVITY_TIME = 150;

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

const DEBUG_ACTS = [
  ["idle", input.KEY_1],
  ["jobsearch", input.KEY_2],
  ["working", input.KEY_3],
  ["eating", input.KEY_4],
  ["sleeping", input.KEY_5],
] as const;

/* oscillate between -1 and 1 `freq` times per sec, offset by `phase` % (0-1) */
const osc = (freq: number, phase = 0) => Math.sin((t * freq + phase) * Math.PI * 2);
/* oscillate between 0 to 1 freq times per sec*/
const osc01 = (freq: number, phase = 0) => (osc(freq, phase) + 1) / 2;
const clamp01 = (val: number) => util.clamp(val, 0, 1);

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
    activityTimeLeft: ACTIVITY_TIME,

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

    log: [],

    debug: false,
  };
};

_update = (dt: number) => {
  // cap delta time (slow framerate instead of allowing massive frameskip to occur)
  // eslint-disable-next-line no-param-reassign
  if (dt > 0.0333) dt = 0.0333;
  t += dt;

  updateGame(dt);

  State.mouse = input.mouse();
  const [mx] = State.mouse;

  const cursorNoticeThresholdX = State.petX + 100;
  const target = input.mouse_over() && mx < cursorNoticeThresholdX ? "cursor" : "none";
  const step = dt / ATTENTION_TRANSITION_DURATION;
  for (const [k, v] of Object.entries(State.attention.weight)) {
    const next = util.clamp(v + (k === target ? step : -step), 0, 1);
    State.attention.weight[k as AttentionTarget] = next;
  }

  if (input.key_pressed(input.KEY_BACKTICK)) {
    State.debug = !State.debug;
  }

  if (State.debug) {
    if (input.mouse_held(input.MOUSE_LEFT) && State.mouse[0] > UI_X) {
      State.mood = util.clamp(util.remap(State.mouse[0], UI_X, usagi.GAME_W, 0, 1), 0, 1);
    }

    for (const [a, k] of DEBUG_ACTS) {
      if (input.key_pressed(k)) {
        State.activity = { t: a };
        State.activityTimeLeft = ACTIVITY_TIME;
      }
    }
  }
};

function updateGame(dt: number) {
  const elapsed = dt * 10;

  State.minute += elapsed;
  if (State.minute >= 60) {
    State.minute = 0;
    State.hour += 1;
    if (State.hour >= 24) {
      State.hour = 0;
      State.day += 1;
      if (State.day > 30) {
        State.day = 1;
        State.month += 1;
        if (State.month >= MONTHS.length) {
          State.month = 0;
        }
      }
    }
  }

  const FATIGUE_FACTOR = 0.01;
  const REST_FACTOR = 0.016;

  const HUNGER_FACTOR = 0.01;
  const EAT_FACTOR = 0.02;

  const addTo = (k: StatusField, val: number) => {
    State[k] = clamp01(State[k] + val);
  };

  const act = State.activity.t;
  if (act === "sleeping") {
    addTo("fatigue", -dt * REST_FACTOR);
    addTo("stress", -dt * 0.002);
    addTo("anxiety", -dt * 0.002);
  } else {
    const actFactor =
      act === "working" ? 2 : act === "jobsearch" ? 1.5 : act === "eating" ? 0.7 : 1;
    const timeFactor = State.hour < 6 ? 2 : 1;
    const mult = actFactor * timeFactor;
    addTo("fatigue", dt * FATIGUE_FACTOR * mult);
  }

  if (act === "eating") {
    addTo("hunger", -dt * EAT_FACTOR);
    addTo("stress", -dt * 0.005);
    addTo("anxiety", -dt * 0.003);
  } else {
    const factor =
      act === "working" ? 1.7 : act === "jobsearch" ? 1.2 : act === "sleeping" ? 0.6 : 1;
    addTo("hunger", dt * HUNGER_FACTOR * factor);
  }

  if (act === "jobsearch") {
    addTo("stress", dt * 0.02);
    addTo("anxiety", dt * 0.016);
  }

  if (act === "idle") {
    addTo("anxiety", dt * 0.004);
    addTo("stress", -dt * 0.004);
  }

  if (State.fatigue > 0.75 && act !== "sleeping") {
    addTo("mood", -dt * 0.01);
    addTo("stress", dt * 0.0055);
  }
  if (State.hunger > 0.75 && act !== "eating") {
    addTo("mood", -dt * 0.01);
    addTo("stress", dt * 0.0045);
  }

  State.activityTimeLeft -= elapsed;
  if (State.activityTimeLeft <= 0) {
    pickNewActivity();
  }
}

function appendToLog(text: string) {
  State.log.push(text);
  while (State.log.length > 10) {
    State.log.shift();
  }
}

function getMoodString() {
  const m = State.mood;

  // could be salience-based too... someday...
  if (m < 0.2) {
    return randomInArray([
      "Rough day!",
      ";_;",
      "Not doing too hot...",
      "This stinks!",
      "Why is life like this...",
      "Time to lie on the floor.",
    ]);
  }
  if (m < 0.4) {
    return randomInArray([
      "Could be better...",
      "Kinda cranky.",
      "Tired of this...",
      "Don't feel like doing anything.",
    ]);
  }
  if (m < 0.6) {
    return randomInArray([
      "Hanging in there...",
      "Keep on truckin'.",
      "Awright.",
      "Doing okay.",
      "Just fine.",
      "Doing fine.",
      "Doing just fine.",
    ]);
  }
  if (m < 0.8) {
    return randomInArray([
      "Doing well.",
      "Got it together.",
      "Hey, this isn't so bad!",
      "Hey, this isn't so hard!",
      "Not bad!",
      "Not half-bad!",
      "Could get used to this!",
    ]);
  }
  return randomInArray([
    "Never been better!",
    "Out of the way, world!",
    "Unstoppable!",
    "This is easy!",
  ]);
}

// again, salience would be nice...
// integrating tracery for variety would also be easy/fun...
const sleepQuips = ["Time for bed.", "Bedtime.", "Sleepy time."];
const eatQuips = ["Time to eat.", "Hungry.", "Chow time."];
const jobSearchQuips = [
  "Time to find work.",
  "Need a job...",
  "Need a job... wonder what's out there.",
  "Time to email some cover letters.",
  "Time to email some CVs.",
  "Ready to cold apply to some gigs.",
  "Ready to get some automated rejection letters.",
];

type ActivityDef = { name: GameState["activity"]["t"]; score: () => number; enter: () => void };
const activities: ActivityDef[] = [
  {
    name: "sleeping",
    score: () => State.fatigue ** 2,
    enter: () => appendToLog(randomInArray(sleepQuips)),
  },
  {
    name: "eating",
    score: () => State.hunger ** 2,
    enter: () => appendToLog(randomInArray(eatQuips)),
  },
  {
    name: "jobsearch",
    score: () => State.mood ** 0.8 * 0.5,
    enter: () => appendToLog(randomInArray(jobSearchQuips)),
  },
  {
    name: "idle",
    score: () => Math.random() * 0.6 + util.remap(State.mood, 0, 1, 0.2, 0),
    enter: () => appendToLog(getMoodString()),
  },
];

function pickNewActivity() {
  let bestScore = -1;
  let bestActivity;
  for (const a of activities) {
    const s = a.score() * (a.name === State.activity.t ? 0.7 : 1);
    if (State.debug) appendToLog(`DEBUG: ${a.name} => ${s.toFixed(2)}`);
    if (s > bestScore) {
      bestScore = s;
      bestActivity = a;
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion -- false poz
  const { name, enter } = bestActivity!;
  State.activity = { t: name };
  State.activityTimeLeft = ACTIVITY_TIME;
  enter();
}

const HEAD_SIZE = 60;
const EYE_SIZE = 12;
const PUPIL_SIZE = 7;
const PUPIL_COL = COLOR.W_AUBERGINE;

_draw = () => {
  gfx.clear(COLOR.Y_WINE);

  // wall/backdrop
  gfx.rect_fill(0, 0, usagi.GAME_W, usagi.GAME_H * 0.65, COLOR.X_PLUM);

  drawBars(); // behind the pet
  drawLog();
  drawPet();

  if (State.debug) {
    gfx.text(
      `DEBUG\t(${State.activity.t}, ${Math.round(State.activityTimeLeft)})`,
      60,
      0,
      COLOR.A_PALE_LIME,
    );
  }
};

const UI_X = 320;
const UI_Y = 10;
const BAR_WIDTH = 140;
const SPACING = 24;
const UI_SCALE = [COLOR.D_BLUSH, COLOR.G_DUSTY_ROSE, COLOR.C_BONE, COLOR.F_SAGE, COLOR.A_PALE_LIME];

function drawBars() {
  const { day, month, hour, minute } = State;
  const time = `${day} ${MONTHS[month]}, ${hour}h${string.format("%02d", math.floor(minute))}`;
  gfx.text_ex(time, UI_X, UI_Y, 2, 0, COLOR.A_PALE_LIME, 1);

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
      ["Temperature", bodyTemp, "neutral"],
      ["Stress", stress, "low"],
    ],
    [
      ["Anxiety", anxiety, "low"],
      ["Fatigue", fatigue, "low"],
    ],
    [
      ["Hunger", hunger, "low"],
      ["Mood", mood, "high"],
    ],
  ];

  let row = 1;
  for (const [l, r] of statGrid) {
    drawStat(l, row, 0);
    drawStat(r, row, 1);
    row += 2;
  }
}

const LOG_Y = 190;

function drawLog() {
  const { log } = State;
  gfx.rect_fill(UI_X, LOG_Y, BAR_WIDTH * 2 + SPACING, 160, COLOR.Z_INK, 0.6);
  for (let i = 0; i < log.length; i++) {
    gfx.text(log[i], UI_X + 5, LOG_Y + i * 16, COLOR.A_PALE_LIME, 0.8);
  }
}

function drawPet() {
  const {
    petX,
    petY,
    mood,
    mouse: [mx, my],
    attention,
    activity,
    activityTimeLeft,
  } = State;

  if (activity.t === "working") return;

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
  const cursorNoticeThresholdX = petX + 100;

  // way more complicated than it needs to be on the expectation that we'll have
  // multiple possible targets at some point (when we'll also need to do a
  // weighted sum to get the final position)
  const attentionX = util.clamp(mx, 0, cursorNoticeThresholdX);
  const attentionY = my;

  let faceOffsetX = 0;
  let faceOffsetY = 0;

  if (activity.t !== "sleeping") {
    faceOffsetX = util.lerp(
      util.remap(noise1D(t + 12020), -1, 1, 0, -10),
      util.remap(attentionX, 0, cursorNoticeThresholdX, -20, 10),
      attention.weight.cursor,
    );
    faceOffsetY = util.lerp(
      0,
      util.remap(attentionY, 0, usagi.GAME_H, -20, 20),
      attention.weight.cursor,
    );
  }

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
  if (activity.t === "sleeping") {
    curve(eyeLeftX - 12, eyeLeftY, eyeLeftX + 12, eyeLeftY, -0.5, 8, PUPIL_COL);
    curve(eyeRightX - 12, eyeRightY, eyeRightX + 12, eyeRightY, -0.5, 8, PUPIL_COL);
  } else if (mood < 0.2) {
    if (mood < 0.1) {
      // cry
      const cycle = (t / 1) % 1;
      const falling = cycle > 0.5;
      const tearOffset = 5 + (falling ? util.remap(cycle, 0.5, 1, 0, 1) ** 2 * 70 : 0);
      const tearSize = util.clamp(cycle * 10, 0, 5);
      gfx.circ_fill(eyeLeftX - 12, eyeLeftY + tearOffset, tearSize, COLOR.E_LAVENDER);
      gfx.circ_fill(eyeRightX + 12, eyeRightY + tearOffset, tearSize, COLOR.E_LAVENDER);
    }
    curve(eyeLeftX - 12, eyeLeftY, eyeLeftX + 12, eyeLeftY, -0.2, 8, PUPIL_COL);
    curve(eyeRightX - 12, eyeRightY, eyeRightX + 12, eyeRightY, -0.2, 8, PUPIL_COL);
  } else if (mood > 0.8) {
    curve(eyeLeftX - 12, eyeLeftY, eyeLeftX + 12, eyeLeftY, 0.5, 8, PUPIL_COL);
    curve(eyeRightX - 12, eyeRightY, eyeRightX + 12, eyeRightY, 0.5, 8, PUPIL_COL);
  } else {
    // eslint-disable-next-line no-lonely-if
    if (noise1D(t * 2) > 0.6) {
      // blink
      gfx.line_ex(eyeLeftX - 12, eyeLeftY, eyeLeftX + 12, eyeLeftY, 4, PUPIL_COL);
      gfx.line_ex(eyeRightX - 12, eyeRightY, eyeRightX + 12, eyeRightY, 4, PUPIL_COL);
    } else {
      gfx.circ_fill(eyeLeftX - 4, eyeLeftY, PUPIL_SIZE, PUPIL_COL);
      gfx.circ_fill(eyeRightX + 4, eyeRightY, PUPIL_SIZE, PUPIL_COL);
    }
  }

  // brows
  const concern = util.remap(mood, 0, 1, -0.6, 0.6) + noise1D(t / 3 + 3924) * 0.2;
  curve(eyeLeftX - 12, eyeLeftY - 18, eyeLeftX + 12, eyeLeftY - 16, concern, 7, PUPIL_COL);
  curve(eyeRightX - 12, eyeRightY - 18, eyeRightX + 12, eyeRightY - 16, concern, 7, PUPIL_COL);

  // mouth
  const mouthX = faceX + faceOffsetX * 0.6;
  const mouthMidY = faceY + faceOffsetY + 26;
  // tongue
  const tongueX = mouthX - 10;
  const tongueY = mouthMidY + 9 + osc(0.6) * 2;
  gfx.circ_fill(tongueX, tongueY, 4, COLOR.D_BLUSH);
  // :3
  curve(mouthX - 30, mouthMidY - 2, mouthX - 10, mouthMidY, -0.9, 5, PUPIL_COL);
  curve(mouthX - 10, mouthMidY, mouthX + 10, mouthMidY + 2, -0.9, 5, PUPIL_COL);

  // nose
  gfx.circ_fill(mouthX - 12, faceY + faceOffsetY + 18, 10, COLOR.N_STEEL);

  // draw activity
  switch (activity.t) {
    case "jobsearch": {
      const tableTop = petY + 50;
      const tableL = petX - 140;
      const tableW = 120;
      const tableH = 60;
      // prettier-ignore
      ellipse(tableL + (tableW + 60) / 2, tableTop + 20 + tableH, (tableW + 60) / 2 + 5, 20, 60, COLOR.Z_INK, 0.6);
      gfx.rect_fill(tableL + tableW / 2 - 25, tableTop + 10, 20, 60, COLOR.W_AUBERGINE);
      gfx.rect_fill(tableL, tableTop, tableW, 20, COLOR.H_TAUPE);
      gfx.rect_fill(tableL, tableTop + 20, 20, 60, COLOR.H_TAUPE);
      gfx.rect_fill(tableL + 20, tableTop + 20, 20, 60, COLOR.W_AUBERGINE);
      gfx.rect_fill(tableL + 100, tableTop + 20, 20, 60, COLOR.H_TAUPE);
      gfx.rect_fill(tableL + tableW, tableTop, 60, 20, COLOR.S_UMBER);
      gfx.rect_fill(tableL + tableW, tableTop + 20, 20, 60, COLOR.S_UMBER);
      gfx.rect_fill(tableL + tableW + 25, tableTop + 20, 15, 60, COLOR.W_AUBERGINE);
      gfx.rect_fill(tableL + tableW + 40, tableTop + 20, 20, 60, COLOR.S_UMBER);

      const laptopY = tableTop - 60;
      const laptopW = 100;
      const laptopSkew = 20;
      const laptopCol = COLOR.F_SAGE;

      const lX1 = tableL;
      const lX2 = tableL + laptopW;
      const lX3 = tableL + laptopSkew;
      const lX4 = tableL + laptopW + laptopSkew;

      gfx.rect_fill(lX4 - 5, tableTop - 5, 60, 5, laptopCol);
      gfx.tri_fill(lX1, laptopY, lX2, laptopY, lX3, tableTop, laptopCol);
      gfx.tri_fill(lX2, laptopY, lX3, tableTop, lX4, tableTop, laptopCol);

      const logoSize = 10;
      const logoX1 = lX1 + laptopSkew / 2 + laptopW / 2 - logoSize;
      const logoX2 = logoX1 + logoSize;
      const logoX3 = logoX1 + 3;
      const logoX4 = logoX1 + logoSize + 3;
      const logoY = laptopY + 30;
      gfx.tri_fill(logoX1, logoY, logoX2, logoY, logoX3, logoY + logoSize, COLOR.A_PALE_LIME);
      // prettier-ignore
      gfx.tri_fill(logoX2, logoY, logoX3, logoY + logoSize, logoX4, logoY + logoSize, COLOR.A_PALE_LIME);
      break;
    }
    case "eating": {
      const bottleX = petX - 100;
      const bottleY = floor + 5;
      const bottleW = 50;
      const bottleH = 70;
      const stuffLeft = ((activityTimeLeft - 15) / (ACTIVITY_TIME - 10)) * bottleH;
      const stuffCol = COLOR.D_BLUSH;
      ellipse(bottleX + bottleW / 2, bottleY, bottleW / 2 + 3, 10, 60, COLOR.Z_INK, 0.5);
      gfx.rect_fill(bottleX, bottleY - bottleH, 50, bottleH, COLOR.M_SLATE, 0.5);
      gfx.rect_fill(bottleX, bottleY - stuffLeft, 50, stuffLeft, stuffCol, 0.5);
      const strawX1 = bottleX + bottleW / 2;
      const strawX2 = strawX1 + 20 + (adjX - petX);
      const strawY1 = bottleY - bottleH - 20;
      const strawCol = stuffLeft > 0 ? stuffCol : COLOR.M_SLATE;
      gfx.line_ex(strawX1, bottleY - 1, strawX2, strawY1, 5, strawCol, 0.7);
      gfx.line_ex(strawX2, strawY1, tongueX, tongueY, 5, strawCol, 0.7);
      break;
    }
    default:
      break;
  }

  // highlight the cursor when noticed
  if (activity.t !== "sleeping" && attention.weight.cursor > 0) {
    // TODO: for now cursor is the only thing that can have attention
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
