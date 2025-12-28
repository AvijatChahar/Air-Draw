
import React from 'react';
import { GestureType } from '../types';

interface GestureLegendProps {
  currentGesture: GestureType;
}

export const GestureLegend: React.FC<GestureLegendProps> = ({ currentGesture }) => {
  const items = [
    { type: GestureType.DRAW, label: 'Draw', desc: 'Index Finger Up', icon: '☝️' },
    { type: GestureType.HOVER, label: 'Move', desc: 'Index + Middle Up', icon: '✌️' },
    { type: GestureType.ERASE, label: 'Erase', desc: 'Closed Fist', icon: '✊' },
  ];

  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => (
        <div 
          key={item.type}
          className={`flex items-center gap-4 px-4 py-2 rounded-xl border transition-all duration-300 ${
            currentGesture === item.type 
              ? 'bg-blue-500/20 border-blue-500/50 scale-105 shadow-lg' 
              : 'bg-zinc-900/40 border-zinc-800/50 opacity-60'
          }`}
        >
          <span className="text-xl">{item.icon}</span>
          <div className="flex flex-col">
            <span className={`text-xs font-bold uppercase tracking-wider ${
              currentGesture === item.type ? 'text-blue-400' : 'text-zinc-500'
            }`}>
              {item.label}
            </span>
            <span className="text-[10px] text-zinc-400 leading-none">{item.desc}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
