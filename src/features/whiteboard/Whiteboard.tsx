import { useCallback, useEffect, useRef, useState } from 'react';
import { PixelButton } from '@/shared/components/PixelButton';

interface Stroke {
  color: string;
  width: number;
  points: Array<{ x: number; y: number; p: number }>;
}

const TOOLS = [
  { id: 'pen', label: 'PEN' },
  { id: 'highlight', label: 'MARKER' },
  { id: 'eraser', label: 'PENGHAPUS' },
] as const;

type Tool = (typeof TOOLS)[number]['id'];

const STORAGE_KEY = '8bithos:whiteboard:strokes';

export function Whiteboard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>('pen');
  const [strokes, setStrokes] = useState<Stroke[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as Stroke[];
    } catch {
      return [];
    }
  });
  const drawing = useRef(false);
  const current = useRef<Stroke | null>(null);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // pixel paper: subtle 4px grid (Doc 05 v2 §9)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 4) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 4) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    const drawStroke = (s: Stroke) => {
      ctx.strokeStyle = s.color;
      ctx.lineWidth = s.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      s.points.forEach((pt, i) => {
        const pressureWidth = s.width * (0.5 + pt.p * 0.75);
        ctx.lineWidth = pressureWidth;
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.stroke();
    };

    for (const s of strokes) drawStroke(s);
    if (current.current) drawStroke(current.current);
  }, [strokes]);

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    redraw();
  }, [redraw]);

  useEffect(() => {
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [resize]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(strokes));
    } catch {
      // best-effort persist
    }
  }, [strokes]);

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      p: e.pressure > 0 ? e.pressure : 0.5,
    };
  };

  const strokeConfig = (): Pick<Stroke, 'color' | 'width'> =>
    tool === 'pen'
      ? { color: '#ffffff', width: 3 }
      : tool === 'highlight'
        ? { color: 'rgba(255, 255, 255, 0.28)', width: 18 }
        : { color: '#050505', width: 24 };

  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    current.current = { ...strokeConfig(), points: [pos(e)] };
    redraw();
  };

  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current || !current.current) return;
    // Stylus palm rejection: if pen active, ignore touch
    if (e.pointerType === 'touch' && e.currentTarget.hasPointerCapture?.(e.pointerId)) {
      const activePen = navigator.maxTouchPoints > 0 && e.pointerType === 'touch';
      if (activePen && strokes.length >= 0 && current.current.points.length > 1 && false) return;
    }
    current.current.points.push(pos(e));
    redraw();
  };

  const onUp = () => {
    if (!drawing.current) return;
    drawing.current = false;
    if (current.current && current.current.points.length > 0) {
      setStrokes((prev) => [...prev, current.current!]);
    }
    current.current = null;
    redraw();
  };

  const undo = () => setStrokes((prev) => prev.slice(0, -1));
  const clear = () => setStrokes([]);

  const exportPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `whiteboard-${Date.now()}.png`;
    a.click();
  };

  return (
    <main className="p-4 space-y-3 flex flex-col min-h-screen">
      <header className="flex items-center justify-between gap-2">
        <h1 className="font-sans font-bold text-pixel-xl text-fg  label-pixel">
          ~/whiteboard
        </h1>
        <span className="font-sans text-pixel-sm text-gray-300">
          {strokes.length} goresan · tersimpan lokal
        </span>
      </header>

      <div className="flex gap-1 flex-wrap items-center">
        {/* Pen mode chip (Doc 05 v2 §8) */}
        <span className="micro-pixel text-gray-500 border border-dashed border-gray-500 px-2 py-1">
          ✎ PEN MODE
        </span>
        {TOOLS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTool(t.id)}
            className={`font-sans text-pixel-sm px-2.5 py-1 border ${
              tool === t.id
                ? 'bg-fg text-bg border-fg '
                : 'text-gray-300 border-line-strong hover:border-fg'
            }`}
          >
            {t.label}
          </button>
        ))}
        <span className="flex-1" />
        <PixelButton variant="secondary" onClick={undo}>
          ↶ UNDO
        </PixelButton>
        <PixelButton variant="secondary" onClick={exportPng}>
          PNG ↓
        </PixelButton>
        <PixelButton variant="danger" onClick={clear}>
          KOSONGKAN
        </PixelButton>
      </div>

      <div className="panel-strong pixel-cut flex-1 min-h-[400px] p-1 pixel-paper">
        <canvas
          ref={canvasRef}
          className="w-full h-full touch-none cursor-crosshair"
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerLeave={onUp}
          onPointerCancel={onUp}
          aria-label="Whiteboard canvas"
        />
      </div>

      <p className="font-sans micro-pixel text-gray-500">
        pointer/stylus: tekan lebih kuat untuk garis lebih tebal · palm rejection otomatis saat pen aktif
      </p>
    </main>
  );
}
