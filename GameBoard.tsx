import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Point, TurnRecord } from '../types';
import {
  calculateRouteDistance,
  calculateDistance,
  calculateDistanceEfficiency,
  calculateTimeEfficiency,
  calculateRoundStars,
  isRouteCorrect,
  ROUND_CONFIG,
} from '../lib/gameLogic';
import { RotateCcw, Lock, CheckCircle2, Clock, Navigation } from 'lucide-react';
import { SpeedoLogo } from './SpeedoLogo';

interface GameBoardProps {
  turnNumber: number;
  points: Point[];
  optimalRoute: number[];
  optimalDistance: number;
  idealTime: number;
  onTurnComplete: (record: TurnRecord) => void;
}

export type RoundDifficulty = 'EASY' | 'MEDIUM' | 'TOUGH';

interface RoundUiConfig {
  difficulty: RoundDifficulty;
  difficultyBadge: {
    bg: string;
    text: string;
    border: string;
    dot: string;
  };
  title: string;
  singular: string;
  instruction: string;
  iconType: 'truck' | 'package' | 'courier';
  pointCount: number;
  maxStars: number;
}

const ROUND_UI_CONFIGS: Record<number, RoundUiConfig> = {
  1: {
    difficulty: 'EASY',
    difficultyBadge: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      dot: 'bg-emerald-500',
    },
    title: 'DELIVERY TRUCKS',
    singular: 'delivery truck',
    instruction: 'Connect all 4 delivery trucks in the most efficient route.',
    iconType: 'truck',
    pointCount: 4,
    maxStars: 20,
  },
  2: {
    difficulty: 'MEDIUM',
    difficultyBadge: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      dot: 'bg-amber-500',
    },
    title: 'DELIVERY PACKAGES',
    singular: 'package',
    instruction: 'Connect all 5 packages in the most efficient route.',
    iconType: 'package',
    pointCount: 5,
    maxStars: 30,
  },
  3: {
    difficulty: 'TOUGH',
    difficultyBadge: {
      bg: 'bg-orange-50',
      text: 'text-[#FF6B00]',
      border: 'border-orange-200',
      dot: 'bg-[#FF6B00]',
    },
    title: 'DELIVERY PARTNERS',
    singular: 'delivery partner',
    instruction: 'Connect all 6 delivery partners in the most efficient route.',
    iconType: 'courier',
    pointCount: 6,
    maxStars: 50,
  },
};

/**
 * Pure SVG vectors for the 3 logistics icon types, designed to render directly
 * inside the game canvas with 100% SVG compatibility across all mobile devices.
 */
