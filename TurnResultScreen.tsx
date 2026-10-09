import React, { useState } from 'react';
import { TurnRecord } from '../types';
import { ArrowRight, CheckCircle2, XCircle, Split, Layers, Star, AlertTriangle } from 'lucide-react';
import { formatRouteString, getPointLetter } from '../lib/gameLogic';
import { SpeedoLogo } from './SpeedoLogo';

interface TurnResultScreenProps {
  turnRecord: TurnRecord;
  isFinalTurn: boolean;
  onNext: () => void;
}

const ROUND_DETAILS: Record<
  number,
  {
    theme: string;
    difficulty: string;
    badgeStyle: string;
    iconType: 'truck' | 'package' | 'courier';
    nextButtonText: string;
  }
> = {
  1: {
    theme: 'DELIVERY TRUCKS',
    difficulty: 'EASY',
    badgeStyle: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    iconType: 'truck',
    nextButtonText: 'PROCEED TO ROUND 2 →',
  },
  2: {
    theme: 'DELIVERY PACKAGES',
    difficulty: 'MEDIUM',
    badgeStyle: 'bg-amber-50 text-amber-700 border-amber-200',
    iconType: 'package',
    nextButtonText: 'PROCEED TO FINAL ROUND →',
  },
  3: {
    theme: 'DELIVERY PARTNERS',
    difficulty: 'TOUGH',
    badgeStyle: 'bg-orange-50 text-[#FF6B00] border-orange-200',
    iconType: 'courier',
    nextButtonText: 'VIEW FINAL SCORE →',
  },
};

/**
 * Logistics icon vector for the route review cards
 */
const renderResultNodeIcon = (type: 'truck' | 'package' | 'courier', badgeColor: string) => {
  const isOrange = badgeColor.toLowerCase().includes('ff6b00');
  const primaryColor = isOrange ? '#FF6B00' : '#0F172A';

  if (type === 'truck') {
    return (
      <g>
        <image
          href="/speedo-delivery-truck.png"
          x="-24"
          y="-23"
          width="48"
          height="46"
          preserveAspectRatio="xMidYMid meet"
        />
      </g>
    );
  }

  if (type === 'package') {
    return (
      <g>
        <image
          href="/speedo-delivery-package.png"
          x="-20"
          y="-22"
          width="40"
          height="44"
          preserveAspectRatio="xMidYMid meet"
        />
      </g>
    );
  }

  // Courier partner
  return (
    <g>
      <image
        href="/speedo-delivery-courier.png"
        x="-14"
        y="-25"
        width="28"
        height="50"
        preserveAspectRatio="xMidYMid meet"
      />
    </g>
  );
};

