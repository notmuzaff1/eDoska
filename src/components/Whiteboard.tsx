import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Download, RotateCcw, Palette, Eraser, Undo2, Redo2, Type,
  Square, Circle, Minus, Grid3x3, AlignJustify, Trash2,
} from 'lucide-react';

interface WhiteboardProps {
  isOpen: boolean;
  onClose: () => void;
}

type BgMode = 'plain' | 'grid' | 'lined';

const COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#ef4444', '#f97316', '#eab308', '#22c55e', '#ffffff', '#f43f5e', '#14b8a6'];
const BG_DARK = '#0f172a';
const BG_LIGHT = '#ffffff';
const GRID_COLOR = '#1e3a5f';
const LINED_COLOR = '#1e3a5f';
const HISTORY_MAX = 50;

// Chaikin's corner-cutting algorithm for smoothing
function chaikinSmooth(points: { x: number; y: number }[], iterations = 1): { x: number; y: number }[] {
  if (points.length < 3) return points;
  let pts = points;
  for (let iter = 0; iter < iterations; iter++) {
    const smoothed: { x: number; y: number }[] = [];
    smoothed.push(pts[0]);
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      smoothed.push({ x: p0.x * 0.75 + p1.x * 0.25, y: p0.y * 0.75 + p1.y * 0.25 });
      smoothed.push({ x: p0.x * 0.25 + p1.x * 0.75, y: p0.y * 0.25 + p1.y * 0.75 });
    }
    smoothed.push(pts[pts.length - 1]);
    pts = smoothed;
  }
  return pts;
}

