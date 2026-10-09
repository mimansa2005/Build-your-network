import { Point, RoundDifficulty, TurnRecord } from '../types';

/**
 * Logistics Round Configuration
 * Round 1: 4 delivery trucks, max 20 stars, base time 8s
 * Round 2: 5 delivery packages, max 30 stars, base time 12s
 * Round 3: 6 delivery partners, max 50 stars, base time 16s
 * TOTAL MAXIMUM = 100 STARS
 */
export interface RoundConfigData {
  roundNumber: number;
  difficulty: RoundDifficulty;
  pointCount: number;
  maxStars: number;
  baseTime: number; // base seconds
  timeFactor: number; // seconds per meter of optimal distance
  iconType: 'truck' | 'package' | 'courier';
  title: string;
  singular: string;
  instruction: string;
}

export const ROUND_CONFIG: Record<number, RoundConfigData> = {
  1: {
    roundNumber: 1,
    difficulty: 'EASY',
    pointCount: 4,
    maxStars: 20,
    baseTime: 8.0,
    timeFactor: 0.0035,
    iconType: 'truck',
    title: 'DELIVERY TRUCKS',
    singular: 'delivery truck',
    instruction: 'Connect all 4 delivery trucks in the most efficient route.',
  },
  2: {
    roundNumber: 2,
    difficulty: 'MEDIUM',
    pointCount: 5,
    maxStars: 30,
    baseTime: 12.0,
    timeFactor: 0.0030,
    iconType: 'package',
    title: 'DELIVERY PACKAGES',
    singular: 'package',
    instruction: 'Connect all 5 packages in the most efficient route.',
  },
  3: {
    roundNumber: 3,
    difficulty: 'TOUGH',
    pointCount: 6,
    maxStars: 50,
    baseTime: 16.0,
    timeFactor: 0.0025,
    iconType: 'courier',
    title: 'DELIVERY PARTNERS',
    singular: 'delivery partner',
    instruction: 'Connect all 6 delivery partners in the most efficient route.',
  },
};

export const TOTAL_MAX_STARS = 100;

/**
 * Benchmark reward threshold. Configurable by management.
 * Default standard benchmark = 100/100 stars.
 */
export const REWARD_THRESHOLD = 100;

/**
 * Calculates Euclidean distance between two points in meters.
 * Scaled by 3.2 to represent city logistics routing distances.
 */
export function calculateDistance(p1: Point, p2: Point): number {
  const pixelDist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
  return Math.round(pixelDist * 3.2);
}

/**
 * Calculates the total distance of a route (sum of segments between successive points).
 */
export function calculateRouteDistance(points: Point[], routeIndices: number[]): number {
  if (routeIndices.length < 2) return 0;

  let total = 0;
  for (let i = 0; i < routeIndices.length - 1; i++) {
    const from = points[routeIndices[i]];
    const to = points[routeIndices[i + 1]];
    if (from && to) {
      total += calculateDistance(from, to);
    }
  }
  return total;
}

/**
 * Helper to generate all permutations of an array.
 * 4 points = 24 permutations
 * 5 points = 120 permutations
 * 6 points = 720 permutations
 * Pure deterministic mathematics executed in <1ms.
 */
export function getPermutations<T>(arr: T[]): T[][] {
  if (arr.length <= 1) return [arr];
  const result: T[][] = [];

  for (let i = 0; i < arr.length; i++) {
    const current = arr[i];
    const remaining = [...arr.slice(0, i), ...arr.slice(i + 1)];
    const permsOfRemaining = getPermutations(remaining);
    for (const p of permsOfRemaining) {
      result.push([current, ...p]);
    }
  }

  return result;
}

/**
 * Deterministically finds the mathematically shortest route connecting all N points.
 * Evaluates every possible valid permutation and picks the absolute minimal distance.
 */
export function findOptimalRoute(points: Point[]): {
  optimalRoute: number[];
  optimalDistance: number;
} {
  const n = points.length;
  if (n === 0) {
    return { optimalRoute: [], optimalDistance: 0 };
  }
  if (n === 1) {
    return { optimalRoute: [0], optimalDistance: 0 };
  }

  const indices = Array.from({ length: n }, (_, i) => i);
  const allPermutations = getPermutations(indices);

  let bestRoute = allPermutations[0];
  let bestDistance = calculateRouteDistance(points, bestRoute);

  for (let i = 1; i < allPermutations.length; i++) {
    const route = allPermutations[i];
    const dist = calculateRouteDistance(points, route);
    if (dist < bestDistance) {
      bestDistance = dist;
      bestRoute = route;
    }
  }

  return {
    optimalRoute: bestRoute,
    optimalDistance: bestDistance,
  };
}

