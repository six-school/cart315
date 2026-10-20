// borrowed from proto_1
export function ellipse(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  thickness: number,
  color: number,
  alpha?: number,
) {
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

const TAU = Math.PI * 2;

// arc start/end in radians, clockwise
export function arc(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  start: number,
  end: number,
  thickness: number,
  color: number,
  alpha?: number,
) {
  let sweep = end - start;
  const full = sweep >= TAU || sweep <= -TAU;
  if (!full) {
    while (sweep < 0) sweep += TAU;
    while (sweep >= TAU) sweep -= TAU;
    if (sweep === 0) return;
  }
  const sx = Math.cos(start);
  const sy = Math.sin(start);
  const ex = Math.cos(start + sweep);
  const ey = Math.sin(start + sweep);
  const wide = sweep > Math.PI;
  const ox = rx + 0.5;
  const oy = ry + 0.5;
  const ix = rx - thickness + 0.5;
  const iy = ry - thickness + 0.5;
  const hollow = ix > 0 && iy > 0;
  for (let dy = -ry; dy <= ry; dy++) {
    for (let dx = -rx; dx <= rx; dx++) {
      if ((dx * dx) / (ox * ox) + (dy * dy) / (oy * oy) > 1) continue;
      if (hollow && (dx * dx) / (ix * ix) + (dy * dy) / (iy * iy) < 1) continue;
      if (!full) {
        const afterStart = sx * dy - sy * dx >= 0;
        const beforeEnd = ex * dy - ey * dx <= 0;
        if (wide ? !afterStart && !beforeEnd : !afterStart || !beforeEnd) continue;
      }
      gfx.px(cx + dx, cy + dy, color, alpha);
    }
  }
}

// like usagi's line_ex, but with bend
export function curve(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  bend: number,
  thickness: number,
  color: number,
  alpha?: number,
) {
  const half = thickness / 2;
  const vx = x1 - x0;
  const vy = y1 - y0;
  const len = Math.sqrt(vx * vx + vy * vy);
  const straight = len === 0 || Math.abs(bend) < 1e-6;

  // Circle through both endpoints (only used when bent)
  let ccx = 0;
  let ccy = 0;
  let r = 0;
  let ax = 0;
  let ay = 0;
  let bx = 0;
  let by = 0; // endpoint directions from the center
  let o = 1; // sweep orientation (+1 or -1)
  let wide = false; // more than a semicircle?

  let minX = Math.min(x0, x1);
  let maxX = Math.max(x0, x1);
  let minY = Math.min(y0, y1);
  let maxY = Math.max(y0, y1);

  if (!straight) {
    const c = len / 2;
    const s = bend * c;
    const nx = vy / len;
    const ny = -vx / len;
    const k = (s * s - c * c) / (2 * s);
    ccx = (x0 + x1) / 2 + nx * k;
    ccy = (y0 + y1) / 2 + ny * k;
    r = (c * c + s * s) / (2 * Math.abs(s));
    ax = x0 - ccx;
    ay = y0 - ccy;
    bx = x1 - ccx;
    by = y1 - ccy;
    const apx = (x0 + x1) / 2 + nx * s - ccx;
    const apy = (y0 + y1) / 2 + ny * s - ccy;
    o = ax * apy - ay * apx >= 0 ? 1 : -1;
    wide = Math.abs(bend) > 1;

    if (inWedge(r, 0)) maxX = Math.max(maxX, ccx + r);
    if (inWedge(-r, 0)) minX = Math.min(minX, ccx - r);
    if (inWedge(0, r)) maxY = Math.max(maxY, ccy + r);
    if (inWedge(0, -r)) minY = Math.min(minY, ccy - r);
  }

  function inWedge(px: number, py: number): boolean {
    const afterStart = o * (ax * py - ay * px) >= 0;
    const beforeEnd = o * (px * by - py * bx) >= 0;
    return wide ? afterStart || beforeEnd : afterStart && beforeEnd;
  }

  const xa = Math.floor(minX - half);
  const xb = Math.ceil(maxX + half);
  const ya = Math.floor(minY - half);
  const yb = Math.ceil(maxY + half);
  const half2 = half * half;

  for (let y = ya; y <= yb; y++) {
    for (let x = xa; x <= xb; x++) {
      let hit: boolean;
      if (straight) {
        let t = len === 0 ? 0 : ((x - x0) * vx + (y - y0) * vy) / (len * len);
        t = Math.max(0, Math.min(1, t));
        const ex = x - (x0 + vx * t);
        const ey = y - (y0 + vy * t);
        hit = ex * ex + ey * ey <= half2;
      } else {
        const px = x - ccx;
        const py = y - ccy;
        if (inWedge(px, py)) {
          hit = Math.abs(Math.sqrt(px * px + py * py) - r) <= half;
        } else {
          const d0x = x - x0;
          const d0y = y - y0;
          const d1x = x - x1;
          const d1y = y - y1;
          hit = d0x * d0x + d0y * d0y <= half2 || d1x * d1x + d1y * d1y <= half2;
        }
      }
      if (hit) gfx.px(x, y, color, alpha);
    }
  }
}
