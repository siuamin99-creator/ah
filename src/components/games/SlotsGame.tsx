import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Trophy, Play, RotateCw } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { SLOT_SYMBOLS, SlotSymbol, formatCash } from '../../utils/economy';

export const SlotsGame: React.FC = () => {
  const { stats, executeCommand } = useGame();
  const [bet, setBet] = useState<number>(500);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [displayedReels, setDisplayedReels] = useState<[SlotSymbol, SlotSymbol, SlotSymbol]>([
    SLOT_SYMBOLS[0],
    SLOT_SYMBOLS[1],
    SLOT_SYMBOLS[2]
  ]);
  const [autoSpin, setAutoSpin] = useState<boolean>(false);

  const handleSpin = () => {
    if (bet > stats.cash || isSpinning || bet <= 0) {
      setAutoSpin(false);
      return;
    }
    setIsSpinning(true);

    // Reel shuffle animation intervals
    const interval = setInterval(() => {
      setDisplayedReels([
        SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)],
        SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)],
        SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)]
      ]);
    }, 90);

    setTimeout(() => {
      clearInterval(interval);
      executeCommand(`owo slots ${bet}`, 'slots-jackpot');
      setIsSpinning(false);
    }, 1200);
  };

  // Auto-spin trigger
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (autoSpin && !isSpinning && stats.cash >= bet && bet > 0) {
      timeout = setTimeout(() => {
        handleSpin();
      }, 1500);
    } else if (autoSpin && stats.cash < bet) {
      setAutoSpin(false);
    }
    return () => clearTimeout(timeout);
  }, [autoSpin, isSpinning, stats.cash, bet]);

  const quickAmounts = [100, 500, 1000, 2500, 'Half', 'Max'];

  const setQuickBet = (amt: number | string) => {
    if (typeof amt === 'number') {
      setBet(Math.min(stats.cash, amt));
    } else if (amt === 'Half') {
      setBet(Math.max(1, Math.floor(stats.cash / 2)));
    } else if (amt === 'Max') {
      setBet(stats.cash);
    }
  };

  return (
    <div id="slots-game-container" className="bg-[#2b2d31] rounded-xl border border-[#3f4147] p-4 md:p-6 text-white max-w-xl mx-auto shadow-xl">
      <div className="flex items-center justify-between border-b border-[#3f4147] pb-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-pink-500/20 text-pink-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-100 flex items-center gap-2">
              OwO 3-Reel Slots
              <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                Up to 10x
              </span>
            </h2>
            <p className="text-xs text-gray-400">Match 3 symbols for huge jackpots (`owo slots`)</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-[#1e1f22] px-3 py-1.5 rounded-lg border border-[#35373c]">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold text-gray-300">Jackpot: 10x</span>
        </div>
      </div>

      {/* 3-Reel Display Machine */}
      <div className="bg-[#1e1f22] p-6 rounded-2xl border-2 border-pink-500/30 shadow-inner mb-6 relative overflow-hidden">
        <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-widest font-black text-pink-400 bg-pink-500/10 px-3 py-0.5 rounded-full border border-pink-500/20">
          Lucky OwO Machine
        </div>

        <div className="grid grid-cols-3 gap-3 md:gap-4 mt-4">
          {displayedReels.map((reel, idx) => (
            <div
              key={idx}
              className="h-28 md:h-32 bg-[#2b2d31] rounded-xl border border-[#3f4147] flex flex-col items-center justify-center shadow-lg relative overflow-hidden"
            >
              <div className="absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />
              <motion.span
                animate={isSpinning ? { y: [-20, 20, -20], scale: [0.9, 1.1, 0.9] } : { y: 0, scale: 1 }}
                transition={{ repeat: isSpinning ? Infinity : 0, duration: 0.15 }}
                className="text-4xl md:text-5xl select-none"
              >
                {reel.emoji}
              </motion.span>
              <span className="text-[11px] font-bold text-gray-300 mt-1">{reel.name}</span>
              <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
            </div>
          ))}
        </div>
      </div>

      {/* Paytable Bar */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 bg-[#1e1f22] p-2.5 rounded-lg border border-[#35373c] mb-5 text-center">
        {SLOT_SYMBOLS.map(s => (
          <div key={s.id} className="p-1 rounded bg-[#2b2d31]/60">
            <div className="text-base">{s.emoji}</div>
            <div className="text-[10px] font-bold text-amber-400">{s.threeMatchMultiplier}x</div>
          </div>
        ))}
      </div>

      {/* Bet Amount Selector */}
      <div className="bg-[#1e1f22] p-4 rounded-lg border border-[#35373c] mb-5">
        <div className="flex justify-between items-center text-xs text-gray-400 mb-2">
          <span>Bet per spin:</span>
          <span>Wallet: <strong className="text-emerald-400">💵 {formatCash(stats.cash)} Cash</strong></span>
        </div>
        <div className="relative flex items-center mb-3">
          <span className="absolute left-3 text-gray-400 font-bold">💵</span>
          <input
            id="input-slots-bet"
            type="number"
            min={1}
            max={stats.cash}
            value={bet || ''}
            onChange={e => setBet(Math.max(0, parseInt(e.target.value, 10) || 0))}
            className="w-full bg-[#2b2d31] border border-[#3f4147] rounded-lg py-2 pl-9 pr-4 text-white text-sm font-bold focus:outline-none focus:border-pink-400"
            placeholder="Bet amount..."
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {quickAmounts.map(amt => (
            <button
              key={amt.toString()}
              type="button"
              onClick={() => setQuickBet(amt)}
              disabled={isSpinning}
              className="flex-1 min-w-[50px] py-1 px-2 text-xs bg-[#2b2d31] hover:bg-[#35373c] border border-[#3f4147] rounded text-gray-300 font-semibold transition"
            >
              {typeof amt === 'number' ? `+${formatCash(amt)}` : amt}
            </button>
          ))}
        </div>
      </div>

      {/* Spin and Auto-spin Buttons */}
      <div className="grid grid-cols-4 gap-3">
        <button
          id="btn-spin-slots"
          type="button"
          onClick={handleSpin}
          disabled={isSpinning || bet <= 0 || bet > stats.cash}
          className={`col-span-3 py-3 rounded-lg font-extrabold text-base flex items-center justify-center gap-2 shadow-lg transition-all ${
            isSpinning
              ? 'bg-pink-600/50 text-pink-200 cursor-not-allowed'
              : bet > stats.cash
              ? 'bg-red-500/20 text-red-400 border border-red-500/30 cursor-not-allowed'
              : 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white hover:shadow-pink-500/25 active:scale-[0.98]'
          }`}
        >
          {isSpinning ? <RotateCw className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
          {isSpinning ? 'Spinning Reels...' : `Spin Slots (${formatCash(bet)} Cash)`}
        </button>

        <button
          id="btn-autospin-slots"
          type="button"
          onClick={() => setAutoSpin(!autoSpin)}
          className={`py-3 rounded-lg font-bold text-xs flex flex-col items-center justify-center transition border ${
            autoSpin
              ? 'bg-amber-500 text-gray-950 border-amber-300 font-extrabold animate-pulse'
              : 'bg-[#1e1f22] text-gray-300 border-[#3f4147] hover:bg-[#35373c]'
          }`}
        >
          <span>Auto</span>
          <span className="text-[10px] opacity-80">{autoSpin ? 'ON' : 'OFF'}</span>
        </button>
      </div>
    </div>
  );
};
