import React from 'react';
import { Trophy, X, Crown, Medal } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { formatCash } from '../../utils/economy';

interface Props {
  onClose: () => void;
}

export const LeaderboardModal: React.FC<Props> = ({ onClose }) => {
  const { stats } = useGame();

  const mockLeaderboard = [
    { rank: 1, name: 'CryptoWhale99', title: '👑 OwO Supreme Deity', cash: 1450000, level: 48, wins: 540, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' },
    { rank: 2, name: 'Luna_OwO', title: '💎 Mythic High Roller', cash: 890000, level: 36, wins: 320, avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80' },
    { rank: 3, name: 'Senpai_Luck', title: '🎰 Casino VIP Master', cash: 520000, level: 29, wins: 210, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80' },
    { rank: 4, name: 'You (Player)', isYou: true, title: stats.title, cash: stats.cash, level: stats.level, wins: stats.totalWins, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' },
    { rank: 5, name: 'KawaiiNeko', title: '🦁 Apex Safari Lord', cash: 210000, level: 19, wins: 95, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80' },
    { rank: 6, name: 'DogeMaster', title: '🎲 Lucky High Roller', cash: 125000, level: 14, wins: 62, avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80' }
  ].sort((a, b) => b.cash - a.cash).map((item, idx) => ({ ...item, rank: idx + 1 }));

  return (
    <div id="leaderboard-modal" className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 md:p-6 overflow-y-auto">
      <div className="bg-[#2b2d31] w-full max-w-xl rounded-2xl border border-[#3f4147] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-[#3f4147] flex justify-between items-center bg-[#1e1f22]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Global Wealth & High Roller Leaderboard</h2>
              <p className="text-xs text-gray-400">Top richest OwO Bot players in the server</p>
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

        {/* List */}
        <div className="p-4 md:p-5 overflow-y-auto flex-1 space-y-2.5">
          {mockLeaderboard.map((player) => (
            <div
              key={player.name}
              className={`p-3 rounded-xl border flex items-center justify-between transition ${
                player.isYou
                  ? 'bg-amber-500/10 border-amber-500/40 ring-1 ring-amber-500/30'
                  : 'bg-[#1e1f22] border-[#35373c]'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Rank Badge */}
                <div className="w-7 text-center font-extrabold text-sm">
                  {player.rank === 1 ? (
                    <Crown className="w-5 h-5 text-amber-400 mx-auto" />
                  ) : player.rank === 2 ? (
                    <Medal className="w-5 h-5 text-gray-300 mx-auto" />
                  ) : player.rank === 3 ? (
                    <Medal className="w-5 h-5 text-amber-600 mx-auto" />
                  ) : (
                    <span className="text-gray-400 font-mono">#{player.rank}</span>
                  )}
                </div>

                <img
                  src={player.avatar}
                  alt={player.name}
                  className="w-10 h-10 rounded-full object-cover border border-[#3f4147]"
                />

                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${player.isYou ? 'text-amber-400' : 'text-white'}`}>
                      {player.name}
                    </span>
                    {player.isYou && (
                      <span className="text-[10px] bg-amber-500 text-gray-950 px-1.5 py-0.2 rounded font-black">
                        YOU
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-gray-400 block">{player.title}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-sm font-black text-emerald-400 block">
                  💵 {formatCash(player.cash)}
                </span>
                <span className="text-[11px] text-purple-400 font-semibold block">
                  Lvl {player.level} • {player.wins} Wins
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
