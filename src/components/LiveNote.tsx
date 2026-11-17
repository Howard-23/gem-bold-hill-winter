import { useEffect, useRef } from "react";
import { paintPoint, type StrokeMsg } from "@/lib/strokes";

export function LiveNote({
  active,
  stream,
}: {
  active: boolean;
  stream: StrokeMsg | null;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const last = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.fillStyle = "#fffdf6";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  useEffect(() => {
    if (!stream) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    if (stream.t === "clear" || stream.t === "commit") {
      ctx.fillStyle = "#fffdf6";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      last.current = null;
      return;
    }
    last.current = paintPoint(ctx, stream, canvas.width, canvas.height, stream.start ? null : last.current);
  }, [stream]);

  if (!active) return null;

  return (
    <div className="note-paper rotate-[-2deg] rounded-sm px-4 pb-5 pt-3">
      <p className="mb-1 text-center text-xs font-semibold uppercase tracking-wider text-rose">Drawing now</p>
      <canvas ref={canvasRef} width={480} height={540} className="h-auto w-full" />
    </div>
  );
}
