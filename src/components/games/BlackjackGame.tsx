import React, { useState } from 'react';
import { Shield, Play, Plus, Hand, Zap } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { calculateHandScore, formatCash, Card } from '../../utils/economy';

export const BlackjackGame: React.FC = () => {
  const {
    stats,
    activeBlackjack,
    executeCommand,
    blackjackHit,
    blackjackStand,
    blackjackDouble
  } = useGame();

  const [bet, setBet] = useState<number>(500);

  const startNewGame = () => {
    if (bet > stats.cash || bet <= 0) return;
    executeCommand(`owo bj ${bet}`, 'blackjack-table');
  };

  const pScore = activeBlackjack ? calculateHandScore(activeBlackjack.playerCards) : null;
  const dScore = activeBlackjack ? calculateHandScore(activeBlackjack.dealerCards) : null;

  const renderCard = (card: Card, hidden: boolean = false, key?: string | number) => {
    const isRed = card.suit === '♥' || card.suit === '♦';

    if (hidden) {
      return (
        <div
          key={key}
          className="w-16 h-24 md:w-20 md:h-28 rounded-lg bg-gradient-to-br from-indigo-900 to-indigo-950 border-2 border-indigo-500/50 shadow-md flex items-center justify-center text-indigo-400 font-black text-xl"
        >
          🂠
        </div>
      );
    }

    return (
      <div
        key={key}
        className="w-16 h-24 md:w-20 md:h-28 rounded-lg bg-white border-2 border-gray-200 shadow-lg flex flex-col justify-between p-1.5 md:p-2 text-gray-950 font-bold select-none transition-transform hover:-translate-y-1"
      >
        <div className={`text-xs md:text-sm font-extrabold flex justify-between items-center ${isRed ? 'text-red-600' : 'text-gray-900'}`}>
          <span>{card.value}</span>
          <span>{card.suit}</span>
        </div>
        <div className={`text-2xl md:text-3xl self-center ${isRed ? 'text-red-600' : 'text-gray-900'}`}>
          {card.suit}
        </div>
        <div className={`text-xs md:text-sm font-extrabold flex justify-between items-center rotate-180 ${isRed ? 'text-red-600' : 'text-gray-900'}`}>
          <span>{card.value}</span>
          <span>{card.suit}</span>
        </div>
      </div>
    );
  };

  const quickAmounts = [100, 500, 1000, 2500, 5000];

  return (
    <div id="blackjack-game-container" className="bg-[#2b2d31] rounded-xl border border-[#3f4147] p-4 md:p-6 text-white max-w-xl mx-auto shadow-xl">
      <div className="flex items-center justify-between border-b border-[#3f4147] pb-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-100 flex items-center gap-2">
              Blackjack 21 Table
              <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                Dealer stands on 17
              </span>
            </h2>
            <p className="text-xs text-gray-400">Beat the dealer without busting (`owo bj`)</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs text-gray-400">Natural 21:</span>
          <div className="text-xs font-bold text-amber-400">3:2 (2.5x) Payout</div>
        </div>
      </div>

      {/* Casino Table Felt */}
      <div className="bg-gradient-to-b from-emerald-900/60 to-emerald-950/80 p-5 rounded-2xl border-2 border-emerald-500/30 shadow-inner mb-6 relative">
        {/* Dealer Area */}
        <div className="mb-6">
          <div className="flex justify-between items-center text-xs font-bold text-emerald-300 mb-2">
            <span>OwO Dealer Hand</span>
            {activeBlackjack ? (
              <span className="bg-emerald-900/80 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                {activeBlackjack.status === 'playing' ? 'Score: ?' : `Score: ${dScore?.score}`}
              </span>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2 min-h-[100px] items-center">
            {activeBlackjack ? (
              activeBlackjack.dealerCards.map((card, idx) =>
                renderCard(card, activeBlackjack.status === 'playing' && idx === 1, idx)
              )
            ) : (
              <div className="text-xs text-emerald-300/50 italic py-4">Cards will appear once you deal a hand.</div>
            )}
          </div>
        </div>

        <div className="border-t border-emerald-500/20 my-3" />

        {/* Player Area */}
        <div>
          <div className="flex justify-between items-center text-xs font-bold text-emerald-300 mb-2">
            <span>Your Hand</span>
            {activeBlackjack && pScore ? (
              <span className="bg-emerald-900/80 px-2.5 py-0.5 rounded-full border border-emerald-500/30 text-amber-300 font-extrabold">
                Score: {pScore.score}
              </span>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2 min-h-[100px] items-center">
            {activeBlackjack ? (
              activeBlackjack.playerCards.map((card, idx) => renderCard(card, false, idx))
            ) : (
              <div className="text-xs text-emerald-300/50 italic py-4">Place a bet to begin playing!</div>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      {activeBlackjack && activeBlackjack.status === 'playing' ? (
        <div className="grid grid-cols-3 gap-3">
          <button
            id="btn-bj-hit"
            type="button"
            onClick={blackjackHit}
            className="py-3 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-extrabold flex items-center justify-center gap-2 shadow-lg transition active:scale-95"
          >
            <Plus className="w-5 h-5" /> Hit
          </button>
          <button
            id="btn-bj-stand"
            type="button"
            onClick={blackjackStand}
            className="py-3 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold flex items-center justify-center gap-2 shadow-lg transition active:scale-95"
          >
            <Hand className="w-5 h-5" /> Stand
          </button>
          <button
            id="btn-bj-double"
            type="button"
            onClick={blackjackDouble}
            disabled={stats.cash < activeBlackjack.bet}
            className="py-3 px-4 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-extrabold flex items-center justify-center gap-2 shadow-lg transition active:scale-95 disabled:opacity-50"
          >
            <Zap className="w-5 h-5" /> 2x Double
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-[#1e1f22] p-4 rounded-lg border border-[#35373c]">
            <div className="flex justify-between items-center text-xs text-gray-400 mb-2">
              <span>Bet Amount:</span>
              <span>Wallet: <strong className="text-emerald-400">💵 {formatCash(stats.cash)} Cash</strong></span>
            </div>
            <div className="relative flex items-center mb-3">
              <span className="absolute left-3 text-gray-400 font-bold">💵</span>
              <input
                id="input-bj-bet"
                type="number"
                min={1}
                max={stats.cash}
                value={bet || ''}
                onChange={e => setBet(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-full bg-[#2b2d31] border border-[#3f4147] rounded-lg py-2 pl-9 pr-4 text-white text-sm font-bold focus:outline-none focus:border-emerald-400"
                placeholder="Bet amount..."
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {quickAmounts.map(amt => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setBet(Math.min(stats.cash, amt))}
                  className="flex-1 py-1 px-2 text-xs bg-[#2b2d31] hover:bg-[#35373c] border border-[#3f4147] rounded text-gray-300 font-semibold transition"
                >
                  +{formatCash(amt)}
                </button>
              ))}
            </div>
          </div>

          <button
            id="btn-deal-bj"
            type="button"
            onClick={startNewGame}
            disabled={bet <= 0 || bet > stats.cash}
            className="w-full py-3 rounded-lg font-extrabold text-base flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg transition active:scale-[0.98] disabled:opacity-50"
          >
            <Play className="w-5 h-5 fill-current" /> Deal Blackjack Hand ({formatCash(bet)} Cash)
          </button>
        </div>
      )}
    </div>
  );
};
