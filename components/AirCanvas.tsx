
import React, { useRef, useEffect, useCallback } from 'react';
import { GestureType, DrawingConfig, Point, Path, PathType } from '../types';

interface AirCanvasProps {
  config: DrawingConfig;
  onGestureChange: (gesture: GestureType) => void;
  onCapture: (dataUrl: string) => void;
}

// Global MediaPipe references
declare const Hands: any;
declare const Camera: any;

export const AirCanvas: React.FC<AirCanvasProps> = ({ config, onGestureChange, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
  const cursorCanvasRef = useRef<HTMLCanvasElement>(null);
  
  // History state
  const paths = useRef<Path[]>([]);
  const redoStack = useRef<Path[]>([]);
  const currentPath = useRef<Path | null>(null);
  const lastPoint = useRef<Point | null>(null);

  const drawPath = (ctx: CanvasRenderingContext2D, path: Path) => {
    if (path.points.length < 2) return;
    
    ctx.beginPath();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = path.size;

    if (path.type === PathType.ERASE) {
      ctx.globalCompositeOperation = 'destination-out';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = path.color;
    }

    ctx.moveTo(path.points[0].x, path.points[0].y);
    for (let i = 1; i < path.points.length; i++) {
      ctx.lineTo(path.points[i].x, path.points[i].y);
    }
    ctx.stroke();
    
    // Reset to default
    ctx.globalCompositeOperation = 'source-over';
  };

  const redrawAll = useCallback(() => {
    const ctx = drawingCanvasRef.current?.getContext('2d');
    if (!ctx || !drawingCanvasRef.current) return;
    
    ctx.clearRect(0, 0, drawingCanvasRef.current.width, drawingCanvasRef.current.height);
    paths.current.forEach(path => drawPath(ctx, path));
  }, []);

  const undo = useCallback(() => {
    if (paths.current.length === 0) return;
    const last = paths.current.pop();
    if (last) redoStack.current.push(last);
    redrawAll();
  }, [redrawAll]);

  const redo = useCallback(() => {
    if (redoStack.current.length === 0) return;
    const last = redoStack.current.pop();
    if (last) paths.current.push(last);
    redrawAll();
  }, [redrawAll]);

  const clearCanvas = useCallback(() => {
    paths.current = [];
    redoStack.current = [];
    redrawAll();
  }, [redrawAll]);

  const captureCanvas = useCallback(() => {
    if (drawingCanvasRef.current) {
      onCapture(drawingCanvasRef.current.toDataURL('image/png'));
    }
  }, [onCapture]);

  useEffect(() => {
    const handleClear = () => clearCanvas();
    const handleCapture = () => captureCanvas();
    const handleUndo = () => undo();
    const handleRedo = () => redo();

    window.addEventListener('clear-canvas', handleClear);
    window.addEventListener('request-capture', handleCapture);
    window.addEventListener('undo-canvas', handleUndo);
    window.addEventListener('redo-canvas', handleRedo);

    return () => {
      window.removeEventListener('clear-canvas', handleClear);
      window.removeEventListener('request-capture', handleCapture);
      window.removeEventListener('undo-canvas', handleUndo);
      window.removeEventListener('redo-canvas', handleRedo);
    };
  }, [clearCanvas, captureCanvas, undo, redo]);

  useEffect(() => {
    if (!videoRef.current || !canvasRef.current || !drawingCanvasRef.current || !cursorCanvasRef.current) return;

    const canvasCtx = canvasRef.current.getContext('2d');
    const drawingCtx = drawingCanvasRef.current.getContext('2d');
    const cursorCtx = cursorCanvasRef.current.getContext('2d');

    if (!canvasCtx || !drawingCtx || !cursorCtx) return;

    const onResults = (results: any) => {
      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
      cursorCtx.clearRect(0, 0, cursorCanvasRef.current!.width, cursorCanvasRef.current!.height);

      let detectedGesture = GestureType.NONE;

      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];
        const indexTip = landmarks[8];
        const indexPip = landmarks[6];
        const middleTip = landmarks[12];
        const middlePip = landmarks[10];
        const ringTip = landmarks[16];
        const ringPip = landmarks[14];
        const pinkyTip = landmarks[20];
        const pinkyPip = landmarks[18];

        const isIndexUp = indexTip.y < indexPip.y;
        const isMiddleUp = middleTip.y < middlePip.y;
        const isRingUp = ringTip.y < ringPip.y;
        const isPinkyUp = pinkyTip.y < pinkyPip.y;

        const x = (1 - indexTip.x) * drawingCanvasRef.current!.width;
        const y = indexTip.y * drawingCanvasRef.current!.height;

        if (isIndexUp && isMiddleUp && isRingUp && isPinkyUp) {
          detectedGesture = GestureType.HOVER;
        } else if (isIndexUp && isMiddleUp) {
          detectedGesture = GestureType.HOVER;
        } else if (isIndexUp && !isMiddleUp) {
          detectedGesture = GestureType.DRAW;
        } else if (!isIndexUp && !isMiddleUp && !isRingUp && !isPinkyUp) {
          detectedGesture = GestureType.ERASE;
        }

        // Gesture management
        if (detectedGesture === GestureType.DRAW || detectedGesture === GestureType.ERASE) {
          const type = detectedGesture === GestureType.ERASE ? PathType.ERASE : PathType.DRAW;
          
          if (!currentPath.current || currentPath.current.type !== type) {
            // Commit old path if switching types mid-gesture
            if (currentPath.current) {
              paths.current.push(currentPath.current);
            }
            currentPath.current = {
              points: [{ x, y }],
              color: config.color,
              size: type === PathType.ERASE ? 40 : config.brushSize,
              type: type
            };
            redoStack.current = [];
          } else {
            currentPath.current.points.push({ x, y });
          }

          // Immediate drawing for responsiveness
          drawingCtx.lineCap = 'round';
          drawingCtx.lineJoin = 'round';
          drawingCtx.lineWidth = currentPath.current.size;

          if (type === PathType.ERASE) {
            drawingCtx.globalCompositeOperation = 'destination-out';
          } else {
            drawingCtx.globalCompositeOperation = 'source-over';
            drawingCtx.strokeStyle = config.color;
          }

          if (lastPoint.current) {
            drawingCtx.beginPath();
            drawingCtx.moveTo(lastPoint.current.x, lastPoint.current.y);
            drawingCtx.lineTo(x, y);
            drawingCtx.stroke();
          }
          lastPoint.current = { x, y };
        } else {
          // Gesture stopped
          if (currentPath.current) {
            paths.current.push(currentPath.current);
            currentPath.current = null;
          }
          lastPoint.current = null;
        }

        // Draw the cursor
        cursorCtx.beginPath();
        cursorCtx.arc(x, y, detectedGesture === GestureType.DRAW ? config.brushSize / 2 : (detectedGesture === GestureType.ERASE ? 20 : 12), 0, Math.PI * 2);
        cursorCtx.strokeStyle = detectedGesture === GestureType.ERASE ? '#ef4444' : config.color;
        cursorCtx.lineWidth = 2;
        cursorCtx.stroke();
        if (detectedGesture === GestureType.DRAW) {
           cursorCtx.fillStyle = config.color;
           cursorCtx.fill();
        }

        onGestureChange(detectedGesture);
      } else {
        if (currentPath.current) {
          paths.current.push(currentPath.current);
          currentPath.current = null;
        }
        lastPoint.current = null;
        onGestureChange(GestureType.NONE);
      }
      canvasCtx.restore();
    };

    const hands = new Hands({
      locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7
    });

    hands.onResults(onResults);

    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        await hands.send({ image: videoRef.current! });
      },
      width: 1280,
      height: 720
    });

    camera.start();

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      [canvasRef, drawingCanvasRef, cursorCanvasRef].forEach(ref => {
        if (ref.current) {
          const temp = ref.current.getContext('2d')?.getImageData(0,0, ref.current.width, ref.current.height);
          ref.current.width = w;
          ref.current.height = h;
          if (temp && ref === drawingCanvasRef) {
            redrawAll(); // Redraw on resize
          }
        }
      });
    };
    resize();
    window.addEventListener('resize', resize);

    return () => {
      camera.stop();
      window.removeEventListener('resize', resize);
    };
  }, [config.color, config.brushSize, onGestureChange, redrawAll]);

  return (
    <div className="relative w-full h-full bg-black">
      <video ref={videoRef} className="hidden" playsInline muted />
      <div className="absolute inset-0 z-0">
        <video 
          autoPlay 
          muted 
          playsInline 
          className="w-full h-full object-cover opacity-50 scale-x-[-1]"
          ref={(el) => { if (el) el.srcObject = videoRef.current?.srcObject || null; }}
        />
      </div>
      <canvas ref={drawingCanvasRef} className="absolute inset-0 z-10 w-full h-full pointer-events-none" />
      <canvas ref={canvasRef} className="absolute inset-0 z-20 w-full h-full pointer-events-none" />
      <canvas ref={cursorCanvasRef} className="absolute inset-0 z-30 w-full h-full pointer-events-none" />
    </div>
  );
};