const renderLogisticsSvgIcon = (
  type: 'truck' | 'package' | 'courier',
  isVisited: boolean,
  isLastVisited: boolean = false
) => {
  const orange = '#FF6B00';
  const darkNavy = '#0F172A';
  const white = '#FFFFFF';

  if (type === 'truck') {
    // ROUND 1: Delivery Truck Icon - Using official Speedo Express 3D delivery truck with transparent background
    return (
      <g>
        <image
          href="/speedo-delivery-truck.png"
          x="-70"
          y="-67"
          width="140"
          height="134"
          preserveAspectRatio="xMidYMid meet"
          className="pointer-events-none select-none transition-all duration-200"
          style={{
            filter: isLastVisited
              ? 'drop-shadow(0 0 12px rgba(255, 107, 0, 0.6)) drop-shadow(0 4px 8px rgba(15, 23, 42, 0.2))'
              : isVisited
              ? 'drop-shadow(0 4px 10px rgba(255, 107, 0, 0.35)) drop-shadow(0 2px 4px rgba(15, 23, 42, 0.15))'
              : 'drop-shadow(0 4px 8px rgba(15, 23, 42, 0.18))',
          }}
        />
      </g>
    );
  }

  if (type === 'package') {
    // ROUND 2: Delivery Package Icon - Using official Speedo Express 3D delivery package with transparent background
    return (
      <g>
        <image
          href="/speedo-delivery-package.png"
          x="-71"
          y="-78"
          width="142"
          height="157"
          preserveAspectRatio="xMidYMid meet"
          className="pointer-events-none select-none transition-all duration-200"
          style={{
            filter: isLastVisited
              ? 'drop-shadow(0 0 14px rgba(255, 107, 0, 0.7)) drop-shadow(0 4px 8px rgba(15, 23, 42, 0.22))'
              : isVisited
              ? 'drop-shadow(0 4px 10px rgba(255, 107, 0, 0.38)) drop-shadow(0 2px 4px rgba(15, 23, 42, 0.16))'
              : 'drop-shadow(0 4px 8px rgba(15, 23, 42, 0.18))',
          }}
        />
      </g>
    );
  }

    // ROUND 3: Delivery Partner Icon - Using official Speedo Express 3D delivery courier with transparent background
    return (
      <g>
        <image
          href="/speedo-delivery-courier.png"
          x="-45"
          y="-80"
          width="90"
          height="161"
          preserveAspectRatio="xMidYMid meet"
          className="pointer-events-none select-none transition-all duration-200"
          style={{
            filter: isLastVisited
              ? 'drop-shadow(0 0 16px rgba(255, 107, 0, 0.75)) drop-shadow(0 4px 8px rgba(15, 23, 42, 0.22))'
              : isVisited
              ? 'drop-shadow(0 4px 10px rgba(255, 107, 0, 0.4)) drop-shadow(0 2px 4px rgba(15, 23, 42, 0.16))'
              : 'drop-shadow(0 4px 8px rgba(15, 23, 42, 0.18))',
          }}
        />
      </g>
    );
  };

