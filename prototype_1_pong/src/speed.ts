/* eslint-disable unicorn/consistent-destructuring */

export type GameState = {
  mode: "speed";
  paddle1Y: number;
  paddle2Y: number;
  paddleSpeed: number;
  ballX: number;
  ballY: number;
  ballAngle: number;
  ballSpeed: number;
  p1Score: number;
  p2Score: number;
};

declare let State: GameState;

const initialBallSpeed = 120;
const initialPaddleSpeed = 126;

const paddleHeight = 30;
const paddleWidth = 5;
const paddleOffsetFromEdge = 15;
const ballSize = 6;
const maxBounceAngle = math.rad(75);
const borderSize = 3;
const textScale = 2;

// F5 to reset
export function _init() {
  State = {
    mode: "speed",
    paddle1Y: usagi.GAME_H / 2 - paddleHeight / 2,
    paddle2Y: usagi.GAME_H / 2 - paddleHeight / 2,
    paddleSpeed: initialPaddleSpeed,
    ballX: usagi.GAME_W / 2 - ballSize / 2,
    ballY: usagi.GAME_H / 2 - ballSize / 2,
    ballAngle: 0, // TODO: more interesting initial angle?
    ballSpeed: initialBallSpeed,
    p1Score: 0,
    p2Score: 0,
  };
}

export function _update(dt: number) {
  const { ballAngle, ballSpeed, paddleSpeed } = State;

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
    maybeJuice();
    State.ballAngle = -State.ballAngle;
    speedUp();
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
    State.ballSpeed = initialBallSpeed;
    State.paddleSpeed = initialPaddleSpeed;
  }

  bounceOffPaddles();
}

function speedUp() {
  State.ballSpeed += 10;
  State.paddleSpeed += 10;
}

function bounceOffPaddles() {
  let didBounce = false;

  // left
  if (
    util.rect_overlap(
      { x: State.ballX, y: State.ballY, w: ballSize, h: ballSize },
      { x: paddleOffsetFromEdge, y: State.paddle1Y, w: paddleWidth, h: paddleHeight },
    )
  ) {
    const ballYPaddleYDelta =
      (State.paddle1Y + paddleHeight / 2 - State.ballY + ballSize / 2) / (paddleHeight / 2);

    State.ballAngle = util.clamp(ballYPaddleYDelta, -1, 1) * -1 * maxBounceAngle;
    State.ballX = paddleOffsetFromEdge + paddleWidth;
    didBounce = true;
  }

  // right
  if (
    // prettier-ignore
    util.rect_overlap(
      { x: State.ballX, y: State.ballY, w: ballSize, h: ballSize },
      { x: usagi.GAME_W - paddleOffsetFromEdge, y: State.paddle2Y, w: paddleWidth, h: paddleHeight }
    )
  ) {
    const ballYPaddleYDelta =
      (State.paddle2Y + paddleHeight / 2 - State.ballY + ballSize / 2) / (paddleHeight / 2);

    State.ballAngle = math.pi - util.clamp(ballYPaddleYDelta, -1, 1) * -1 * maxBounceAngle;
    State.ballX = usagi.GAME_W - paddleOffsetFromEdge - ballSize;
    didBounce = true;
  }

  if (didBounce) {
    if (State.ballSpeed > initialBallSpeed * 2) {
      effect.hitstop(0.1);
    }
    maybeJuice();
    speedUp();
    sfx.play("bip");
  }
}

function maybeJuice() {
  if (State.ballSpeed > initialBallSpeed * 3) {
    effect.screen_shake(0.08, 4);
  } else if (State.ballSpeed > initialBallSpeed * 2) {
    effect.screen_shake(0.08, 3);
  } else if (State.ballSpeed > initialBallSpeed * 1.5) {
    effect.screen_shake(0.08, 1);
  }
}

const CYCLE = [
  gfx.COLOR_RED,
  gfx.COLOR_ORANGE,
  gfx.COLOR_YELLOW,
  gfx.COLOR_GREEN,
  gfx.COLOR_BLUE,
  gfx.COLOR_INDIGO,
  gfx.COLOR_DARK_PURPLE,
];

let currCycle = 0;

export function _draw() {
  if (State.ballSpeed > initialBallSpeed * 1.5) {
    // don't fully clear the screen when we're going fast to add a trail effect
    const alpha = util.clamp(
      util.remap(State.ballSpeed, initialBallSpeed * 2, initialBallSpeed * 4, 0.9, 0.3),
      0.3,
      1.0,
    );
    gfx.rect_fill(0, 0, usagi.GAME_W, usagi.GAME_H, gfx.COLOR_BLACK, alpha);
  } else {
    gfx.clear(gfx.COLOR_BLACK);
  }

  const heat = util.clamp(
    util.remap(State.ballSpeed, initialBallSpeed, initialBallSpeed * 4, 0.0, 0.6),
    0.0,
    0.6,
  );
  gfx.rect_fill(0, 0, usagi.GAME_W, usagi.GAME_H, gfx.COLOR_PINK, heat);

  const { ballX, ballY, paddle1Y, paddle2Y, p1Score, p2Score } = State;

  // center line
  for (let i = 0; i < usagi.GAME_H; i += 8) {
    gfx.rect_fill(usagi.GAME_W / 2 - borderSize / 2, i, borderSize, borderSize, gfx.COLOR_WHITE);
  }

  if (State.ballSpeed > initialBallSpeed * 2) {
    // rainbow ball
    currCycle = (currCycle + 1) % CYCLE.length;
    gfx.rect_fill(ballX, ballY, ballSize, ballSize, CYCLE[currCycle]);
  } else {
    // normal ball
    gfx.rect_fill(ballX, ballY, ballSize, ballSize, gfx.COLOR_WHITE);
  }

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
