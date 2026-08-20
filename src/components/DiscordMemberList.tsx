import React from 'react';
import { SIMULATED_MEMBERS } from '../data/items';
import { useGame } from '../context/GameContext';
import { Check } from 'lucide-react';
import { formatCash } from '../utils/economy';

export const DiscordMemberList: React.FC = () => {
  const { stats } = useGame();

  const members = SIMULATED_MEMBERS.map(m => {
    if (m.id === 'user_me') {
      return {
        ...m,
        activity: `💵 ${formatCash(stats.cash)} Cash • ${stats.title}`
      };
    }
    return m;
  });

  return (
    <aside id="discord-member-list" className="w-56 bg-[#2b2d31] p-3 hidden lg:flex flex-col h-full border-l border-[#1f2023] shrink-0 select-none overflow-y-auto">
      {/* Category: Bots */}
      <div className="mb-4">
        <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1 px-1">
          Bots — 1
        </h3>
        {members.filter(m => m.isBot).map(member => (
          <div
            key={member.id}
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-[#35373c]/50 transition cursor-pointer group"
          >
            <div className="relative">
              <img
                src={member.avatar}
                alt={member.name}
                className="w-8 h-8 rounded-full object-cover border border-[#3f4147]"
              />
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-[#2b2d31]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-pink-400 truncate">{member.name}</span>
                <span className="bg-[#5865F2] text-white text-[9px] font-black px-1 rounded flex items-center gap-0.5">
                  <Check className="w-2 h-2" /> BOT
                </span>
              </div>
              <p className="text-[10px] text-gray-400 truncate">{member.activity}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Category: Online Players */}
      <div>
        <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1 px-1">
          Online Players — {members.filter(m => !m.isBot).length}
        </h3>
        {members.filter(m => !m.isBot).map(member => (
          <div
            key={member.id}
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-[#35373c]/50 transition cursor-pointer group"
          >
            <div className="relative">
              <img
                src={member.avatar}
                alt={member.name}
                className="w-8 h-8 rounded-full object-cover border border-[#3f4147]"
              />
              <div
                className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-[#2b2d31] ${
                  member.status === 'idle' ? 'bg-amber-500' : member.status === 'dnd' ? 'bg-red-500' : 'bg-emerald-500'
                }`}
              />
            </div>
            <div className="min-w-0">
              <span
                className="text-xs font-bold truncate block"
                style={{ color: member.roleColor || '#ffffff' }}
              >
                {member.name}
              </span>
              <p className="text-[10px] text-gray-400 truncate">{member.activity}</p>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};
