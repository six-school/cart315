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
    const outer = Math.min(rx, Math.floor(ox * Math.sqrt(Math.max(0, 1 - (dy * dy) / (oy * oy)))));
    let inner = 0;
    if (hollow && dy * dy < iy * iy) {
      inner = Math.ceil(ix * Math.sqrt(1 - (dy * dy) / (iy * iy)));
    }
    if (inner > outer) continue;
    if (inner === 0) {
      gfx.rect_fill(cx - outer, cy + dy, 2 * outer + 1, 1, color, alpha);
    } else {
      const w = outer - inner + 1;
      gfx.rect_fill(cx - outer, cy + dy, w, 1, color, alpha);
      gfx.rect_fill(cx + inner, cy + dy, w, 1, color, alpha);
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

// max distance in px outer edge may stray from the true arc, lower = smoother
const CURVE_TOLERANCE = 0.5;
const CURVE_MAX_SEGMENTS = 48;

function cap(x: number, y: number, half: number, color: number) {
  const cx = Math.round(x);
  const cy = Math.round(y);
  const half2 = half * half;
  let prev = -1;
  for (let dy = Math.floor(half); dy >= 0; dy--) {
    const w = Math.floor(Math.sqrt(half2 - dy * dy));
    if (w > prev) {
      gfx.rect_fill(cx - w, cy - dy, 2 * w + 1, 2 * dy + 1, color);
      prev = w;
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
) {
  const half = thickness / 2;
  const vx = x1 - x0;
  const vy = y1 - y0;
  const len = Math.sqrt(vx * vx + vy * vy);

  cap(x0, y0, half, color);
  if (len === 0) return;
  cap(x1, y1, half, color);

  const thin = thickness < 2;

  if (Math.abs(bend) < 1e-6) {
    if (thin) {
      gfx.line(x0, y0, x1, y1, color);
      return;
    }
    const ox = (-vy / len) * half;
    const oy = (vx / len) * half;
    // offset by half a pixel to line up
    const ax = x0 + 0.5;
    const ay = y0 + 0.5;
    const bx = x1 + 0.5;
    const by = y1 + 0.5;
    gfx.tri_fill(ax + ox, ay + oy, ax - ox, ay - oy, bx + ox, by + oy, color);
    gfx.tri_fill(ax - ox, ay - oy, bx - ox, by - oy, bx + ox, by + oy, color);
    return;
  }

  const c = len / 2;
  const s = bend * c;
  const nx = vy / len;
  const ny = -vx / len;
  const k = (s * s - c * c) / (2 * s);
  const ccx = (x0 + x1) / 2 + nx * k;
  const ccy = (y0 + y1) / 2 + ny * k;
  const r = (c * c + s * s) / (2 * Math.abs(s));

  const sweep = 4 * Math.atan(Math.abs(bend));

  const ax = x0 - ccx;
  const ay = y0 - ccy;
  const apx = (x0 + x1) / 2 + nx * s - ccx;
  const apy = (y0 + y1) / 2 + ny * s - ccy;
  const dir = ax * apy - ay * apx >= 0 ? 1 : -1;

  const ro = thin ? r : r + half;
  const ri = thin ? r : Math.max(0, r - half);
  let segments = CURVE_MAX_SEGMENTS;
  if (ro > CURVE_TOLERANCE) {
    const maxStep = 2 * Math.acos(1 - CURVE_TOLERANCE / ro);
    segments = Math.max(1, Math.min(CURVE_MAX_SEGMENTS, Math.ceil(sweep / maxStep)));
  }

  const step = (dir * sweep) / segments;
  const cs = Math.cos(step);
  const sn = Math.sin(step);
  const cx = thin ? ccx : ccx + 0.5;
  const cy = thin ? ccy : ccy + 0.5;
  let ux = ax / r;
  let uy = ay / r;
  let pox = cx + ux * ro;
  let poy = cy + uy * ro;
  let pix = cx + ux * ri;
  let piy = cy + uy * ri;
  for (let i = 1; i <= segments; i++) {
    if (i === segments) {
      ux = (x1 - ccx) / r;
      uy = (y1 - ccy) / r;
    } else {
      const t = ux * cs - uy * sn;
      uy = ux * sn + uy * cs;
      ux = t;
    }
    const qox = cx + ux * ro;
    const qoy = cy + uy * ro;
    const qix = cx + ux * ri;
    const qiy = cy + uy * ri;
    if (thin) {
      gfx.line(pox, poy, qox, qoy, color);
    } else {
      gfx.tri_fill(pox, poy, pix, piy, qox, qoy, color);
      gfx.tri_fill(pix, piy, qix, qiy, qox, qoy, color);
    }
    pox = qox;
    poy = qoy;
    pix = qix;
    piy = qiy;
  }
}
