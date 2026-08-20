import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Dices, Play } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { formatCash } from '../../utils/economy';

export const DiceGame: React.FC = () => {
  const { stats, executeCommand } = useGame();
  const [bet, setBet] = useState<number>(500);
  const [mode, setMode] = useState<'duel' | 'high' | 'low'>('duel');
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [diceVals, setDiceVals] = useState<[number, number]>([3, 4]);

  const handleRoll = () => {
    if (bet > stats.cash || isRolling || bet <= 0) return;
    setIsRolling(true);

    const interval = setInterval(() => {
      setDiceVals([
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1
      ]);
    }, 80);

    setTimeout(() => {
      clearInterval(interval);
      if (mode === 'duel') {
        executeCommand(`owo roll ${bet}`, 'gambling-den');
      } else {
        executeCommand(`owo roll ${bet} ${mode}`, 'gambling-den');
      }
      setIsRolling(false);
    }, 1000);
  };

  const pipRender = (num: number) => {
    const diceFaces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    return diceFaces[num - 1] || '⚅';
  };

  const quickAmounts = [100, 500, 1000, 2500, 'Half', 'Max'];

  return (
    <div id="dice-game-container" className="bg-[#2b2d31] rounded-xl border border-[#3f4147] p-4 md:p-6 text-white max-w-xl mx-auto shadow-xl">
      <div className="flex items-center justify-between border-b border-[#3f4147] pb-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
            <Dices className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-100">Dice Duel & High/Low</h2>
            <p className="text-xs text-gray-400">Roll 2 dice against OwO Bot or guess total (`owo roll`)</p>
          </div>
        </div>
        <div className="text-xs bg-[#1e1f22] px-3 py-1.5 rounded-lg border border-[#35373c] text-indigo-300 font-bold">
          2.0x Payout
        </div>
      </div>

      {/* Mode Selector */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <button
          type="button"
          onClick={() => setMode('duel')}
          className={`py-2 px-3 rounded-lg text-xs font-bold transition ${
            mode === 'duel' ? 'bg-indigo-600 text-white shadow' : 'bg-[#1e1f22] text-gray-400 hover:bg-[#35373c]'
          }`}
        >
          ⚔️ Bot Duel
        </button>
        <button
          type="button"
          onClick={() => setMode('high')}
          className={`py-2 px-3 rounded-lg text-xs font-bold transition ${
            mode === 'high' ? 'bg-indigo-600 text-white shadow' : 'bg-[#1e1f22] text-gray-400 hover:bg-[#35373c]'
          }`}
        >
          📈 High (7-12)
        </button>
        <button
          type="button"
          onClick={() => setMode('low')}
          className={`py-2 px-3 rounded-lg text-xs font-bold transition ${
            mode === 'low' ? 'bg-indigo-600 text-white shadow' : 'bg-[#1e1f22] text-gray-400 hover:bg-[#35373c]'
          }`}
        >
          📉 Low (2-6)
        </button>
      </div>

      {/* Dice Roll Visual */}
      <div className="bg-[#1e1f22] p-8 rounded-2xl border border-[#35373c] flex items-center justify-center gap-6 mb-6">
        <motion.div
          animate={isRolling ? { rotate: [0, 360, 720], scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 0.8, ease: 'linear' }}
          className="w-24 h-24 bg-white rounded-2xl shadow-xl flex items-center justify-center text-6xl text-gray-900 select-none font-bold"
        >
          {pipRender(diceVals[0])}
        </motion.div>
        <div className="text-2xl font-black text-indigo-400">+</div>
        <motion.div
          animate={isRolling ? { rotate: [0, -360, -720], scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 0.8, ease: 'linear' }}
          className="w-24 h-24 bg-white rounded-2xl shadow-xl flex items-center justify-center text-6xl text-gray-900 select-none font-bold"
        >
          {pipRender(diceVals[1])}
        </motion.div>
      </div>

      {/* Bet Box */}
      <div className="bg-[#1e1f22] p-4 rounded-lg border border-[#35373c] mb-5">
        <div className="flex justify-between items-center text-xs text-gray-400 mb-2">
          <span>Bet Amount:</span>
          <span>Wallet: <strong className="text-emerald-400">💵 {formatCash(stats.cash)} Cash</strong></span>
        </div>
        <div className="relative flex items-center mb-3">
          <span className="absolute left-3 text-gray-400 font-bold">💵</span>
          <input
            id="input-dice-bet"
            type="number"
            min={1}
            max={stats.cash}
            value={bet || ''}
            onChange={e => setBet(Math.max(0, parseInt(e.target.value, 10) || 0))}
            className="w-full bg-[#2b2d31] border border-[#3f4147] rounded-lg py-2 pl-9 pr-4 text-white text-sm font-bold focus:outline-none focus:border-indigo-400"
            placeholder="Bet amount..."
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {quickAmounts.map(amt => (
            <button
              key={amt.toString()}
              type="button"
              onClick={() => {
                if (typeof amt === 'number') setBet(Math.min(stats.cash, amt));
                else if (amt === 'Half') setBet(Math.floor(stats.cash / 2));
                else if (amt === 'Max') setBet(stats.cash);
              }}
              className="flex-1 py-1 px-2 text-xs bg-[#2b2d31] hover:bg-[#35373c] border border-[#3f4147] rounded text-gray-300 font-semibold transition"
            >
              {typeof amt === 'number' ? `+${formatCash(amt)}` : amt}
            </button>
          ))}
        </div>
      </div>

      <button
        id="btn-roll-dice"
        type="button"
        onClick={handleRoll}
        disabled={isRolling || bet <= 0 || bet > stats.cash}
        className="w-full py-3 rounded-lg font-extrabold text-base flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg transition active:scale-[0.98] disabled:opacity-50"
      >
        <Play className="w-5 h-5 fill-current" />
        {isRolling ? 'Rolling Dice...' : `Roll for ${formatCash(bet * 2)} Cash`}
      </button>
    </div>
  );
};
