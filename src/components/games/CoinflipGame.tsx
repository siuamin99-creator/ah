import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coins, Flame, RotateCcw, Zap, Sparkles } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { formatCash } from '../../utils/economy';

export const CoinflipGame: React.FC = () => {
  const { stats, executeCommand, shopItems } = useGame();
  const [bet, setBet] = useState<number>(500);
  const [choice, setChoice] = useState<'heads' | 'tails'>('heads');
  const [isFlipping, setIsFlipping] = useState<boolean>(false);
  const [lastResult, setLastResult] = useState<{ side: 'heads' | 'tails'; won: boolean; payout: number } | null>(null);

  const hasClover = shopItems.some(i => i.id === 'lucky_clover' && i.owned);

  const handleFlip = () => {
    if (bet > stats.cash || isFlipping) return;
    setIsFlipping(true);
    setLastResult(null);

    setTimeout(() => {
      // Execute command through central engine
      executeCommand(`owo cf ${bet} ${choice}`, 'coinflip-arena');
      setIsFlipping(false);
    }, 1000);
  };

  const quickAmounts = [100, 500, 1000, 2500, 5000, 'Half', 'All'];

  const setQuickBet = (amt: number | string) => {
    if (typeof amt === 'number') {
      setBet(Math.min(stats.cash, amt));
    } else if (amt === 'Half') {
      setBet(Math.max(1, Math.floor(stats.cash / 2)));
    } else if (amt === 'All') {
      setBet(stats.cash);
    }
  };

  return (
    <div id="coinflip-game-container" className="bg-[#2b2d31] rounded-xl border border-[#3f4147] p-4 md:p-6 text-white max-w-xl mx-auto shadow-xl">
      <div className="flex items-center justify-between border-b border-[#3f4147] pb-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-100 flex items-center gap-2">
              Coinflip Arena
              {hasClover && (
                <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-500/30">
                  <Sparkles className="w-3 h-3" /> +5% Luck Active
                </span>
              )}
            </h2>
            <p className="text-xs text-gray-400">Double your cash on 50/50 odds (`owo cf`)</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-[#1e1f22] px-3 py-1.5 rounded-lg border border-[#35373c]">
          <Flame className="w-4 h-4 text-orange-400" />
          <span className="text-xs font-semibold text-gray-300">Streak:</span>
          <span className="text-xs font-bold text-orange-400">{stats.currentStreak}</span>
        </div>
      </div>

      {/* Coin Animation Area */}
      <div className="flex flex-col items-center justify-center my-6 py-4">
        <motion.div
          id="animated-coin"
          animate={isFlipping ? {
            rotateY: [0, 1800],
            y: [0, -60, 0],
            scale: [1, 1.25, 1]
          } : { rotateY: 0, y: 0, scale: 1 }}
          transition={{ duration: 1.0, ease: 'easeInOut' }}
          className="w-32 h-32 rounded-full border-4 border-amber-400 bg-gradient-to-br from-amber-300 via-amber-500 to-yellow-600 shadow-2xl flex flex-col items-center justify-center text-gray-900 font-extrabold select-none cursor-pointer"
          onClick={() => !isFlipping && setChoice(choice === 'heads' ? 'tails' : 'heads')}
        >
          <span className="text-3xl">{choice === 'heads' ? '👑' : '🦅'}</span>
          <span className="text-xs uppercase tracking-wider font-black mt-1">
            {choice === 'heads' ? 'HEADS' : 'TAILS'}
          </span>
          <span className="text-[10px] opacity-75 font-semibold">2.0x Payout</span>
        </motion.div>

        <p className="text-xs text-gray-400 mt-4 flex items-center gap-1">
          <RotateCcw className="w-3.5 h-3.5" /> Click coin or buttons below to switch side
        </p>
      </div>

      {/* Side Selector */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <button
          id="btn-select-heads"
          type="button"
          onClick={() => setChoice('heads')}
          disabled={isFlipping}
          className={`py-2.5 px-4 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${
            choice === 'heads'
              ? 'bg-amber-500 text-gray-950 ring-2 ring-amber-300 shadow-md'
              : 'bg-[#1e1f22] text-gray-300 hover:bg-[#35373c]'
          }`}
        >
          👑 Heads (h)
        </button>
        <button
          id="btn-select-tails"
          type="button"
          onClick={() => setChoice('tails')}
          disabled={isFlipping}
          className={`py-2.5 px-4 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${
            choice === 'tails'
              ? 'bg-amber-500 text-gray-950 ring-2 ring-amber-300 shadow-md'
              : 'bg-[#1e1f22] text-gray-300 hover:bg-[#35373c]'
          }`}
        >
          🦅 Tails (t)
        </button>
      </div>

      {/* Bet Amount Selector */}
      <div className="bg-[#1e1f22] p-4 rounded-lg border border-[#35373c] mb-5">
        <div className="flex justify-between items-center text-xs text-gray-400 mb-2">
          <span>Wager Amount:</span>
          <span>Wallet: <strong className="text-emerald-400">💵 {formatCash(stats.cash)} Cash</strong></span>
        </div>
        <div className="relative flex items-center mb-3">
          <span className="absolute left-3 text-gray-400 font-bold">💵</span>
          <input
            id="input-cf-bet"
            type="number"
            min={1}
            max={stats.cash}
            value={bet || ''}
            onChange={e => setBet(Math.max(0, parseInt(e.target.value, 10) || 0))}
            className="w-full bg-[#2b2d31] border border-[#3f4147] rounded-lg py-2 pl-9 pr-4 text-white text-sm font-bold focus:outline-none focus:border-amber-400"
            placeholder="Enter bet amount..."
          />
        </div>

        {/* Quick Bet Buttons */}
        <div className="flex flex-wrap gap-1.5">
          {quickAmounts.map((amt) => (
            <button
              key={amt.toString()}
              type="button"
              onClick={() => setQuickBet(amt)}
              disabled={isFlipping}
              className="flex-1 min-w-[50px] py-1 px-2 text-xs bg-[#2b2d31] hover:bg-[#35373c] border border-[#3f4147] rounded text-gray-300 font-semibold transition"
            >
              {typeof amt === 'number' ? `+${formatCash(amt)}` : amt}
            </button>
          ))}
        </div>
      </div>

      {/* Flip Button */}
      <button
        id="btn-execute-cf"
        type="button"
        onClick={handleFlip}
        disabled={isFlipping || bet <= 0 || bet > stats.cash}
        className={`w-full py-3 rounded-lg font-extrabold text-base flex items-center justify-center gap-2 shadow-lg transition-all ${
          isFlipping
            ? 'bg-amber-600/50 text-amber-200 cursor-not-allowed'
            : bet > stats.cash
            ? 'bg-red-500/20 text-red-400 border border-red-500/30 cursor-not-allowed'
            : 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-gray-950 hover:shadow-amber-500/25 active:scale-[0.98]'
        }`}
      >
        <Zap className="w-5 h-5 fill-current" />
        {isFlipping ? 'Flipping in progress...' : `Flip for ${formatCash(bet * 2)} Cash`}
      </button>
    </div>
  );
};
