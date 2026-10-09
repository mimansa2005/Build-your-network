import React, { useEffect, useState } from 'react';

interface CountdownScreenProps {
  turnNumber: number;
  onComplete: () => void;
}

const COUNTDOWN_INFO: Record<
  number,
  {
    theme: string;
    difficulty: string;
    badgeStyle: string;
    hint: string;
    progressionMsg?: string;
  }
> = {
  1: {
    theme: 'DELIVERY TRUCKS',
    difficulty: 'EASY',
    badgeStyle: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    hint: 'Connect all 4 delivery trucks in the most efficient route.',
  },
  2: {
    theme: 'DELIVERY PACKAGES',
    difficulty: 'MEDIUM',
    badgeStyle: 'bg-amber-50 text-amber-700 border-amber-200',
    hint: 'Connect all 5 packages in the most efficient route.',
    progressionMsg: 'Good start. Round 2 gets trickier.',
  },
  3: {
    theme: 'DELIVERY PARTNERS',
    difficulty: 'TOUGH',
    badgeStyle: 'bg-orange-50 text-[#FF6B00] border-orange-200',
    hint: 'Connect all 6 delivery partners in the most efficient route.',
    progressionMsg: 'Nice route. Final round. Think carefully.',
  },
};

export const CountdownScreen: React.FC<CountdownScreenProps> = ({
  turnNumber,
  onComplete,
}) => {
  const [count, setCount] = useState<number | string>(3);
  const info = COUNTDOWN_INFO[turnNumber] || COUNTDOWN_INFO[1];

  useEffect(() => {
    const t1 = setTimeout(() => setCount(2), 700);
    const t2 = setTimeout(() => setCount(1), 1400);
    const t3 = setTimeout(() => setCount('GO!'), 2100);
    const t4 = setTimeout(() => onComplete(), 2700);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  return (
    <div
      id="speedo-countdown-screen"
      className="min-h-[85vh] flex flex-col items-center justify-center px-4 select-none"
    >
      <div className="flex flex-col items-center max-w-sm text-center">
        {/* Progression message if Round 2 or 3 */}
        {info.progressionMsg && (
          <div className="mb-4 px-4 py-1.5 rounded-full bg-[#0F172A] text-white text-xs font-bold border border-orange-500/40 animate-scale-up">
            <span className="text-[#FF6B00] mr-1.5 font-black">⚡</span>
            <span>{info.progressionMsg}</span>
          </div>
        )}

        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
            ROUND {turnNumber} OF 3
          </span>
          <span
            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${info.badgeStyle}`}
          >
            {info.difficulty}
          </span>
        </div>

        {turnNumber === 1 && (
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-center p-2 mb-3">
            <img
              src="/speedo-truck-icon.png"
              alt="Speedo Express Delivery Truck"
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
        )}
        {turnNumber === 2 && (
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-center p-2 mb-3">
            <img
              src="/speedo-delivery-package.png"
              alt="Speedo Express Delivery Package"
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
        )}
        {turnNumber === 3 && (
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-center p-2 mb-3">
            <img
              src="/speedo-delivery-courier.png"
              alt="Speedo Express Delivery Partner"
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] font-heading mb-5">
          {info.theme}
        </h2>

        <div className="relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center">
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border-4 border-orange-100 border-t-[#FF6B00] animate-spin" />

          {/* Core digit */}
          <div
            key={String(count)}
            className="text-6xl sm:text-7xl font-black text-[#FF6B00] font-heading tracking-tight animate-scale-up"
          >
            {count}
          </div>
        </div>

        <span className="text-xs sm:text-sm text-slate-600 font-semibold mt-6 px-4">
          &ldquo;{info.hint}&rdquo;
        </span>
      </div>
    </div>
  );
};
