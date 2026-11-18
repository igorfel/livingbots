export type GameId =
  | "shooting-stars"
  | "shooting-stars-3d"
  | "stack-rivals"
  | "bomb-arena"
  | "orbit-runner"
  | "idle-forge"
  | "wordle-royale"
  | "outward";

const WORKER_COLOR = "#3dd6ff";
const FOREMAN_COLOR = "#ff3d6e";

function drawShootingStar(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  const r = 8;
  ctx.strokeStyle = "rgba(61,214,255,0.35)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - r * 1.8, cy - r * 1.8);
  ctx.lineTo(cx - r * 0.4, cy - r * 0.4);
  ctx.stroke();

  ctx.fillStyle = WORKER_COLOR;
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI / 4) * i - Math.PI / 2;
    const rad = i % 2 === 0 ? r : r * 0.4;
    const px = cx + rad * Math.cos(angle);
    const py = cy + rad * Math.sin(angle);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

function drawSynthBlock(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  const s = 16;
  ctx.fillStyle = WORKER_COLOR;
  ctx.fillRect(cx - s / 2, cy - s / 2, s, s);
  ctx.fillStyle = FOREMAN_COLOR;
  ctx.fillRect(cx - s / 2, cy - s / 2, s, s * 0.18);
  ctx.strokeStyle = "rgba(11,14,20,0.55)";
  ctx.lineWidth = 1;
  for (let i = 1; i <= 2; i++) {
    const ly = cy - s / 2 + s * 0.18 + (s * 0.82) * (i / 3);
    ctx.beginPath();
    ctx.moveTo(cx - s / 2, ly);
    ctx.lineTo(cx + s / 2, ly);
    ctx.stroke();
  }
}

function drawArtillery(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  const r = 6;
  ctx.setLineDash([3, 3]);
  ctx.strokeStyle = FOREMAN_COLOR;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx - r * 3.2, cy + r * 1.6);
  ctx.quadraticCurveTo(cx - r * 1.6, cy - r * 2.8, cx, cy);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = WORKER_COLOR;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.7, 0, Math.PI * 2);
  ctx.fill();
}

function drawOrbitPlanet(ctx: CanvasRenderingContext2D, cx: number, cy: number, t: number) {
  const r = 7;
  ctx.strokeStyle = "rgba(61,214,255,0.45)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(cx, cy, r * 1.9, r * 0.75, -0.3, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = WORKER_COLOR;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.85, 0, Math.PI * 2);
  ctx.fill();

  const moonAngle = t * 2;
  const cos = Math.cos(-0.3);
  const sin = Math.sin(-0.3);
  const ex = Math.cos(moonAngle) * r * 1.9;
  const ey = Math.sin(moonAngle) * r * 0.75;
  const mx = cx + ex * cos - ey * sin;
  const my = cy + ex * sin + ey * cos;
  ctx.fillStyle = FOREMAN_COLOR;
  ctx.beginPath();
  ctx.arc(mx, my, r * 0.28, 0, Math.PI * 2);
  ctx.fill();
}

/** A bomber crossing the sky with a flak burst blooming on the tracer line. */
function drawFlakBurst(ctx: CanvasRenderingContext2D, cx: number, cy: number, t: number) {
  ctx.strokeStyle = "rgba(61,214,255,0.35)";
  ctx.lineWidth = 1.5;
  ctx.setLineDash([2, 3]);
  ctx.beginPath();
  ctx.moveTo(cx - 14, cy + 12);
  ctx.lineTo(cx - 1, cy - 1);
  ctx.stroke();
  ctx.setLineDash([]);

  // Top-down bomber heading left: fuselage, swept wings, tailplane.
  const px = cx + 7;
  const py = cy - 7;
  ctx.fillStyle = WORKER_COLOR;
  ctx.fillRect(px - 7, py - 1.2, 13, 2.4);
  ctx.beginPath();
  ctx.moveTo(px - 2, py);
  ctx.lineTo(px + 2, py - 8);
  ctx.lineTo(px + 4, py - 8);
  ctx.lineTo(px + 2.5, py);
  ctx.lineTo(px + 4, py + 8);
  ctx.lineTo(px + 2, py + 8);
  ctx.closePath();
  ctx.fill();
  ctx.fillRect(px + 4.5, py - 3.5, 1.5, 7);

  const phase = (t * 0.9) % 1;
  ctx.strokeStyle = `rgba(255,61,110,${(1 - phase).toFixed(3)})`;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx - 1, cy - 1, 2 + phase * 7, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = FOREMAN_COLOR;
  ctx.beginPath();
  ctx.arc(cx - 1, cy - 1, 1.6, 0, Math.PI * 2);
  ctx.fill();
}

