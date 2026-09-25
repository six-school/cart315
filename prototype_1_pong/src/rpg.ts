/* eslint-disable @typescript-eslint/prefer-destructuring, unicorn/consistent-destructuring */
import { assertNever } from "./util";

export type GameState = {
  mode: "rpg";
  paddle1Y: number;
  paddle2Y: number;
  ballX: number;
  ballY: number;
  ballAngle: number;
  ballSpeed: number;
  p1Score: number;
  p2Score: number;

  player1Hp: number;
  player1Mp: number;
  player2Hp: number;
  player2Mp: number;
  battle: RPGMode;
};

const BATTLE_INTRO_TIME = 1;
const MESSAGE_PRE_TIME = 0.4; // seconds
const MESSAGE_TIME = 1.5; // seconds
const ENEMY_HP = 10;
const SHOW_ENEMY_HP = true;

const COMBAT_OPTIONS = ["Attack", "Defend", "Magic", "Run"] as const;
type Action = (typeof COMBAT_OPTIONS)[number];

type ResolutionStep = {
  message: string;
  endState: { playerHp: number; playerMp: number; enemyHp: number };
  effects?: () => void;
};

type CombatRoundOutcome = "lose" | "win" | "continue";

type CombatRoundResolution = [ResolutionStep[], CombatRoundOutcome];

type CombatRoundUIState = {
  resolution: ResolutionStep[];
  outcome: CombatRoundOutcome;
  index: number;
  messageState: ["predisplay", number] | ["display", number];
};

type RPGMode = { state: "none" } | BattleMode;
type BattleMode = {
  state: "battle";
  player: "1" | "2";
  enemyHp: number;
  phase:
    | ["init", { timeLeft: number }]
    | ["choose", { cursor: number }]
    | ["resolve", CombatRoundUIState];
};

declare let State: GameState;

const paddleHeight = 30;
const paddleWidth = 5;
const paddleOffsetFromEdge = 15;
const paddleSpeed = 126;
const ballSize = 6;
const maxBounceAngle = math.rad(75);
const borderSize = 3;
const textScale = 2;

// F5 to reset
export function _init() {
  music.stop();
  State = {
    mode: "rpg",
    paddle1Y: usagi.GAME_H / 2 - paddleHeight / 2,
    paddle2Y: usagi.GAME_H / 2 - paddleHeight / 2,
    ballX: usagi.GAME_W / 2 - ballSize / 2,
    ballY: usagi.GAME_H / 2 - ballSize / 2,
    ballAngle: 0, // TODO: more interesting initial angle?
    ballSpeed: 120,
    p1Score: 0,
    p2Score: 0,

    player1Hp: 12,
    player1Mp: 5,
    player2Hp: 12,
    player2Mp: 5,
    battle: { state: "none" },
  };
}

export function _update(dt: number) {
  switch (State.battle.state) {
    case "none":
      updateNormal(dt);
      break;
    case "battle":
      updateBattle(dt, State.battle);
      break;
    default:
      assertNever(State.battle);
  }
}

function updateBattle(dt: number, state: BattleMode) {
  switch (state.phase[0]) {
    case "init":
      state.phase[1].timeLeft -= dt;
      if (state.phase[1].timeLeft < 0) {
        state.phase = ["choose", { cursor: 0 }];
      }
      break;
    case "choose": {
      const up = state.player === "1" ? input.KEY_W : input.KEY_UP;
      const down = state.player === "1" ? input.KEY_S : input.KEY_DOWN;
      const confirm = state.player === "1" ? input.KEY_D : input.KEY_RIGHT;
      if (input.key_pressed(up)) {
        state.phase[1].cursor -= 1;
        if (state.phase[1].cursor < 0) state.phase[1].cursor = COMBAT_OPTIONS.length - 1;
      } else if (input.key_pressed(down)) {
        state.phase[1].cursor = (state.phase[1].cursor + 1) % COMBAT_OPTIONS.length;
      } else if (input.key_pressed(confirm)) {
        const [resolution, outcome] = generateCombatResolution(
          COMBAT_OPTIONS[state.phase[1].cursor],
          state,
        );
        state.phase = [
          "resolve",
          { resolution, outcome, index: 0, messageState: ["predisplay", MESSAGE_PRE_TIME] },
        ];
      }
      break;
    }
    case "resolve":
      updateCombatStepResolution(dt, state.phase[1], state);
      break;
    default:
      assertNever(state.phase);
  }
}

