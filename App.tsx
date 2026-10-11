import React, { useState, useCallback } from 'react';
import { AirCanvas } from './components/AirCanvas';
import { ControlPanel } from './components/ControlPanel';
import { GestureLegend } from './components/GestureLegend';
import { GestureType, DrawingConfig } from './types';

const App: React.FC = () => {
  const [config, setConfig] = useState<DrawingConfig>({
    color: '#3b82f6',
    brushSize: 8,
  });
  
  const [currentGesture, setCurrentGesture] = useState<GestureType>(GestureType.NONE);

  const handleGestureChange = useCallback((gesture: GestureType) => {
    setCurrentGesture(gesture);
  }, []);

  return (
    <div className="relative w-screen h-screen bg-zinc-950 overflow-hidden font-sans">
      {/* Background Canvas & Camera */}
      <AirCanvas 
        config={config} 
        onGestureChange={handleGestureChange}
      />

      {/* Overlay UI */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="bg-zinc-900/30 backdrop-blur-sm border border-zinc-800/40 p-3 rounded-xl shadow-lg transition-opacity hover:opacity-100 opacity-80">
              <h1 className="text-sm font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent opacity-60">
                AirDraw
              </h1>
              <p className="text-zinc-500 text-[10px] font-medium tracking-tight opacity-40">Hand Gesture Canvas</p>
            </div>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('clear-canvas'))}
              title="Clear Canvas (Hotkey: C or Delete)"
              className="pointer-events-auto bg-zinc-900/40 hover:bg-rose-500/20 border border-zinc-800/50 hover:border-rose-500/40 text-zinc-400 hover:text-rose-300 px-3.5 py-2.5 rounded-xl text-xs font-semibold backdrop-blur-sm transition-all flex items-center gap-2 shadow-md active:scale-95"
            >
              <svg className="w-3.5 h-3.5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear Screen
            </button>
          </div>
          
          <GestureLegend currentGesture={currentGesture} />
        </div>

        <div className="flex justify-center w-full pointer-events-auto">
          <ControlPanel 
            config={config} 
            setConfig={setConfig} 
            onClear={() => window.dispatchEvent(new CustomEvent('clear-canvas'))}
            onDownload={() => window.dispatchEvent(new CustomEvent('download-canvas'))}
          />
        </div>
      </div>
    </div>
  );
};

export default App;
