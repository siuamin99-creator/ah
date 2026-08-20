import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Terminal, PlusCircle } from 'lucide-react';
import { useGame } from '../context/GameContext';

const AUTOCOMPLETE_COMMANDS = [
  { cmd: 'm cf 500 h', name: 'm cf <amt> [h/t]', desc: 'Flip coin with heads or tails (2.0x cash)' },
  { cmd: 'm slots 500', name: 'm slots <amt>', desc: 'Spin 3-reel slot machine (up to 12x jackpot)' },
  { cmd: 'm bj 500', name: 'm bj <amt>', desc: 'Play Blackjack 21 (Hit, Stand, Double)' },
  { cmd: 'm hunt', name: 'm hunt', desc: 'Venture into the wild to catch cute & mythical pets' },
  { cmd: 'm daily', name: 'm daily', desc: 'Claim daily streak cowoncy and XP' },
  { cmd: 'm cash', name: 'm cash', desc: 'Check wallet balance, level, and stats' },
  { cmd: 'm zoo', name: 'm zoo', desc: 'View all animals in your sanctuary' },
  { cmd: 'm sell all', name: 'm sell all', desc: 'Sell all caught pets for instant cash' },
  { cmd: 'm shop', name: 'm shop', desc: 'Browse lucky clovers & permanent upgrades' },
  { cmd: 'm quest', name: 'm quest', desc: 'View daily quests & bounties' },
  { cmd: 'm roll 500', name: 'm roll <amt>', desc: 'Roll 2 dice duel against bot' },
  { cmd: 'm owner', name: 'm owner', desc: 'View Founder & CEO Wifey leadership credentials' },
  { cmd: 'm beg', name: 'm beg', desc: 'Claim emergency bailout cash if broke' }
];

export const DiscordInputBar: React.FC = () => {
  const { currentChannelId, executeCommand, stats } = useGame();
  const [input, setInput] = useState<string>('');
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredCommands = AUTOCOMPLETE_COMMANDS.filter(c =>
    input.trim().length > 0 && (
      c.cmd.toLowerCase().includes(input.toLowerCase()) ||
      c.name.toLowerCase().includes(input.toLowerCase()) ||
      input.startsWith('m') ||
      input.startsWith('o') ||
      input.startsWith('owo') ||
      input.startsWith('/')
    )
  );

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    executeCommand(input.trim(), currentChannelId);
    setInput('');
    setShowSuggestions(false);
  };

  const handleSelectSuggestion = (cmd: string) => {
    executeCommand(cmd, currentChannelId);
    setInput('');
    setShowSuggestions(false);
  };

  return (
    <div id="discord-input-container" className="p-3 bg-[#313338] border-t border-[#2b2d31] relative">
      {/* Quick Action Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-1 scrollbar-none text-[11px]">
        <span className="text-gray-400 font-bold shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-pink-400" /> Quick:
        </span>
        <button
          type="button"
          onClick={() => executeCommand('m cf 500 h')}
          className="px-2 py-0.5 rounded-full bg-[#2b2d31] hover:bg-[#35373c] border border-[#3f4147] text-amber-300 font-bold shrink-0 transition"
        >
          🪙 Flip 500
        </button>
        <button
          type="button"
          onClick={() => executeCommand('m slots 500')}
          className="px-2 py-0.5 rounded-full bg-[#2b2d31] hover:bg-[#35373c] border border-[#3f4147] text-pink-300 font-bold shrink-0 transition"
        >
          🎰 Slots 500
        </button>
        <button
          type="button"
          onClick={() => executeCommand('m bj 500')}
          className="px-2 py-0.5 rounded-full bg-[#2b2d31] hover:bg-[#35373c] border border-[#3f4147] text-emerald-300 font-bold shrink-0 transition"
        >
          🃏 BJ 500
        </button>
        <button
          type="button"
          onClick={() => executeCommand('m hunt')}
          className="px-2 py-0.5 rounded-full bg-[#2b2d31] hover:bg-[#35373c] border border-[#3f4147] text-purple-300 font-bold shrink-0 transition"
        >
          🐾 Hunt
        </button>
        <button
          type="button"
          onClick={() => executeCommand('m daily')}
          className="px-2 py-0.5 rounded-full bg-[#2b2d31] hover:bg-[#35373c] border border-[#3f4147] text-yellow-300 font-bold shrink-0 transition"
        >
          🎁 Daily
        </button>
        <button
          type="button"
          onClick={() => executeCommand('m cash')}
          className="px-2 py-0.5 rounded-full bg-[#2b2d31] hover:bg-[#35373c] border border-[#3f4147] text-cyan-300 font-bold shrink-0 transition"
        >
          💵 Cash
        </button>
        <button
          type="button"
          onClick={() => executeCommand('m sell all')}
          className="px-2 py-0.5 rounded-full bg-[#2b2d31] hover:bg-[#35373c] border border-[#3f4147] text-green-300 font-bold shrink-0 transition"
        >
          💰 Sell All
        </button>
      </div>

      {/* Auto-complete Popup */}
      {showSuggestions && filteredCommands.length > 0 && (
        <div className="absolute bottom-16 left-3 right-3 max-w-xl bg-[#2b2d31] rounded-xl border border-[#3f4147] shadow-2xl p-2 z-30 max-h-60 overflow-y-auto space-y-1">
          <div className="text-[10px] uppercase font-bold text-gray-400 px-2 py-1 flex items-center gap-1">
            <Terminal className="w-3 h-3" /> Matching OwO Bot Commands
          </div>
          {filteredCommands.slice(0, 6).map((cmd, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectSuggestion(cmd.cmd)}
              className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#35373c] text-xs transition flex items-center justify-between group"
            >
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-pink-400 group-hover:text-pink-300">
                  {cmd.name}
                </span>
                <span className="text-gray-400 text-[11px] truncate max-w-xs">{cmd.desc}</span>
              </div>
              <span className="text-[10px] bg-[#1e1f22] text-gray-400 px-1.5 py-0.5 rounded font-mono">
                Tab / Click
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Form Input */}
      <form onSubmit={handleSend} className="relative flex items-center">
        <button
          type="button"
          title="Command Menu"
          onClick={() => setShowSuggestions(!showSuggestions)}
          className="absolute left-3 text-gray-400 hover:text-white p-1 rounded-full hover:bg-[#35373c] transition"
        >
          <PlusCircle className="w-5 h-5" />
        </button>

        <input
          ref={inputRef}
          id="chat-command-input"
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setShowSuggestions(e.target.value.length > 0);
          }}
          onFocus={() => setShowSuggestions(input.length > 0)}
          placeholder={`Message #${currentChannelId} or type m cash, m hunt, m cf 500 h, m slots 500...`}
          className="w-full bg-[#383a40] text-gray-100 placeholder-gray-400 text-sm rounded-lg py-2.5 pl-11 pr-12 focus:outline-none focus:ring-1 focus:ring-[#5865F2]"
        />

        <button
          id="btn-send-message"
          type="submit"
          disabled={!input.trim()}
          className="absolute right-2.5 p-1.5 bg-[#5865F2] hover:bg-[#4752C4] disabled:bg-gray-600/40 text-white rounded-md transition shadow-sm"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
