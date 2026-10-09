import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import {
  initializeFirestore,
  doc,
  setDoc,
  updateDoc,
  getDocFromServer,
  collection,
  getDocs,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { PlayerData, TurnRecord, LeaderboardEntry } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

// Initialize Firebase with long-polling to prevent proxy/iframe backend connection drops
const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(
  app,
  {
    experimentalForceLongPolling: true,
  },
  firebaseConfig.firestoreDatabaseId
);
export const auth = getAuth(app);

// Attempt anonymous authentication on boot for event session reliability
signInAnonymously(auth).catch((err) => {
  // If anonymous auth is not enabled in Firebase Console, application proceeds gracefully
  console.info('Firebase auth session notice:', err?.message || err);
});

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): FirestoreErrorInfo {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path,
  };
  console.warn(`[Firestore ${operationType} on ${path}]:`, errInfo.error);
  return errInfo;
}

// Validate Firestore connection on app boot
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.info('Firestore client is currently operating in offline-first mode.');
    } else {
      console.info(
        'Firestore connection status check:',
        error instanceof Error ? error.message : String(error)
      );
    }
    return false;
  }
}

// Local storage key prefix for local device crash/state recovery
const LOCAL_STORAGE_KEY_PREFIX = 'speedo_network_player_';

/**
 * Saves initial player registration to Firestore and local backup.
 * Returns success status and error message if write fails.
 */
export async function registerPlayerSession(
  player: PlayerData
): Promise<{ success: boolean; error?: string }> {
  // 1. Store in localStorage for device recovery
  try {
    localStorage.setItem(
      `${LOCAL_STORAGE_KEY_PREFIX}${player.playerId}`,
      JSON.stringify(player)
    );
  } catch (err) {
    console.warn('LocalStorage write failed:', err);
  }

  // 2. Persist to Firestore players collection
  try {
    const docRef = doc(db, 'players', player.playerId);
    await setDoc(docRef, {
      playerId: player.playerId,
      gameId: player.gameId || player.playerId,
      name: player.name.trim(),
      email: (player.email || '').trim(),
      businessOwner: Boolean(player.businessOwner),
      instagram: (player.instagram || '').trim(),
      instagramId: (player.instagramId || player.instagram || '').trim(),
      contactNumber: (player.contactNumber || '').trim(),
      gameStatus: player.gameStatus,
      createdAt: player.createdAt,
      turns: player.turns || [],
    });
    return { success: true };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `players/${player.playerId}`);
    return {
      success: false,
      error: 'Unable to save your registration. Please check your connection and try again.',
    };
  }
}

/**
 * Records a completed turn to Firestore and updates local storage.
 * Stores all required telemetry fields per round.
 */
export async function saveTurnRecord(
  playerId: string,
  turn: TurnRecord,
  gameStatus: PlayerData['gameStatus']
): Promise<{ success: boolean; error?: string }> {
  let currentData: PlayerData | null = null;
  try {
    const cached = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}${playerId}`);
    if (cached) {
      currentData = JSON.parse(cached);
      if (currentData) {
        currentData.turns = currentData.turns || [];
        const existingIdx = currentData.turns.findIndex(
          (t) => t.turnNumber === turn.turnNumber
        );
        if (existingIdx >= 0) {
          currentData.turns[existingIdx] = turn;
        } else {
          currentData.turns.push(turn);
        }
        currentData.gameStatus = gameStatus;
        localStorage.setItem(
          `${LOCAL_STORAGE_KEY_PREFIX}${playerId}`,
          JSON.stringify(currentData)
        );
      }
    }
  } catch (err) {
    console.warn('LocalStorage turn update failed:', err);
  }

  try {
    const docRef = doc(db, 'players', playerId);
    const updatedTurns = currentData ? currentData.turns : [turn];
    await updateDoc(docRef, {
      turns: updatedTurns,
      gameStatus,
    });
    return { success: true };
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `players/${playerId}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Turn sync delayed.',
    };
  }
}

/**
 * Finalizes the game session in both the private players document
 * and the public leaderboard collection (containing ONLY public fields).
 */
