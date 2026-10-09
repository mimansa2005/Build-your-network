import React, { useState, useEffect, useCallback } from 'react';
import { GameScreen, PlayerData, TurnRecord, Point, RegistrationFormData } from './types';
import {
  generateEasyPoints,
  generateMediumPoints,
  generateHardPoints,
  findOptimalRoute,
  calculateIdealTime,
  calculateTotalPerformance,
  REWARD_THRESHOLD,
  TOTAL_MAX_STARS,
} from './lib/gameLogic';
import {
  registerPlayerSession,
  saveTurnRecord,
  finalizeGameSession,
  testFirestoreConnection,
} from './lib/firebase';
import { Header } from './components/Header';
import { WelcomeScreen } from './components/WelcomeScreen';
import { RegistrationScreen } from './components/RegistrationScreen';
import { InstructionsScreen } from './components/InstructionsScreen';
import { CountdownScreen } from './components/CountdownScreen';
import { GameBoard } from './components/GameBoard';
import { TurnResultScreen } from './components/TurnResultScreen';
import { FinalResultScreen } from './components/FinalResultScreen';
import { LeaderboardModal } from './components/LeaderboardModal';

export default function App() {
  const [screen, setScreen] = useState<GameScreen>('welcome');
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [countdownTurn, setCountdownTurn] = useState<number>(1);
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);
  const [finalSyncStatus, setFinalSyncStatus] = useState<'syncing' | 'synced' | 'error'>('synced');

  // Points & Hidden Ideal Performance for active turn
  const [turnPoints, setTurnPoints] = useState<Point[]>([]);
  const [optimalRoute, setOptimalRoute] = useState<number[]>([]);
  const [optimalDistance, setOptimalDistance] = useState<number>(0);
  const [idealTime, setIdealTime] = useState<number>(0);

  // Test Firestore connection on boot
  useEffect(() => {
    testFirestoreConnection().catch(() => {
      // Handled gracefully inside testFirestoreConnection
    });
  }, []);

  // Compute total stars earned so far
  const currentTotalStars =
    playerData?.turns && playerData.turns.length > 0
      ? playerData.turns.reduce((sum, t) => sum + (t.roundStars || 0), 0)
      : null;

  // Compute average distance efficiency across completed turns
  const currentAverageEfficiency =
    playerData?.turns && playerData.turns.length > 0
      ? Math.round(
          (playerData.turns.reduce((sum, t) => sum + (t.distanceEfficiency ? t.distanceEfficiency * 100 : t.efficiency), 0) /
            playerData.turns.length) *
            10
        ) / 10
      : null;

  /**
   * Pre-calculates the hidden ideal performance deterministically
   * BEFORE the player starts each round.
   */
  const prepareRound = useCallback((roundNum: number) => {
    let pts: Point[];
    if (roundNum === 1) {
      pts = generateEasyPoints();
    } else if (roundNum === 2) {
      pts = generateMediumPoints();
    } else {
      pts = generateHardPoints();
    }

    const { optimalRoute: optRoute, optimalDistance: optDist } = findOptimalRoute(pts);
    const targetIdealTime = calculateIdealTime(roundNum, optDist);

    setTurnPoints(pts);
    setOptimalRoute(optRoute);
    setOptimalDistance(optDist);
    setIdealTime(targetIdealTime);
    setCountdownTurn(roundNum);
    setScreen('countdown');
  }, []);

  // 1. Welcome -> Registration
  const handleStartFromWelcome = () => {
    setScreen('registration');
  };

  // 2. Registration -> Instructions
  const handleRegistrationSubmit = async (formData: RegistrationFormData) => {
    setIsRegistering(true);
    const newPlayerId = `sp_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const cleanIg = formData.instagramId.replace(/^@+/, '').trim();
    const cleanContact = formData.contactNumber?.trim() || null;

    const newPlayer: PlayerData = {
      playerId: newPlayerId,
      gameId: newPlayerId,
      name: formData.name.trim(),
      email: formData.email.trim(),
      businessOwner: formData.businessOwner,
      instagram: cleanIg,
      instagramId: cleanIg,
      contactNumber: cleanContact,
      createdAt: new Date().toISOString(),
      gameStatus: 'in_progress',
      turns: [],
      totalStars: 0,
      maxStars: TOTAL_MAX_STARS,
      rewardEligible: false,
    };

    const regResult = await registerPlayerSession(newPlayer);
    setIsRegistering(false);

    if (!regResult.success) {
      return {
        success: false,
        error:
          regResult.error ||
          'Unable to save your registration. Please check your connection and try again.',
      };
    }

    setPlayerData(newPlayer);
    setScreen('instructions');
    return { success: true };
  };

  // 3. Instructions -> Countdown for Round 1 (Easy - 4 Trucks, max 20 stars)
  const handleStartFromInstructions = () => {
    prepareRound(1);
  };

  // 4. Countdown Complete -> Launch Turn Screen
  const handleCountdownComplete = () => {
    if (countdownTurn === 1) {
      setScreen('turn_1');
    } else if (countdownTurn === 2) {
      setScreen('turn_2');
    } else if (countdownTurn === 3) {
      setScreen('turn_3');
    }
  };

  // 5. Round 1 Complete
  const handleTurn1Complete = useCallback(
    async (turnRecord: TurnRecord) => {
      if (!playerData) return;
      const updatedTurns = [turnRecord];
      const updatedPlayer: PlayerData = {
        ...playerData,
        gameStatus: 'turn_1_complete',
        turns: updatedTurns,
        totalStars: turnRecord.roundStars,
      };
      setPlayerData(updatedPlayer);
      await saveTurnRecord(playerData.playerId, turnRecord, 'turn_1_complete');
      setScreen('turn_1_result');
    },
    [playerData]
  );

  // 6. Round 1 Result -> Launch Round 2 (Medium - 5 Packages, max 30 stars)
  const handleNextFromTurn1Result = () => {
    prepareRound(2);
  };

  // 7. Round 2 Complete
  const handleTurn2Complete = useCallback(
    async (turnRecord: TurnRecord) => {
      if (!playerData) return;
      const updatedTurns = [...(playerData.turns || []), turnRecord];
      const starsSoFar = updatedTurns.reduce((acc, t) => acc + (t.roundStars || 0), 0);
      const updatedPlayer: PlayerData = {
        ...playerData,
        gameStatus: 'turn_2_complete',
        turns: updatedTurns,
        totalStars: starsSoFar,
      };
      setPlayerData(updatedPlayer);
      await saveTurnRecord(playerData.playerId, turnRecord, 'turn_2_complete');
      setScreen('turn_2_result');
    },
    [playerData]
  );

  // 8. Round 2 Result -> Launch Round 3 (Tough - 6 Delivery Partners, max 50 stars)
  const handleNextFromTurn2Result = () => {
    prepareRound(3);
  };

  // 9. Round 3 Complete -> Aggregate 100 Stars & Strict Reward Eligibility
  const handleTurn3Complete = useCallback(
    async (turnRecord: TurnRecord) => {
      if (!playerData) return;
      const updatedTurns = [...(playerData.turns || []), turnRecord];

      // Evaluate performance across all 3 rounds using strict win condition:
      // rewardEligible = all 3 rounds perfect (route correct + within ideal time)
      const {
        totalStars,
        perfectRounds,
        allRoundsPerfect,
        rewardEligible,
      } = calculateTotalPerformance(updatedTurns);

      // Total completion time across rounds
      const totalTime =
        Math.round(
          updatedTurns.reduce((acc, t) => acc + (t.playerTime || t.timeTaken || 0), 0) * 10
        ) / 10;
      const completedAt = new Date().toISOString();

      const finalizedPlayer: PlayerData = {
        ...playerData,
        gameStatus: 'completed',
        turns: updatedTurns,
        totalStars,
        maxStars: TOTAL_MAX_STARS,
        perfectRounds,
        allRoundsPerfect,
        rewardEligible,
        totalTime,
        finalScore: totalStars,
        completedAt,
      };

      setPlayerData(finalizedPlayer);

      // Persist turn 3 and finalize record in database
      await saveTurnRecord(playerData.playerId, turnRecord, 'completed');

      setFinalSyncStatus('syncing');
      setScreen('final_result');

      const finalRes = await finalizeGameSession(
        playerData.playerId,
        playerData.name,
        totalStars,
        rewardEligible,
        totalTime,
        completedAt,
        perfectRounds,
        allRoundsPerfect
      );

      if (finalRes.success) {
        setFinalSyncStatus('synced');
      } else {
        setFinalSyncStatus('error');
      }
    },
    [playerData]
  );

  // Retry final save if connection failed
  const handleRetryFinalSave = async () => {
    if (!playerData) return;
    setFinalSyncStatus('syncing');
    const totalTime =
      Math.round(
        (playerData.turns || []).reduce((acc, t) => acc + (t.playerTime || t.timeTaken || 0), 0) * 10
      ) / 10;
    const completedAt = playerData.completedAt || new Date().toISOString();

    const finalRes = await finalizeGameSession(
      playerData.playerId,
      playerData.name,
      playerData.totalStars ?? 0,
      Boolean(playerData.rewardEligible),
      totalTime,
      completedAt,
      playerData.perfectRounds || 0,
      Boolean(playerData.allRoundsPerfect)
    );

    if (finalRes.success) {
      setFinalSyncStatus('synced');
    } else {
      setFinalSyncStatus('error');
    }
  };

  // Play Again: reset state and return to welcome to start a fresh game session
  const handlePlayAgain = () => {
    setPlayerData(null);
    setTurnPoints([]);
    setOptimalRoute([]);
    setOptimalDistance(0);
    setIdealTime(0);
    setCountdownTurn(1);
    setFinalSyncStatus('synced');
    setScreen('welcome');
  };

  // Determine current turn number for header
  const getCurrentTurnNumber = (): number => {
    switch (screen) {
      case 'turn_1':
      case 'turn_1_result':
        return 1;
      case 'turn_2':
      case 'turn_2_result':
        return 2;
      case 'turn_3':
      case 'final_result':
        return 3;
      case 'countdown':
        return countdownTurn;
      default:
        return 1;
    }
  };

  const isFrontPage = screen === 'welcome';
  const showHeaderControls =
    screen !== 'welcome' && screen !== 'registration' && screen !== 'instructions';

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col antialiased selection:bg-[#FF6B00] selection:text-white">
      <Header
        showBanner={isFrontPage}
        currentTurn={getCurrentTurnNumber()}
        totalTurns={3}
        currentEfficiency={currentAverageEfficiency}
        currentStars={currentTotalStars}
        playerName={playerData?.name}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        showControls={showHeaderControls}
      />

      <main className="flex-1 flex flex-col justify-center px-2 sm:px-4 py-4 sm:py-6">
        {/* Screen 1: Welcome Screen (Front Page) */}
        {screen === 'welcome' && (
          <WelcomeScreen
            onStart={handleStartFromWelcome}
            onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
          />
        )}

        {/* Screen 2: Player Registration Screen */}
        {screen === 'registration' && (
          <RegistrationScreen
            onSubmit={handleRegistrationSubmit}
            isLoading={isRegistering}
          />
        )}

        {/* Screen 3: Instructions Screen */}
        {screen === 'instructions' && (
          <InstructionsScreen onStartGame={handleStartFromInstructions} />
        )}

        {/* Screen 4: Countdown Screen (Before each round) */}
        {screen === 'countdown' && (
          <CountdownScreen
            turnNumber={countdownTurn}
            onComplete={handleCountdownComplete}
          />
        )}

        {/* Screen 5: Round 1 Game Board (Delivery Trucks, 4 points, max 20 stars) */}
        {screen === 'turn_1' && (
          <GameBoard
            turnNumber={1}
            points={turnPoints}
            optimalRoute={optimalRoute}
            optimalDistance={optimalDistance}
            idealTime={idealTime}
            onTurnComplete={handleTurn1Complete}
          />
        )}

        {/* Screen 6: Round 1 Result */}
        {screen === 'turn_1_result' && playerData?.turns[0] && (
          <TurnResultScreen
            turnRecord={playerData.turns[0]}
            isFinalTurn={false}
            onNext={handleNextFromTurn1Result}
          />
        )}

        {/* Screen 7: Round 2 Game Board (Delivery Packages, 5 points, max 30 stars) */}
        {screen === 'turn_2' && (
          <GameBoard
            turnNumber={2}
            points={turnPoints}
            optimalRoute={optimalRoute}
            optimalDistance={optimalDistance}
            idealTime={idealTime}
            onTurnComplete={handleTurn2Complete}
          />
        )}

        {/* Screen 8: Round 2 Result */}
        {screen === 'turn_2_result' && playerData?.turns[1] && (
          <TurnResultScreen
            turnRecord={playerData.turns[1]}
            isFinalTurn={false}
            onNext={handleNextFromTurn2Result}
          />
        )}

        {/* Screen 9: Round 3 Game Board (Delivery Partners, 6 points, max 50 stars) */}
        {screen === 'turn_3' && (
          <GameBoard
            turnNumber={3}
            points={turnPoints}
            optimalRoute={optimalRoute}
            optimalDistance={optimalDistance}
            idealTime={idealTime}
            onTurnComplete={handleTurn3Complete}
          />
        )}

        {/* Screen 10: Final Result Screen (100-Star Scorecard & Reward Eligibility) */}
        {screen === 'final_result' && playerData && (
          <FinalResultScreen
            playerData={playerData}
            onPlayAgain={handlePlayAgain}
            onViewLeaderboard={() => setIsLeaderboardOpen(true)}
            syncStatus={finalSyncStatus}
            onRetrySync={handleRetryFinalSave}
          />
        )}
      </main>

      {/* Leaderboard Modal */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        currentPlayerId={playerData?.playerId}
        currentPlayerName={playerData?.name}
      />
    </div>
  );
}
