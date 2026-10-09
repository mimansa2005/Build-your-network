import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { PlayerData } from '../types';
import { REWARD_THRESHOLD, TOTAL_MAX_STARS } from '../lib/gameLogic';
import { SpeedoLogo } from './SpeedoLogo';
import {
  RotateCcw,
  Trophy,
  Share2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Star,
  Award,
  Clock,
  Navigation,
} from 'lucide-react';

interface FinalResultScreenProps {
  playerData: PlayerData;
  onPlayAgain: () => void;
  onViewLeaderboard: () => void;
  syncStatus?: 'syncing' | 'synced' | 'error';
  onRetrySync?: () => void;
}

/**
 * Clean text-based round score card.
 * Communicates round score clearly using bold typography and route accuracy badges.
 */
interface RoundScoreCardProps {
  roundNumber: number;
  theme: string;
  earned: number;
  max: number;
  routeCorrect?: boolean;
  timeWithinLimit?: boolean;
  perfectRound?: boolean;
}

const RoundScoreCard: React.FC<RoundScoreCardProps> = ({
  roundNumber,
  theme,
  earned,
  max,
  routeCorrect,
  timeWithinLimit,
  perfectRound,
}) => {
  return (
    <div className="p-4 sm:p-4.5 rounded-xl bg-slate-50/90 border border-slate-200/80 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs sm:text-sm font-black text-slate-800 font-heading uppercase tracking-wider">
          ROUND {roundNumber} • {theme}
        </span>
        {perfectRound ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-300 font-heading uppercase">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            PERFECT
          </span>
        ) : routeCorrect && !timeWithinLimit ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-black text-amber-700 bg-amber-100/80 px-2.5 py-0.5 rounded-full border border-amber-300 font-heading uppercase">
            <Clock className="w-3 h-3 text-amber-600" />
            TIME OVER
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] font-black text-rose-700 bg-rose-100/80 px-2.5 py-0.5 rounded-full border border-rose-300 font-heading uppercase">
            <XCircle className="w-3 h-3 text-rose-600" />
            ROUTE MISSED
          </span>
        )}
      </div>
      <div>
        <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-widest block mb-0.5 font-heading">
          STARS
        </span>
        <div className="text-2xl sm:text-3xl font-black text-[#0F172A] font-heading tracking-tight flex items-baseline gap-1.5">
          <span>
            {earned} <span className="text-slate-400 font-bold text-xl sm:text-2xl">/ {max}</span>
          </span>
          <span className="text-xs sm:text-sm font-black text-[#FF6B00] uppercase tracking-wider font-heading">
            STARS
          </span>
        </div>
      </div>
    </div>
  );
};

