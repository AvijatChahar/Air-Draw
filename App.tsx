
import React, { useState, useCallback } from 'react';
import { AirCanvas } from './components/AirCanvas';
import { ControlPanel } from './components/ControlPanel';
import { GestureLegend } from './components/GestureLegend';
import { GestureType, DrawingConfig } from './types';
import { GoogleGenAI } from "@google/genai";

const App: React.FC = () => {
  const [config, setConfig] = useState<DrawingConfig>({
    color: '#3b82f6',
    brushSize: 8,
  });
  
  const [currentGesture, setCurrentGesture] = useState<GestureType>(GestureType.NONE);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);

  const handleGestureChange = useCallback((gesture: GestureType) => {
    setCurrentGesture(gesture);
  }, []);

  const analyzeDrawing = async (imageDataUrl: string) => {
    setIsAiAnalyzing(true);
    setAiFeedback(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const base64Data = imageDataUrl.split(',')[1];
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          {
            parts: [
              { text: "Look at this digital drawing created using hand gestures. What do you see? Provide a creative, one-sentence interpretation or critique." },
              { inlineData: { mimeType: "image/png", data: base64Data } }
            ]
          }
        ]
      });

      setAiFeedback(response.text || "I see infinite potential in your strokes!");
    } catch (error) {
      console.error("AI Analysis failed", error);
      setAiFeedback("The AI is shy right now. Keep drawing!");
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  return (
    <div className="relative w-screen h-screen bg-zinc-950 overflow-hidden font-sans">
      {/* Background Canvas & Camera */}
      <AirCanvas 
        config={config} 
        onGestureChange={handleGestureChange}
        onCapture={analyzeDrawing}
      />

      {/* Overlay UI */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
        <div className="flex justify-between items-start">
          <div className="bg-zinc-900/30 backdrop-blur-sm border border-zinc-800/40 p-3 rounded-xl shadow-lg transition-opacity hover:opacity-100 opacity-80">
            <h1 className="text-sm font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent opacity-60">
              AirDraw AI
            </h1>
            <p className="text-zinc-500 text-[10px] font-medium tracking-tight opacity-40">Hand Gesture Canvas</p>
          </div>
          
          <GestureLegend currentGesture={currentGesture} />
        </div>

        {aiFeedback && (
          <div className="max-w-md self-center bg-blue-500/10 border border-blue-500/30 backdrop-blur-md p-4 rounded-xl text-blue-200 animate-in fade-in slide-in-from-bottom-4">
            <p className="text-sm font-semibold mb-1 opacity-70 italic">AI Interpretation:</p>
            <p className="text-base leading-relaxed">{aiFeedback}</p>
          </div>
        )}

        <div className="flex justify-center w-full pointer-events-auto">
          <ControlPanel 
            config={config} 
            setConfig={setConfig} 
            isAnalyzing={isAiAnalyzing}
            onClear={() => window.dispatchEvent(new CustomEvent('clear-canvas'))}
            onAnalyze={() => window.dispatchEvent(new CustomEvent('request-capture'))}
          />
        </div>
      </div>
    </div>
  );
};

export default App;
