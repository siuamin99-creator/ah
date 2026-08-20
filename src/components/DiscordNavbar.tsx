import React, { useState, useEffect } from 'react';
import { Hash, Sparkles, Trophy, ShoppingBag, Compass, Gift, Volume2, VolumeX, HelpCircle, Flame, Bot } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { formatCash } from '../utils/economy';

interface Props {
  onToggleMemberList?: () => void;
  showMemberList?: boolean;
  activeView: 'chat' | 'arcade';
  setActiveView: (view: 'chat' | 'arcade') => void;
}

export const DiscordNavbar: React.FC<Props> = ({
  activeView,
  setActiveView
}) => {
  const {
    currentChannelId,
    servers,
    currentServerId,
    stats,
    soundEnabled,
    setSoundEnabled,
    setActiveGameModal,
    claimDaily,
    executeCommand
  } = useGame();

  const [botOnline, setBotOnline] = useState<boolean>(true);

  useEffect(() => {
    const checkBot = async () => {
      try {
        const res = await fetch('/api/bot/status');
        if (res.ok) {
          const data = await res.json();
          setBotOnline(data.online);
        }
      } catch {
        /* ignore */
      }
    };
    checkBot();
    const interval = setInterval(checkBot, 5000);
    return () => clearInterval(interval);
  }, []);

  const currentServer = servers.find(s => s.id === currentServerId) || servers[0];
  const currentChannel = currentServer.channels.find(c => c.id === currentChannelId) || currentServer.channels[0];

  return (
    <header id="discord-navbar" className="h-12 bg-[#313338] border-b border-[#2b2d31] px-4 flex items-center justify-between shrink-0 select-none shadow-sm z-10">
      {/* Left: Channel Name & Topic */}
      <div className="flex items-center gap-2.5 min-w-0">
        <Hash className="w-5 h-5 text-gray-400 shrink-0" />
        <span className="text-sm font-bold text-white shrink-0">{currentChannel.name}</span>
        <div className="h-4 w-[1px] bg-[#3f4147] mx-1 hidden sm:block shrink-0" />
        <span className="text-xs text-gray-400 truncate hidden md:block max-w-xs xl:max-w-md">
          {currentChannel.topic}
        </span>
      </div>

      {/* Right: Quick Action Buttons & Wallet */}
      <div className="flex items-center gap-2">
        {/* Discord Bot Status Indicator & Server Launcher */}
        <button
          id="btn-bot-status-modal"
          type="button"
          onClick={() => setActiveGameModal('bot')}
          title="Discord Bot Server Host & Invite Settings"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#5865F2]/15 hover:bg-[#5865F2]/25 border border-[#5865F2]/40 text-xs font-bold transition group"
        >
          <div className="relative">
            <Bot className="w-3.5 h-3.5 text-[#5865F2]" />
            <div
              className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${
                botOnline ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
              }`}
            />
          </div>
          <span className="text-[#5865F2] hidden sm:inline">
            {botOnline ? 'Bot Online' : 'Bot Connect'}
          </span>
          <span className="text-[10px] bg-[#5865F2] text-white px-1 rounded font-extrabold hidden md:inline">
            Invite
          </span>
        </button>

        {/* Streak indicator */}
        {stats.currentStreak > 0 && (
          <div className="hidden sm:flex items-center gap-1 bg-orange-500/10 border border-orange-500/30 text-orange-400 px-2 py-0.5 rounded-full text-xs font-bold">
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span>{stats.currentStreak} Streak</span>
          </div>
        )}

        {/* View Switcher: Chat Stream vs Visual Arcade */}
        <div className="flex items-center bg-[#1e1f22] p-0.5 rounded-lg border border-[#35373c]">
          <button
            type="button"
            onClick={() => setActiveView('chat')}
            className={`px-2.5 py-1 rounded-md text-xs font-bold transition ${
              activeView === 'chat'
                ? 'bg-[#5865F2] text-white shadow'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            💬 Discord Chat
          </button>
          <button
            type="button"
            onClick={() => setActiveView('arcade')}
            className={`px-2.5 py-1 rounded-md text-xs font-bold transition ${
              activeView === 'arcade'
                ? 'bg-pink-600 text-white shadow'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            🎮 Visual Arcade
          </button>
        </div>

        {/* Wallet Balance Pill */}
        <div className="flex items-center gap-1.5 bg-[#1e1f22] border border-[#35373c] px-3 py-1 rounded-lg text-xs font-extrabold text-emerald-400">
          <span>💵</span>
          <span>{formatCash(stats.cash)}</span>
        </div>

        {/* Admin 200M Grant Button */}
        <button
          id="btn-nav-admin-cash"
          type="button"
          onClick={() => executeCommand('m givecash 200000000')}
          title="Admin ID 1522197368601055304: Add 200M OwO Cash"
          className="flex items-center gap-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 font-extrabold px-2.5 py-1 rounded-lg text-xs transition active:scale-95 shadow-sm"
        >
          <span>👑</span>
          <span className="hidden sm:inline">+200M Cash</span>
        </button>

        {/* Daily Reward Button */}
        <button
          id="btn-nav-daily"
          type="button"
          onClick={claimDaily}
          title="Claim Daily Cowoncy"
          className="flex items-center gap-1 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-gray-950 font-black px-2.5 py-1 rounded-lg text-xs shadow transition active:scale-95"
        >
          <Gift className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Daily</span>
        </button>

        {/* Zoo Modal */}
        <button
          type="button"
          onClick={() => setActiveGameModal('zoo')}
          title="OwO Zoo Sanctuary"
          className="p-1.5 text-gray-400 hover:text-purple-400 hover:bg-[#35373c] rounded-lg transition"
        >
          <Compass className="w-4 h-4" />
        </button>

        {/* Shop Modal */}
        <button
          type="button"
          onClick={() => setActiveGameModal('shop')}
          title="Shop"
          className="p-1.5 text-gray-400 hover:text-amber-400 hover:bg-[#35373c] rounded-lg transition"
        >
          <ShoppingBag className="w-4 h-4" />
        </button>

        {/* Leaderboard Modal */}
        <button
          type="button"
          onClick={() => setActiveGameModal('leaderboard')}
          title="Leaderboard"
          className="p-1.5 text-gray-400 hover:text-yellow-400 hover:bg-[#35373c] rounded-lg transition"
        >
          <Trophy className="w-4 h-4" />
        </button>

        {/* Sound toggle */}
        <button
          type="button"
          onClick={() => setSoundEnabled(!soundEnabled)}
          title={soundEnabled ? 'Mute SFX' : 'Unmute SFX'}
          className="p-1.5 text-gray-400 hover:text-white hover:bg-[#35373c] rounded-lg transition"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-red-400" />}
        </button>

        {/* Help */}
        <button
          type="button"
          onClick={() => setActiveGameModal('help')}
          title="Commands Guide"
          className="p-1.5 text-gray-400 hover:text-white hover:bg-[#35373c] rounded-lg transition"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

