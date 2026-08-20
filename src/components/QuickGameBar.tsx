import React, { useState } from 'react';
import { CoinflipGame } from './games/CoinflipGame';
import { SlotsGame } from './games/SlotsGame';
import { BlackjackGame } from './games/BlackjackGame';
import { DiceGame } from './games/DiceGame';
import { Coins, Sparkles, Shield, Dices, Compass } from 'lucide-react';
import { useGame } from '../context/GameContext';

export const QuickGameBar: React.FC = () => {
  const [selectedGame, setSelectedGame] = useState<'cf' | 'slots' | 'bj' | 'dice'>('cf');
  const { setActiveGameModal } = useGame();

  return (
    <div id="visual-arcade-hub" className="flex-1 bg-[#313338] overflow-y-auto p-4 md:p-6 space-y-6">
      {/* Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 max-w-xl mx-auto bg-[#2b2d31] p-1.5 rounded-xl border border-[#3f4147]">
        <button
          type="button"
          onClick={() => setSelectedGame('cf')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
            selectedGame === 'cf'
              ? 'bg-amber-500 text-gray-950 shadow-md font-extrabold'
              : 'text-gray-300 hover:bg-[#35373c]'
          }`}
        >
          <Coins className="w-4 h-4" /> Coinflip
        </button>
        <button
          type="button"
          onClick={() => setSelectedGame('slots')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
            selectedGame === 'slots'
              ? 'bg-pink-500 text-white shadow-md font-extrabold'
              : 'text-gray-300 hover:bg-[#35373c]'
          }`}
        >
          <Sparkles className="w-4 h-4" /> Slots
        </button>
        <button
          type="button"
          onClick={() => setSelectedGame('bj')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
            selectedGame === 'bj'
              ? 'bg-emerald-600 text-white shadow-md font-extrabold'
              : 'text-gray-300 hover:bg-[#35373c]'
          }`}
        >
          <Shield className="w-4 h-4" /> Blackjack
        </button>
        <button
          type="button"
          onClick={() => setSelectedGame('dice')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
            selectedGame === 'dice'
              ? 'bg-indigo-600 text-white shadow-md font-extrabold'
              : 'text-gray-300 hover:bg-[#35373c]'
          }`}
        >
          <Dices className="w-4 h-4" /> Dice Duel
        </button>
        <button
          type="button"
          onClick={() => setActiveGameModal('zoo')}
          className="flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 text-purple-400 hover:bg-[#35373c] transition border border-purple-500/30"
        >
          <Compass className="w-4 h-4" /> Safari Zoo
        </button>
      </div>

      {/* Selected Game Card */}
      <div className="max-w-xl mx-auto">
        {selectedGame === 'cf' && <CoinflipGame />}
        {selectedGame === 'slots' && <SlotsGame />}
        {selectedGame === 'bj' && <BlackjackGame />}
        {selectedGame === 'dice' && <DiceGame />}
      </div>
    </div>
  );
};