export const Whiteboard: React.FC<WhiteboardProps> = ({ isOpen, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(3);
  const [brushColor, setBrushColor] = useState('#06b6d4');
  const [tool, setTool] = useState<'pen' | 'eraser' | 'line' | 'rect' | 'circle' | 'text'>('pen');
  const [bgMode, setBgMode] = useState<BgMode>('plain');
  const [showTextModal, setShowTextModal] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [textPos, setTextPos] = useState({ x: 0, y: 0 });
  const [shapeStart, setShapeStart] = useState<{ x: number; y: number } | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // History refs to avoid stale closure issues
  const historyStackRef = useRef<ImageData[]>([]);
  const historyIdxRef = useRef(-1);
  const [, forceRender] = useState(0);

  const currentActionRef = useRef<{
    tool: string;
    points: { x: number; y: number }[];
    color: string;
    size: number;
  } | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2000);
  }, []);

  const getCtx = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d', { willReadFrequently: true }) ?? null;
    if (ctx) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
    }
    return ctx;
  }, []);

  const getPos = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  const drawBackground = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.fillStyle = BG_DARK;
    ctx.fillRect(0, 0, w, h);
    if (bgMode === 'grid') {
      ctx.strokeStyle = GRID_COLOR;
      ctx.lineWidth = 0.5;
      const step = 40;
      for (let x = 0; x <= w; x += step) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = 0; y <= h; y += step) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }
    } else if (bgMode === 'lined') {
      ctx.strokeStyle = LINED_COLOR;
      ctx.lineWidth = 0.5;
      const spacing = 36;
      const margin = 60;
      // Left margin line
      ctx.strokeStyle = '#ff6b6b';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(margin, 0); ctx.lineTo(margin, h); ctx.stroke();
      // Horizontal lines
      ctx.strokeStyle = LINED_COLOR;
      ctx.lineWidth = 0.5;
      for (let y = spacing; y <= h; y += spacing) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }
    }
  }, [bgMode]);

  const saveState = useCallback(() => {
    const ctx = getCtx();
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const stack = historyStackRef.current;
    const idx = historyIdxRef.current;
    const newStack = stack.slice(0, idx + 1);
    newStack.push(imageData);
    if (newStack.length > HISTORY_MAX) newStack.shift();
    historyStackRef.current = newStack;
    historyIdxRef.current = newStack.length - 1;
    forceRender((n) => n + 1);
  }, [getCtx]);

  const restoreState = useCallback((imageData: ImageData) => {
    const ctx = getCtx();
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;
    ctx.putImageData(imageData, 0, 0);
  }, [getCtx]);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      drawBackground(ctx, rect.width, rect.height);
    }
    saveState();
  }, [drawBackground, saveState]);

  useEffect(() => {
    if (!isOpen) return;
    const timeout = setTimeout(initCanvas, 50);
    return () => clearTimeout(timeout);
  }, [isOpen, initCanvas]);

  // Re-draw background when bgMode changes (preserve drawing content)
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = getCtx();
    if (!canvas || !ctx) return;
    const currentData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    drawBackground(ctx, canvas.width, canvas.height);
    ctx.putImageData(currentData, 0, 0);
  }, [bgMode, getCtx, drawBackground]);

  // ── Drawing Primitives ──

  const drawSmoothLine = useCallback((
    points: { x: number; y: number }[],
    color: string,
    size: number,
    isEraser: boolean,
  ) => {
    const ctx = getCtx();
    if (!ctx || points.length < 2) return;
    ctx.save();
    if (isEraser) {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = BG_DARK;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = color;
    }
    ctx.lineWidth = size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const smoothed = chaikinSmooth(points, 1);
    ctx.beginPath();
    ctx.moveTo(smoothed[0].x, smoothed[0].y);
    for (let i = 1; i < smoothed.length - 1; i++) {
      const midX = (smoothed[i].x + smoothed[i + 1].x) / 2;
      const midY = (smoothed[i].y + smoothed[i + 1].y) / 2;
      ctx.quadraticCurveTo(smoothed[i].x, smoothed[i].y, midX, midY);
    }
    const last = smoothed[smoothed.length - 1];
    ctx.lineTo(last.x, last.y);
    ctx.stroke();
    ctx.restore();
  }, [getCtx]);

  const drawDot = useCallback((
    x: number, y: number, color: string, size: number, isEraser: boolean,
  ) => {
    const ctx = getCtx();
    if (!ctx) return;
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, size / 2, 0, Math.PI * 2);
    ctx.fillStyle = isEraser ? BG_DARK : color;
    ctx.fill();
    ctx.restore();
  }, [getCtx]);

  const drawShape = useCallback((
    start: { x: number; y: number },
    end: { x: number; y: number },
    shape: 'line' | 'rect' | 'circle',
    color: string,
    size: number,
    isEraser: boolean,
  ) => {
    const ctx = getCtx();
    if (!ctx) return;
    ctx.save();
    ctx.lineWidth = size;
    ctx.strokeStyle = isEraser ? BG_DARK : color;
    ctx.globalCompositeOperation = 'source-over';
    ctx.beginPath();
    if (shape === 'line') {
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
    } else if (shape === 'rect') {
      const x = Math.min(start.x, end.x);
      const y = Math.min(start.y, end.y);
      const w = Math.abs(end.x - start.x);
      const h = Math.abs(end.y - start.y);
      ctx.strokeRect(x, y, w, h);
    } else if (shape === 'circle') {
      const cx = (start.x + end.x) / 2;
      const cy = (start.y + end.y) / 2;
      const rx = Math.abs(end.x - start.x) / 2;
      const ry = Math.abs(end.y - start.y) / 2;
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    }
    ctx.stroke();
    ctx.restore();
  }, [getCtx]);

  const drawText = useCallback((
    x: number, y: number, text: string, color: string, size: number,
  ) => {
    const ctx = getCtx();
    if (!ctx) return;
    ctx.save();
    ctx.fillStyle = color;
    ctx.font = `${Math.max(size * 6, 16)}px sans-serif`;
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillText(text, x, y);
    ctx.restore();
  }, [getCtx]);

  // ── History ──

  const handleUndo = useCallback(() => {
    if (historyIdxRef.current > 0) {
      historyIdxRef.current--;
      restoreState(historyStackRef.current[historyIdxRef.current]);
      forceRender((n) => n + 1);
    }
  }, [restoreState]);

  const handleRedo = useCallback(() => {
    const stack = historyStackRef.current;
    const idx = historyIdxRef.current;
    if (idx < stack.length - 1) {
      historyIdxRef.current++;
      restoreState(stack[historyIdxRef.current]);
      forceRender((n) => n + 1);
    }
  }, [restoreState]);

  // ── Pointer handlers ──

  const startDrawing = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const pos = getPos(e);
    if (tool === 'text') {
      setTextPos(pos);
      setShowTextModal(true);
      return;
    }
    setIsDrawing(true);
    currentActionRef.current = {
      tool, points: [pos], color: brushColor, size: brushSize,
    };
    if (tool === 'line' || tool === 'rect' || tool === 'circle') {
      setShapeStart(pos);
    } else if (tool === 'pen' || tool === 'eraser') {
      drawDot(pos.x, pos.y, brushColor, brushSize, tool === 'eraser');
    }
  }, [getPos, tool, brushColor, brushSize, drawDot]);

  const draw = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing || !currentActionRef.current) return;
    const pos = getPos(e);
    const action = currentActionRef.current;

    if (tool === 'pen' || tool === 'eraser') {
      action.points.push(pos);
      const len = action.points.length;
      if (len >= 3) {
        const segment = action.points.slice(Math.max(0, len - 4), len);
        drawSmoothLine(segment, action.color, action.size, tool === 'eraser');
      }
    } else if (shapeStart) {
      // Restore previous state and draw shape preview
      if (historyIdxRef.current >= 0) {
        restoreState(historyStackRef.current[historyIdxRef.current]);
      }
      drawShape(shapeStart, pos, tool as 'line' | 'rect' | 'circle', action.color, action.size, false);
    }
  }, [isDrawing, getPos, tool, shapeStart, drawSmoothLine, drawShape, restoreState]);

  const stopDrawing = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing || !currentActionRef.current) {
      setIsDrawing(false);
      return;
    }
    const action = currentActionRef.current;

    if ((tool === 'line' || tool === 'rect' || tool === 'circle') && shapeStart) {
      const pos = getPos(e);
      drawShape(shapeStart, pos, tool as 'line' | 'rect' | 'circle', action.color, action.size, false);
      setShapeStart(null);
    }

    setIsDrawing(false);
    currentActionRef.current = null;
    saveState();
  }, [isDrawing, tool, shapeStart, getPos, drawShape, saveState]);

  const handleTextSubmit = useCallback(() => {
    if (textInput.trim()) {
      drawText(textPos.x, textPos.y, textInput, brushColor, brushSize);
      saveState();
      showToast('Matn qo\'shildi');
    }
    setTextInput('');
    setShowTextModal(false);
  }, [textInput, textPos, brushColor, brushSize, drawText, saveState, showToast]);

  const clearCanvas = useCallback(() => {
    const ctx = getCtx();
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;
    drawBackground(ctx, canvas.width, canvas.height);
    saveState();
    setShowClearConfirm(false);
    showToast('Taxta tozalandi');
  }, [getCtx, drawBackground, saveState, showToast]);

  const downloadImage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `whiteboard-${Date.now()}.png`;
    link.click();
    showToast('Rasm saqlandi');
  }, [showToast]);

  // ── Keyboard shortcuts ──

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showTextModal) return;
      if (e.ctrlKey && e.key === 'z') { e.preventDefault(); handleUndo(); }
      if (e.ctrlKey && e.key === 'y') { e.preventDefault(); handleRedo(); }
      if (e.key === 'e') setTool('eraser');
      if (e.key === 'p') setTool('pen');
      if (e.key === 'l') setTool('line');
      if (e.key === 'r') setTool('rect');
      if (e.key === 'c' && !e.ctrlKey) setTool('circle');
      if (e.key === 't') setTool('text');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, showTextModal]);

  const canUndo = historyIdxRef.current > 0;
  const canRedo = historyIdxRef.current < historyStackRef.current.length - 1;

  const tools = [
    { id: 'pen' as const, icon: Palette, label: 'Qalam (P)' },
    { id: 'eraser' as const, icon: Eraser, label: "O'chirg'ich (E)" },
    { id: 'line' as const, icon: Minus, label: 'Chiziq (L)' },
    { id: 'rect' as const, icon: Square, label: "To'rtburchak (R)" },
    { id: 'circle' as const, icon: Circle, label: 'Doira (C)' },
    { id: 'text' as const, icon: Type, label: 'Matn (T)' },
  ];

  const bgOptions: { id: BgMode; icon: any; label: string }[] = [
    { id: 'plain', icon: RotateCcw, label: 'Oddiy' },
    { id: 'grid', icon: Grid3x3, label: 'Katak' },
    { id: 'lined', icon: AlignJustify, label: 'Chiziqli' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-950 z-50 flex flex-col"
        >
          {/* Toast */}
          <AnimatePresence>
            {toastMsg && (
              <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                className="fixed top-4 left-1/2 -translate-x-1/2 z-[70] bg-green-500/90 text-white px-5 py-2 rounded-full text-sm font-medium shadow-lg"
              >
                {toastMsg}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Header */}
          <motion.div
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="h-14 border-b border-blue-500/20 px-4 md:px-6 flex items-center justify-between bg-slate-900/50 backdrop-blur-md flex-shrink-0"
          >
            <div className="min-w-0">
              <h2 className="text-lg md:text-xl font-bold text-white truncate">Yozuv taxtasi</h2>
              <p className="text-xs text-slate-400 hidden md:block">Erkin chizing va izohlang</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 hidden md:inline">Ctrl+Z Ortga | Ctrl+Y Oldinga</span>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="p-2 hover:bg-slate-800 rounded-lg transition-all"
              >
                <X className="w-5 h-5 text-slate-400" />
              </motion.button>
            </div>
          </motion.div>

          {/* Toolbar */}
          <motion.div
            initial={{ x: -100 }}
            animate={{ x: 0 }}
            className="min-h-[3.5rem] border-b border-blue-500/20 px-2 md:px-4 py-1.5 flex items-center gap-2 md:gap-3 bg-slate-900/30 backdrop-blur-md flex-wrap"
          >
            {/* Tools */}
            <div className="flex gap-0.5">
              {tools.map((t) => {
                const Icon = t.icon;
                return (
                  <motion.button
                    key={t.id}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setTool(t.id)}
                    title={t.label}
                    className={`p-1.5 md:p-2 rounded-lg transition-all ${
                      tool === t.id
                        ? t.id === 'eraser'
                          ? 'bg-red-500/30 border border-red-400'
                          : 'bg-cyan-500/30 border border-cyan-400'
                        : 'hover:bg-slate-800 border border-transparent'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-300" />
                  </motion.button>
                );
              })}
            </div>

            <div className="w-px h-6 bg-blue-500/20" />

            {/* Brush size */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400 hidden sm:inline">O'lcham:</span>
              <input
                type="range"
                min="1"
                max="30"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-16 md:w-20 accent-cyan-500"
              />
              <span className="text-xs text-slate-400 w-5">{brushSize}</span>
            </div>

            <div className="w-px h-6 bg-blue-500/20" />

            {/* Colors */}
            {tool !== 'eraser' && (
              <div className="flex gap-1">
                {COLORS.map((color) => (
                  <motion.button
                    key={color}
                    whileHover={{ scale: 1.2 }}
                    onClick={() => setBrushColor(color)}
                    className={`w-5 h-5 md:w-6 md:h-6 rounded-full border-2 transition-all ${
                      brushColor === color ? 'border-white scale-110' : 'border-slate-700'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            )}

            <div className="w-px h-6 bg-blue-500/20" />

            {/* Background toggle */}
            <div className="flex gap-0.5">
              {bgOptions.map((opt) => {
                const Icon = opt.icon;
                return (
                  <motion.button
                    key={opt.id}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setBgMode(opt.id)}
                    title={opt.label}
                    className={`p-1.5 md:p-2 rounded-lg transition-all ${
                      bgMode === opt.id
                        ? 'bg-cyan-500/30 border border-cyan-400'
                        : 'hover:bg-slate-800 border border-transparent'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-300" />
                  </motion.button>
                );
              })}
            </div>

            {/* Actions */}
            <div className="ml-auto flex gap-0.5">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleUndo}
                disabled={!canUndo}
                className="p-1.5 md:p-2 hover:bg-slate-800 rounded-lg transition-all disabled:opacity-30"
                title="Ortga (Ctrl+Z)"
              >
                <Undo2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-400" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRedo}
                disabled={!canRedo}
                className="p-1.5 md:p-2 hover:bg-slate-800 rounded-lg transition-all disabled:opacity-30"
                title="Oldinga (Ctrl+Y)"
              >
                <Redo2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-400" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowClearConfirm(true)}
                className="p-1.5 md:p-2 hover:bg-red-800/30 rounded-lg transition-all"
                title="Hammasini tozalash"
              >
                <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-red-400" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={downloadImage}
                className="px-2 md:px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg text-xs md:text-sm font-semibold hover:shadow-lg transition-all flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span className="hidden sm:inline">Saqlash</span>
              </motion.button>
            </div>
          </motion.div>

          {/* Canvas */}
          <motion.div
            ref={containerRef}
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="flex-1 overflow-hidden p-2 md:p-3"
          >
            <canvas
              ref={canvasRef}
              onPointerDown={startDrawing}
              onPointerMove={draw}
              onPointerUp={stopDrawing}
              onPointerLeave={stopDrawing}
              onPointerCancel={stopDrawing}
              className="w-full h-full rounded-xl border border-blue-500/20 cursor-crosshair touch-none"
              style={{ touchAction: 'none' }}
            />
          </motion.div>

          {/* Clear confirmation */}
          <AnimatePresence>
            {showClearConfirm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center"
                onClick={() => setShowClearConfirm(false)}
              >
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.9 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-slate-900 border border-red-500/30 rounded-2xl p-6 w-80 mx-4"
                >
                  <h3 className="text-lg font-bold text-white mb-2">Taxtani tozalash</h3>
                  <p className="text-sm text-slate-400 mb-6">Barcha chizmalar o'chiriladi. Davom etasizmi?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowClearConfirm(false)}
                      className="flex-1 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-all"
                    >
                      Bekor qilish
                    </button>
                    <button
                      onClick={clearCanvas}
                      className="flex-1 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all"
                    >
                      Tozalash
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Text input modal */}
          <AnimatePresence>
            {showTextModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center"
                onClick={() => setShowTextModal(false)}
              >
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.9 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-slate-900 border border-blue-500/30 rounded-2xl p-6 w-80 mx-4"
                >
                  <h3 className="text-lg font-bold text-white mb-4">Matn qo'shish</h3>
                  <input
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleTextSubmit();
                      if (e.key === 'Escape') setShowTextModal(false);
                    }}
                    placeholder="Matningizni yozing..."
                    className="w-full px-4 py-3 bg-slate-800 border border-blue-500/20 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 mb-4"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowTextModal(false)}
                      className="flex-1 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-all"
                    >
                      Bekor qilish
                    </button>
                    <button
                      onClick={handleTextSubmit}
                      className="flex-1 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                    >
                      Qo'shish
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};