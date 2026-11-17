import { useEffect, useRef, useState } from "react";

const COLORS = [
  { id: "ink", value: "#1a2e2a" },
  { id: "rose", value: "#e25b6a" },
  { id: "leaf", value: "#2f8a74" },
] as const;

export type LivePoint = { x: number; y: number; c: string; s: number; start: boolean };

export function Composer({
  busy,
  onSend,
  onPoint,
  onClear,
}: {
  busy: boolean;
  onSend: (image: string) => void;
  onPoint?: (point: LivePoint) => void;
  onClear?: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [color, setColor] = useState<(typeof COLORS)[number]["value"]>(COLORS[0].value);
  const [size, setSize] = useState(4);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#fffdf6";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  function pos(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  }

  function down(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    canvas.setPointerCapture(e.pointerId);
    drawing.current = true;
    stroke(e, true);
  }

  function stroke(e: React.PointerEvent<HTMLCanvasElement>, start: boolean) {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const p = pos(e);
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x, p.y);
    if (!start) {
      ctx.lineTo(p.x, p.y);
    }
    // Draw a short segment from the last point stored on the canvas dataset.
    const lastX = Number(canvas.dataset.lx);
    const lastY = Number(canvas.dataset.ly);
    ctx.beginPath();
    if (start || Number.isNaN(lastX)) {
      ctx.moveTo(p.x, p.y);
    } else {
      ctx.moveTo(lastX, lastY);
    }
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    canvas.dataset.lx = String(p.x);
    canvas.dataset.ly = String(p.y);
    onPoint?.({ x: p.x / canvas.width, y: p.y / canvas.height, c: color, s: size, start });
  }

  function move(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    stroke(e, false);
  }

  function up() {
    drawing.current = false;
  }

  function clear() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.fillStyle = "#fffdf6";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    delete canvas.dataset.lx;
    onClear?.();
  }

  function send() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onSend(canvas.toDataURL("image/jpeg", 0.72));
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="overflow-hidden rounded-card border border-line bg-surface shadow-sm">
        <canvas
          ref={canvasRef}
          width={640}
          height={720}
          className="aspect-[8/9] w-full touch-none bg-surface"
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
        />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        {COLORS.map((c) => (
          <button
            key={c.id}
            type="button"
            aria-label={`${c.id} ink`}
            onClick={() => setColor(c.value)}
            className={`h-11 w-11 rounded-full border-2 ${color === c.value ? "border-ink" : "border-transparent"}`}
            style={{ background: c.value }}
          />
        ))}
        <label className="ml-auto flex items-center gap-2 text-sm text-muted">
          Tip
          <input
            type="range"
            min={2}
            max={14}
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className="w-24 accent-leaf"
          />
        </label>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={clear}
          className="h-12 rounded-full border border-line bg-surface font-medium text-ink"
        >
          Clear
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={send}
          className="h-12 rounded-full bg-rose font-semibold text-surface disabled:opacity-60"
        >
          {busy ? "Sending…" : "Keep this note"}
        </button>
      </div>
    </div>
  );
}
