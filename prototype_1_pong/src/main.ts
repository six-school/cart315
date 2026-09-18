/* eslint-disable unicorn/consistent-destructuring */

declare let State: {
  paddle1Y: number;
  paddle2Y: number;
  ballX: number;
  ballY: number;
  ballAngle: number;
  ballSpeed: number;
  p1Score: number;
  p2Score: number;
};

const paddleHeight = 30;
const paddleWidth = 5;
const paddleOffsetFromEdge = 15;
const paddleSpeed = 126;
const ballSize = 6;
const maxBounceAngle = math.rad(75);
const borderSize = 3;
const textScale = 2;

function _config() {
  return { name: "Game", game_id: "com.usagiengine.SIX_PONG" };
}

// F5 to reset
function _init() {
  State = {
    paddle1Y: usagi.GAME_H / 2 - paddleHeight / 2,
    paddle2Y: usagi.GAME_H / 2 - paddleHeight / 2,
    ballX: usagi.GAME_W / 2 - ballSize / 2,
    ballY: usagi.GAME_H / 2 - ballSize / 2,
    ballAngle: 0, // TODO
    ballSpeed: 120,
    p1Score: 0,
    p2Score: 0,
  };
}

let t = 0;

function _update(dt: number) {
  t += dt;

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
    // TODO: bounce sound
  }

  if (
    // prettier-ignore
    util.rect_overlap(
      { x: State.ballX, y: State.ballY, w: ballSize, h: ballSize },
      { x: paddleOffsetFromEdge, y: State.paddle1Y, w: paddleWidth, h: paddleHeight },
    )
  ) {
    const ballDistanceFromPaddleCenter =
      ((State.paddle1Y + paddleHeight / 2 - State.ballY + ballSize / 2) / (paddleHeight / 2)) * -1;

    State.ballAngle = ballDistanceFromPaddleCenter * maxBounceAngle;
    // TODO: bounce paddle sound
  }

  if (
    // prettier-ignore
    util.rect_overlap(
      { x: State.ballX, y: State.ballY, w: ballSize, h: ballSize },
      { x: usagi.GAME_W - paddleOffsetFromEdge, y: State.paddle2Y, w: paddleWidth, h: paddleHeight }
    )
  ) {
    const ballDistanceFromPaddleCenter =
      ((State.paddle2Y + paddleHeight / 2 - State.ballY + ballSize / 2) / (paddleHeight / 2)) * -1;

    State.ballAngle = math.pi - ballDistanceFromPaddleCenter * maxBounceAngle;
    // TODO: bounce paddle sound
  }
}

function _draw(_dt: number) {
  gfx.clear(gfx.COLOR_BLACK);

  const { ballX, ballY, paddle1Y, paddle2Y, p1Score, p2Score } = State;

  // center line
  for (let i = 0; i < usagi.GAME_H; i += 8) {
    gfx.rect_fill(usagi.GAME_W / 2 - borderSize / 2, i, borderSize, borderSize, gfx.COLOR_WHITE);
  }

  // draw score
  const [p1ScoreWidth] = usagi.measure_text(p1Score.toString());
  // prettier-ignore
  gfx.text_ex(p1Score.toString(), usagi.GAME_W / 2 - p1ScoreWidth * textScale - 10, 10, textScale, 0, gfx.COLOR_WHITE, 1);
  gfx.text_ex(p2Score.toString(), usagi.GAME_W / 2 + 10, 10, textScale, 0, gfx.COLOR_WHITE, 1);

  gfx.rect_fill(ballX, ballY, ballSize, ballSize, gfx.COLOR_WHITE);

  gfx.rect_fill(paddleOffsetFromEdge, paddle1Y, paddleWidth, paddleHeight, gfx.COLOR_WHITE);
  gfx.rect_fill(
    usagi.GAME_W - paddleOffsetFromEdge,
    paddle2Y,
    paddleWidth,
    paddleHeight,
    gfx.COLOR_WHITE,
  );
}
