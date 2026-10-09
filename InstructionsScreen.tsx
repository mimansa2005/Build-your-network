import React, { useEffect, useState } from 'react';
import { ArrowRight, Hand, Sparkles, Star, Clock } from 'lucide-react';
import { SpeedoLogo } from './SpeedoLogo';

interface InstructionsScreenProps {
  onStartGame: () => void;
}

export const InstructionsScreen: React.FC<InstructionsScreenProps> = ({ onStartGame }) => {
  // Demonstration animated route progress
  const [demoStep, setDemoStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setDemoStep((prev) => (prev + 1) % 5);
    }, 1200);
    return () => clearInterval(timer);
  }, []);

  // Demo 4 points layout
  const demoNodes = [
    { x: 45, y: 35 },
    { x: 195, y: 45 },
    { x: 195, y: 170 },
    { x: 50, y: 155 },
  ];

  return (
    <div
      id="speedo-instructions-screen"
      className="min-h-[85vh] flex flex-col items-center justify-center px-4 py-8 max-w-md mx-auto text-center"
    >
      <div className="w-full bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col items-center">
        <SpeedoLogo size="md" withCard={true} className="mb-3" />

        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] font-heading mb-1.5">
          HOW TO PLAY
        </h2>
        <p className="text-sm text-slate-600 font-medium mb-4">
          &ldquo;Find the shortest route in each round. Think fast, deliver smart.&rdquo;
        </p>

        {/* 3 Progressive Rounds Preview Chips with Stars */}
        <div className="grid grid-cols-3 gap-2 w-full mb-5 text-[11px] font-bold">
          <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg p-2 flex flex-col items-center">
            <span className="text-[9px] uppercase tracking-wider text-emerald-600 font-black">R1 • EASY</span>
            <span className="font-extrabold mt-0.5 flex items-center gap-1">
              <img
                src="/speedo-truck-icon.png"
                alt="Truck"
                className="w-3.5 h-3.5 object-contain"
                referrerPolicy="no-referrer"
              />
              <span>4 Trucks</span>
            </span>
            <span className="text-[10px] text-amber-600 font-black mt-0.5">⭐ 20 Stars</span>
          </div>
          <div className="bg-amber-50 text-amber-800 border border-amber-200 rounded-lg p-2 flex flex-col items-center">
            <span className="text-[9px] uppercase tracking-wider text-amber-600 font-black">R2 • MEDIUM</span>
            <span className="font-extrabold mt-0.5">📦 5 Packages</span>
            <span className="text-[10px] text-amber-600 font-black mt-0.5">⭐ 30 Stars</span>
          </div>
          <div className="bg-orange-50 text-orange-900 border border-orange-200 rounded-lg p-2 flex flex-col items-center">
            <span className="text-[9px] uppercase tracking-wider text-[#FF6B00] font-black">R3 • TOUGH</span>
            <span className="font-extrabold mt-0.5">🏃 6 Partners</span>
            <span className="text-[10px] text-amber-600 font-black mt-0.5">⭐ 50 Stars</span>
          </div>
        </div>

        {/* Visual Animated Demonstration */}
        <div className="w-full max-w-[260px] aspect-square bg-slate-50 border border-slate-200 rounded-xl relative p-3 mb-5 shadow-inner flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(#FF6B00_1px,transparent_1px)] [background-size:16px_16px]" />

          <svg className="w-full h-full" viewBox="0 0 240 220">
            {demoStep >= 1 && (
              <line
                x1={demoNodes[0].x}
                y1={demoNodes[0].y}
                x2={demoNodes[1].x}
                y2={demoNodes[1].y}
                stroke="#FF6B00"
                strokeWidth="4"
                strokeLinecap="round"
              />
            )}
            {demoStep >= 2 && (
              <line
                x1={demoNodes[1].x}
                y1={demoNodes[1].y}
                x2={demoNodes[2].x}
                y2={demoNodes[2].y}
                stroke="#FF6B00"
                strokeWidth="4"
                strokeLinecap="round"
              />
            )}
            {demoStep >= 3 && (
              <line
                x1={demoNodes[2].x}
                y1={demoNodes[2].y}
                x2={demoNodes[3].x}
                y2={demoNodes[3].y}
                stroke="#FF6B00"
                strokeWidth="4"
                strokeLinecap="round"
              />
            )}

            {demoNodes.map((node, index) => {
              const isVisited = demoStep >= index;
              return (
                <g key={index} transform={`translate(${node.x}, ${node.y})`}>
                  {isVisited && (
                    <circle
                      r="18"
                      fill="none"
                      stroke="#FF6B00"
                      strokeWidth="2"
                      opacity="0.4"
                    />
                  )}
                  <circle
                    r="15"
                    fill={isVisited ? '#FFF7ED' : '#FFFFFF'}
                    stroke={isVisited ? '#FF6B00' : '#CBD5E1'}
                    strokeWidth="2"
                  />
                  <image
                    href="/speedo-delivery-truck.png"
                    x="-14"
                    y="-13"
                    width="28"
                    height="26"
                    preserveAspectRatio="xMidYMid meet"
                  />
                </g>
              );
            })}
          </svg>

          {/* Demonstration Hand Hint */}
          <div
            className="absolute transition-all duration-700 pointer-events-none text-slate-800"
            style={{
              left: `${demoStep === 0 ? 30 : demoStep === 1 ? 80 : demoStep === 2 ? 80 : 30}%`,
              top: `${demoStep === 0 ? 25 : demoStep === 1 ? 30 : demoStep === 2 ? 75 : 70}%`,
            }}
          >
            <div className="bg-[#0F172A] text-white p-1.5 rounded-full shadow-lg">
              <Hand className="w-4 h-4 text-[#FF6B00]" />
            </div>
          </div>

          {demoStep >= 3 && (
            <div className="absolute bottom-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              <span>OPTIMAL ROUTE!</span>
            </div>
          )}
        </div>

        {/* Prompt Section 14: Speed alone isn't enough banner */}
        <div className="w-full bg-orange-50/90 border border-orange-200 rounded-xl p-3 mb-4 text-left">
          <div className="text-[11px] font-black text-[#FF6B00] uppercase tracking-wider flex items-center gap-1.5 mb-1 font-heading">
            <span>⚡ WINNING CRITERIA</span>
          </div>
          <p className="text-xs text-[#0F172A] font-extrabold mb-1">
            &ldquo;Speed alone isn&apos;t enough. You need the RIGHT ROUTE at the RIGHT SPEED.&rdquo;
          </p>
          <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
            Matching the optimal route is required for full stars. Completing an incorrect route quickly will still result in low stars.
          </p>
        </div>

        {/* Instructions Steps */}
        <div className="w-full text-left space-y-2.5 mb-5">
          <div className="flex items-start gap-2.5 text-xs text-slate-600">
            <span className="w-5 h-5 rounded-full bg-orange-100 text-[#FF6B00] font-bold flex items-center justify-center shrink-0 text-[11px]">
              1
            </span>
            <span>
              <strong>Connect all points</strong> by tapping or dragging in the optimal sequence.
            </span>
          </div>
          <div className="flex items-start gap-2.5 text-xs text-slate-600">
            <span className="w-5 h-5 rounded-full bg-orange-100 text-[#FF6B00] font-bold flex items-center justify-center shrink-0 text-[11px]">
              2
            </span>
            <span>
              <strong>Optimal Route + Time Target</strong>: Both are required to earn full stars (20 + 30 + 50 = 100 Stars).
            </span>
          </div>
          <div className="flex items-start gap-2.5 text-xs text-slate-600">
            <span className="w-5 h-5 rounded-full bg-orange-100 text-[#FF6B00] font-bold flex items-center justify-center shrink-0 text-[11px]">
              3
            </span>
            <span>
              <strong>Unlock the Reward</strong>: Win the exclusive reward ONLY by completing all 3 rounds perfectly!
            </span>
          </div>
        </div>

        {/* Ready & Start */}
        <div className="w-full space-y-2">
          <button
            id="btn-instructions-start"
            onClick={onStartGame}
            className="w-full h-12 sm:h-13 bg-[#FF6B00] hover:bg-[#E55A00] active:scale-[0.98] text-white font-bold text-base rounded-xl shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>START GAME</span>
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};