export const FinalResultScreen: React.FC<FinalResultScreenProps> = ({
  playerData,
  onPlayAgain,
  onViewLeaderboard,
  syncStatus,
  onRetrySync,
}) => {
  const { turns, name } = playerData;

  // Selected round for visual route inspection (defaults to round 1)
  const [selectedRoundIdx, setSelectedRoundIdx] = useState(0);

  // Compute strict round perfection
  const perfectRound1 = Boolean(
    turns[0]?.perfectRound ?? (turns[0]?.routeCorrect && turns[0]?.timeWithinLimit)
  );
  const perfectRound2 = Boolean(
    turns[1]?.perfectRound ?? (turns[1]?.routeCorrect && turns[1]?.timeWithinLimit)
  );
  const perfectRound3 = Boolean(
    turns[2]?.perfectRound ?? (turns[2]?.routeCorrect && turns[2]?.timeWithinLimit)
  );

  const perfectRounds = [perfectRound1, perfectRound2, perfectRound3].filter(Boolean).length;
  const allRoundsPerfect = perfectRounds === 3;

  // Strict reward eligibility: ONLY if all 3 rounds are perfect
  const rewardEligible = playerData.rewardEligible ?? allRoundsPerfect;

  // Compute stars for each round
  const round1Stars = turns[0]?.roundStars ?? 0;
  const round2Stars = turns[1]?.roundStars ?? 0;
  const round3Stars = turns[2]?.roundStars ?? 0;

  // Strict 100-star rule: 100/100 is ONLY possible when all 3 rounds are perfect
  const rawTotalStars = round1Stars + round2Stars + round3Stars;
  const totalStars = allRoundsPerfect
    ? TOTAL_MAX_STARS
    : Math.min(TOTAL_MAX_STARS - 1, Math.max(0, rawTotalStars));

  // Compute aggregated distance and time metrics
  const totalPlayerDistance = turns.reduce((acc, t) => acc + (t.playerDistance || 0), 0);
  const totalOptimalDistance = turns.reduce((acc, t) => acc + (t.optimalDistance || 0), 0);
  const distanceDifference = Math.max(0, totalPlayerDistance - totalOptimalDistance);

  const totalPlayerTime =
    Math.round(turns.reduce((acc, t) => acc + (t.playerTime || t.timeTaken || 0), 0) * 10) / 10;
  const totalIdealTime =
    Math.round(turns.reduce((acc, t) => acc + (t.idealTime || 0), 0) * 10) / 10;

  // Active round data for visual comparison
  const activeTurn = turns[selectedRoundIdx] || turns[0];
  const activePoints = activeTurn?.points || [];
  const activePlayerRoute = activeTurn?.playerRoute || [];
  const activeOptimalRoute = activeTurn?.optimalRoute || [];

  // Confetti celebration if qualifying or high score
  useEffect(() => {
    try {
      if (rewardEligible) {
        confetti({
          particleCount: 110,
          spread: 80,
          origin: { y: 0.55 },
          colors: ['#FF6B00', '#F59E0B', '#10B981', '#0F172A'],
        });
      } else {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#FF6B00', '#F59E0B', '#0F172A'],
        });
      }
    } catch {
      // Graceful fallback
    }
  }, [rewardEligible]);

  const [copied, setCopied] = useState(false);
  const handleShare = async () => {
    const shareText = `🚚 I scored ${totalStars}/100 STARS in Speedo Express BUILD YOUR NETWORK! Can you match the optimal route? ⚡ #SpeedoExpress`;
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // SVG route drawer
  const renderRouteSvg = (
    route: number[],
    strokeColor: string,
    isEngine = false
  ) => {
    return (
      <svg viewBox="0 0 800 800" className="w-full h-full">
        <defs>
          <filter id={`finalShadow-${isEngine ? 'eng' : 'usr'}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.14" />
          </filter>
        </defs>

        {/* Path Lines */}
        {route.map((pointId, idx) => {
          if (idx === route.length - 1) return null;
          const nextPointId = route[idx + 1];
          const p1 = activePoints[pointId];
          const p2 = activePoints[nextPointId];
          if (!p1 || !p2) return null;

          return (
            <line
              key={`line-${idx}-${p1.id}-${p2.id}`}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke={strokeColor}
              strokeWidth={isEngine ? '5' : '6'}
              strokeDasharray={isEngine ? '10 7' : undefined}
              strokeLinecap="round"
            />
          );
        })}

        {/* Delivery Points */}
        {activePoints.map((p) => {
          const visitedIdx = route.indexOf(p.id);
          const orderNum = visitedIdx >= 0 ? visitedIdx + 1 : '';

          return (
            <g key={`pt-${p.id}`} transform={`translate(${p.x}, ${p.y})`}>
              <circle
                r="26"
                fill="#FFFFFF"
                stroke={strokeColor}
                strokeWidth="3"
                filter={`url(#finalShadow-${isEngine ? 'eng' : 'usr'})`}
              />
              <circle r="19" fill={strokeColor} />
              <text
                textAnchor="middle"
                dominantBaseline="central"
                fill="#FFFFFF"
                fontSize="15"
                fontWeight="900"
                fontFamily="Outfit, sans-serif"
              >
                {orderNum}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <div
      id="speedo-final-result-screen"
      className="w-full flex-1 flex flex-col items-center justify-start px-3.5 py-4 sm:py-6 max-w-2xl mx-auto"
    >
      {/* 1. Header */}
      <div className="flex flex-col items-center text-center mb-5">
        <SpeedoLogo size="lg" withCard={true} className="mb-2" />
        <span className="text-xs font-black tracking-widest text-slate-500 uppercase font-heading">
          BUILD YOUR NETWORK
        </span>

        <h1 className="text-3xl sm:text-4xl font-black text-[#0F172A] font-heading tracking-tight mt-1 mb-1">
          GAME COMPLETE
        </h1>

        <p className="text-sm font-medium text-slate-500 italic max-w-md">
          &ldquo;Can you deliver smarter than everyone else?&rdquo;
        </p>

        {name && (
          <div className="mt-2 text-xs font-semibold text-slate-600">
            Player: <strong className="text-slate-900">{name}</strong>
          </div>
        )}
      </div>

      {/* Cloud Sync Status Banner */}
      {syncStatus === 'syncing' && (
        <div
          id="sync-status-syncing"
          className="w-full mb-4 p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700 flex items-center justify-center gap-2"
        >
          <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin shrink-0" />
          <span className="font-semibold">Syncing score to live leaderboard...</span>
        </div>
      )}

      {syncStatus === 'synced' && (
        <div
          id="sync-status-synced"
          className="w-full mb-4 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-center gap-1.5"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="font-semibold">Score synced to live event leaderboard</span>
        </div>
      )}

      {syncStatus === 'error' && (
        <div
          id="sync-status-error"
          className="w-full mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-2xs"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-semibold">
              Score saved locally. Syncing to leaderboard was interrupted by network.
            </span>
          </div>
          {onRetrySync && (
            <button
              type="button"
              onClick={onRetrySync}
              className="px-3 py-1 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-extrabold rounded-lg text-xs transition-all cursor-pointer font-heading tracking-wider shrink-0"
            >
              RETRY SYNC
            </button>
          )}
        </div>
      )}

      {/* 2. REWARD STATUS BANNER & PERFECT ROUNDS (PROMPT SECTION 16) */}
      <div
        id="reward-status-card"
        className={`w-full rounded-2xl p-5 sm:p-6 text-center border mb-5 shadow-xs transition-all ${
          rewardEligible
            ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
            : 'bg-amber-50/80 border-amber-200 text-amber-950'
        }`}
      >
        {/* Perfect Rounds Tracker */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/90 border border-slate-200 shadow-2xs mb-3 text-xs font-black uppercase tracking-widest font-heading">
          <span className="text-slate-500">PERFECT ROUNDS:</span>
          <span
            id="perfect-rounds-counter"
            className={`font-black ${rewardEligible ? 'text-emerald-700' : 'text-[#FF6B00]'}`}
          >
            {perfectRounds} / 3
          </span>
        </div>

        <div className="flex items-center justify-center gap-2 mb-2">
          {rewardEligible ? (
            <Award className="w-6 h-6 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          )}
          <h2
            id="reward-headline"
            className="text-xl sm:text-2xl font-black font-heading tracking-tight"
          >
            {rewardEligible ? '🎉 REWARD UNLOCKED' : 'Almost there!'}
          </h2>
        </div>

        {rewardEligible ? (
          <div className="space-y-1">
            <p className="text-sm sm:text-base font-bold text-emerald-800">
              Outstanding network mastery! You completed all 3 routes perfectly within the target time limits.
            </p>
            <p className="text-xs text-emerald-700 font-medium">
              100 / 100 Stars awarded! Visit the Speedo Express desk to claim your reward.
            </p>
          </div>
        ) : (
          <div className="space-y-1.5 text-xs sm:text-sm font-medium text-amber-950">
            <p className="font-extrabold text-amber-900 text-sm sm:text-base">
              To win the reward:
            </p>
            <p className="font-bold text-amber-800">
              Get all 3 routes right within the time limit.
            </p>
            <p className="text-xs text-amber-700/90 font-medium pt-0.5">
              Speed alone is not enough — you need the RIGHT ROUTE at the RIGHT SPEED.
            </p>
          </div>
        )}
      </div>

      {/* 3. YOUR NETWORK SCORE & CLEAN SCORE BREAKDOWN */}
      <div className="w-full bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-7 shadow-xs mb-5">
        <div className="text-center pb-5 mb-5 border-b border-slate-100">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Star className="w-3.5 h-3.5 text-[#FF6B00] fill-[#FF6B00] shrink-0" />
            <span className="text-xs font-black uppercase tracking-widest text-slate-400 font-heading">
              YOUR NETWORK SCORE
            </span>
          </div>
          <div className="flex items-baseline justify-center gap-2">
            <span
              id="final-total-stars"
              className="text-5xl sm:text-6xl font-black text-[#0F172A] font-heading tracking-tight"
            >
              {totalStars} / 100
            </span>
            <span className="text-base sm:text-lg font-black text-[#FF6B00] font-heading uppercase">
              STARS
            </span>
          </div>
        </div>

        {/* Round-by-Round Clean Score Cards */}
        <div className="space-y-3 sm:space-y-3.5">
          {/* Round 1 */}
          <RoundScoreCard
            roundNumber={1}
            theme="TRUCKS"
            earned={round1Stars}
            max={20}
            routeCorrect={turns[0]?.routeCorrect}
            timeWithinLimit={turns[0]?.timeWithinLimit}
            perfectRound={perfectRound1}
          />

          {/* Round 2 */}
          <RoundScoreCard
            roundNumber={2}
            theme="PACKAGES"
            earned={round2Stars}
            max={30}
            routeCorrect={turns[1]?.routeCorrect}
            timeWithinLimit={turns[1]?.timeWithinLimit}
            perfectRound={perfectRound2}
          />

          {/* Round 3 */}
          <RoundScoreCard
            roundNumber={3}
            theme="DELIVERY PARTNERS"
            earned={round3Stars}
            max={50}
            routeCorrect={turns[2]?.routeCorrect}
            timeWithinLimit={turns[2]?.timeWithinLimit}
            perfectRound={perfectRound3}
          />

          {/* Total Network Score Card */}
          <div className="flex items-center justify-between p-4 sm:p-4.5 rounded-xl bg-orange-50/80 border border-orange-200 text-orange-950">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-[#FF6B00] fill-[#FF6B00] shrink-0" />
              <span className="text-xs sm:text-sm font-black font-heading uppercase tracking-wider text-slate-900">
                TOTAL NETWORK SCORE
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-heading text-[#FF6B00] tracking-tight">
              {totalStars} <span className="text-orange-400/80 text-lg sm:text-xl font-bold">/ 100</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. IDEAL VS PLAYER COMPARISON (PROMPT SECTION 14) */}
      <div className="w-full bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs mb-5">
        <div className="flex items-center gap-2 mb-3">
          <Navigation className="w-4 h-4 text-[#FF6B00]" />
          <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest font-heading">
            YOUR PERFORMANCE TELEMETRY
          </h3>
        </div>

        {/* Telemetry Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center mb-5">
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Total Distance
            </span>
            <span className="text-base sm:text-lg font-black text-slate-800 font-heading">
              {totalPlayerDistance.toLocaleString()}
              <span className="text-xs font-semibold text-slate-400 ml-1">m</span>
            </span>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Speedo Optimal Distance
            </span>
            <span className="text-base sm:text-lg font-black text-[#FF6B00] font-heading">
              {totalOptimalDistance.toLocaleString()}
              <span className="text-xs font-semibold text-slate-400 ml-1">m</span>
            </span>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 col-span-2 sm:col-span-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Distance Difference
            </span>
            <span className="text-base sm:text-lg font-black text-slate-800 font-heading">
              {distanceDifference === 0 ? (
                <span className="text-emerald-600">0 m (Optimal)</span>
              ) : (
                `+${distanceDifference.toLocaleString()} m`
              )}
            </span>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Your Time
            </span>
            <span className="text-base sm:text-lg font-black text-slate-800 font-heading">
              {totalPlayerTime.toFixed(1)}
              <span className="text-xs font-semibold text-slate-400 ml-1">sec</span>
            </span>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Ideal Time
            </span>
            <span className="text-base sm:text-lg font-black text-emerald-600 font-heading">
              {totalIdealTime.toFixed(1)}
              <span className="text-xs font-semibold text-slate-400 ml-1">sec</span>
            </span>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 col-span-2 sm:col-span-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Reward Benchmark
            </span>
            <span className="text-base sm:text-lg font-black text-slate-800 font-heading">
              {REWARD_THRESHOLD} ⭐
            </span>
          </div>
        </div>

        {/* Visual Route Comparison: YOUR ROUTE vs SPEEDO EXPRESS OPTIMAL ROUTE */}
        <div className="border-t border-slate-100 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <span className="text-xs font-black text-[#0F172A] font-heading uppercase tracking-wider block">
                YOUR ROUTE vs SPEEDO EXPRESS OPTIMAL ROUTE
              </span>
              <p className="text-[11px] text-slate-500 font-medium">
                Review path geometry across each round
              </p>
            </div>

            {/* Round Selector Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
              {turns.map((_, idx) => (
                <button
                  key={`tab-final-round-${idx}`}
                  onClick={() => setSelectedRoundIdx(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedRoundIdx === idx
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Round {idx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Dual Visual Route Boards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Player Route */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 flex flex-col items-center">
              <div className="w-full flex items-center justify-between mb-2 text-xs font-bold">
                <span className="flex items-center gap-1.5 text-slate-900">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B00]" />
                  YOUR ROUTE
                </span>
                <span className="text-[#FF6B00]">
                  {activeTurn?.playerDistance?.toLocaleString()} m
                </span>
              </div>
              <div className="w-full aspect-square bg-white rounded-lg p-2 relative border border-slate-200">
                {renderRouteSvg(activePlayerRoute, '#FF6B00', false)}
              </div>
              <div className="w-full text-center mt-2 text-[11px] font-semibold text-slate-500">
                Stars: <strong className="text-amber-600">{activeTurn?.roundStars} / {activeTurn?.maxStars}</strong>
              </div>
            </div>

            {/* Optimal Route */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 flex flex-col items-center">
              <div className="w-full flex items-center justify-between mb-2 text-xs font-bold">
                <span className="flex items-center gap-1.5 text-slate-900">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0F172A]" />
                  SPEEDO OPTIMAL
                </span>
                <span className="text-slate-700">
                  {activeTurn?.optimalDistance?.toLocaleString()} m
                </span>
              </div>
              <div className="w-full aspect-square bg-white rounded-lg p-2 relative border border-slate-200">
                {renderRouteSvg(activeOptimalRoute, '#0F172A', true)}
              </div>
              <div className="w-full text-center mt-2 text-[11px] font-semibold text-slate-500">
                Target Time: <strong className="text-emerald-600">{activeTurn?.idealTime?.toFixed(1)}s</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Final CTAs */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {/* Play Again */}
        <button
          id="btn-play-again"
          onClick={onPlayAgain}
          className="h-13 bg-[#FF6B00] hover:bg-[#E55A00] active:scale-[0.98] text-white font-extrabold text-base rounded-xl shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>PLAY AGAIN</span>
        </button>

        {/* View Leaderboard */}
        <button
          id="btn-view-leaderboard"
          onClick={onViewLeaderboard}
          className="h-13 bg-white hover:bg-orange-50/60 active:scale-[0.98] border-2 border-[#FF6B00] text-[#FF6B00] font-extrabold text-base rounded-xl shadow-2xs flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Trophy className="w-4 h-4" />
          <span>VIEW LEADERBOARD</span>
        </button>
      </div>

      {/* Share Score Button */}
      <button
        id="btn-share-score"
        onClick={handleShare}
        className="w-full py-2 text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
      >
        {copied ? (
          <>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-emerald-600">RESULT COPIED TO CLIPBOARD!</span>
          </>
        ) : (
          <>
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Result with Friends</span>
          </>
        )}
      </button>
    </div>
  );
};
