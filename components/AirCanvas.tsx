
import React, { useRef, useEffect, useCallback } from 'react';
import { GestureType, DrawingConfig, Point } from '../types';

interface AirCanvasProps {
  config: DrawingConfig;
  onGestureChange: (gesture: GestureType) => void;
  onCapture: (dataUrl: string) => void;
}

// Global MediaPipe references because they are loaded via CDN
declare const Hands: any;
declare const Camera: any;

export const AirCanvas: React.FC<AirCanvasProps> = ({ config, onGestureChange, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
  const cursorCanvasRef = useRef<HTMLCanvasElement>(null);
  
  // State for drawing logic
  const isDrawing = useRef(false);
  const lastPoint = useRef<Point | null>(null);

  const clearCanvas = useCallback(() => {
    const ctx = drawingCanvasRef.current?.getContext('2d');
    if (ctx && drawingCanvasRef.current) {
      ctx.clearRect(0, 0, drawingCanvasRef.current.width, drawingCanvasRef.current.height);
    }
  }, []);

  const captureCanvas = useCallback(() => {
    if (drawingCanvasRef.current) {
      onCapture(drawingCanvasRef.current.toDataURL('image/png'));
    }
  }, [onCapture]);

  useEffect(() => {
    const handleClear = () => clearCanvas();
    const handleCapture = () => captureCanvas();
    window.addEventListener('clear-canvas', handleClear);
    window.addEventListener('request-capture', handleCapture);
    return () => {
      window.removeEventListener('clear-canvas', handleClear);
      window.removeEventListener('request-capture', handleCapture);
    };
  }, [clearCanvas, captureCanvas]);

  useEffect(() => {
    if (!videoRef.current || !canvasRef.current || !drawingCanvasRef.current || !cursorCanvasRef.current) return;

    const canvasCtx = canvasRef.current.getContext('2d');
    const drawingCtx = drawingCanvasRef.current.getContext('2d');
    const cursorCtx = cursorCanvasRef.current.getContext('2d');

    if (!canvasCtx || !drawingCtx || !cursorCtx) return;

    const onResults = (results: any) => {
      // Clear skeleton canvas and cursor canvas
      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
      cursorCtx.clearRect(0, 0, cursorCanvasRef.current!.width, cursorCanvasRef.current!.height);

      let detectedGesture = GestureType.NONE;

      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];
        
        // Landmark positions (normalized 0 to 1)
        const indexTip = landmarks[8];
        const indexPip = landmarks[6];
        const middleTip = landmarks[12];
        const middlePip = landmarks[10];
        const ringTip = landmarks[16];
        const ringPip = landmarks[14];
        const pinkyTip = landmarks[20];
        const pinkyPip = landmarks[18];

        // Finger States
        const isIndexUp = indexTip.y < indexPip.y;
        const isMiddleUp = middleTip.y < middlePip.y;
        const isRingUp = ringTip.y < ringPip.y;
        const isPinkyUp = pinkyTip.y < pinkyPip.y;

        // Map normalized coordinates to canvas size
        const x = (1 - indexTip.x) * drawingCanvasRef.current!.width;
        const y = indexTip.y * drawingCanvasRef.current!.height;

        // Gesture Recognition Logic
        if (isIndexUp && isMiddleUp && isRingUp && isPinkyUp) {
          detectedGesture = GestureType.HOVER;
          isDrawing.current = false;
          lastPoint.current = null;
        } else if (isIndexUp && isMiddleUp) {
          detectedGesture = GestureType.HOVER;
          isDrawing.current = false;
          lastPoint.current = null;
        } else if (isIndexUp && !isMiddleUp) {
          detectedGesture = GestureType.DRAW;
          isDrawing.current = true;
        } else if (!isIndexUp && !isMiddleUp && !isRingUp && !isPinkyUp) {
          detectedGesture = GestureType.ERASE;
          isDrawing.current = false;
          lastPoint.current = null;
          
          // Erase logic: clear a circle around the hand tip
          drawingCtx.globalCompositeOperation = 'destination-out';
          drawingCtx.beginPath();
          drawingCtx.arc(x, y, 40, 0, Math.PI * 2);
          drawingCtx.fill();
          drawingCtx.globalCompositeOperation = 'source-over';
        } else {
          detectedGesture = GestureType.NONE;
          isDrawing.current = false;
          lastPoint.current = null;
        }

        // Draw the cursor
        cursorCtx.beginPath();
        cursorCtx.arc(x, y, detectedGesture === GestureType.DRAW ? config.brushSize / 2 : 12, 0, Math.PI * 2);
        cursorCtx.strokeStyle = config.color;
        cursorCtx.lineWidth = 2;
        cursorCtx.stroke();
        if (detectedGesture === GestureType.DRAW) {
           cursorCtx.fillStyle = config.color;
           cursorCtx.fill();
        }

        // Drawing Logic
        if (isDrawing.current) {
          drawingCtx.lineCap = 'round';
          drawingCtx.lineJoin = 'round';
          drawingCtx.strokeStyle = config.color;
          drawingCtx.lineWidth = config.brushSize;

          if (lastPoint.current) {
            drawingCtx.beginPath();
            drawingCtx.moveTo(lastPoint.current.x, lastPoint.current.y);
            drawingCtx.lineTo(x, y);
            drawingCtx.stroke();
          }
          lastPoint.current = { x, y };
        }

        onGestureChange(detectedGesture);
      } else {
        onGestureChange(GestureType.NONE);
        isDrawing.current = false;
        lastPoint.current = null;
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

    // Set canvas sizes
    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      [canvasRef, drawingCanvasRef, cursorCanvasRef].forEach(ref => {
        if (ref.current) {
          ref.current.width = w;
          ref.current.height = h;
        }
      });
    };
    resize();
    window.addEventListener('resize', resize);

    return () => {
      camera.stop();
      window.removeEventListener('resize', resize);
    };
  }, [config.color, config.brushSize, onGestureChange]);

  return (
    <div className="relative w-full h-full bg-black">
      {/* Hidden video element for MediaPipe input */}
      <video ref={videoRef} className="hidden" playsInline muted />
      
      {/* Camera Preview - 50% opacity, mirrored */}
      <div className="absolute inset-0 z-0">
        <video 
          autoPlay 
          muted 
          playsInline 
          className="w-full h-full object-cover opacity-50 scale-x-[-1]"
          ref={(el) => { if (el) el.srcObject = videoRef.current?.srcObject || null; }}
        />
      </div>

      {/* Main Drawing Layer */}
      <canvas 
        ref={drawingCanvasRef} 
        className="absolute inset-0 z-10 w-full h-full pointer-events-none" 
      />

      {/* MediaPipe Debug / Skeleton Layer */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 z-20 w-full h-full pointer-events-none" 
      />

      {/* Visual Cursor Layer */}
      <canvas 
        ref={cursorCanvasRef} 
        className="absolute inset-0 z-30 w-full h-full pointer-events-none" 
      />
    </div>
  );
};