function updateCombatStepResolution(dt: number, res: CombatRoundUIState, battle: BattleMode) {
  const ms = res.messageState;
  switch (ms[0]) {
    case "predisplay":
      ms[1] -= dt;

      // predisplay done? trigger our effects, and switch to message delay
      if (ms[1] <= 0) {
        res.messageState = ["display", MESSAGE_TIME];

        const { effects, endState } = res.resolution[res.index];
        effects?.();
        if (battle.player === "1") {
          State.player1Hp = endState.playerHp;
          State.player1Mp = endState.playerMp;
        } else {
          State.player2Hp = endState.playerHp;
          State.player2Mp = endState.playerMp;
        }
        battle.enemyHp = endState.enemyHp;
      }
      break;
    case "display":
      ms[1] -= dt;

      // display timer done? next message, predisplay
      if (ms[1] <= 0) {
        res.messageState = ["predisplay", MESSAGE_PRE_TIME];
        res.index += 1;

        if (res.index === res.resolution.length) {
          switch (res.outcome) {
            case "lose":
              // TODO
              break;
            case "win":
              // TODO
              break;
            case "continue":
              battle.phase = ["choose", { cursor: 0 }];
              break;
            default:
              assertNever(res.outcome);
          }
        }
      }
      break;
    default:
      assertNever(ms);
  }
}

function generateCombatResolution(playerAction: Action, battle: BattleMode): CombatRoundResolution {
  const resolution: ResolutionStep[] = [];

  const initHp = battle.player === "1" ? State.player1Hp : State.player2Hp;
  const initMp = battle.player === "1" ? State.player1Mp : State.player2Mp;

  let enemyHp = battle.enemyHp;

  switch (playerAction) {
    case "Attack": {
      const damage = math.random(1, 3);
      enemyHp -= damage;
      resolution.push({
        message: `Paddle attacks!\nBall took ${damage} damage.`,
        endState: { playerHp: initHp, playerMp: initMp, enemyHp },
        effects: () => {
          sfx.play("rpg-player-attack");
        },
      });
      break;
    }
    case "Defend":
      resolution.push({
        message: `Paddle defends!`,
        endState: { playerHp: initHp, playerMp: initMp, enemyHp },
      });
      break;
    case "Magic": {
      if (math.random() > 0.5) {
        // heal
        if (initMp < 2) {
          resolution.push({
            message: `Paddle tries to cast Heal!\nNot enough MP!`,
            endState: { playerHp: initHp, playerMp: initMp, enemyHp },
          });
        } else {
          const heal = math.random(2, 4);
          resolution.push({
            message: `Paddle casts Heal!\nPaddle healed ${heal} HP.`,
            endState: { playerHp: initHp + heal, playerMp: initMp - 2, enemyHp },
            effects: () => {
              sfx.play("heal");
            },
          });
        }
      } else {
        // eslint-disable-next-line no-lonely-if
        if (initMp < 2) {
          resolution.push({
            message: `Paddle tries to cast Flame!\nNot enough MP!`,
            endState: { playerHp: initHp, playerMp: initMp, enemyHp },
          });
        } else {
          const damage = math.random(2, 4);
          enemyHp -= damage;
          resolution.push({
            message: `Paddle casts Flame!\nBall took ${damage} damage.`,
            endState: { playerHp: initHp, playerMp: initMp - 2, enemyHp },
            effects: () => {
              sfx.play("flamespell");
            },
          });
        }
      }
      break;
    }
    case "Run":
      resolution.push({
        message: `Paddle tries to run away!\nBut it has no feet!`,
        endState: { playerHp: initHp, playerMp: initMp, enemyHp },
      });
      break;
    default:
      assertNever(playerAction);
  }

  if (enemyHp <= 0) {
    resolution.push({
      message: `Ball was vanquished.`,
      endState: { playerHp: initHp, playerMp: initMp, enemyHp: 0 },
      effects: () => {
        music.play("victory");
      },
    });

    return [resolution, "win"];
  }

  const roll = math.random();
  if (roll < 0.5) {
    const damage = math.random(1, 3);
    resolution.push({
      message: `Ball attacks!\nPaddle took ${damage} damage.`,
      endState: { playerHp: initHp - damage, playerMp: initMp, enemyHp },
      effects: () => {
        effect.screen_shake(0.1, 2);
        sfx.play("rpg-enemy-attack");
      },
    });
  } else if (roll < 0.8) {
    resolution.push({
      message: `Ball defends!`,
      endState: { playerHp: initHp, playerMp: initMp, enemyHp },
    });
  } else if (roll < 0.9) {
    resolution.push({
      message: `Ball is assessing the situation.`,
      endState: { playerHp: initHp, playerMp: initMp, enemyHp },
    });
  } else {
    resolution.push({
      message: `Ball looks frightened.`,
      endState: { playerHp: initHp, playerMp: initMp, enemyHp },
    });
  }

  if (resolution.at(-1)!.endState.playerHp <= 0) {
    resolution.at(-1)!.endState.playerHp = 0;
    resolution.push({
      message: `Paddle was defeated...`,
      endState: { playerHp: 0, playerMp: initMp, enemyHp },
      effects: () => {
        music.play("death");
      },
    });
    return [resolution, "lose"];
  }

  return [resolution, "continue"];
}

