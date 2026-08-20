import React from 'react';
import { Scroll, X, Check, Gift } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { formatCash } from '../../utils/economy';

interface Props {
  onClose: () => void;
}

export const QuestsModal: React.FC<Props> = ({ onClose }) => {
  const { quests, claimQuest } = useGame();

  const completedCount = quests.filter(q => q.completed).length;

  return (
    <div id="quests-modal" className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 md:p-6 overflow-y-auto">
      <div className="bg-[#2b2d31] w-full max-w-xl rounded-2xl border border-[#3f4147] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-[#3f4147] flex justify-between items-center bg-[#1e1f22]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
              <Scroll className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Daily Quests & Bounties</h2>
              <p className="text-xs text-gray-400">
                {completedCount}/{quests.length} Completed • Earn bonus cowoncy and XP!
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-[#35373c] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quests List */}
        <div className="p-4 md:p-5 overflow-y-auto flex-1 space-y-3">
          {quests.map((q) => {
            const percent = Math.min(100, Math.floor((q.current / q.target) * 100));

            return (
              <div
                key={q.id}
                className={`p-4 rounded-xl border transition ${
                  q.claimed
                    ? 'bg-[#1e1f22]/60 border-[#35373c] opacity-75'
                    : q.completed
                    ? 'bg-[#1e1f22] border-amber-500/40 shadow-md ring-1 ring-amber-500/20'
                    : 'bg-[#1e1f22] border-[#35373c]'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      {q.title}
                      {q.completed && !q.claimed && (
                        <span className="text-[10px] bg-amber-500 text-gray-950 px-2 py-0.5 rounded-full font-black animate-pulse">
                          CLAIM READY
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-gray-400 mt-0.5">{q.description}</p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-extrabold text-emerald-400 block">
                      +💵 {formatCash(q.rewardCash)}
                    </span>
                    <span className="text-[10px] font-semibold text-purple-400 block">
                      +{q.rewardXp} XP
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-[11px] text-gray-400 mb-1 font-semibold">
                    <span>Progress</span>
                    <span>
                      {q.current} / {q.target} ({percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-[#2b2d31] rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        q.completed ? 'bg-amber-400' : 'bg-blue-500'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                {/* Claim Button */}
                {q.completed && !q.claimed && (
                  <div className="mt-3 pt-3 border-t border-[#2b2d31]">
                    <button
                      type="button"
                      onClick={() => claimQuest(q.id)}
                      className="w-full py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-gray-950 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow active:scale-95 transition"
                    >
                      <Gift className="w-4 h-4" /> Claim Rewards (+{formatCash(q.rewardCash)} Cash)
                    </button>
                  </div>
                )}

                {q.claimed && (
                  <div className="mt-2 text-center text-xs text-gray-500 font-semibold flex items-center justify-center gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-400" /> Claimed
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
