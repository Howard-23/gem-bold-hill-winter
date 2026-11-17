export type StrokeMsg =
  | { t: "pt"; x: number; y: number; c: string; s: number; start: boolean }
  | { t: "clear" }
  | { t: "commit" };

export function isStrokeMsg(data: unknown): data is StrokeMsg {
  if (!data || typeof data !== "object") return false;
  const t = (data as { t?: unknown }).t;
  return t === "pt" || t === "clear" || t === "commit";
}

export function paintPoint(
  ctx: CanvasRenderingContext2D,
  msg: Extract<StrokeMsg, { t: "pt" }>,
  width: number,
  height: number,
  last: { x: number; y: number } | null,
) {
  const x = msg.x * width;
  const y = msg.y * height;
  ctx.strokeStyle = msg.c;
  ctx.lineWidth = msg.s;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  if (msg.start || !last) ctx.moveTo(x, y);
  else ctx.moveTo(last.x, last.y);
  ctx.lineTo(x, y);
  ctx.stroke();
  return { x, y };
}
