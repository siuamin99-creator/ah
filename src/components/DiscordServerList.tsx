import React from 'react';
import { useGame } from '../context/GameContext';
import { Sparkles, Plus, Compass } from 'lucide-react';

export const DiscordServerList: React.FC = () => {
  const { servers, currentServerId, setCurrentServerId, setActiveGameModal } = useGame();

  return (
    <aside id="discord-server-list" className="w-[72px] bg-[#1e1f22] flex flex-col items-center py-3 space-y-2 select-none shrink-0 z-20 border-r border-[#2b2d31]">
      {/* Home / OwO Bot Icon */}
      <button
        id="btn-server-home"
        type="button"
        title="OwO Main Lounge"
        onClick={() => setCurrentServerId('owo_official')}
        className="relative group flex items-center justify-center"
      >
        <div
          className={`absolute left-0 w-1 bg-white rounded-r transition-all duration-200 ${
            currentServerId === 'owo_official' ? 'h-10' : 'h-2 group-hover:h-5 opacity-0 group-hover:opacity-100'
          }`}
        />
        <div
          className={`w-12 h-12 rounded-[24px] group-hover:rounded-[16px] transition-all duration-200 flex items-center justify-center font-extrabold text-lg shadow-md ${
            currentServerId === 'owo_official'
              ? 'bg-[#5865F2] text-white rounded-[16px]'
              : 'bg-[#313338] text-pink-400 group-hover:bg-[#5865F2] group-hover:text-white'
          }`}
        >
          🌸
        </div>
      </button>

      <div className="w-8 h-[2px] bg-[#35373c] rounded my-1" />

      {/* Other Servers */}
      {servers.map((server) => {
        const isActive = currentServerId === server.id;
        return (
          <button
            key={server.id}
            id={`btn-server-${server.id}`}
            type="button"
            title={server.name}
            onClick={() => setCurrentServerId(server.id)}
            className="relative group flex items-center justify-center"
          >
            <div
              className={`absolute left-0 w-1 bg-white rounded-r transition-all duration-200 ${
                isActive ? 'h-10' : 'h-2 group-hover:h-5 opacity-0 group-hover:opacity-100'
              }`}
            />
            <div
              className={`w-12 h-12 rounded-[24px] group-hover:rounded-[16px] transition-all duration-200 flex items-center justify-center font-bold text-xl shadow-md ${
                isActive
                  ? 'bg-amber-500 text-gray-950 rounded-[16px]'
                  : 'bg-[#313338] text-gray-300 group-hover:bg-[#5865F2] group-hover:text-white'
              }`}
            >
              {server.icon}
            </div>
          </button>
        );
      })}

      {/* Safari Hub Button */}
      <button
        id="btn-server-zoo"
        type="button"
        title="OwO Zoo Sanctuary"
        onClick={() => setActiveGameModal('zoo')}
        className="w-12 h-12 rounded-[24px] hover:rounded-[16px] bg-[#313338] hover:bg-emerald-600 text-emerald-400 hover:text-white transition-all duration-200 flex items-center justify-center shadow-md group"
      >
        <Compass className="w-5 h-5" />
      </button>

      {/* Shop Hub Button */}
      <button
        id="btn-server-shop"
        type="button"
        title="OwO Shop"
        onClick={() => setActiveGameModal('shop')}
        className="w-12 h-12 rounded-[24px] hover:rounded-[16px] bg-[#313338] hover:bg-purple-600 text-purple-400 hover:text-white transition-all duration-200 flex items-center justify-center shadow-md group"
      >
        <Sparkles className="w-5 h-5" />
      </button>

      {/* Discord Bot Server & Live Gateway Hub */}
      <button
        id="btn-server-bot-hub"
        type="button"
        title="Discord Bot Gateway & Invite Host"
        onClick={() => setActiveGameModal('bot')}
        className="w-12 h-12 rounded-[24px] hover:rounded-[16px] bg-[#5865F2]/20 hover:bg-[#5865F2] text-[#5865F2] hover:text-white border border-[#5865F2]/50 transition-all duration-200 flex items-center justify-center shadow-md group relative"
      >
        <span className="text-lg">🤖</span>
        <div className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
      </button>

      <div className="w-8 h-[2px] bg-[#35373c] rounded my-1" />

      {/* Help / Guide */}
      <button
        id="btn-server-help"
        type="button"
        title="Command Manual"
        onClick={() => setActiveGameModal('help')}
        className="w-12 h-12 rounded-[24px] hover:rounded-[16px] bg-[#313338] hover:bg-[#35373c] text-emerald-400 hover:text-emerald-300 transition-all duration-200 flex items-center justify-center font-black text-sm shadow-md"
      >
        ❓
      </button>
    </aside>
  );
};