export const TurnResultScreen: React.FC<TurnResultScreenProps> = ({
  turnRecord,
  isFinalTurn,
  onNext,
}) => {
  const [viewMode, setViewMode] = useState<'side-by-side' | 'overlay'>('side-by-side');

  const {
    turnNumber,
    points,
    playerRoute,
    optimalRoute,
    playerDistance,
    optimalDistance,
    distanceDifference,
    playerTime,
    idealTime,
    distanceEfficiency,
    roundStars,
    maxStars,
    routeCorrect,
    timeWithinLimit,
    perfectRound,
  } = turnRecord;

  const roundDetails = ROUND_DETAILS[turnNumber] || ROUND_DETAILS[1];
  const efficiencyPercent = Math.round(distanceEfficiency * 100);

  // Render a route on an SVG canvas
  const renderRouteSvg = (
    route: number[],
    lineColor: string,
    badgeColor: string,
    isDashed = false
  ) => {
    return (
      <svg viewBox="0 0 800 800" className="w-full h-full">
        {/* Draw Segments */}
        {route.map((pointId, idx) => {
          if (idx === route.length - 1) return null;
          const nextPointId = route[idx + 1];
          const p1 = points[pointId];
          const p2 = points[nextPointId];
          if (!p1 || !p2) return null;

          return (
            <line
              key={`line-${p1.id}-${p2.id}`}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke={lineColor}
              strokeWidth="6.5"
              strokeDasharray={isDashed ? '10 8' : undefined}
              strokeLinecap="round"
            />
          );
        })}

        {/* Draw Logistics Points with Step Sequence Badge and Point Letter */}
        {points.map((p) => {
          const visitedIdx = route.indexOf(p.id);
          const orderNum = visitedIdx >= 0 ? visitedIdx + 1 : '';
          const letter = getPointLetter(p.id);

          return (
            <g key={`pt-${p.id}`} transform={`translate(${p.x}, ${p.y})`}>
              <circle
                r="26"
                fill="#FFFFFF"
                stroke={badgeColor}
                strokeWidth="3"
              />
              {renderResultNodeIcon(roundDetails.iconType, badgeColor)}

              {/* Point Letter Identifier (Top Left) */}
              <g transform="translate(-16, -16)">
                <circle r="9" fill="#0F172A" stroke="#FFFFFF" strokeWidth="1.5" />
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#FFFFFF"
                  fontSize="9.5"
                  fontWeight="900"
                  fontFamily="Outfit, sans-serif"
                >
                  {letter}
                </text>
              </g>

              {/* Visited Sequence Tag (Top Right) */}
              {orderNum && (
                <g transform="translate(16, -16)">
                  <circle r="10" fill={badgeColor} stroke="#FFFFFF" strokeWidth="1.8" />
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#FFFFFF"
                    fontSize="10.5"
                    fontWeight="900"
                    fontFamily="Outfit, sans-serif"
                  >
                    {orderNum}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <div
      id="speedo-turn-result-screen"
      className="min-h-[85vh] flex flex-col items-center justify-start px-3 py-6 max-w-2xl mx-auto w-full"
    >
      {/* Turn Complete Header with Difficulty Badge */}
      <div className="text-center mb-3">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#FF6B00] bg-orange-50 px-3.5 py-1 rounded-full border border-orange-200 mb-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>ROUND {turnNumber} OF 3</span>
          <span className="text-orange-300">•</span>
          <span className={`text-[10px] px-2 py-0.2 rounded-sm border ${roundDetails.badgeStyle}`}>
            {roundDetails.difficulty}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] font-heading tracking-tight flex items-center justify-center gap-2">
          {turnNumber === 1 && (
            <img
              src="/speedo-truck-icon.png"
              alt="Speedo Express Delivery Truck"
              className="w-7 h-7 sm:w-8 sm:h-8 object-contain rounded-lg border border-orange-200/80 shadow-2xs inline-block"
              referrerPolicy="no-referrer"
            />
          )}
          <span>ROUND COMPLETE</span>
        </h1>
      </div>

      {/* Prominent Route Correctness Banner (✓ OPTIMAL ROUTE / ✕ ROUTE MISSED) */}
      <div className="mb-3.5">
        {routeCorrect ? (
          <div
            id="route-correctness-badge"
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs sm:text-sm font-black font-heading tracking-wide uppercase shadow-2xs"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
            <span>✓ OPTIMAL ROUTE</span>
          </div>
        ) : (
          <div
            id="route-correctness-badge"
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-rose-50 border border-rose-300 text-rose-800 text-xs sm:text-sm font-black font-heading tracking-wide uppercase shadow-2xs"
          >
            <XCircle className="w-4 h-4 text-rose-600 stroke-[2.5]" />
            <span>✕ ROUTE MISSED</span>
          </div>
        )}
      </div>

      {/* Prominent Star Banner (⭐ XX / XX STARS) */}
      <div className="w-full bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs text-center mb-5">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
          <span
            id="round-stars-display"
            className="text-3xl sm:text-4xl font-black text-[#0F172A] font-heading tracking-tight"
          >
            {roundStars} / {maxStars} STARS
          </span>
        </div>

        {/* Elegant Star Bar Meter */}
        <div className="max-w-md mx-auto mb-3">
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                routeCorrect
                  ? 'bg-gradient-to-r from-amber-400 to-[#FF6B00]'
                  : 'bg-gradient-to-r from-rose-400 to-amber-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, (roundStars / maxStars) * 100))}%` }}
            />
          </div>
        </div>

        {/* PROMPT SECTION 15: YOUR ROUTE vs SPEEDO EXPRESS ROUTE */}
        <div className="w-full bg-slate-50/95 rounded-xl p-3 sm:p-4 border border-slate-200/90 my-3.5 text-left">
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-slate-200/80">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 font-heading">
                YOUR ROUTE
              </span>
              <span
                id="player-route-sequence"
                className={`font-black font-heading tracking-wider text-sm sm:text-base ${
                  routeCorrect ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {formatRouteString(playerRoute)}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-0.5">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 font-heading">
                SPEEDO EXPRESS ROUTE
              </span>
              <span
                id="optimal-route-sequence"
                className="font-black text-slate-900 font-heading tracking-wider text-sm sm:text-base"
              >
                {formatRouteString(optimalRoute)}
              </span>
            </div>
          </div>
        </div>

        {/* Clear Cause Explanation for Star Award */}
        <div className="text-xs sm:text-sm font-semibold max-w-md mx-auto mb-3">
          {perfectRound ? (
            <p className="text-emerald-700 font-bold">
              🎉 <strong>PERFECT ROUND!</strong> Optimal route matched within the target time ({playerTime.toFixed(1)}s ≤ {idealTime.toFixed(1)}s). Full {maxStars}/{maxStars} stars awarded!
            </p>
          ) : routeCorrect && !timeWithinLimit ? (
            <p className="text-amber-800 font-semibold">
              ⚠️ <strong>OPTIMAL ROUTE MATCHED</strong>, but your time ({playerTime.toFixed(1)}s) exceeded the ideal target ({idealTime.toFixed(1)}s). Round score reduced to {roundStars}/{maxStars} stars.
            </p>
          ) : (
            <p className="text-rose-800 font-semibold">
              ✕ <strong>ROUTE MISSED.</strong> The point sequence was not optimal. Even with fast speed, an incorrect route cannot receive full stars ({roundStars}/{maxStars} stars).
            </p>
          )}
        </div>

        {/* Simple Route Efficiency Explanation */}
        <p className="text-[11px] sm:text-xs font-semibold text-slate-500 max-w-md mx-auto">
          Route distance efficiency: <strong className="text-slate-800">{efficiencyPercent}%</strong>
        </p>

        {/* Telemetry Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center pt-4 mt-4 border-t border-slate-100">
          <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
              Your Distance
            </span>
            <span className="text-base sm:text-lg font-black text-slate-800 font-heading">
              {playerDistance.toLocaleString()}
              <span className="text-xs font-semibold text-slate-400 ml-0.5">m</span>
            </span>
          </div>

          <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
              Optimal Distance
            </span>
            <span className="text-base sm:text-lg font-black text-[#FF6B00] font-heading">
              {optimalDistance.toLocaleString()}
              <span className="text-xs font-semibold text-slate-400 ml-0.5">m</span>
            </span>
          </div>

          <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
              Your Time
            </span>
            <span
              className={`text-base sm:text-lg font-black font-heading ${
                timeWithinLimit ? 'text-slate-800' : 'text-amber-700'
              }`}
            >
              {playerTime.toFixed(1)}
              <span className="text-xs font-semibold text-slate-400 ml-0.5">s</span>
            </span>
          </div>

          <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
              Ideal Time
            </span>
            <span className="text-base sm:text-lg font-black text-emerald-600 font-heading">
              {idealTime.toFixed(1)}
              <span className="text-xs font-semibold text-slate-400 ml-0.5">s</span>
            </span>
          </div>
        </div>

        {/* Distance Difference note */}
        <div className="mt-3 text-[11px] font-semibold text-slate-500">
          Distance Difference:{' '}
          <strong className={distanceDifference === 0 ? 'text-emerald-600' : 'text-slate-800'}>
            {distanceDifference === 0
              ? '0 m (Exact Optimal Distance)'
              : `+${distanceDifference.toLocaleString()} m`}
          </strong>
        </div>
      </div>

      {/* Visual Route Comparison (Now revealed after completion) */}
      <div className="w-full bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs mb-5">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
          <div>
            <h2 className="text-xs sm:text-sm font-extrabold text-[#0F172A] font-heading uppercase tracking-wider">
              ROUTE ANALYSIS: YOURS vs SPEEDO OPTIMAL
            </h2>
            <p className="text-[11px] text-slate-500 font-medium">
              Speedo Express engine optimal path now revealed
            </p>
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('side-by-side')}
              className={`p-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'side-by-side' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
              }`}
              title="Side by side"
            >
              <Split className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('overlay')}
              className={`p-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'overlay' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
              }`}
              title="Overlay"
            >
              <Layers className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {viewMode === 'side-by-side' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Player's Route */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 flex flex-col items-center">
              <div className="w-full flex items-center justify-between mb-2 text-xs font-bold">
                <span className="flex items-center gap-1.5 text-slate-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B00]" />
                  YOUR ROUTE
                </span>
                <span className="text-[#FF6B00]">{playerDistance.toLocaleString()} m</span>
              </div>
              <div className="w-full aspect-square bg-white rounded-lg p-2 border border-slate-200">
                {renderRouteSvg(playerRoute, '#FF6B00', '#FF6B00', false)}
              </div>
            </div>

            {/* Optimal Route */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 flex flex-col items-center">
              <div className="w-full flex items-center justify-between mb-2 text-xs font-bold">
                <span className="flex items-center gap-1.5 text-slate-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0F172A]" />
                  SPEEDO OPTIMAL
                </span>
                <span className="text-slate-700">{optimalDistance.toLocaleString()} m</span>
              </div>
              <div className="w-full aspect-square bg-white rounded-lg p-2 border border-slate-200">
                {renderRouteSvg(optimalRoute, '#0F172A', '#0F172A', true)}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-2 text-xs font-bold px-1">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-slate-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B00]" />
                  You ({playerDistance.toLocaleString()}m)
                </span>
                <span className="flex items-center gap-1 text-slate-500">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0F172A]" />
                  Optimal ({optimalDistance.toLocaleString()}m)
                </span>
              </div>
            </div>
            <div className="w-full aspect-square bg-white rounded-lg p-2 relative border border-slate-200">
              <svg viewBox="0 0 800 800" className="w-full h-full">
                {/* Engine Optimal (Dashed Dark Navy) */}
                {optimalRoute.map((pointId, idx) => {
                  if (idx === optimalRoute.length - 1) return null;
                  const p1 = points[pointId];
                  const p2 = points[optimalRoute[idx + 1]];
                  if (!p1 || !p2) return null;
                  return (
                    <line
                      key={`over-opt-${idx}`}
                      x1={p1.x}
                      y1={p1.y}
                      x2={p2.x}
                      y2={p2.y}
                      stroke="#0F172A"
                      strokeWidth="5"
                      strokeDasharray="10 8"
                      strokeLinecap="round"
                    />
                  );
                })}
                {/* Player Route (Solid Orange) */}
                {playerRoute.map((pointId, idx) => {
                  if (idx === playerRoute.length - 1) return null;
                  const p1 = points[pointId];
                  const p2 = points[playerRoute[idx + 1]];
                  if (!p1 || !p2) return null;
                  return (
                    <line
                      key={`over-plyr-${idx}`}
                      x1={p1.x}
                      y1={p1.y}
                      x2={p2.x}
                      y2={p2.y}
                      stroke="#FF6B00"
                      strokeWidth="5"
                      strokeLinecap="round"
                    />
                  );
                })}
                {/* Points */}
                {points.map((p) => (
                  <g key={`over-pt-${p.id}`} transform={`translate(${p.x}, ${p.y})`}>
                    <circle r="22" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2.5" />
                    {renderResultNodeIcon(roundDetails.iconType, '#0F172A')}
                  </g>
                ))}
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Primary CTA: NEXT ROUND / PROCEED */}
      <button
        id="btn-next-round"
        onClick={onNext}
        className="w-full h-13 bg-[#FF6B00] hover:bg-[#E55A00] active:scale-[0.98] text-white font-extrabold text-base rounded-xl shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
      >
        <span>{roundDetails.nextButtonText}</span>
        <ArrowRight className="w-5 h-5 stroke-[2.5]" />
      </button>
    </div>
  );
};
