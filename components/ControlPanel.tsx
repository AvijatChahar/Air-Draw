import React from 'react';
import { DrawingConfig } from '../types';

interface ControlPanelProps {
  config: DrawingConfig;
  setConfig: React.Dispatch<React.SetStateAction<DrawingConfig>>;
  onClear: () => void;
  onDownload: () => void;
}

const COLORS = [
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#ffffff', // White
  '#000000', // Black
];

export const ControlPanel: React.FC<ControlPanelProps> = ({ config, setConfig, onClear, onDownload }) => {
  const handleUndo = () => window.dispatchEvent(new CustomEvent('undo-canvas'));
  const handleRedo = () => window.dispatchEvent(new CustomEvent('redo-canvas'));

  return (
    <div className="flex flex-col md:flex-row items-center gap-6 bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 p-6 rounded-3xl shadow-2xl mb-4 w-full max-w-5xl animate-in slide-in-from-bottom-10 duration-500">
      
      {/* History Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleUndo}
          title="Undo (Ctrl+Z)"
          className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        </button>
        <button
          onClick={handleRedo}
          title="Redo (Ctrl+Y)"
          className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 10h-10a8 8 0 00-8 8v2m18-12l-6 6m6-6l-6-6" />
          </svg>
        </button>
      </div>

      <div className="h-10 w-px bg-zinc-800 hidden md:block" />

      {/* Color Picker */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Palette</label>
        <div className="flex items-center gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setConfig(prev => ({ ...prev, color: c }))}
              className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                config.color === c ? 'border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 'border-transparent'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
          <input 
            type="color" 
            value={config.color}
            onChange={(e) => setConfig(prev => ({ ...prev, color: e.target.value }))}
            className="w-8 h-8 rounded-full bg-transparent border-none cursor-pointer overflow-hidden"
          />
        </div>
      </div>

      <div className="h-10 w-px bg-zinc-800 hidden md:block" />

      {/* Brush Size */}
      <div className="flex flex-col gap-2 flex-grow min-w-[150px]">
        <div className="flex justify-between items-end">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Brush Size</label>
          <span className="text-xs text-zinc-400 font-mono">{config.brushSize}px</span>
        </div>
        <input 
          type="range"
          min="1"
          max="50"
          value={config.brushSize}
          onChange={(e) => setConfig(prev => ({ ...prev, brushSize: parseInt(e.target.value) }))}
          className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
      </div>

      <div className="h-10 w-px bg-zinc-800 hidden md:block" />

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={onClear}
          title="Clear Screen (Hotkey: C)"
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 hover:border-rose-500/50 transition-all flex items-center gap-2 active:scale-95"
        >
          <svg className="w-4 h-4 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Clear Screen
        </button>
        <button
          onClick={onDownload}
          className="px-6 py-2.5 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg active:scale-95 transition-all flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Save Image
        </button>
      </div>
    </div>
  );
};