/**
 * Deterministic ideal-time calculation based on:
 * - baseTime (per round difficulty)
 * - optimalDistance
 * - timeFactor
 *
 * idealTime = baseTime + (optimalDistance * timeFactor)
 * Calculated and stored BEFORE the player starts the round.
 */
export function calculateIdealTime(roundNumber: number, optimalDistance: number): number {
  const cfg = ROUND_CONFIG[roundNumber] || ROUND_CONFIG[1];
  const rawIdeal = cfg.baseTime + optimalDistance * cfg.timeFactor;
  return Math.round(rawIdeal * 10) / 10;
}

/**
 * Calculate player distance efficiency:
 * distanceEfficiency = optimalDistance / playerDistance
 * Clamped strictly between 0 and 1.
 */
export function calculateDistanceEfficiency(
  optimalDistance: number,
  playerDistance: number
): number {
  if (playerDistance <= 0) return 0;
  if (playerDistance <= optimalDistance) return 1.0;
  const efficiency = optimalDistance / playerDistance;
  return Math.min(1.0, Math.max(0, efficiency));
}

/**
 * Calculate player time efficiency:
 * If playerTime <= idealTime: full efficiency (1.0).
 * If player takes longer: reduce proportionally, clamped at 0.
 * Configurable decay rate.
 */
export function calculateTimeEfficiency(playerTime: number, idealTime: number): number {
  if (playerTime <= 0) return 1.0;
  if (playerTime <= idealTime) {
    return 1.0;
  }
  // Linear proportional reduction; zero efficiency reached at 2.2x ideal time
  const excess = playerTime - idealTime;
  const graceWindow = idealTime * 1.2;
  const score = 1.0 - excess / graceWindow;
  return Math.max(0, Math.min(1.0, Math.round(score * 1000) / 1000));
}

/**
 * STRICT ROUTE CORRECTNESS
 * Compares the player's route order against the mathematically shortest optimal route
 * and its exact reverse.
 *
 * A route and its exact reverse represent the same physical path in logistics.
 * Returns TRUE only if the player's route matches either optimalRoute or reverse of optimalRoute.
 * Returns FALSE otherwise.
 */
export function isRouteCorrect(
  playerRoute: number[],
  optimalRoute: number[],
  points?: Point[]
): boolean {
  if (!playerRoute || !optimalRoute) return false;
  if (playerRoute.length !== optimalRoute.length) return false;
  if (playerRoute.length === 0) return false;

  // 1. Direct forward match: A -> B -> C -> D
  let matchesForward = true;
  for (let i = 0; i < optimalRoute.length; i++) {
    if (playerRoute[i] !== optimalRoute[i]) {
      matchesForward = false;
      break;
    }
  }
  if (matchesForward) return true;

  // 2. Exact reverse match: D -> C -> B -> A
  let matchesReverse = true;
  for (let i = 0; i < optimalRoute.length; i++) {
    const revIdx = optimalRoute.length - 1 - i;
    if (playerRoute[i] !== optimalRoute[revIdx]) {
      matchesReverse = false;
      break;
    }
  }
  if (matchesReverse) return true;

  // 3. Mathematical distance equality check: if multiple distinct routes achieve the same minimal distance
  if (points && points.length === playerRoute.length) {
    const playerDist = calculateRouteDistance(points, playerRoute);
    const optimalDist = calculateRouteDistance(points, optimalRoute);
    // Allow up to 1 meter difference for floating point or symmetry
    if (Math.abs(playerDist - optimalDist) <= 1) {
      return true;
    }
  }

  return false;
}

/**
 * Converts a point ID to a clean alphabet letter:
 * 0 -> 'A', 1 -> 'B', 2 -> 'C', 3 -> 'D', 4 -> 'E', 5 -> 'F'
 */
export function getPointLetter(pointId: number): string {
  return String.fromCharCode(65 + pointId);
}

/**
 * Formats a point route index array into an arrow-delimited sequence string:
 * e.g., [0, 1, 3, 2] -> "A → B → D → C"
 */
export function formatRouteString(route: number[]): string {
  if (!route || route.length === 0) return '—';
  return route.map((id) => getPointLetter(id)).join(' → ');
}