function updateNormal(dt: number) {
  const { ballAngle, ballSpeed } = State;

  if (input.key_held(input.KEY_W)) State.paddle1Y -= paddleSpeed * dt;
  else if (input.key_held(input.KEY_S)) State.paddle1Y += paddleSpeed * dt;
  if (input.key_held(input.KEY_UP)) State.paddle2Y -= paddleSpeed * dt;
  else if (input.key_held(input.KEY_DOWN)) State.paddle2Y += paddleSpeed * dt;

  if (State.paddle1Y < 0) State.paddle1Y = 0;
  if (State.paddle1Y + paddleHeight > usagi.GAME_H) State.paddle1Y = usagi.GAME_H - paddleHeight;
  if (State.paddle2Y < 0) State.paddle2Y = 0;
  if (State.paddle2Y + paddleHeight > usagi.GAME_H) State.paddle2Y = usagi.GAME_H - paddleHeight;

  State.ballX += math.cos(ballAngle) * ballSpeed * dt;
  State.ballY += math.sin(ballAngle) * ballSpeed * dt;

  // top and bottom bounce
  let bouncedOffWall = false;
  if (State.ballY < 0) {
    State.ballY = math.abs(State.ballY);
    bouncedOffWall = true;
  }
  while (State.ballY + ballSize > usagi.GAME_H) {
    State.ballY = usagi.GAME_H - ballSize;
    bouncedOffWall = true;
  }
  if (bouncedOffWall) {
    State.ballAngle = -State.ballAngle;
    sfx.play("bup");
  }

  // handle scoring
  let didScore = false;
  if (State.ballX + ballSize < 0) {
    State.p2Score += 1;
    State.ballAngle = 0; // TODO

    State.ballX = usagi.GAME_W / 2 - ballSize / 2;
    State.ballY = usagi.GAME_H / 2 - ballSize / 2;
    didScore = true;
  } else if (State.ballX > usagi.GAME_W) {
    State.p1Score += 1;
    State.ballAngle = math.pi; // TODO

    State.ballX = usagi.GAME_W / 2 - ballSize / 2;
    State.ballY = usagi.GAME_H / 2 - ballSize / 2;
    didScore = true;
  }
  if (didScore) {
    sfx.play("bop");
  }

  bounceOffPaddles();
}

