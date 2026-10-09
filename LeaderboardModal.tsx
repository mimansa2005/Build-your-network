import React, { useEffect, useState } from 'react';
import { LeaderboardEntry } from '../types';
import { fetchLeaderboard } from '../lib/firebase';
import { SpeedoLogo } from './SpeedoLogo';
import { Trophy, X, Loader2, ArrowLeft, Star, Clock } from 'lucide-react';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlayerId?: string;
  currentPlayerName?: string;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  currentPlayerId,
}) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setLoading(true);

    fetchLeaderboard()
      .then((data) => {
        if (isMounted) {
          setEntries(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn('Leaderboard fetch issue:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      id="speedo-leaderboard-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
    >
      <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#FF6B00] flex items-center justify-center shrink-0">
              <Trophy className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <SpeedoLogo size="xs" withCard={true} className="mb-0.5 items-start" />
              <h2 className="text-sm sm:text-base font-extrabold text-[#0F172A] font-heading leading-tight">
                DISPATCH LEADERBOARD
              </h2>
            </div>
          </div>

          <button
            id="btn-close-leaderboard"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            aria-label="Close Leaderboard"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Subtitle bar */}
        <div className="px-4 sm:px-5 py-2 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between text-[11px] sm:text-xs text-slate-500 font-medium">
          <span>Ranked by: Stars → Perfect Routes → Time</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>Optimal Route Priority</span>
          </span>
        </div>

        {/* List Content */}
        <div className="p-3 sm:p-5 overflow-y-auto flex-1 divide-y divide-slate-100">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#FF6B00]" />
              <span className="text-xs font-semibold">Syncing dispatch records...</span>
            </div>
          ) : entries.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No completed dispatches yet. Complete all 3 rounds to set a high score!
            </div>
          ) : (
            <div className="space-y-1.5">
              {entries.map((entry) => {
                const isCurrent = currentPlayerId && entry.playerId === currentPlayerId;
                const isTop1 = entry.rank === 1;
                const isTop2 = entry.rank === 2;
                const isTop3 = entry.rank === 3;
                const stars = entry.totalStars ?? entry.finalScore ?? 0;

                return (
                  <div
                    key={entry.playerId}
                    className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
                      isCurrent
                        ? 'bg-orange-50/90 border border-orange-200 text-slate-900'
                        : 'bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {/* Rank & Name */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black font-heading shrink-0 ${
                          isTop1
                            ? 'bg-amber-400 text-slate-950 shadow-2xs'
                            : isTop2
                            ? 'bg-slate-200 text-slate-800'
                            : isTop3
                            ? 'bg-amber-600/20 text-amber-800'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        #{entry.rank}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold truncate text-slate-900">
                            {entry.name}
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] font-black uppercase tracking-wider bg-[#FF6B00] text-white px-1.5 py-0.2 rounded-sm">
                              YOU
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          {typeof entry.perfectRounds === 'number' && (
                            <span className="font-semibold text-slate-600">
                              {entry.perfectRounds}/3 Perfect
                            </span>
                          )}
                          {entry.totalTime && entry.totalTime < 900 && (
                            <span>
                              {typeof entry.perfectRounds === 'number' && <span className="text-slate-300 mr-1.5">•</span>}
                              {entry.totalTime.toFixed(1)}s
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Total Stars */}
                    <div className="text-right pl-2 shrink-0 flex items-center gap-1.5">
                      <span className="text-base sm:text-lg font-black text-[#0F172A] font-heading">
                        {stars}
                      </span>
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <SpeedoLogo size="sm" showSubtext={false} />
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Game</span>
          </button>
        </div>
      </div>
    </div>
  );
};