export const GameBoard: React.FC<GameBoardProps> = ({
  turnNumber,
  points,
  optimalRoute,
  optimalDistance,
  idealTime,
  onTurnComplete,
}) => {
  const config = ROUND_UI_CONFIGS[turnNumber] || ROUND_UI_CONFIGS[1];
  const requiredCount = points.length || config.pointCount;

  // Route drawing state
  const [visited, setVisited] = useState<number[]>([]);
  const [pointerCoords, setPointerCoords] = useState<{ x: number; y: number } | null>(null);
  const [isInteracting, setIsInteracting] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(false);

  // Accurate Player Timer
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const startTimeRef = useRef<number>(Date.now());
  const timerActiveRef = useRef<boolean>(true);

  // SVG DOM reference
  const svgRef = useRef<SVGSVGElement | null>(null);
  const isLockedRef = useRef(false);
  const completedRef = useRef(false);
  const visitedRef = useRef<number[]>([]);

  // Synchronize state resets when round changes
  useEffect(() => {
    setVisited([]);
    visitedRef.current = [];
    setPointerCoords(null);
    setIsInteracting(false);
    setIsLocked(false);
    isLockedRef.current = false;
    completedRef.current = false;

    // Reset and start timer immediately when round begins
    startTimeRef.current = Date.now();
    timerActiveRef.current = true;
    setElapsedSeconds(0);

    const timer = setInterval(() => {
      if (timerActiveRef.current) {
        const secs = (Date.now() - startTimeRef.current) / 1000;
        setElapsedSeconds(Math.round(secs * 10) / 10);
      }
    }, 100);

    return () => clearInterval(timer);
  }, [turnNumber, points]);

  // Convert screen ClientX/ClientY to SVG viewBox (0-800) coordinates
  const getSvgCoordinates = useCallback((clientX: number, clientY: number) => {
    if (!svgRef.current) return null;
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const transformed = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    return { x: transformed.x, y: transformed.y };
  }, []);

  // Find point at coordinates (touch-friendly radius 65px)
  const findPointAtCoords = useCallback(
    (coords: { x: number; y: number }, threshold = 65) => {
      for (const p of points) {
        const dist = Math.hypot(p.x - coords.x, p.y - coords.y);
        if (dist <= threshold) {
          return p.id;
        }
      }
      return null;
    },
    [points]
  );

  // Complete and Lock Route
  const completeRoute = useCallback(
    (finalSequence: number[]) => {
      if (isLockedRef.current || completedRef.current) return;
      completedRef.current = true;
      setIsLocked(true);
      isLockedRef.current = true;
      setIsInteracting(false);
      setPointerCoords(null);

      // Stop timer immediately
      timerActiveRef.current = false;
      const endTime = Date.now();
      const playerTime = Math.max(
        0.5,
        Math.round(((endTime - startTimeRef.current) / 1000) * 10) / 10
      );
      setElapsedSeconds(playerTime);

      // Calculate Player Route Distance
      const playerDistance = calculateRouteDistance(points, finalSequence);
      const distanceDifference = Math.max(0, playerDistance - optimalDistance);

      // 1. Strict route correctness check (forward and reverse optimal path match, plus equal optimal distance check)
      const routeCorrect = isRouteCorrect(finalSequence, optimalRoute, points);

      // 2. Strict time limit check
      const timeWithinLimit = playerTime <= idealTime;

      // 3. Perfect round condition
      const perfectRound = routeCorrect && timeWithinLimit;

      // Calculate efficiencies
      const distanceEfficiency = calculateDistanceEfficiency(optimalDistance, playerDistance);
      const timeEfficiency = calculateTimeEfficiency(playerTime, idealTime);

      // Calculate stars using strict route accuracy + time limit scoring
      const { roundStars, maxStars } = calculateRoundStars(
        turnNumber,
        routeCorrect,
        timeWithinLimit,
        distanceEfficiency,
        timeEfficiency
      );

      const record: TurnRecord = {
        turnNumber,
        difficulty: config.difficulty,
        pointCount: points.length,
        points,
        playerRoute: finalSequence,
        optimalRoute,
        playerDistance,
        optimalDistance,
        difference: distanceDifference,
        distanceDifference,
        routeDifference: distanceDifference,
        playerTime,
        idealTime,
        distanceEfficiency,
        timeEfficiency,
        routeCorrect,
        timeWithinLimit,
        perfectRound,
        roundStars,
        maxStars,
        timeTaken: playerTime,
        efficiency: Math.round(distanceEfficiency * 100),
      };

      // Delay slightly so player sees the satisfying "ROUTE LOCKED" banner
      setTimeout(() => {
        onTurnComplete(record);
      }, 1000);
    },
    [points, turnNumber, optimalRoute, optimalDistance, idealTime, config.difficulty, onTurnComplete]
  );

  // Add node to path
  const handleConnectPoint = useCallback(
    (pointId: number) => {
      if (isLockedRef.current || completedRef.current) return;
      const current = visitedRef.current;

      // Cannot visit already visited point
      if (current.includes(pointId)) return;

      const updated = [...current, pointId];
      setVisited(updated);
      visitedRef.current = updated;

      // Check if all points for this round are connected
      if (updated.length === points.length) {
        completeRoute(updated);
      }
    },
    [completeRoute, points.length]
  );

  // Pointer Down (Mouse or Touch Start)
  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (isLockedRef.current || completedRef.current) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Graceful fallback if pointer capture is unsupported
    }

    const coords = getSvgCoordinates(e.clientX, e.clientY);
    if (!coords) return;

    const hitRadius =
      config.iconType === 'truck' ? 70 : config.iconType === 'package' ? 68 : 64;
    const hitPointId = findPointAtCoords(coords, hitRadius);
    if (hitPointId !== null) {
      if (!visitedRef.current.includes(hitPointId)) {
        handleConnectPoint(hitPointId);
      }
      setIsInteracting(true);
      setPointerCoords(coords);
    }
  };

  // Pointer Move (Mouse move or Touch drag)
  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (isLockedRef.current || completedRef.current) return;
    const coords = getSvgCoordinates(e.clientX, e.clientY);
    if (!coords) return;

    if (isInteracting && visitedRef.current.length > 0) {
      setPointerCoords(coords);

      const hitRadius =
        config.iconType === 'truck' ? 66 : config.iconType === 'package' ? 64 : 60;
      const hitPointId = findPointAtCoords(coords, hitRadius);
      if (hitPointId !== null && !visitedRef.current.includes(hitPointId)) {
        handleConnectPoint(hitPointId);
      }
    }
  };

  // Pointer Up or Cancel
  const handlePointerUp = (e?: React.PointerEvent<SVGSVGElement>) => {
    if (e && e.currentTarget && e.pointerId) {
      try {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
      } catch {
        // Ignored
      }
    }
    setIsInteracting(false);
    setPointerCoords(null);
  };

  // Reset current route to redraw
  const handleResetRoute = () => {
    if (isLocked) return;
    setVisited([]);
    visitedRef.current = [];
    setPointerCoords(null);
    setIsInteracting(false);
  };

  const lastPoint = visited.length > 0 ? points[visited[visited.length - 1]] : null;

  return (
    <div
      id="speedo-game-board-container"
      className="w-full max-w-xl mx-auto flex flex-col items-center select-none"
    >
      {/* Round Header */}
      <div className="w-full text-center mb-2.5">
        <div className="flex items-center justify-center gap-2 mb-1 flex-wrap">
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-500 font-heading">
            BUILD YOUR NETWORK
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
            ROUND {turnNumber} / 3
          </span>
          {/* Difficulty Badge */}
          <span
            id="round-difficulty-badge"
            className={`inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${config.difficultyBadge.bg} ${config.difficultyBadge.text} ${config.difficultyBadge.border}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${config.difficultyBadge.dot}`} />
            <span>{config.difficulty}</span>
          </span>
          {/* Round Maximum Stars Badge */}
          <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-black uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
            <span>⭐ MAX {config.maxStars}</span>
          </span>
        </div>

        {/* Round Theme Title */}
        <h1 className="text-lg sm:text-2xl font-black text-[#0F172A] font-heading tracking-tight flex items-center justify-center gap-2">
          {config.iconType === 'truck' && (
            <img
              src="/speedo-truck-icon.png"
              alt="Speedo Express Delivery Truck"
              className="w-7 h-7 sm:w-8 sm:h-8 object-contain rounded-lg border border-orange-200/80 shadow-2xs"
              referrerPolicy="no-referrer"
            />
          )}
          {config.iconType === 'package' && (
            <img
              src="/speedo-delivery-package.png"
              alt="Speedo Express Delivery Package"
              className="w-7 h-7 sm:w-8 sm:h-8 object-contain rounded-lg border border-orange-200/80 shadow-2xs bg-orange-50/40"
              referrerPolicy="no-referrer"
            />
          )}
          {config.iconType === 'courier' && (
            <img
              src="/speedo-delivery-courier.png"
              alt="Speedo Express Delivery Partner"
              className="w-7 h-7 sm:w-8 sm:h-8 object-contain rounded-lg border border-orange-200/80 shadow-2xs bg-orange-50/40"
              referrerPolicy="no-referrer"
            />
          )}
          <span>{config.title}</span>
        </h1>

        {/* Explicit Prompt Instruction */}
        <p className="text-xs sm:text-sm text-slate-600 font-medium">
          &ldquo;{config.instruction}&rdquo;
        </p>
      </div>

      {/* Board Controls & Status Bar */}
      <div className="w-full flex items-center justify-between px-1 mb-2.5">
        {/* Simple Live Timer */}
        <div
          id="player-timer-display"
          className="flex items-center gap-2 bg-white border border-slate-200/90 px-3 py-1.5 rounded-xl shadow-2xs"
        >
          <Clock className="w-4 h-4 text-[#FF6B00]" />
          <div className="flex flex-col">
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 leading-none">
              TIME
            </span>
            <span className="text-xs sm:text-sm font-black text-[#0F172A] font-heading leading-tight">
              {elapsedSeconds.toFixed(1)}s
            </span>
          </div>
        </div>

        {/* Connected Logistics Points Counter */}
        <div className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs">
          <span className="text-slate-500 hidden xs:inline">Connected:</span>
          <span className="text-[#FF6B00] font-black">{visited.length}</span>
          <span className="text-slate-400">/ {requiredCount}</span>
        </div>

        {/* Reset Button */}
        <button
          id="btn-reset-current-turn"
          onClick={handleResetRoute}
          disabled={visited.length === 0 || isLocked}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#FF6B00] disabled:opacity-30 disabled:pointer-events-none transition-colors bg-white border border-slate-200 px-3 py-2 rounded-xl cursor-pointer shadow-2xs"
          title="Clear current route"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Main Interactive Game Board Canvas */}
      <div className="relative w-full aspect-square max-w-[500px] mx-auto bg-white rounded-2xl border-2 border-slate-200/90 shadow-sm overflow-hidden touch-board">
        {/* Subtle Logistics Map Background: faint road lines & network grid */}
        <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(#0F172A_1.5px,transparent_1.5px)] [background-size:24px_24px] pointer-events-none" />

        {/* Board Prompt Floating Banner */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 pointer-events-none z-10">
          {isLocked ? (
            <div
              id="banner-route-locked"
              className="bg-[#0F172A] text-white px-4 py-1.5 rounded-full shadow-lg flex items-center gap-2 text-xs sm:text-sm font-bold tracking-wide border border-orange-500/40 animate-scale-up"
            >
              <Lock className="w-3.5 h-3.5 text-[#FF6B00]" />
              <span className="text-[#FF6B00]">ROUTE LOCKED</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          ) : visited.length === 0 ? (
            <div className="bg-white/95 backdrop-blur-xs text-slate-700 text-[11px] sm:text-xs font-semibold px-3.5 py-1 rounded-full border border-slate-200 shadow-2xs flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-[#FF6B00]" />
              <span>Tap or drag any {config.singular} to start</span>
            </div>
          ) : visited.length < requiredCount ? (
            <div className="bg-orange-50/95 backdrop-blur-xs text-orange-950 text-[11px] sm:text-xs font-bold px-3.5 py-1 rounded-full border border-orange-200 shadow-2xs">
              Connect to next {config.singular} ({visited.length}/{requiredCount})
            </div>
          ) : null}
        </div>

        {/* SVG Game Canvas */}
        <svg
          ref={svgRef}
          viewBox="0 0 800 800"
          className="w-full h-full cursor-crosshair touch-board no-select"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <defs>
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF8533" />
              <stop offset="100%" stopColor="#FF6B00" />
            </linearGradient>
            <filter id="nodeShadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="4" stdDeviation="5" floodOpacity="0.16" />
            </filter>
            <filter id="nodeGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#FF6B00" floodOpacity="0.4" />
            </filter>
          </defs>

          {/* Ambient logistics road network background lines */}
          <g opacity="0.07" stroke="#0F172A" strokeWidth="2" strokeDasharray="6 6" fill="none">
            <line x1="80" y1="200" x2="720" y2="200" />
            <line x1="80" y1="400" x2="720" y2="400" />
            <line x1="80" y1="600" x2="720" y2="600" />
            <line x1="200" y1="80" x2="200" y2="720" />
            <line x1="400" y1="80" x2="400" y2="720" />
            <line x1="600" y1="80" x2="600" y2="720" />
            <path d="M 120 120 Q 400 300 680 120" />
            <path d="M 120 680 Q 400 500 680 680" />
          </g>

          {/* 1. Active Rubber-Band Line */}
          {lastPoint && pointerCoords && !isLocked && (
            <line
              x1={lastPoint.x}
              y1={lastPoint.y}
              x2={pointerCoords.x}
              y2={pointerCoords.y}
              stroke="#FF6B00"
              strokeWidth="4.5"
              strokeDasharray="6 6"
              strokeLinecap="round"
              opacity="0.85"
            />
          )}

          {/* 2. Connected Route Segments */}
          {visited.map((pointId, idx) => {
            if (idx === visited.length - 1) return null;
            const nextPointId = visited[idx + 1];
            const p1 = points[pointId];
            const p2 = points[nextPointId];
            if (!p1 || !p2) return null;

            const midX = (p1.x + p2.x) / 2;
            const midY = (p1.y + p2.y) / 2;
            const distMeters = calculateDistance(p1, p2);

            return (
              <g key={`segment-${p1.id}-${p2.id}`}>
                {/* Glow outline */}
                <line
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke="#FF6B00"
                  strokeWidth="9"
                  strokeLinecap="round"
                  opacity="0.25"
                />
                {/* Solid core line */}
                <line
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke="url(#routeGradient)"
                  strokeWidth="5.5"
                  strokeLinecap="round"
                />

                {/* Segment distance badge */}
                <g transform={`translate(${midX}, ${midY})`}>
                  <rect
                    x="-32"
                    y="-12"
                    width="64"
                    height="24"
                    rx="12"
                    fill="#0F172A"
                    stroke="#FF6B00"
                    strokeWidth="1.5"
                  />
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#FFFFFF"
                    fontSize="11"
                    fontWeight="700"
                    fontFamily="Outfit, sans-serif"
                  >
                    {distMeters}m
                  </text>
                </g>
              </g>
            );
          })}

          {/* 3. Interactive Logistics Nodes */}
          {points.map((p) => {
            const visitedIndex = visited.indexOf(p.id);
            const isVisited = visitedIndex >= 0;
            const isLastVisited = lastPoint?.id === p.id;
            const isTruck = config.iconType === 'truck';
            const isPackage = config.iconType === 'package';
            const isCourier = config.iconType === 'courier';

            return (
              <g
                key={`point-${p.id}`}
                transform={`translate(${p.x}, ${p.y})`}
                className="cursor-pointer group"
                onClick={() => handleConnectPoint(p.id)}
              >
                {/* Large Invisible Hit Area */}
                <circle r={isTruck ? '65' : isPackage ? '62' : '60'} fill="transparent" />

                {/* Ground Contact Shadow */}
                {isTruck ? (
                  <ellipse
                    cx="0"
                    cy="46"
                    rx="54"
                    ry="12"
                    fill="#0F172A"
                    opacity={isVisited ? '0.30' : '0.18'}
                  />
                ) : isPackage ? (
                  <ellipse
                    cx="0"
                    cy="72"
                    rx="46"
                    ry="11"
                    fill="#0F172A"
                    opacity={isVisited ? '0.30' : '0.18'}
                  />
                ) : (
                  <ellipse
                    cx="0"
                    cy="80"
                    rx="38"
                    ry="10"
                    fill="#0F172A"
                    opacity={isVisited ? '0.30' : '0.18'}
                  />
                )}

                {/* Animated pulse halo for active connection source */}
                {isLastVisited && !isLocked && (
                  <circle
                    cx="0"
                    cy="0"
                    r={isTruck ? '56' : isPackage ? '52' : '50'}
                    fill="none"
                    stroke="#FF6B00"
                    strokeWidth="3"
                    className="animate-ping opacity-60"
                  />
                )}

                {/* Logistics Icon Vector (Truck / Package / Partner) - NO NUMBERS */}
                {renderLogisticsSvgIcon(config.iconType, isVisited, isLastVisited)}

                {/* Visited Checkmark Badge */}
                {isVisited && (
                  <g
                    transform={
                      isTruck
                        ? 'translate(44, -38)'
                        : isPackage
                        ? 'translate(42, -42)'
                        : 'translate(36, -56)'
                    }
                  >
                    <circle
                      r="12"
                      fill="#FF6B00"
                      stroke="#FFFFFF"
                      strokeWidth="2.2"
                    />
                    <path
                      d="M -4.5 -0.5 L -1 3 L 4.5 -2.5"
                      stroke="#FFFFFF"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Board Footer */}
      <div className="w-full mt-3 flex items-center justify-between text-xs text-slate-500 px-2">
        <div className="flex items-center gap-2">
          <SpeedoLogo size="xs" withCard={true} />
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider hidden sm:inline">
            Speedo Logistics Engine
          </span>
        </div>
        <div className="text-[11px] text-slate-400 font-medium">
          {visited.length === requiredCount ? 'Calculating telemetry...' : 'Touch-friendly • 0% page scroll'}
        </div>
      </div>
    </div>
  );
};