function bounceOffPaddles() {
  // left
  if (
    util.rect_overlap(
      { x: State.ballX, y: State.ballY, w: ballSize, h: ballSize },
      { x: paddleOffsetFromEdge, y: State.paddle1Y, w: paddleWidth, h: paddleHeight },
    )
  ) {
    State.battle = {
      state: "battle",
      player: "1",
      enemyHp: ENEMY_HP,
      phase: ["init", { timeLeft: BATTLE_INTRO_TIME }],
    };
    music.loop("battle");

    // TODO
    // const ballYPaddleYDelta =
    //   (State.paddle1Y + paddleHeight / 2 - State.ballY + ballSize / 2) / (paddleHeight / 2);

    // State.ballAngle = util.clamp(ballYPaddleYDelta, -1, 1) * -1 * maxBounceAngle;
    // State.ballX = paddleOffsetFromEdge + paddleWidth;
    // sfx.play("bip");
  }

  // right
  if (
    // prettier-ignore
    util.rect_overlap(
      { x: State.ballX, y: State.ballY, w: ballSize, h: ballSize },
      { x: usagi.GAME_W - paddleOffsetFromEdge, y: State.paddle2Y, w: paddleWidth, h: paddleHeight }
    )
  ) {
    State.battle = {
      state: "battle",
      player: "2",
      enemyHp: ENEMY_HP,
      phase: ["init", { timeLeft: BATTLE_INTRO_TIME }],
    };
    music.loop("battle");

    // TODO
    // const ballYPaddleYDelta =
    //   (State.paddle2Y + paddleHeight / 2 - State.ballY + ballSize / 2) / (paddleHeight / 2);

    // State.ballAngle = math.pi - util.clamp(ballYPaddleYDelta, -1, 1) * -1 * maxBounceAngle;
    // State.ballX = usagi.GAME_W - paddleOffsetFromEdge - ballSize;
    // sfx.play("bip");
  }
}

export function _draw() {
  gfx.clear(gfx.COLOR_BLACK);

  drawPong();

  if (State.battle.state === "battle") {
    const rectW = usagi.GAME_W - 5 * 2;
    const rectH = usagi.GAME_H - 5 * 2;

    const { phase } = State.battle;
    switch (phase[0]) {
      case "init": {
        const anim = util.remap(phase[1].timeLeft, BATTLE_INTRO_TIME, 0, 0, 1);
        const x = util.lerp(usagi.GAME_W / 2, 5, anim);
        const y = util.lerp(usagi.GAME_H / 2, 5, anim);
        const w = util.lerp(0, rectW, anim);
        const h = util.lerp(0, rectH, anim);
        gfx.rect_fill(x, y, w, h, gfx.COLOR_DARK_BLUE, 0.5);
        break;
      }
      case "choose":
        gfx.rect_fill(5, 5, rectW, rectH, gfx.COLOR_DARK_BLUE, 0.5);
        drawEnemy(State.battle.enemyHp);
        drawBattleMenus(phase[1].cursor);
        drawPlayerStatus(State.battle);
        break;
      case "resolve":
        gfx.rect_fill(5, 5, rectW, rectH, gfx.COLOR_DARK_BLUE, 0.5);
        drawEnemy(State.battle.enemyHp);
        drawCombatResolution(phase[1].resolution[phase[1].index]);
        drawPlayerStatus(State.battle);
        break;
      default:
        assertNever(phase);
    }
  }
}

const BG_W = 120;
const BG_H = 104;

function drawEnemy(hp: number) {
  // draw backdrop
  gfx.sspr_ex(
    // src
    0,
    0,
    BG_W,
    BG_H,
    // dest
    usagi.GAME_W / 2 - BG_W / 2,
    5,
    BG_W,
    BG_H,
    false,
    false,
    0,
    gfx.COLOR_TRUE_WHITE,
    1.0,
  );

  // "enemy" shadow
  gfx.rect_fill(
    usagi.GAME_W / 2 - 9,
    usagi.GAME_H / 2 - 5,
    18,
    4,
    gfx.COLOR_BLACK,
    util.lerp(0.35, 0.39, math.sin(usagi.elapsed * 5)),
  );
  // "enemy" body
  gfx.rect_fill(
    usagi.GAME_W / 2 - 10,
    usagi.GAME_H / 2 - 30 + math.sin(usagi.elapsed * 5),
    20,
    20,
    gfx.COLOR_WHITE,
  );

  if (SHOW_ENEMY_HP) {
    const [w] = usagi.measure_text(hp.toString());
    gfx.text(hp.toString(), usagi.GAME_W / 2 - w / 2, usagi.GAME_H / 2 - 50, gfx.COLOR_RED);
  }
}

