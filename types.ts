export interface Point {
  id: number;
  label: string;
  x: number;
  y: number;
}

export type RoundDifficulty = 'EASY' | 'MEDIUM' | 'TOUGH';

export interface TurnRecord {
  turnNumber: number;
  difficulty: RoundDifficulty;
  pointCount: number;
  points: Point[];
  playerRoute: number[];
  optimalRoute: number[];
  playerDistance: number;
  optimalDistance: number;
  difference: number;
  distanceDifference: number;
  routeDifference?: number;
  playerTime: number;
  idealTime: number;
  distanceEfficiency: number; // 0.0 to 1.0
  timeEfficiency: number; // 0.0 to 1.0
  routeCorrect: boolean; // TRUE only if matches optimalRoute or reverse of optimalRoute
  timeWithinLimit: boolean; // playerTime <= idealTime
  perfectRound: boolean; // routeCorrect && timeWithinLimit
  roundStars: number; // Integer stars earned
  maxStars: number; // Round max: 20, 30, or 50
  timeTaken: number; // Backward compat
  efficiency: number; // Backward compat percentage (0 - 100)
}

export interface RegistrationFormData {
  name: string;
  email: string;
  businessOwner: boolean;
  instagramId: string;
  contactNumber?: string | null;
}

export interface PlayerData {
  playerId: string;
  gameId?: string;
  name: string;
  email?: string;
  businessOwner?: boolean;
  instagram: string;
  instagramId?: string;
  contactNumber?: string | null;
  createdAt: string;
  completedAt?: string;
  gameStatus: 'in_progress' | 'turn_1_complete' | 'turn_2_complete' | 'completed';
  totalStars?: number; // 0 to 100
  maxStars?: number; // 100
  totalTime?: number; // Sum of player times
  totalIdealTime?: number;
  perfectRounds?: number; // 0 to 3
  allRoundsPerfect?: boolean; // perfectRound1 && perfectRound2 && perfectRound3
  rewardEligible?: boolean; // allRoundsPerfect
  finalScore?: number; // Same as totalStars (0 - 100)
  turns: TurnRecord[];
}

export interface LeaderboardEntry {
  playerId: string;
  name: string;
  totalStars: number;
  perfectRounds: number;
  totalTime: number;
  finalScore: number;
  rewardEligible: boolean;
  completedAt: string;
  rank?: number;
}

export type GameScreen =
  | 'welcome'
  | 'registration'
  | 'instructions'
  | 'countdown'
  | 'turn_1'
  | 'turn_1_result'
  | 'turn_2'
  | 'turn_2_result'
  | 'turn_3'
  | 'final_result';