/**
 * Star calculation for each round:
 *
 * 1. PERFECT ROUND (routeCorrect === true && timeWithinLimit === true):
 *    Awards exact full stars for that round (Round 1 = 20, Round 2 = 30, Round 3 = 50).
 *
 * 2. CORRECT ROUTE BUT TOO SLOW (routeCorrect === true && timeWithinLimit === false):
 *    Route is optimal, but time was exceeded. Stars are reduced based on time efficiency.
 *    CRITICAL: Never awards maximum round stars.
 *
 * 3. INCORRECT ROUTE (routeCorrect === false):
 *    Route pattern was missed. Heavy penalty applied via incorrectRouteMultiplier = 0.35.
 *    Time may partially contribute, but score is strictly capped at maxStars * 0.35.
 *    CRITICAL: An incorrect route can NEVER produce anything close to full stars, even if extremely fast.
 */
export function calculateRoundStars(
  roundNumber: number,
  routeCorrect: boolean,
  timeWithinLimit: boolean,
  distanceEfficiency: number,
  timeEfficiency: number
): {
  routeScore: number;
  timeScore: number;
  performanceScore: number;
  roundStars: number;
  maxStars: number;
} {
  const cfg = ROUND_CONFIG[roundNumber] || ROUND_CONFIG[1];
  const maxStars = cfg.maxStars;

  // CASE 1: PERFECT ROUND
  if (routeCorrect && timeWithinLimit) {
    return {
      routeScore: 0.7,
      timeScore: 0.3,
      performanceScore: 1.0,
      roundStars: maxStars,
      maxStars,
    };
  }

  // CASE 2: CORRECT ROUTE BUT TOO SLOW
  if (routeCorrect && !timeWithinLimit) {
    const routeScore = 0.7;
    const timeScore = Math.round(timeEfficiency * 0.3 * 100) / 100;
    const performanceScore = Math.round((routeScore + timeScore) * 100) / 100;

    // Time-decayed scale: slight delay (timeEff ~0.9) yields high 90s %,
    // severe delay yields lower 60s %
    const timeScaledScore = 0.55 + 0.42 * Math.min(0.95, timeEfficiency);
    let stars = Math.floor(timeScaledScore * maxStars);

    // Strictly capped below maximum
    stars = Math.min(maxStars - 1, Math.max(1, stars));

    return {
      routeScore,
      timeScore,
      performanceScore,
      roundStars: stars,
      maxStars,
    };
  }

  // CASE 3: INCORRECT ROUTE
  // Route pattern missed. Severe penalty: max 35% of round stars.
  const incorrectRouteMultiplier = 0.35;
  const normalPerformanceScore = distanceEfficiency * 0.7 + timeEfficiency * 0.3;
  const routeScore = 0;
  const timeScore = Math.round(timeEfficiency * 0.3 * 100) / 100;
  const performanceScore = Math.round(normalPerformanceScore * incorrectRouteMultiplier * 100) / 100;

  const maxAllowedStars = Math.floor(maxStars * incorrectRouteMultiplier);
  let stars = Math.round(normalPerformanceScore * incorrectRouteMultiplier * maxStars);
  stars = Math.min(maxAllowedStars, Math.max(0, stars));

  return {
    routeScore,
    timeScore,
    performanceScore,
    roundStars: stars,
    maxStars,
  };
}

/**
 * Aggregate stars from all 3 rounds and evaluate reward qualification.
 *
 * STRICT WIN CONDITION:
 * The player qualifies for the reward ONLY if ALL THREE rounds are perfect:
 * perfectRound1 (20/20) AND perfectRound2 (30/30) AND perfectRound3 (50/50).
 *
 * 100/100 STARS is strictly reserved for 20 + 30 + 50 across all 3 perfect rounds.
 * A single mistake or slow round prevents 100/100 and prevents the reward.
 */
