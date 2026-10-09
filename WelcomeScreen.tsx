import React from 'react';
import { SpeedoLogo } from './SpeedoLogo';
import { ArrowRight, Route, Trophy, Star, Sparkles } from 'lucide-react';

interface WelcomeScreenProps {
  onStart: () => void;
  onOpenLeaderboard?: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart, onOpenLeaderboard }) => {
  return (
    <div
      id="speedo-welcome-screen"
      className="min-h-[82vh] flex flex-col items-center justify-center px-4 py-6 max-w-xl mx-auto text-center"
    >
      {/* Brand Hero Element */}
      <div className="mb-6 flex flex-col items-center animate-fade-in">
        <SpeedoLogo size="xl" withCard={true} className="mb-1" />
      </div>

      {/* Main Title & Teaser */}
      <div className="space-y-3 mb-8">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0F172A] tracking-tight font-heading leading-tight">
          BUILD YOUR <span className="text-[#FF6B00]">NETWORK</span>
        </h1>
        <p className="text-lg sm:text-xl font-medium text-slate-600 max-w-md mx-auto">
          &ldquo;Can you deliver smarter than everyone else?&rdquo;
        </p>
      </div>

      {/* Quick Value Cards */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3 w-full max-w-md mb-8">
        <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-2xs flex flex-col items-center text-center">
          <div className="w-7 h-7 rounded-lg bg-orange-50 text-[#FF6B00] flex items-center justify-center mb-1.5">
            <Route className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-slate-800">3 Rounds</span>
          <span className="text-[10px] text-slate-500 font-medium">4, 5, & 6 points</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-2xs flex flex-col items-center text-center">
          <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-1.5">
            <Star className="w-4 h-4 fill-amber-500" />
          </div>
          <span className="text-xs font-bold text-slate-800">100 Stars</span>
          <span className="text-[10px] text-slate-500 font-medium">20 / 30 / 50 split</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-2xs flex flex-col items-center text-center">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-slate-800">Rewards</span>
          <span className="text-[10px] text-slate-500 font-medium">Optimal routing</span>
        </div>
      </div>

      {/* CTA Button */}
      <div className="w-full max-w-xs flex flex-col items-center gap-3">
        <button
          id="btn-start-game"
          onClick={onStart}
          className="w-full h-13 sm:h-14 bg-[#FF6B00] hover:bg-[#E55A00] active:scale-[0.98] text-white font-bold text-base sm:text-lg rounded-xl shadow-md shadow-orange-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <span>START GAME</span>
          <ArrowRight className="w-5 h-5 stroke-[2.5]" />
        </button>

        {onOpenLeaderboard && (
          <button
            type="button"
            onClick={onOpenLeaderboard}
            id="welcome-btn-leaderboard"
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#FF6B00] transition-colors cursor-pointer py-1"
          >
            <Trophy className="w-3.5 h-3.5 text-[#FF6B00]" />
            <span>View Leaderboard</span>
          </button>
        )}

        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
          3 rounds &bull; Progressive logistics &bull; 100 Stars Challenge
        </p>
      </div>
    </div>
  );
};
