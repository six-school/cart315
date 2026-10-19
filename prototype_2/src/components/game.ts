import { assertNever, randomInt } from "~/util";

export type GameState = {
  // TODO: multiple players
  player1Hp: number;
  player1Mp: number;
  player1Status?: StatusEffect;
  phase: Phase;
};

type Phase = { state: "none" } | BattleMode;

type BattleMode = {
  state: "battle";
  enemyHp: number;
  phase:
    | ["init", { timeLeft: number }]
    | ["choose", { cursor: number }]
    | ["resolve", CombatRoundUIState];
};

const BATTLE_INTRO_TIME = 1;
const MESSAGE_PRE_TIME = 0.4;
const MESSAGE_TIME = 1.5;

const PLAYER_INITIAL_HP = 12;
const PLAYER_INITIAL_MP = 5;
const ENEMY_HP = 10;
const SHOW_ENEMY_HP = false;

// [status, duration]
type StatusEffect = ["recovering", number];

const COMBAT_OPTIONS = ["Attack", "Defend", "Magic", "Run"] as const;
type Action = (typeof COMBAT_OPTIONS)[number];

type ResolutionStep = {
  message: string;
  endState: { playerHp: number; playerMp: number; enemyHp: number };
  effects?: () => void;
};

type CombatRoundOutcome = "lose" | "win" | "continue";

type CombatRoundUIState = {
  resolution: ResolutionStep[];
  outcome: CombatRoundOutcome;
  index: number;
  messageState: ["predisplay", number] | ["display", number];
};

declare let State: GameState;

export function _init() {
  State = {
    player1Hp: PLAYER_INITIAL_HP,
    player1Mp: PLAYER_INITIAL_MP,
    phase: { state: "none" },
  };
}

export function _update(dt: number) {
  switch (State.phase.state) {
    case "none":
      // TODO: other phases
      // updateNormal(dt);
      break;
    case "battle":
      updateBattle(dt, State.phase);
      break;
    default:
      assertNever(State.phase);
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
      // TODO: controls here, in proto 1 was p1/p2 keyboard controls
      const confirm = false;

      if (confirm) {
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

// play out the generated resolution for this round of combat, triggering
// effects (sfx, screenshake) and running down message timers
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

        State.player1Hp = endState.playerHp;
        State.player1Mp = endState.playerMp;

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
              State.phase = { state: "none" };

              // TODO: lose screen

              break;
            case "win":
              State.phase = { state: "none" };

              // TODO: win screen

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

function generateCombatResolution(
  playerAction: Action,
  battle: BattleMode,
): [ResolutionStep[], CombatRoundOutcome] {
  const resolution: ResolutionStep[] = [];

  const initHp = State.player1Hp;
  const initMp = State.player1Mp;

  let enemyHp = battle.enemyHp;

  switch (playerAction) {
    case "Attack": {
      const damage = randomInt(1, 3);
      enemyHp -= damage;
      resolution.push({
        message: `Paddle attacks!\nBall took ${damage} damage.`,
        endState: { playerHp: initHp, playerMp: initMp, enemyHp },
        effects: () => {
          // TODO: sfx
          // sfx.play("rpg-player-attack");
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
      if (Math.random() > 0.5) {
        // heal
        if (initMp < 2) {
          resolution.push({
            message: `Paddle tries to cast Heal!\nNot enough MP!`,
            endState: { playerHp: initHp, playerMp: initMp, enemyHp },
          });
        } else {
          const heal = randomInt(2, 4);
          resolution.push({
            message: `Paddle casts Heal!\nPaddle healed ${heal} HP.`,
            endState: { playerHp: initHp + heal, playerMp: initMp - 2, enemyHp },
            effects: () => {
              // TODO: sfx
              // sfx.play("heal");
            },
          });
        }
      } else {
        if (initMp < 2) {
          resolution.push({
            message: `Paddle tries to cast Flame!\nNot enough MP!`,
            endState: { playerHp: initHp, playerMp: initMp, enemyHp },
          });
        } else {
          const damage = randomInt(2, 4);
          enemyHp -= damage;
          resolution.push({
            message: `Paddle casts Flame!\nBall took ${damage} damage.`,
            endState: { playerHp: initHp, playerMp: initMp - 2, enemyHp },
            effects: () => {
              // TODO: sfx
              // sfx.play("flamespell");
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
        // TODO: music
        // music.play("victory");
      },
    });

    return [resolution, "win"];
  }

  const roll = Math.random();
  if (roll < 0.5) {
    const damage = randomInt(1, 3);
    resolution.push({
      message: `Ball attacks!\nPaddle took ${damage} damage.`,
      endState: { playerHp: initHp - damage, playerMp: initMp, enemyHp },
      effects: () => {
        // TODO: sfx
        // effect.screen_shake(0.1, 2);
        // sfx.play("rpg-enemy-attack");
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
        // TODO: music
        // music.play("death");
      },
    });
    return [resolution, "lose"];
  }

  return [resolution, "continue"];
}

/*

State.battle = {
  state: "battle",
  player: "1",
  enemyHp: ENEMY_HP,
  phase: ["init", { timeLeft: BATTLE_INTRO_TIME }],
};

*/

/*
export function _draw() {
  gfx.clear(gfx.COLOR_BLACK);

  if (State.battle.state === "battle") {
    const rectW = usagi.GAME_W - 5 * 2;
    const rectH = usagi.GAME_H - 5 * 2;

    const { phase } = State.battle;
    switch (phase[0]) {
      case "init": {
        const anim = util.remap(phase[1].timeLeft, BATTLE_INTRO_TIME, 0, 0, 1);
        const x = util.lerp(State.ballX, 5, anim);
        const y = util.lerp(State.ballY, 5, anim);
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
  // prettier-ignore
  gfx.sspr_ex(
    // src
    0, 0, BG_W, BG_H,
    // dest
    usagi.GAME_W / 2 - BG_W / 2, 5, BG_W, BG_H,
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

// seems like this isn't part of usagi's api yet. not too bad to implement...
// prettier-ignore
function ellipse(cx: number, cy: number, rx: number, ry: number, thickness: number, color: number, alpha?: number) {
  const ox = rx + 0.5;
  const oy = ry + 0.5;
  const ix = rx - thickness + 0.5;
  const iy = ry - thickness + 0.5;
  const hollow = ix > 0 && iy > 0;
  for (let dy = -ry; dy <= ry; dy++) {
    for (let dx = -rx; dx <= rx; dx++) {
      if ((dx * dx) / (ox * ox) + (dy * dy) / (oy * oy) > 1) continue;
      if (hollow && (dx * dx) / (ix * ix) + (dy * dy) / (iy * iy) < 1) continue;
      gfx.px(cx + dx, cy + dy, color, alpha);
    }
  }
}
*/