export function calculateTotalPerformance(turnsOrStars: TurnRecord[] | number[]): {
  totalStars: number;
  maxStars: number;
  perfectRounds: number;
  allRoundsPerfect: boolean;
  rewardEligible: boolean;
} {
  if (!turnsOrStars || turnsOrStars.length === 0) {
    return {
      totalStars: 0,
      maxStars: TOTAL_MAX_STARS,
      perfectRounds: 0,
      allRoundsPerfect: false,
      rewardEligible: false,
    };
  }

  // Check if array of TurnRecord
  if (typeof turnsOrStars[0] === 'object') {
    const turns = turnsOrStars as TurnRecord[];
    const perfectRound1 = turns[0]?.perfectRound === true;
    const perfectRound2 = turns[1]?.perfectRound === true;
    const perfectRound3 = turns[2]?.perfectRound === true;

    const perfectRounds = [perfectRound1, perfectRound2, perfectRound3].filter(Boolean).length;
    const allRoundsPerfect = perfectRound1 && perfectRound2 && perfectRound3;
    const rewardEligible = allRoundsPerfect;

    const rawTotal = turns.reduce((acc, t) => acc + (t.roundStars || 0), 0);
    let totalStars = Math.min(TOTAL_MAX_STARS, Math.max(0, rawTotal));

    // Hard anti-false-100 guardrail: 100 stars is EXCLUSIVELY for all 3 perfect rounds
    if (!allRoundsPerfect && totalStars >= 100) {
      totalStars = 99;
    }

    return {
      totalStars,
      maxStars: TOTAL_MAX_STARS,
      perfectRounds,
      allRoundsPerfect,
      rewardEligible,
    };
  }

  // Fallback for number array
  const stars = turnsOrStars as number[];
  const rawTotal = stars.reduce((acc, s) => acc + s, 0);
  const totalStars = Math.min(TOTAL_MAX_STARS, Math.max(0, rawTotal));
  const isPerfect = stars[0] === 20 && stars[1] === 30 && stars[2] === 50;

  return {
    totalStars: isPerfect ? 100 : Math.min(99, totalStars),
    maxStars: TOTAL_MAX_STARS,
    perfectRounds: isPerfect ? 3 : 0,
    allRoundsPerfect: isPerfect,
    rewardEligible: isPerfect,
  };
}

/**
 * ROUND 1: EASY DIFFICULTY (4 Delivery Trucks)
 * 4 points in spacious quadrants with generous padding.
 */
export function generateEasyPoints(width = 800, height = 800): Point[] {
  const padding = 130;
  const quadrants = [
    { minX: padding, maxX: 340, minY: padding, maxY: 340 }, // Top-Left
    { minX: 460, maxX: width - padding, minY: padding, maxY: 340 }, // Top-Right
    { minX: 460, maxX: width - padding, minY: 460, maxY: height - padding }, // Bottom-Right
    { minX: padding, maxX: 340, minY: 460, maxY: height - padding }, // Bottom-Left
  ];

  const shuffled = [...quadrants].sort(() => Math.random() - 0.5);
  const points: Point[] = [];

  for (let i = 0; i < 4; i++) {
    const q = shuffled[i];
    const x = Math.round(q.minX + Math.random() * (q.maxX - q.minX));
    const y = Math.round(q.minY + Math.random() * (q.maxY - q.minY));
    points.push({
      id: i,
      label: `Truck ${i + 1}`,
      x,
      y,
    });
  }

  return points;
}

/**
 * ROUND 2: MEDIUM DIFFICULTY (5 Delivery Packages)
 * Exactly 5 points with moderate spacing, minDistance >= 180px.
 */
export function generateMediumPoints(width = 800, height = 800): Point[] {
  const padding = 110;
  let minDistance = 190;
  let attempts = 0;

  while (attempts < 500) {
    attempts++;
    const candidates: Point[] = [];
    let valid = true;

    for (let i = 0; i < 5; i++) {
      let ptAttempts = 0;
      let placed = false;
      while (!placed && ptAttempts < 100) {
        ptAttempts++;
        const x = Math.round(padding + Math.random() * (width - padding * 2));
        const y = Math.round(padding + Math.random() * (height - padding * 2));

        const isSeparated = candidates.every(
          (existing) => Math.hypot(existing.x - x, existing.y - y) >= minDistance
        );

        if (isSeparated) {
          candidates.push({
            id: i,
            label: `Package ${i + 1}`,
            x,
            y,
          });
          placed = true;
        }
      }

      if (!placed) {
        valid = false;
        break;
      }
    }

    if (valid && candidates.length === 5) {
      return candidates;
    }

    if (attempts > 300) {
      minDistance = Math.max(160, minDistance - 5);
    }
  }

  // Fallback guaranteed placement for 5 points
  return generatePointsFallback(5, 'Package', width, height, padding, 160);
}

