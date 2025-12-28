
import React from 'react';
import { DrawingConfig } from '../types';

interface ControlPanelProps {
  config: DrawingConfig;
  setConfig: React.Dispatch<React.SetStateAction<DrawingConfig>>;
  isAnalyzing: boolean;
  onClear: () => void;
  onAnalyze: () => void;
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

export const ControlPanel: React.FC<ControlPanelProps> = ({ config, setConfig, isAnalyzing, onClear, onAnalyze }) => {
  return (
    <div className="flex flex-col md:flex-row items-center gap-6 bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 p-6 rounded-3xl shadow-2xl mb-4 w-full max-w-4xl animate-in slide-in-from-bottom-10 duration-500">
      
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
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          Clear Canvas
        </button>
        <button
          onClick={onAnalyze}
          disabled={isAnalyzing}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-all flex items-center gap-2 ${
            isAnalyzing 
              ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-500 text-white active:scale-95'
          }`}
        >
          {isAnalyzing ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4 text-zinc-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Thinking...
            </span>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              AI Critique
            </>
          )}
        </button>
      </div>
    </div>
  );
};
