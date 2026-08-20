import React from 'react';
import { HelpCircle, X, Terminal, Coins, Sparkles, Compass } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export const HelpModal: React.FC<Props> = ({ onClose }) => {
  return (
    <div id="help-modal" className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 md:p-6 overflow-y-auto">
      <div className="bg-[#2b2d31] w-full max-w-xl rounded-2xl border border-[#3f4147] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-[#3f4147] flex justify-between items-center bg-[#1e1f22]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-pink-500/20 text-pink-400">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">OwO Bot Command Manual</h2>
              <p className="text-xs text-gray-400">Supported Prefixes: <code className="text-pink-400 font-bold">m</code>, <code className="text-pink-400 font-bold">owo</code>, <code className="text-pink-400 font-bold">o</code> (e.g. <span className="text-amber-300">m cash</span>, <span className="text-amber-300">m hunt</span>, <span className="text-amber-300">m cf 500 h</span>)</p>
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

        {/* Content */}
        <div className="p-4 md:p-5 overflow-y-auto flex-1 space-y-4 text-xs text-gray-300">
          <div className="bg-[#1e1f22] p-3.5 rounded-xl border border-[#35373c]">
            <h3 className="font-bold text-amber-400 flex items-center gap-2 mb-2 text-sm">
              <Coins className="w-4 h-4" /> Gambling & Cash Games
            </h3>
            <ul className="space-y-1.5 font-mono">
              <li><strong className="text-white">m cf &lt;amount&gt; [h/t]</strong> — Coinflip 2.0x (e.g. `m cf 500 h` or `m cf all t`)</li>
              <li><strong className="text-white">m slots &lt;amount&gt;</strong> (or `m s`) — 3-Reel Slots (up to 12x jackpot)</li>
              <li><strong className="text-white">m bj &lt;amount&gt;</strong> — Play Blackjack (Hit, Stand, Double)</li>
              <li><strong className="text-white">m roll &lt;amount&gt; [high/low]</strong> — 2-Dice duel vs bot</li>
            </ul>
          </div>

          <div className="bg-[#1e1f22] p-3.5 rounded-xl border border-[#35373c]">
            <h3 className="font-bold text-purple-400 flex items-center gap-2 mb-2 text-sm">
              <Compass className="w-4 h-4" /> Zoo, Hunting & Economy
            </h3>
            <ul className="space-y-1.5 font-mono">
              <li><strong className="text-white">m hunt</strong> (or `m h`) — Safari hunt for common, rare, mythical animals</li>
              <li><strong className="text-white">m zoo</strong> (or `m inv`) — View all caught pets in your sanctuary</li>
              <li><strong className="text-white">m sell &lt;name&gt;</strong> — Sell a specific animal for cash</li>
              <li><strong className="text-white">m sell all</strong> — Cash in your entire zoo collection</li>
              <li><strong className="text-white">m cash</strong> (or `m bal`) — View wallet, bank, level, win streak</li>
              <li><strong className="text-white">m owner</strong> — View Founder & CEO Wifey credentials</li>
            </ul>
          </div>

          <div className="bg-[#1e1f22] p-3.5 rounded-xl border border-[#35373c]">
            <h3 className="font-bold text-emerald-400 flex items-center gap-2 mb-2 text-sm">
              <Sparkles className="w-4 h-4" /> Rewards & Shop
            </h3>
            <ul className="space-y-1.5 font-mono">
              <li><strong className="text-white">m daily</strong> — Claim daily streak cowoncy</li>
              <li><strong className="text-white">m quest</strong> — View & claim active daily quests</li>
              <li><strong className="text-white">m shop</strong> — Buy lucky clovers, safari lenses, auto-farms</li>
              <li><strong className="text-white">m buy &lt;item_id&gt;</strong> — Purchase a shop item</li>
              <li><strong className="text-white">m give &lt;amount&gt; &lt;@user&gt;</strong> — Gift cash to friend</li>
              <li><strong className="text-white">m beg</strong> — Emergency cash bailout if wallet &lt; 200</li>
            </ul>
          </div>

          <div className="bg-[#1e1f22] p-3.5 rounded-xl border border-[#35373c]">
            <h3 className="font-bold text-blue-400 flex items-center gap-2 mb-1.5 text-sm">
              <Terminal className="w-4 h-4" /> Quick Amount Shortcuts
            </h3>
            <p className="text-gray-400 leading-relaxed">
              In any gambling command, you can use <code className="text-amber-300">all</code>, <code className="text-amber-300">half</code>, <code className="text-amber-300">1k</code>, <code className="text-amber-300">5k</code>, <code className="text-amber-300">1m</code>. Example: <code className="text-white">m cf all h</code>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
