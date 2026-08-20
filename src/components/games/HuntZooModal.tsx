import React from 'react';
import { Compass, DollarSign, Sparkles, X, Shield, Swords } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { formatCash } from '../../utils/economy';
import { AnimalRarity } from '../../types';

interface Props {
  onClose: () => void;
}

export const HuntZooModal: React.FC<Props> = ({ onClose }) => {
  const { inventory, stats, executeCommand, sellAnimal, sellAllAnimals, shopItems } = useGame();
  const hasLens = shopItems.some(i => i.id === 'hunter_lens' && i.owned);

  const totalZooValue = inventory.reduce((sum, a) => sum + a.sellValue * a.count, 0);
  const totalPets = inventory.reduce((sum, a) => sum + a.count, 0);

  const getRarityBadge = (rarity: AnimalRarity) => {
    switch (rarity) {
      case 'fabled':
        return <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-1.5 py-0.5 rounded font-black">💎 FABLED</span>;
      case 'mythical':
        return <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded font-black">🌌 MYTHIC</span>;
      case 'epic':
        return <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.5 rounded font-bold">🔥 EPIC</span>;
      case 'rare':
        return <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1.5 py-0.5 rounded font-semibold">🟣 RARE</span>;
      case 'uncommon':
        return <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded font-medium">🔵 UNCOMMON</span>;
      default:
        return <span className="text-[10px] bg-gray-500/20 text-gray-300 border border-gray-500/30 px-1.5 py-0.5 rounded">🟢 COMMON</span>;
    }
  };

  return (
    <div id="hunt-zoo-modal" className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 md:p-6 overflow-y-auto">
      <div className="bg-[#2b2d31] w-full max-w-2xl rounded-2xl border border-[#3f4147] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-[#3f4147] flex justify-between items-center bg-[#1e1f22]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                OwO Wildlife Zoo & Sanctuary
                {hasLens && (
                  <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1 font-semibold">
                    <Sparkles className="w-3 h-3" /> Safari Lens (+40%)
                  </span>
                )}
              </h2>
              <p className="text-xs text-gray-400">
                {totalPets} Animals in collection • Total Value: <strong className="text-emerald-400">💵 {formatCash(totalZooValue)} Cash</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-[#35373c] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Action Banner */}
        <div className="p-4 bg-[#232428] border-b border-[#35373c] flex flex-wrap items-center justify-between gap-3">
          <button
            id="btn-modal-hunt"
            type="button"
            onClick={() => executeCommand('m hunt', 'zoo-and-hunting')}
            className="flex-1 py-2.5 px-4 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg transition active:scale-95"
          >
            <Compass className="w-4 h-4" /> Go Safari Hunting (`m hunt`)
          </button>

          {inventory.length > 0 && (
            <button
              id="btn-modal-sell-all"
              type="button"
              onClick={sellAllAnimals}
              className="py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center gap-1.5 shadow transition active:scale-95"
            >
              <DollarSign className="w-4 h-4" /> Sell All Pets (+{formatCash(totalZooValue)})
            </button>
          )}
        </div>

        {/* Animals Grid */}
        <div className="p-4 md:p-5 overflow-y-auto flex-1 space-y-4">
          {inventory.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <span className="text-5xl mb-3 block">🏞️</span>
              <h3 className="text-base font-bold text-gray-300">Your zoo is empty!</h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto mt-1 mb-4">
                Use the Safari Hunt button to venture into the wild and catch common, rare, epic, and mythical pets!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {inventory.map((pet) => (
                <div
                  key={pet.id}
                  className="bg-[#1e1f22] p-3 rounded-xl border border-[#35373c] hover:border-[#4e5058] transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-3xl">{pet.emoji}</div>
                      <div className="flex flex-col items-end gap-1">
                        {getRarityBadge(pet.rarity)}
                        <span className="text-xs font-bold text-purple-300 bg-purple-950/60 px-1.5 py-0.5 rounded">
                          x{pet.count}
                        </span>
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-white">{pet.name}</h4>
                    <p className="text-[11px] text-gray-400 font-mono my-1 truncate">{pet.ascii}</p>

                    <div className="flex items-center gap-3 text-[10px] text-gray-400 mb-3">
                      <span className="flex items-center gap-1 text-red-400">
                        <Swords className="w-3 h-3" /> ATK: {pet.attack}
                      </span>
                      <span className="flex items-center gap-1 text-blue-400">
                        <Shield className="w-3 h-3" /> DEF: {pet.defense}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-[#2b2d31] pt-2">
                    <span className="text-xs font-bold text-emerald-400">
                      💵 {formatCash(pet.sellValue)}
                    </span>
                    <button
                      type="button"
                      onClick={() => sellAnimal(pet.id, 1)}
                      className="px-2.5 py-1 text-xs bg-[#2b2d31] hover:bg-red-500/20 hover:text-red-300 border border-[#3f4147] rounded text-gray-300 font-semibold transition"
                    >
                      Sell 1
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