/** An anvil with sparks drifting up off the strike point. */
function drawAnvil(ctx: CanvasRenderingContext2D, cx: number, cy: number, t: number) {
  ctx.fillStyle = WORKER_COLOR;
  ctx.beginPath();
  ctx.moveTo(cx - 13, cy - 3);
  ctx.lineTo(cx - 5, cy - 6);
  ctx.lineTo(cx + 10, cy - 6);
  ctx.lineTo(cx + 10, cy - 1);
  ctx.lineTo(cx + 4, cy - 1);
  ctx.lineTo(cx + 3, cy + 4);
  ctx.lineTo(cx + 7, cy + 8);
  ctx.lineTo(cx - 6, cy + 8);
  ctx.lineTo(cx - 2, cy + 4);
  ctx.lineTo(cx - 3, cy - 1);
  ctx.lineTo(cx - 6, cy - 1);
  ctx.closePath();
  ctx.fill();

  for (let i = 0; i < 3; i++) {
    const phase = (t * 0.7 + i / 3) % 1;
    const sx = cx + 1 + Math.sin(i * 2.1 + phase * 3) * (2 + phase * 5);
    const sy = cy - 8 - phase * 12;
    ctx.fillStyle = `rgba(255,61,110,${(1 - phase).toFixed(3)})`;
    ctx.fillRect(sx - 1, sy - 1, 2, 2);
  }
}

/** A small letter board: two scored tiles, one flipping, an empty row below. */
function drawLetterTiles(ctx: CanvasRenderingContext2D, cx: number, cy: number, t: number) {
  const s = 8;
  const gap = 2;
  const left = cx - (3 * s + 2 * gap) / 2;
  const top = cy - (2 * s + gap) / 2;
  const flip = Math.cos(t * 1.4);

  for (let col = 0; col < 3; col++) {
    const x = left + col * (s + gap);
    if (col < 2) {
      ctx.fillStyle = col === 0 ? WORKER_COLOR : FOREMAN_COLOR;
      ctx.fillRect(x, top, s, s);
    } else {
      const h = s * Math.abs(flip);
      if (flip < 0) {
        ctx.fillStyle = WORKER_COLOR;
        ctx.fillRect(x, top + (s - h) / 2, s, h);
      } else {
        ctx.strokeStyle = "rgba(232,236,241,0.45)";
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, top + (s - h) / 2 + 0.5, s - 1, Math.max(0, h - 1));
      }
    }
    ctx.strokeStyle = "rgba(232,236,241,0.2)";
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, top + s + gap + 0.5, s - 1, s - 1);
  }
}

/** A home node linked to conquered outposts, with a scanner ping sweeping out. */
function drawNodeMap(ctx: CanvasRenderingContext2D, cx: number, cy: number, t: number) {
  const hx = cx - 3;
  const hy = cy + 2;
  const nodes = [
    { x: cx + 9, y: cy - 8, color: WORKER_COLOR, r: 2 },
    { x: cx + 11, y: cy + 7, color: FOREMAN_COLOR, r: 2.2 },
    { x: cx - 12, y: cy - 8, color: null, r: 2 },
  ];

  ctx.strokeStyle = "rgba(61,214,255,0.45)";
  ctx.lineWidth = 1;
  for (const n of nodes) {
    ctx.setLineDash(n.color ? [] : [2, 2]);
    ctx.beginPath();
    ctx.moveTo(hx, hy);
    ctx.lineTo(n.x, n.y);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  const phase = (t * 0.5) % 1;
  ctx.strokeStyle = `rgba(61,214,255,${(0.6 * (1 - phase)).toFixed(3)})`;
  ctx.beginPath();
  ctx.arc(hx, hy, 4 + phase * 14, 0, Math.PI * 2);
  ctx.stroke();

  for (const n of nodes) {
    ctx.beginPath();
    ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
    if (n.color) {
      ctx.fillStyle = n.color;
      ctx.fill();
    } else {
      ctx.strokeStyle = "rgba(232,236,241,0.45)";
      ctx.stroke();
    }
  }
  ctx.fillStyle = WORKER_COLOR;
  ctx.beginPath();
  ctx.arc(hx, hy, 3.5, 0, Math.PI * 2);
  ctx.fill();
}

/** Each game's Canvas glyph — shared by the arena targets and the card vignettes. */
export function drawGameGlyph(
  ctx: CanvasRenderingContext2D,
  id: GameId,
  x: number,
  y: number,
  t: number,
) {
  switch (id) {
    case "shooting-stars":
      return drawShootingStar(ctx, x, y);
    case "shooting-stars-3d":
      return drawFlakBurst(ctx, x, y, t);
    case "stack-rivals":
      return drawSynthBlock(ctx, x, y);
    case "bomb-arena":
      return drawArtillery(ctx, x, y);
    case "orbit-runner":
      return drawOrbitPlanet(ctx, x, y, t);
    case "idle-forge":
      return drawAnvil(ctx, x, y, t);
    case "wordle-royale":
      return drawLetterTiles(ctx, x, y, t);
    case "outward":
      return drawNodeMap(ctx, x, y, t);
  }
}
