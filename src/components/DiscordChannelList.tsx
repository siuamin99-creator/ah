import React from 'react';
import { Hash, Volume2, VolumeX, RotateCcw, ChevronDown, Sparkles, Shield, Gift } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { SIMULATED_MEMBERS } from '../data/items';
import { formatCash } from '../utils/economy';

export const DiscordChannelList: React.FC = () => {
  const {
    servers,
    currentServerId,
    currentChannelId,
    setCurrentChannelId,
    stats,
    soundEnabled,
    setSoundEnabled,
    resetAllData,
    claimDaily,
    setActiveGameModal
  } = useGame();

  const currentServer = servers.find(s => s.id === currentServerId) || servers[0];

  // Group channels by category
  const categories = Array.from(new Set(currentServer.channels.map(c => c.category)));

  return (
    <div id="discord-channel-list" className="w-60 bg-[#2b2d31] flex flex-col h-full select-none border-r border-[#1f2023] shrink-0">
      {/* Server Name Banner */}
      <div className="h-12 border-b border-[#1f2023] px-4 flex items-center justify-between font-bold text-white shadow-sm hover:bg-[#35373c]/50 transition cursor-pointer">
        <span className="truncate text-sm flex items-center gap-2">
          <span>{currentServer.icon}</span>
          <span className="truncate">{currentServer.name}</span>
        </span>
        <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
      </div>

      {/* Channel Categories & Channels */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        {categories.map((category) => (
          <div key={category} className="space-y-0.5">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-2 flex items-center justify-between">
              <span>{category}</span>
            </div>
            {currentServer.channels
              .filter(c => c.category === category)
              .map(channel => {
                const isActive = currentChannelId === channel.id;
                return (
                  <button
                    key={channel.id}
                    id={`channel-${channel.id}`}
                    type="button"
                    onClick={() => setCurrentChannelId(channel.id)}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-semibold transition group ${
                      isActive
                        ? 'bg-[#35373c] text-white'
                        : 'text-gray-400 hover:bg-[#35373c]/40 hover:text-gray-200'
                    }`}
                  >
                    <Hash className={`w-4 h-4 shrink-0 ${isActive ? 'text-gray-200' : 'text-gray-500 group-hover:text-gray-400'}`} />
                    <span className="truncate">{channel.name}</span>
                  </button>
                );
              })}
          </div>
        ))}

        {/* Quick Shortcut Hubs inside channel list */}
        <div className="pt-2 border-t border-[#35373c]/60 space-y-1">
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-2">
            Quick Hubs
          </div>
          <button
            type="button"
            onClick={() => setActiveGameModal('quests')}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-semibold text-amber-400 hover:bg-[#35373c]/60 transition"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" /> Daily Quests
            </span>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-bold">
              Rewards
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveGameModal('shop')}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-semibold text-purple-400 hover:bg-[#35373c]/60 transition"
          >
            <span className="flex items-center gap-2">
              <Gift className="w-3.5 h-3.5" /> Lucky Shop
            </span>
            <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.2 rounded font-bold">
              Buffs
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveGameModal('leaderboard')}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-semibold text-emerald-400 hover:bg-[#35373c]/60 transition"
          >
            <span className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5" /> Leaderboard
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-bold">
              Rank
            </span>
          </button>
        </div>
      </div>

      {/* User Bar at Bottom */}
      <div className="h-14 bg-[#232428] px-2.5 flex items-center justify-between border-t border-[#1e1f22]">
        <div className="flex items-center gap-2 min-w-0">
          <div className="relative shrink-0">
            <img
              src={SIMULATED_MEMBERS[1].avatar}
              alt="Avatar"
              className="w-8 h-8 rounded-full object-cover border border-[#3f4147]"
            />
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-[#232428]" />
          </div>

          <div className="min-w-0">
            <div className="text-xs font-bold text-white truncate flex items-center gap-1">
              <span>You</span>
              <span className="text-[10px] text-amber-400 font-extrabold bg-amber-950/60 px-1 rounded">
                Lvl {stats.level}
              </span>
            </div>
            <div className="text-[11px] font-bold text-emerald-400 truncate">
              💵 {formatCash(stats.cash)}
            </div>
          </div>
        </div>

        {/* Audio Toggle & Reset */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            title={soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-[#35373c] transition"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-red-400" />}
          </button>
          <button
            type="button"
            title="Reset Game Data"
            onClick={resetAllData}
            className="p-1.5 text-gray-400 hover:text-red-400 rounded hover:bg-[#35373c] transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
