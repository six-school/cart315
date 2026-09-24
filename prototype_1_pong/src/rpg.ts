/* eslint-disable unicorn/consistent-destructuring */
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

type RPGMode = { state: "none" } | BattleMode;
type BattleMode = {
  state: "battle";
  player: "1" | "2";
  initializedAt: number;
  cursor: number;
  magicMenu: boolean;
  enemyHp: number;
};

declare let State: GameState;

const initTime = 1; // seconds

const paddleHeight = 30;
const paddleWidth = 5;
const paddleOffsetFromEdge = 15;
const paddleSpeed = 126;
const ballSize = 6;
const maxBounceAngle = math.rad(75);
const borderSize = 3;
const textScale = 2;

const options = ["Attack", "Defend", "Magic", "Run"];

// F5 to reset
export function _init() {
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
  if (usagi.elapsed < state.initializedAt + initTime) {
    return;
  }

  if (input.key_pressed(input.KEY_W) || input.key_pressed(input.KEY_UP)) {
    state.cursor -= 1;
    if (state.cursor < 0) state.cursor = options.length - 1;
  } else if (input.key_pressed(input.KEY_S) || input.key_pressed(input.KEY_DOWN)) {
    state.cursor = (state.cursor + 1) % options.length;
  } else if (input.key_pressed(input.KEY_SPACE)) {
    //
  }
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
      initializedAt: usagi.elapsed,
      cursor: 0,
      magicMenu: false,
      enemyHp: 10,
    };
    music.play("battle");

    // TODO
    const ballYPaddleYDelta =
      (State.paddle1Y + paddleHeight / 2 - State.ballY + ballSize / 2) / (paddleHeight / 2);

    State.ballAngle = util.clamp(ballYPaddleYDelta, -1, 1) * -1 * maxBounceAngle;
    State.ballX = paddleOffsetFromEdge + paddleWidth;
    sfx.play("bip");
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
      initializedAt: usagi.elapsed,
      cursor: 0,
      magicMenu: false,
      enemyHp: 10,
    };
    music.play("battle");

    // TODO
    const ballYPaddleYDelta =
      (State.paddle2Y + paddleHeight / 2 - State.ballY + ballSize / 2) / (paddleHeight / 2);

    State.ballAngle = math.pi - util.clamp(ballYPaddleYDelta, -1, 1) * -1 * maxBounceAngle;
    State.ballX = usagi.GAME_W - paddleOffsetFromEdge - ballSize;
    sfx.play("bip");
  }
}

export function _draw() {
  gfx.clear(gfx.COLOR_BLACK);

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

  if (State.battle.state === "battle") {
    // TODO: initial anim

    // const anim = usagi.elapsed - State.battle.initializedAt;
    // if (anim < initTime) {
    //   const x = util.lerp(usagi.GAME_W / 2, 10, anim);
    //   const y = util.lerp(usagi.GAME_H / 2, 10, anim);
    //   const w = util.lerp(0, usagi.GAME_W - 10 * 2, anim);
    //   const h = util.lerp(0, usagi.GAME_H - 10 * 2, anim);
    //   gfx.rect_fill(x, y, w, h, gfx.COLOR_DARK_BLUE);
    //   return;
    // }
    // gfx.rect_fill(10, 10, usagi.GAME_W - 20, usagi.GAME_H - 20, gfx.COLOR_DARK_BLUE);

    const BG_W = 120;
    const BG_H = 104;
    gfx.sspr_ex(
      // src
      0,
      0,
      BG_W,
      BG_H,
      // dest
      usagi.GAME_W / 2 - BG_W / 2,
      10,
      BG_W,
      BG_H,
      false,
      false,
      0,
      gfx.COLOR_TRUE_WHITE,
      1.0,
    );
    gfx.rect_fill(usagi.GAME_W / 2 - 10, usagi.GAME_H / 2 - 30, 20, 20, gfx.COLOR_WHITE);

    // bottom text
    gfx.rect_fill(5, 10 + BG_H + 5, usagi.GAME_W - 10, 55, gfx.COLOR_BLACK);
    gfx.rect_ex(5, 10 + BG_H + 5, usagi.GAME_W - 10, 55, 3, gfx.COLOR_LIGHT_GRAY);
    gfx.text("A BALL draws near!\nCommand?", 12, 10 + BG_H + 10, gfx.COLOR_WHITE);

    // command
    gfx.rect_fill(5, 5, 60, 100, gfx.COLOR_BLACK);
    gfx.rect_ex(5, 5, 60, 100, 3, gfx.COLOR_LIGHT_GRAY);
    for (const [i, opt] of options.entries()) {
      gfx.text(opt, 20, 12 + i * 12, gfx.COLOR_WHITE);
    }
    gfx.text(">", 12, 12 + 12 * State.battle.cursor, gfx.COLOR_WHITE);

    // stats
    const statsX = usagi.GAME_W - 60;
    const hp = State.battle.player === "1" ? State.player1Hp : State.player2Hp;
    const mp = State.battle.player === "1" ? State.player1Mp : State.player2Mp;
    gfx.rect_fill(statsX - 5, 5, 60, 100, gfx.COLOR_BLACK);
    gfx.rect_ex(statsX - 5, 5, 60, 100, 3, gfx.COLOR_LIGHT_GRAY);
    gfx.text("Hero", statsX + 5, 12, gfx.COLOR_WHITE);
    gfx.text(`HP ${hp}`, statsX + 5, 24, gfx.COLOR_WHITE);
    gfx.text(`MP ${mp}`, statsX + 5, 36, gfx.COLOR_WHITE);
  }
}