function drawBattleMenus(cursor: number) {
  // bottom text
  gfx.rect_fill(5, 10 + BG_H + 5, usagi.GAME_W - 10, 55, gfx.COLOR_BLACK);
  gfx.rect_ex(5, 10 + BG_H + 5, usagi.GAME_W - 10, 55, 3, gfx.COLOR_LIGHT_GRAY);
  gfx.text("A BALL draws near!\nCommand?", 12, 10 + BG_H + 10, gfx.COLOR_WHITE);

  // command
  gfx.rect_fill(5, 5, 70, 104, gfx.COLOR_BLACK);
  gfx.rect_ex(5, 5, 70, 104, 3, gfx.COLOR_LIGHT_GRAY);
  for (const [i, opt] of COMBAT_OPTIONS.entries()) {
    gfx.text(opt, 20, 12 + i * 12, gfx.COLOR_WHITE);
  }
  gfx.text(">", 12, 12 + 12 * cursor, gfx.COLOR_WHITE);
}

function drawCombatResolution(step: ResolutionStep) {
  gfx.rect_fill(5, 10 + BG_H + 5, usagi.GAME_W - 10, 55, gfx.COLOR_BLACK);
  gfx.rect_ex(5, 10 + BG_H + 5, usagi.GAME_W - 10, 55, 3, gfx.COLOR_LIGHT_GRAY);
  gfx.text(step.message, 12, 10 + BG_H + 10, gfx.COLOR_WHITE);
}

function drawPlayerStatus(battleState: BattleMode) {
  const statsX = usagi.GAME_W - 70;
  const hp = battleState.player === "1" ? State.player1Hp : State.player2Hp;
  const mp = battleState.player === "1" ? State.player1Mp : State.player2Mp;
  gfx.rect_fill(statsX - 5, 5, 70, 104, gfx.COLOR_BLACK);
  gfx.rect_ex(statsX - 5, 5, 70, 104, 3, gfx.COLOR_LIGHT_GRAY);
  gfx.text("Paddle", statsX + 5, 12, gfx.COLOR_WHITE);
  gfx.text(`HP ${hp}`, statsX + 5, 24, gfx.COLOR_WHITE);
  gfx.text(`MP ${mp}`, statsX + 5, 36, gfx.COLOR_WHITE);
}

function drawPong() {
  const { ballX, ballY, paddle1Y, paddle2Y, p1Score, p2Score } = State;

  // center line
  for (let i = 0; i < usagi.GAME_H; i += 8) {
    gfx.rect_fill(usagi.GAME_W / 2 - borderSize / 2, i, borderSize, borderSize, gfx.COLOR_WHITE);
  }

  // draw ball
  gfx.rect_fill(ballX, ballY, ballSize, ballSize, gfx.COLOR_WHITE);

  // prettier-ignore
  {
    // draw score
    const [p1ScoreWidth] = usagi.measure_text(p1Score.toString());
    gfx.text_ex(p1Score.toString(), usagi.GAME_W / 2 - p1ScoreWidth * textScale - 10, 10, textScale, 0, gfx.COLOR_WHITE, 1);
    gfx.text_ex(p2Score.toString(), usagi.GAME_W / 2 + borderSize + 10, 10, textScale, 0, gfx.COLOR_WHITE, 1);

    // draw paddles
    gfx.rect_fill(paddleOffsetFromEdge, paddle1Y, paddleWidth, paddleHeight, gfx.COLOR_WHITE);
    gfx.rect_fill(usagi.GAME_W - paddleOffsetFromEdge, paddle2Y, paddleWidth, paddleHeight, gfx.COLOR_WHITE);
  }
}