export async function finalizeGameSession(
  playerId: string,
  playerName: string,
  totalStars: number,
  rewardEligible: boolean,
  totalTime: number,
  completedAt: string,
  perfectRounds = 0,
  allRoundsPerfect = false
): Promise<{ success: boolean; error?: string }> {
  // 1. Update local storage
  try {
    const cached = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}${playerId}`);
    if (cached) {
      const parsed: PlayerData = JSON.parse(cached);
      parsed.totalStars = totalStars;
      parsed.maxStars = 100;
      parsed.rewardEligible = rewardEligible;
      parsed.totalTime = totalTime;
      parsed.finalScore = totalStars;
      parsed.completedAt = completedAt;
      parsed.gameStatus = 'completed';
      parsed.perfectRounds = perfectRounds;
      parsed.allRoundsPerfect = allRoundsPerfect;
      localStorage.setItem(
        `${LOCAL_STORAGE_KEY_PREFIX}${playerId}`,
        JSON.stringify(parsed)
      );
    }
  } catch (err) {
    console.warn('LocalStorage finalize update failed:', err);
  }

  // 2. Write to Firestore players document
  try {
    const playerRef = doc(db, 'players', playerId);
    await updateDoc(playerRef, {
      totalStars,
      maxStars: 100,
      rewardEligible,
      totalTime,
      finalScore: totalStars,
      completedAt,
      gameStatus: 'completed',
      perfectRounds,
      allRoundsPerfect,
    });

    // 3. Write ONLY public fields to the dedicated public leaderboard collection
    // NEVER write email, instagram, contactNumber, businessOwner, or raw turn routes here
    const leaderboardRef = doc(db, 'leaderboard', playerId);
    await setDoc(leaderboardRef, {
      playerId,
      name: playerName.trim(),
      totalStars,
      perfectRounds,
      totalTime: Math.round(totalTime * 10) / 10,
      finalScore: totalStars,
      rewardEligible,
      completedAt,
    });

    return { success: true };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `leaderboard/${playerId}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to sync with leaderboard.',
    };
  }
}

/**
 * Retrieves player data from local storage for local recovery.
 */
export function getLocalPlayerData(playerId: string): PlayerData | null {
  try {
    const cached = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}${playerId}`);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (err) {
    console.warn('LocalStorage read error:', err);
  }
  return null;
}

/**
 * Fetches and ranks real leaderboard entries directly from the Firestore
 * leaderboard collection. Never reads from players collection or merges
 * local storage for the public leaderboard. Starts completely clean without fake seeds.
 *
 * Ranking order:
 * 1. Total Stars (descending)
 * 2. Perfect Rounds (descending)
 * 3. Total Time (ascending)
 * 4. Completed At (earliest first if tied)
 */
export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const colRef = collection(db, 'leaderboard');
    const snapshot = await getDocs(colRef);
    const list: LeaderboardEntry[] = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data && data.name) {
        const totalStars =
          typeof data.totalStars === 'number'
            ? data.totalStars
            : typeof data.finalScore === 'number'
            ? data.finalScore
            : 0;

        const totalTime =
          typeof data.totalTime === 'number' ? data.totalTime : 999;
        const perfectRounds =
          typeof data.perfectRounds === 'number' ? data.perfectRounds : 0;

        list.push({
          playerId: docSnap.id,
          name: data.name,
          totalStars: Math.min(100, Math.max(0, totalStars)),
          perfectRounds,
          totalTime,
          finalScore: totalStars,
          rewardEligible: Boolean(data.rewardEligible),
          completedAt: data.completedAt || '',
        });
      }
    });

    // Sort strictly:
    // 1. Total Stars (descending)
    // 2. Perfect Rounds (descending)
    // 3. Total Time (ascending)
    // 4. Completed At (earliest first if tied)
    list.sort((a, b) => {
      if (b.totalStars !== a.totalStars) {
        return b.totalStars - a.totalStars;
      }
      if (b.perfectRounds !== a.perfectRounds) {
        return b.perfectRounds - a.perfectRounds;
      }
      if (a.totalTime !== b.totalTime) {
        return a.totalTime - b.totalTime;
      }
      return (a.completedAt || '').localeCompare(b.completedAt || '');
    });

    // Assign rank numbers 1, 2, 3...
    return list.map((item, index) => ({
      ...item,
      rank: index + 1,
    }));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'leaderboard');
    throw err;
  }
}

