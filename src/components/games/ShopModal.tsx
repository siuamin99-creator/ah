import React from 'react';
import { ShoppingBag, X, Check, Sparkles } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { formatCash } from '../../utils/economy';

interface Props {
  onClose: () => void;
}

export const ShopModal: React.FC<Props> = ({ onClose }) => {
  const { shopItems, stats, buyShopItem } = useGame();

  return (
    <div id="shop-modal" className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 md:p-6 overflow-y-auto">
      <div className="bg-[#2b2d31] w-full max-w-2xl rounded-2xl border border-[#3f4147] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-[#3f4147] flex justify-between items-center bg-[#1e1f22]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                OwO Charms & Buffs Shop
              </h2>
              <p className="text-xs text-gray-400">
                Wallet Balance: <strong className="text-emerald-400">💵 {formatCash(stats.cash)} Cash</strong>
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

        {/* Items List */}
        <div className="p-4 md:p-5 overflow-y-auto flex-1 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {shopItems.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition flex flex-col justify-between ${
                  item.owned
                    ? 'bg-[#1e1f22]/70 border-emerald-500/30'
                    : 'bg-[#1e1f22] border-[#35373c] hover:border-[#4e5058]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl">{item.emoji}</span>
                    {item.owned ? (
                      <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Owned
                      </span>
                    ) : (
                      <span className="text-xs font-black text-amber-400 bg-amber-950/60 border border-amber-500/20 px-2.5 py-1 rounded-full">
                        💵 {formatCash(item.price)}
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    {item.name}
                  </h4>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">{item.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#2b2d31]">
                  {item.owned ? (
                    <div className="text-center py-1.5 text-xs text-emerald-400 font-semibold flex items-center justify-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> Effect Active & Applied!
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => buyShopItem(item.id)}
                      disabled={stats.cash < item.price}
                      className={`w-full py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                        stats.cash < item.price
                          ? 'bg-[#2b2d31] text-gray-500 cursor-not-allowed border border-[#3f4147]'
                          : 'bg-amber-500 hover:bg-amber-400 text-gray-950 shadow active:scale-95'
                      }`}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      Buy for {formatCash(item.price)} Cash
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
