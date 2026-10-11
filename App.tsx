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
          <div className="bg-zinc-900/30 backdrop-blur-sm border border-zinc-800/40 p-3 rounded-xl shadow-lg transition-opacity hover:opacity-100 opacity-80">
            <h1 className="text-sm font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent opacity-60">
              AirDraw
            </h1>
            <p className="text-zinc-500 text-[10px] font-medium tracking-tight opacity-40">Hand Gesture Canvas</p>
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
