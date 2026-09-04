import { useCallback, useEffect, useRef } from 'react';

// Reusable handwriting canvas (Doc 05 v2 §8, Doc 08 NOTES-02 handwrite area).
// Pointer events + pressure; strokes kept in state via onChange for persistence.
export interface HandStroke {
  color: string;
  width: number;
  points: Array<{ x: number; y: number; p: number }>;
}

interface HandwriteCanvasProps {
  strokes: HandStroke[];
  onChange: (strokes: HandStroke[]) => void;
  height?: number;
  tool?: 'pen' | 'eraser';
  className?: string;
}

export function HandwriteCanvas({
  strokes,
  onChange,
  height = 180,
  tool = 'pen',
  className = '',
}: HandwriteCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const current = useRef<HandStroke | null>(null);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const drawStroke = (s: HandStroke) => {
      ctx.strokeStyle = s.color;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      s.points.forEach((pt, i) => {
        ctx.lineWidth = s.width * (0.5 + pt.p * 0.75);
        ctx.beginPath();
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else {
          const prev = s.points[i - 1]!;
          ctx.moveTo(prev.x, prev.y);
        }
        ctx.lineTo(pt.x, pt.y);
        ctx.stroke();
      });
    };
    for (const s of strokes) drawStroke(s);
    if (current.current) drawStroke(current.current);
  }, [strokes]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = height;
    redraw();
  }, [redraw, height]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      p: e.pressure > 0 ? e.pressure : 0.5,
    };
  };

  const config = (): Pick<HandStroke, 'color' | 'width'> =>
    tool === 'eraser'
      ? { color: '#050505', width: 22 }
      : { color: '#ffffff', width: 2.5 };

  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    current.current = { ...config(), points: [pos(e)] };
    redraw();
  };

  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current || !current.current) return;
    current.current.points.push(pos(e));
    redraw();
  };

  const onUp = () => {
    if (!drawing.current) return;
    drawing.current = false;
    if (current.current && current.current.points.length > 1) {
      onChange([...strokes, current.current]);
    }
    current.current = null;
    redraw();
  };

  return (
    <div className={`panel-strong pixel-cut p-1 ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full touch-none cursor-crosshair"
        style={{ height }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerLeave={onUp}
        onPointerCancel={onUp}
        aria-label="Area tulisan tangan"
      />
    </div>
  );
}

// Export current canvas content as PNG data URL.
export const strokesToDataUrl = (
  strokes: HandStroke[],
  width = 800,
  height = 200,
): string => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#ffffff';
    for (const s of strokes) {
      ctx.strokeStyle = s.color === '#050505' ? '#050505' : '#ffffff';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      s.points.forEach((pt, i) => {
        ctx.lineWidth = s.width * (0.5 + pt.p * 0.75);
        ctx.beginPath();
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else {
          const prev = s.points[i - 1]!;
          ctx.moveTo(prev.x, prev.y);
        }
        ctx.lineTo(pt.x, pt.y);
        ctx.stroke();
      });
    }
  }
  return canvas.toDataURL('image/png');
};
