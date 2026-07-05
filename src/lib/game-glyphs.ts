export type GameId = "shooting-stars" | "stack-rivals" | "bomb-arena" | "orbit-runner";

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

/** Each game's Canvas glyph — shared by the arena targets and the card vignettes. */
export function drawGameGlyph(
  ctx: CanvasRenderingContext2D,
  id: GameId,
  x: number,
  y: number,
  t: number,
) {
  if (id === "shooting-stars") drawShootingStar(ctx, x, y);
  else if (id === "stack-rivals") drawSynthBlock(ctx, x, y);
  else if (id === "bomb-arena") drawArtillery(ctx, x, y);
  else drawOrbitPlanet(ctx, x, y, t);
}
