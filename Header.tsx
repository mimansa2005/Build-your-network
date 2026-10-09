import React from 'react';
import { Trophy } from 'lucide-react';
import driverPhoto from '../assets/images/speedo_driver_bnr_1789915194692.jpg';
import { SpeedoLogo } from './SpeedoLogo';

interface HeaderProps {
  showBanner?: boolean;
  currentTurn?: number;
  totalTurns?: number;
  currentEfficiency?: number | null;
  currentStars?: number | null;
  playerName?: string;
  onOpenLeaderboard?: () => void;
  showControls?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  showBanner = false,
  currentTurn = 1,
  totalTurns = 3,
  currentEfficiency = null,
  currentStars = null,
  playerName,
  onOpenLeaderboard,
  showControls = true,
}) => {
  return (
    <header
      id="speedo-game-header"
      className="w-full bg-[#0F172A] border-b border-slate-800 sticky top-0 z-40 shadow-xs select-none"
    >
      {/* 
        SPEEDO HERO BANNER:
        Rendered ONLY on the front page (welcome screen) as requested by the user.
        Exact reproduction of bnr1.png:
        - Left: Courier driver with logistics fleet & white Speedo Express logo
        - Divider: Crisp forward-slanted diagonal cut
        - Right: Vibrant Speedo Orange canvas with "Delivery Ki #AbTensionNhi"
      */}
      {showBanner && (
        <div className="relative w-full h-[78px] sm:h-[94px] md:h-[110px] lg:h-[124px] overflow-hidden bg-[#FF6000]">
          <div className="absolute inset-0 flex items-stretch">
            {/* Left Hero Section: Logistics fleet and courier driver */}
            <div className="relative w-[34%] sm:w-[30%] md:w-[26%] lg:w-[24%] h-full overflow-hidden shrink-0 bg-slate-900">
              <img
                src={driverPhoto}
                alt="Speedo Express Delivery Fleet"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-top filter brightness-95 contrast-105"
              />
              {/* Subtle contrast gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-transparent to-transparent pointer-events-none" />

              {/* SPEEDO EXPRESS Logo (White, exact uniform font and fixed E) */}
              <div className="absolute top-1.5 left-2 sm:top-2 sm:left-3.5 z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]">
                <svg
                  viewBox="0 0 460 230"
                  className="w-16 sm:w-20 md:w-24 lg:w-28 h-auto"
                  xmlns="http://www.w3.org/2000/svg"
                  role="img"
                  aria-label="Speedo Express"
                >
                  <g transform="skewX(-12) translate(28, 10)">
                    <text
                      x="18"
                      y="94"
                      fontFamily="'Outfit', 'Arial Black', Impact, -apple-system, sans-serif"
                      fontWeight="900"
                      fontSize="84"
                      letterSpacing="-1"
                      fill="#FFFFFF"
                    >
                      SP
                    </text>
                    <text
                      x="136"
                      y="94"
                      fontFamily="'Outfit', 'Arial Black', Impact, -apple-system, sans-serif"
                      fontWeight="900"
                      fontSize="84"
                      letterSpacing="-1"
                      fill="#FFFFFF"
                    >
                      E
                    </text>
                    <g transform="translate(242, 0) scale(-1, 1)">
                      <text
                        x="0"
                        y="94"
                        fontFamily="'Outfit', 'Arial Black', Impact, -apple-system, sans-serif"
                        fontWeight="900"
                        fontSize="84"
                        letterSpacing="-1"
                        fill="#FFFFFF"
                      >
                        E
                      </text>
                    </g>
                    <text
                      x="248"
                      y="94"
                      fontFamily="'Outfit', 'Arial Black', Impact, -apple-system, sans-serif"
                      fontWeight="900"
                      fontSize="84"
                      letterSpacing="-1"
                      fill="#FFFFFF"
                    >
                      DO
                    </text>
                    <text
                      x="20"
                      y="176"
                      fontFamily="'Outfit', 'Arial Black', Impact, -apple-system, sans-serif"
                      fontWeight="900"
                      fontSize="80"
                      letterSpacing="0.5"
                      fill="#FFFFFF"
                    >
                      EXPRESS
                    </text>
                  </g>
                </svg>
              </div>
            </div>

            {/* Sharp Diagonal Slanted Cut Divider */}
            <div className="relative -ml-4 sm:-ml-7 md:-ml-9 z-10 h-full w-8 sm:w-14 md:w-18 overflow-hidden pointer-events-none">
              <svg
                className="h-full w-full"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                fill="#FF6000"
              >
                <polygon points="100,0 100,100 0,100 45,0" />
              </svg>
            </div>

            {/* Right Slogan Area: Speedo Orange Canvas with exact typography matching bnr1.png */}
            <div className="flex-1 bg-[#FF6000] flex items-center justify-between px-4 sm:px-8 md:px-12 py-1">
              <div className="flex flex-col justify-center leading-[1.05] sm:leading-[1.1]">
                <span className="font-heading font-black text-white tracking-tight text-base sm:text-2xl md:text-3xl lg:text-4xl drop-shadow-xs">
                  Delivery Ki
                </span>
                <span className="font-heading font-black text-white tracking-tight text-xl sm:text-3xl md:text-4xl lg:text-5xl drop-shadow-sm mt-0.5">
                  #AbTensionNhi
                </span>
              </div>

              {/* Front Page Leaderboard Quick Access */}
              {onOpenLeaderboard && (
                <button
                  onClick={onOpenLeaderboard}
                  id="front-page-btn-leaderboard"
                  className="hidden sm:flex items-center gap-1.5 bg-black/30 hover:bg-black/50 active:scale-95 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border border-white/25 shadow-sm"
                >
                  <Trophy className="w-3.5 h-3.5 text-[#FFD700]" />
                  <span>Leaderboard</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 
        GAME PAGE COMPACT HEADER:
        Rendered when on the game page (turn boards, countdown, result screens).
        Zero visual clutter, sleek 48px height, maximizing playing field visibility.
      */}
      {!showBanner && showControls && (
        <div
          id="game-hud-bar"
          className="w-full bg-[#0F172A] text-white px-3 sm:px-6 h-12 sm:h-13 flex items-center justify-between text-xs sm:text-sm"
        >
          {/* Brand & Round info */}
          <div className="flex items-center gap-2.5">
            <SpeedoLogo size="xs" withCard={true} />
            <div className="h-4 w-px bg-slate-700 hidden sm:block" />
            <div className="flex items-center gap-1.5">
              <span className="bg-[#FF6B00] text-white font-black px-2 py-0.5 rounded text-[10px] sm:text-xs tracking-wider uppercase font-heading">
                ROUND
              </span>
              <span className="font-extrabold text-slate-200">
                {currentTurn} of {totalTurns}
              </span>
            </div>
          </div>

          {/* Stars & Efficiency Pill */}
          <div className="flex items-center gap-2">
            {currentStars !== null && (
              <div className="flex items-center gap-1.5 bg-slate-800/90 px-2.5 py-1 rounded-lg border border-slate-700/80">
                <span className="text-slate-400 text-[10px] sm:text-[11px] uppercase font-bold tracking-wider">
                  Stars
                </span>
                <span className="font-black text-amber-400 flex items-center gap-0.5">
                  {currentStars} <span className="text-amber-500">⭐</span>
                </span>
              </div>
            )}
            {currentEfficiency !== null && (
              <div className="hidden sm:flex items-center gap-1.5 bg-slate-800/90 px-2.5 py-1 rounded-lg border border-slate-700/80">
                <span className="text-slate-400 text-[10px] sm:text-[11px] uppercase font-bold tracking-wider">
                  Efficiency
                </span>
                <span className="font-black text-[#FF6B00]">
                  {currentEfficiency}%
                </span>
              </div>
            )}
          </div>

          {/* Player info & Leaderboard */}
          <div className="flex items-center gap-2 sm:gap-3">
            {playerName && (
              <span className="text-slate-300 font-semibold text-xs hidden md:inline truncate max-w-[130px]">
                {playerName}
              </span>
            )}
            {onOpenLeaderboard && (
              <button
                onClick={onOpenLeaderboard}
                id="header-btn-leaderboard"
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 hover:text-white px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border border-slate-700 shadow-2xs"
              >
                <Trophy className="w-3.5 h-3.5 text-[#FF6B00]" />
                <span className="hidden sm:inline">Leaderboard</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Minimal Header on non-game transitional screens (Registration / Instructions) */}
      {!showBanner && !showControls && (
        <div
          id="minimal-hud-bar"
          className="w-full bg-[#0F172A] text-white px-3 sm:px-6 h-12 flex items-center justify-between text-xs"
        >
          <SpeedoLogo size="xs" withCard={true} />
          {onOpenLeaderboard && (
            <button
              onClick={onOpenLeaderboard}
              id="header-btn-leaderboard-min"
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 hover:text-white px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border border-slate-700 shadow-2xs"
            >
              <Trophy className="w-3.5 h-3.5 text-[#FF6B00]" />
              <span className="hidden sm:inline">Leaderboard</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
};
