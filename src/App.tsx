import React, { useState } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { DiscordServerList } from './components/DiscordServerList';
import { DiscordChannelList } from './components/DiscordChannelList';
import { DiscordNavbar } from './components/DiscordNavbar';
import { DiscordChat } from './components/DiscordChat';
import { DiscordInputBar } from './components/DiscordInputBar';
import { DiscordMemberList } from './components/DiscordMemberList';
import { QuickGameBar } from './components/QuickGameBar';
import { HuntZooModal } from './components/games/HuntZooModal';
import { ShopModal } from './components/games/ShopModal';
import { QuestsModal } from './components/games/QuestsModal';
import { LeaderboardModal } from './components/games/LeaderboardModal';
import { HelpModal } from './components/games/HelpModal';
import { DiscordBotModal } from './components/DiscordBotModal';

const DiscordAppInner: React.FC = () => {
  const { activeGameModal, setActiveGameModal } = useGame();
  const [activeView, setActiveView] = useState<'chat' | 'arcade'>('chat');
  const [mobileChannelOpen, setMobileChannelOpen] = useState<boolean>(false);

  return (
    <div id="owo-bot-app" className="h-screen w-screen flex flex-col bg-[#1e1f22] overflow-hidden font-sans text-gray-100 antialiased select-none">
      {/* Discord Layout Body */}
      <div className="flex-1 flex h-full overflow-hidden">
        {/* Leftmost Server List */}
        <DiscordServerList />

        {/* Channels Sidebar */}
        <div className={`h-full ${mobileChannelOpen ? 'block absolute z-40' : 'hidden md:block'}`}>
          <DiscordChannelList />
        </div>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col h-full min-w-0 bg-[#313338] relative">
          <DiscordNavbar
            activeView={activeView}
            setActiveView={setActiveView}
          />

          {/* Toggle View: Real-time Discord Chat vs Visual Arcade Gamepad */}
          {activeView === 'chat' ? (
            <div className="flex-1 flex flex-col h-full min-h-0">
              <DiscordChat />
              <DiscordInputBar />
            </div>
          ) : (
            <QuickGameBar />
          )}
        </main>

        {/* Right Member List */}
        <DiscordMemberList />
      </div>

      {/* Popups & Modals */}
      {activeGameModal === 'zoo' && (
        <HuntZooModal onClose={() => setActiveGameModal(null)} />
      )}
      {activeGameModal === 'shop' && (
        <ShopModal onClose={() => setActiveGameModal(null)} />
      )}
      {activeGameModal === 'quests' && (
        <QuestsModal onClose={() => setActiveGameModal(null)} />
      )}
      {activeGameModal === 'leaderboard' && (
        <LeaderboardModal onClose={() => setActiveGameModal(null)} />
      )}
      {activeGameModal === 'help' && (
        <HelpModal onClose={() => setActiveGameModal(null)} />
      )}
      {activeGameModal === 'bot' && (
        <DiscordBotModal onClose={() => setActiveGameModal(null)} />
      )}
    </div>
  );
};

export default function App() {
  return (
    <GameProvider>
      <DiscordAppInner />
    </GameProvider>
  );
}