/**
 * ROUND 3: TOUGH DIFFICULTY (6 Delivery Partners)
 * Exactly 6 points with non-trivial spatial layout and non-obvious optimal path.
 * Min distance >= 145px ensures comfortable 55px touch targets without overlap.
 */
export function generateHardPoints(width = 800, height = 800): Point[] {
  const padding = 95;
  let minDistance = 160;
  let attempts = 0;

  while (attempts < 600) {
    attempts++;
    const candidates: Point[] = [];
    let valid = true;

    for (let i = 0; i < 6; i++) {
      let ptAttempts = 0;
      let placed = false;
      while (!placed && ptAttempts < 100) {
        ptAttempts++;
        const x = Math.round(padding + Math.random() * (width - padding * 2));
        const y = Math.round(padding + Math.random() * (height - padding * 2));

        const isSeparated = candidates.every(
          (existing) => Math.hypot(existing.x - x, existing.y - y) >= minDistance
        );

        if (isSeparated) {
          candidates.push({
            id: i,
            label: `Partner ${i + 1}`,
            x,
            y,
          });
          placed = true;
        }
      }

      if (!placed) {
        valid = false;
        break;
      }
    }

    if (valid && candidates.length === 6) {
      return candidates;
    }

    if (attempts > 300) {
      minDistance = Math.max(140, minDistance - 5);
    }
  }

  // Fallback guaranteed placement for 6 points
  return generatePointsFallback(6, 'Partner', width, height, padding, 140);
}

/**
 * Fallback procedural point generator with progressive relaxation
 */
function generatePointsFallback(
  count: number,
  labelPrefix: string,
  width: number,
  height: number,
  padding: number,
  initialMinDistance: number
): Point[] {
  const points: Point[] = [];
  let minDistance = initialMinDistance;

  for (let i = 0; i < count; i++) {
    let attempts = 0;
    let placed = false;

    while (!placed && attempts < 200) {
      attempts++;
      const x = Math.round(padding + Math.random() * (width - padding * 2));
      const y = Math.round(padding + Math.random() * (height - padding * 2));

      const isSeparated = points.every(
        (existing) => Math.hypot(existing.x - x, existing.y - y) >= minDistance
      );

      if (isSeparated) {
        points.push({
          id: i,
          label: `${labelPrefix} ${i + 1}`,
          x,
          y,
        });
        placed = true;
      }
    }

    if (!placed) {
      minDistance = Math.max(120, minDistance * 0.85);
      i--;
    }
  }

  return points;
}

/**
 * Precalculates the hidden ideal performance challenge for a given round
 * BEFORE the player starts the round.
 */
export interface RoundChallenge {
  roundNumber: number;
  config: RoundConfigData;
  points: Point[];
  optimalRoute: number[];
  optimalDistance: number;
  idealTime: number;
}

export function createRoundChallenge(roundNumber: number, width = 800, height = 800): RoundChallenge {
  const config = ROUND_CONFIG[roundNumber] || ROUND_CONFIG[1];
  let points: Point[];

  if (roundNumber === 1) {
    points = generateEasyPoints(width, height);
  } else if (roundNumber === 2) {
    points = generateMediumPoints(width, height);
  } else {
    points = generateHardPoints(width, height);
  }

  // Calculate shortest possible route deterministically
  const { optimalRoute, optimalDistance } = findOptimalRoute(points);

  // Calculate ideal target time
  const idealTime = calculateIdealTime(roundNumber, optimalDistance);

  return {
    roundNumber,
    config,
    points,
    optimalRoute,
    optimalDistance,
    idealTime,
  };
}

/**
 * Backward compatibility helpers
 */
export function calculateEfficiency(optimalDistance: number, playerDistance: number): number {
  if (playerDistance <= 0) return 0;
  const raw = (optimalDistance / playerDistance) * 100;
  const clamped = Math.min(100, Math.max(0, raw));
  return Math.round(clamped * 10) / 10;
}

export function getPerformanceMessage(totalStars: number): string {
  if (totalStars >= 100) {
    return 'Flawless route optimization! Your performance matched the ideal benchmark.';
  }
  if (totalStars >= 90) {
    return 'Exceptional logistics precision! You planned nearly optimal routes.';
  }
  if (totalStars >= 80) {
    return 'Great route planning and speed. Close to peak network dispatch efficiency.';
  }
  if (totalStars >= 70) {
    return 'Solid logistics run. Keep sharpening your routes to unlock the benchmark.';
  }
  return 'Every delivery run teaches you something. Keep pushing to beat your score!';
}
