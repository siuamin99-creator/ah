import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Animal,
  ShopItem,
  Quest,
  ChatMessage,
  UserStats,
  DiscordEmbed,
  DiscordServer
} from '../types';
import {
  ANIMALS_DATABASE,
  INITIAL_SHOP_ITEMS,
  DEFAULT_QUESTS,
  DEFAULT_SERVERS,
  SIMULATED_MEMBERS
} from '../data/items';
import {
  formatCash,
  getLevelFromXp,
  getTitleForLevel,
  playCoinflip,
  playSlots,
  createDeck,
  calculateHandScore,
  formatCardsString,
  executeHunt,
  playDiceDuel,
  Card
} from '../utils/economy';
import { sounds } from '../utils/sound';

interface ActiveBlackjack {
  bet: number;
  deck: Card[];
  playerCards: Card[];
  dealerCards: Card[];
  status: 'playing' | 'player_won' | 'dealer_won' | 'push' | 'blackjack';
  channelId: string;
}

interface GameContextType {
  stats: UserStats;
  inventory: Animal[];
  shopItems: ShopItem[];
  quests: Quest[];
  servers: DiscordServer[];
  currentServerId: string;
  currentChannelId: string;
  messages: ChatMessage[];
  activeBlackjack: ActiveBlackjack | null;
  soundEnabled: boolean;
  activeGameModal: 'coinflip' | 'slots' | 'blackjack' | 'dice' | 'zoo' | 'shop' | 'quests' | 'leaderboard' | 'help' | 'bot' | null;
  
  // Actions
  setCurrentServerId: (id: string) => void;
  setCurrentChannelId: (id: string) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setActiveGameModal: (modal: 'coinflip' | 'slots' | 'blackjack' | 'dice' | 'zoo' | 'shop' | 'quests' | 'leaderboard' | 'help' | 'bot' | null) => void;
  executeCommand: (rawInput: string, targetChannelId?: string) => void;
  claimQuest: (questId: string) => void;
  buyShopItem: (itemId: string) => void;
  sellAnimal: (animalId: string, count?: number) => void;
  sellAllAnimals: () => void;
  claimDaily: () => void;
  claimEmergencyFunds: () => void;
  blackjackHit: () => void;
  blackjackStand: () => void;
  blackjackDouble: () => void;
  resetAllData: () => void;
}

const STORAGE_KEY = 'owo_bot_game_state_v1';

const INITIAL_STATS: UserStats = {
  cash: 0,
  bank: 0,
  xp: 0,
  level: 1,
  totalGames: 0,
  totalWins: 0,
  totalLosses: 0,
  totalWagered: 0,
  totalWon: 0,
  biggestWin: 0,
  currentStreak: 0,
  bestStreak: 0,
  dailyStreak: 0,
  lastDailyTimestamp: 0,
  huntsCount: 0,
  title: '🌱 Novice Roller'
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load initial states from LocalStorage or defaults
  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_stats`);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return INITIAL_STATS;
  });

  const [inventory, setInventory] = useState<Animal[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_inventory`);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    // Start with empty zoo for new players (hunt to earn)
    return [];
  });

  const [shopItems, setShopItems] = useState<ShopItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_shop`);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return INITIAL_SHOP_ITEMS;
  });

  const [quests, setQuests] = useState<Quest[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_quests`);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return DEFAULT_QUESTS;
  });

  const [servers] = useState<DiscordServer[]>(DEFAULT_SERVERS);
  const [currentServerId, setCurrentServerId] = useState<string>('owo_official');
  const [currentChannelId, setCurrentChannelId] = useState<string>('bot-commands');
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(true);
  const [activeGameModal, setActiveGameModal] = useState<'coinflip' | 'slots' | 'blackjack' | 'dice' | 'zoo' | 'shop' | 'quests' | 'leaderboard' | 'help' | 'bot' | null>(null);
  const [activeBlackjack, setActiveBlackjack] = useState<ActiveBlackjack | null>(null);

  // Initial welcome messages in chat
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'm-welcome',
      sender: SIMULATED_MEMBERS[0], // OwO Bot
      channelId: 'bot-commands',
      timestamp: 'Today at ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      embed: {
        title: '🌸 Welcome to OwO Discord Bot & Economy!',
        description: 'New players start with **💵 0 Cash**. Earn cash by claiming your daily reward, hunting animals for free, and gambling your earnings!\n\n**💵 Starting Balance:** **0 Cash**\n**🚀 How to Earn Your First Cash:**\n• `owo daily` — Claim **+2,500 Cash** daily starter bonus!\n• `owo hunt` — Hunt wild pets for free, then `owo sell all` for instant cash!\n• `owo beg` — Emergency relief cash if you run out of money!\n• `owo cf <amt> h` / `owo slots <amt>` — Multiply your cash!',
        color: '#f43f5e',
        actions: [
          { id: 'btn_daily', label: '🎁 Claim Daily (+2.5K)', style: 'success', command: 'owo daily', emoji: '🎁' },
          { id: 'btn_hunt', label: '🐾 Hunt Animals (Free)', style: 'primary', command: 'owo hunt', emoji: '🐾' },
          { id: 'btn_sell', label: '💰 Sell Zoo Animals', style: 'secondary', command: 'owo sell all', emoji: '💰' },
          { id: 'btn_owner', label: '👑 View Founder & CEO', style: 'secondary', command: 'owo owner', emoji: '👑' }
        ]
      }
    }
  ]);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_stats`, JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_inventory`, JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_shop`, JSON.stringify(shopItems));
  }, [shopItems]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_quests`, JSON.stringify(quests));
  }, [quests]);

  const setSoundEnabled = (val: boolean) => {
    setSoundEnabledState(val);
    sounds.enabled = val;
  };

  // Passive income generator (OwO Farm)
  useEffect(() => {
    const interval = setInterval(() => {
      const miningFarm = shopItems.find(i => i.id === 'piggy_bank' && i.owned);
      if (miningFarm && miningFarm.passiveIncome) {
        setStats(prev => ({
          ...prev,
          cash: prev.cash + miningFarm.passiveIncome!
        }));
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [shopItems]);

  // Occasional simulated Discord community chatter in gambling-den
  useEffect(() => {
    const interval = setInterval(() => {
      // Pick random simulated user
      const otherUsers = SIMULATED_MEMBERS.filter(m => !m.isBot && m.id !== 'user_me');
      const randomUser = otherUsers[Math.floor(Math.random() * otherUsers.length)];
      const games = ['cf', 'slots', 'hunt'];
      const pickedGame = games[Math.floor(Math.random() * games.length)];
      const betAmt = [200, 500, 1000, 2500, 5000][Math.floor(Math.random() * 5)];
      const timeStr = 'Today at ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      if (pickedGame === 'cf') {
        const won = Math.random() > 0.48;
        const msgUser: ChatMessage = {
          id: `sim-${Date.now()}-1`,
          sender: randomUser,
          content: `owo cf ${betAmt} h`,
          channelId: 'gambling-den',
          timestamp: timeStr
        };
        const msgBot: ChatMessage = {
          id: `sim-${Date.now()}-2`,
          sender: SIMULATED_MEMBERS[0],
          channelId: 'gambling-den',
          timestamp: timeStr,
          embed: {
            title: `🪙 Coinflip — ${randomUser.name}`,
            description: won
              ? `The coin landed on **HEADS**! 🎉\n**${randomUser.name}** won **+${formatCash(betAmt * 2)} Cash**!`
              : `The coin landed on **TAILS**! 💀\n**${randomUser.name}** lost **${formatCash(betAmt)} Cash**!`,
            color: won ? '#22c55e' : '#ef4444'
          }
        };
        setMessages(prev => [...prev.slice(-40), msgUser, msgBot]);
      }
    }, 45000);
    return () => clearInterval(interval);
  }, []);

  // Helper to add XP and check level-up
  const addXpAndCash = useCallback((xpGain: number, cashChange: number, isWin: boolean, wagered: number = 0) => {
    setStats(prev => {
      const newXp = prev.xp + xpGain;
      const { level } = getLevelFromXp(newXp);
      const newCash = Math.max(0, prev.cash + cashChange);
      const newStreak = isWin ? prev.currentStreak + 1 : 0;
      const bestStreak = Math.max(prev.bestStreak, newStreak);
      const totalWins = isWin ? prev.totalWins + 1 : prev.totalWins;
      const totalLosses = !isWin && wagered > 0 ? prev.totalLosses + 1 : prev.totalLosses;
      const totalWon = cashChange > 0 ? prev.totalWon + cashChange : prev.totalWon;
      const biggestWin = cashChange > prev.biggestWin ? cashChange : prev.biggestWin;

      return {
        ...prev,
        cash: newCash,
        xp: newXp,
        level,
        title: getTitleForLevel(level),
        totalGames: wagered > 0 ? prev.totalGames + 1 : prev.totalGames,
        totalWagered: prev.totalWagered + wagered,
        totalWins,
        totalLosses,
        totalWon,
        biggestWin,
        currentStreak: newStreak,
        bestStreak
      };
    });
  }, []);

  // Check and update quest progression
  const updateQuests = useCallback((type: Quest['type'], amount: number = 1) => {
    setQuests(prev =>
      prev.map(q => {
        if (q.type === type && !q.completed) {
          const next = Math.min(q.target, q.current + amount);
          return {
            ...q,
            current: next,
            completed: next >= q.target
          };
        }
        return q;
      })
    );
  }, []);

  const claimQuest = (questId: string) => {
    const quest = quests.find(q => q.id === questId);
    if (!quest || !quest.completed || quest.claimed) return;

    sounds.playWin();
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });

    setStats(prev => ({
      ...prev,
      cash: prev.cash + quest.rewardCash,
      xp: prev.xp + quest.rewardXp
    }));

    setQuests(prev =>
      prev.map(q => (q.id === questId ? { ...q, claimed: true } : q))
    );

    // Bot message notification
    const timeStr = 'Today at ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [
      ...prev,
      {
        id: `quest-${Date.now()}`,
        sender: SIMULATED_MEMBERS[0],
        channelId: currentChannelId,
        timestamp: timeStr,
        embed: {
          title: `📜 Quest Completed: ${quest.title}!`,
          description: `You claimed **+${formatCash(quest.rewardCash)} Cash** and **+${quest.rewardXp} XP**! 🎉`,
          color: '#eab308'
        }
      }
    ]);
  };

  const claimDaily = () => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const isReady = now - stats.lastDailyTimestamp > 12 * 60 * 60 * 1000; // 12hr cooldown for friendly play

    if (!isReady && stats.lastDailyTimestamp > 0) {
      const remainingMs = 12 * 60 * 60 * 1000 - (now - stats.lastDailyTimestamp);
      const hrs = Math.floor(remainingMs / (60 * 60 * 1000));
      const mins = Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000));

      const timeStr = 'Today at ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages(prev => [
        ...prev,
        {
          id: `daily-cooldown-${Date.now()}`,
          sender: SIMULATED_MEMBERS[0],
          channelId: currentChannelId,
          timestamp: timeStr,
          embed: {
            title: '⏳ Daily Reward Cooldown',
            description: `You already claimed your daily reward recently!\nNext claim in **${hrs}h ${mins}m**.`,
            color: '#f59e0b'
          }
        }
      ]);
      return;
    }

    // Has Crown of OwO? 3x multiplier
    const hasCrown = shopItems.some(i => i.id === 'crown_of_owo' && i.owned);
    const multiplier = hasCrown ? 3 : 1;
    const baseReward = 2000 + stats.dailyStreak * 300;
    const totalDaily = baseReward * multiplier;

    sounds.playWin();
    confetti({ particleCount: 70, spread: 70, origin: { y: 0.5 } });

    setStats(prev => ({
      ...prev,
      cash: prev.cash + totalDaily,
      xp: prev.xp + 150,
      dailyStreak: prev.dailyStreak + 1,
      lastDailyTimestamp: now
    }));

    const timeStr = 'Today at ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [
      ...prev,
      {
        id: `daily-reward-${Date.now()}`,
        sender: SIMULATED_MEMBERS[0],
        channelId: currentChannelId,
        timestamp: timeStr,
        embed: {
          title: '🎁 Daily Cowoncy Reward Claimed!',
          description: `**Daily Streak:** 🔥 **${stats.dailyStreak} Days**\n**Cash Received:** 💵 **+${formatCash(totalDaily)} Cash**\n**XP Gained:** 🌟 **+150 XP**\n${hasCrown ? '👑 *Crown of OwO bonus applied (3x)!*' : ''}`,
          color: '#22c55e',
          actions: [
            { id: 'act_cf', label: '🎲 Gamble Daily Cash', style: 'primary', command: `owo cf ${Math.floor(totalDaily / 2)} h` },
            { id: 'act_hunt', label: '🐾 Go Hunting', style: 'secondary', command: 'owo hunt' }
          ]
        }
      }
    ]);
  };

  const claimEmergencyFunds = () => {
    sounds.playWin();
    setStats(prev => ({
      ...prev,
      cash: prev.cash + 5000
    }));

    const timeStr = 'Today at ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [
      ...prev,
      {
        id: `bailout-${Date.now()}`,
        sender: SIMULATED_MEMBERS[0],
        channelId: currentChannelId,
        timestamp: timeStr,
        embed: {
          title: '💸 OwO Emergency Stimulus Package!',
          description: 'Here is **+5,000 Cash** to get you right back in the action! Play responsibly! 🍀',
          color: '#22c55e'
        }
      }
    ]);
  };

  const buyShopItem = (itemId: string) => {
    const item = shopItems.find(i => i.id === itemId);
    if (!item) return;

    if (item.owned) {
      alert('You already own this item!');
      return;
    }

    if (stats.cash < item.price) {
      sounds.playLoss();
      alert(`Not enough cash! You need ${formatCash(item.price)} Cash.`);
      return;
    }

    sounds.playWin();
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 } });

    setStats(prev => ({
      ...prev,
      cash: prev.cash - item.price,
      xp: prev.xp + 200
    }));

    setShopItems(prev =>
      prev.map(i => (i.id === itemId ? { ...i, owned: true } : i))
    );

    const timeStr = 'Today at ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [
      ...prev,
      {
        id: `shop-buy-${Date.now()}`,
        sender: SIMULATED_MEMBERS[0],
        channelId: currentChannelId,
        timestamp: timeStr,
        embed: {
          title: `🛍️ Purchased: ${item.emoji} ${item.name}!`,
          description: `Paid: **${formatCash(item.price)} Cash**\n*${item.description}*`,
          color: '#a855f7'
        }
      }
    ]);
  };

  const sellAnimal = (animalId: string, count: number = 1) => {
    const pet = inventory.find(a => a.id === animalId);
    if (!pet || pet.count < count) return;

    const totalEarned = pet.sellValue * count;
    sounds.playCoin();

    setStats(prev => ({
      ...prev,
      cash: prev.cash + totalEarned,
      xp: prev.xp + 10 * count
    }));

    setInventory(prev =>
      prev
        .map(a => (a.id === animalId ? { ...a, count: a.count - count } : a))
        .filter(a => a.count > 0)
    );

    const timeStr = 'Today at ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [
      ...prev,
      {
        id: `sell-${Date.now()}`,
        sender: SIMULATED_MEMBERS[0],
        channelId: currentChannelId,
        timestamp: timeStr,
        embed: {
          title: `💰 Sold ${pet.emoji} ${pet.name} (x${count})`,
          description: `Earned **+${formatCash(totalEarned)} Cash**!`,
          color: '#22c55e'
        }
      }
    ]);
  };

  const sellAllAnimals = () => {
    if (inventory.length === 0) {
      alert('Your zoo/inventory is empty!');
      return;
    }

    const totalEarned = inventory.reduce((sum, a) => sum + a.sellValue * a.count, 0);
    const totalCount = inventory.reduce((sum, a) => sum + a.count, 0);

    sounds.playWin();
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });

    setStats(prev => ({
      ...prev,
      cash: prev.cash + totalEarned,
      xp: prev.xp + totalCount * 10
    }));

    setInventory([]);

    const timeStr = 'Today at ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [
      ...prev,
      {
        id: `sell-all-${Date.now()}`,
        sender: SIMULATED_MEMBERS[0],
        channelId: currentChannelId,
        timestamp: timeStr,
        embed: {
          title: `💰 Sold All Animals (x${totalCount})!`,
          description: `Total cash earned: **+${formatCash(totalEarned)} Cash**! 🎉`,
          color: '#22c55e'
        }
      }
    ]);
  };

  const resetAllData = () => {
    if (confirm('Are you sure you want to reset all game data and balance?')) {
      localStorage.clear();
      setStats(INITIAL_STATS);
      setInventory([{ ...ANIMALS_DATABASE[0], count: 1 }]);
      setShopItems(INITIAL_SHOP_ITEMS);
      setQuests(DEFAULT_QUESTS);
      setActiveBlackjack(null);
      setMessages([
        {
          id: `reset-${Date.now()}`,
          sender: SIMULATED_MEMBERS[0],
          channelId: 'bot-commands',
          timestamp: 'Today at ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          embed: {
            title: '✨ Account Reset Complete',
            description: 'Your balance is restored to **5,000 Cash**! Good luck on your new OwO adventure!',
            color: '#3b82f6'
          }
        }
      ]);
    }
  };

  /* ================= BLACKJACK CONTROLS ================= */
  const endBlackjackRound = useCallback((finalDealerCards: Card[], updatedPlayerCards: Card[], bjState: ActiveBlackjack) => {
    const pScore = calculateHandScore(updatedPlayerCards);
    const dScore = calculateHandScore(finalDealerCards);
    const timeStr = 'Today at ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let resultStatus: 'player_won' | 'dealer_won' | 'push' | 'blackjack' = 'dealer_won';
    let payout = 0;
    let color = '#ef4444';
    let resultMsg = '';

    if (pScore.isBusted) {
      resultStatus = 'dealer_won';
      resultMsg = `💥 **Bust!** Your total is **${pScore.score}**. You lost **${formatCash(bjState.bet)} Cash**.`;
      sounds.playLoss();
      addXpAndCash(20, -bjState.bet, false, bjState.bet);
    } else if (dScore.isBusted) {
      resultStatus = 'player_won';
      payout = bjState.bet * 2;
      color = '#22c55e';
      resultMsg = `🎉 **Dealer Busted!** Dealer has **${dScore.score}**. You won **+${formatCash(payout)} Cash**!`;
      sounds.playWin();
      confetti({ particleCount: 50, spread: 60 });
      addXpAndCash(60, bjState.bet, true, bjState.bet);
      updateQuests('blackjack', 1);
    } else if (pScore.score > dScore.score) {
      resultStatus = 'player_won';
      payout = bjState.bet * 2;
      color = '#22c55e';
      resultMsg = `🎉 **You Win!** Your **${pScore.score}** beat Dealer's **${dScore.score}**! Payout: **+${formatCash(payout)} Cash**!`;
      sounds.playWin();
      confetti({ particleCount: 50, spread: 60 });
      addXpAndCash(60, bjState.bet, true, bjState.bet);
      updateQuests('blackjack', 1);
    } else if (pScore.score < dScore.score) {
      resultStatus = 'dealer_won';
      resultMsg = `💀 **Dealer Wins!** Dealer has **${dScore.score}** vs your **${pScore.score}**. You lost **${formatCash(bjState.bet)} Cash**.`;
      sounds.playLoss();
      addXpAndCash(20, -bjState.bet, false, bjState.bet);
    } else {
      resultStatus = 'push';
      color = '#eab308';
      resultMsg = `🤝 **Push!** Both you and dealer tied at **${pScore.score}**. Bet of **${formatCash(bjState.bet)} Cash** returned.`;
      sounds.playNotification();
      addXpAndCash(20, 0, false, bjState.bet);
    }

    setMessages(prev => [
      ...prev,
      {
        id: `bj-end-${Date.now()}`,
        sender: SIMULATED_MEMBERS[0],
        channelId: bjState.channelId,
        timestamp: timeStr,
        embed: {
          title: '🃏 Blackjack Result',
          description: resultMsg,
          color,
          fields: [
            { name: `Your Hand (${pScore.score})`, value: formatCardsString(updatedPlayerCards), inline: true },
            { name: `Dealer Hand (${dScore.score})`, value: formatCardsString(finalDealerCards), inline: true }
          ],
          actions: [
            { id: 'bj_again', label: `🃏 Play Again (${formatCash(bjState.bet)})`, style: 'primary', command: `owo bj ${bjState.bet}` }
          ]
        }
      }
    ]);

    setActiveBlackjack(null);
  }, [addXpAndCash, updateQuests]);

  const blackjackHit = () => {
    if (!activeBlackjack) return;
    sounds.playCardFlip();

    const deck = [...activeBlackjack.deck];
    const newCard = deck.pop()!;
    const newPlayerCards = [...activeBlackjack.playerCards, newCard];
    const { score, isBusted } = calculateHandScore(newPlayerCards);

    const timeStr = 'Today at ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (isBusted) {
      endBlackjackRound(activeBlackjack.dealerCards, newPlayerCards, activeBlackjack);
    } else {
      setActiveBlackjack({
        ...activeBlackjack,
        deck,
        playerCards: newPlayerCards
      });

      setMessages(prev => [
        ...prev,
        {
          id: `bj-hit-${Date.now()}`,
          sender: SIMULATED_MEMBERS[0],
          channelId: activeBlackjack.channelId,
          timestamp: timeStr,
          embed: {
            title: `🃏 Blackjack — Drew ${newCard.value}${newCard.suit}`,
            description: `**Your Hand:** ${formatCardsString(newPlayerCards)} (Score: **${score}**)\n**Dealer:** ${formatCardsString(activeBlackjack.dealerCards, true)}`,
            color: '#3b82f6',
            actions: [
              { id: 'bj_hit_btn', label: '🃏 Hit', style: 'primary', command: 'owo hit' },
              { id: 'bj_stand_btn', label: '🛑 Stand', style: 'success', command: 'owo stand' }
            ]
          }
        }
      ]);
    }
  };

  const blackjackStand = () => {
    if (!activeBlackjack) return;
    sounds.playCardFlip();

    const deck = [...activeBlackjack.deck];
    const dealerCards = [...activeBlackjack.dealerCards];

    // Dealer hits until >= 17
    while (calculateHandScore(dealerCards).score < 17 && !calculateHandScore(dealerCards).isBusted) {
      if (deck.length > 0) {
        dealerCards.push(deck.pop()!);
      } else {
        break;
      }
    }

    endBlackjackRound(dealerCards, activeBlackjack.playerCards, activeBlackjack);
  };

  const blackjackDouble = () => {
    if (!activeBlackjack) return;
    if (stats.cash < activeBlackjack.bet) {
      alert('Not enough cash to double down!');
      return;
    }

    sounds.playCardFlip();
    const newBet = activeBlackjack.bet * 2;
    const deck = [...activeBlackjack.deck];
    const newCard = deck.pop()!;
    const newPlayerCards = [...activeBlackjack.playerCards, newCard];

    const dealerCards = [...activeBlackjack.dealerCards];
    while (calculateHandScore(dealerCards).score < 17 && !calculateHandScore(dealerCards).isBusted) {
      if (deck.length > 0) {
        dealerCards.push(deck.pop()!);
      } else {
        break;
      }
    }

    endBlackjackRound(dealerCards, newPlayerCards, { ...activeBlackjack, bet: newBet });
  };

  /* ================= COMMAND EXECUTION ENGINE ================= */
  const executeCommand = (rawInput: string, targetChannelId?: string) => {
    const channel = targetChannelId || currentChannelId;
    const text = rawInput.trim();
    if (!text) return;

    const timeStr = 'Today at ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Post user message
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: SIMULATED_MEMBERS[1], // Player
      content: text,
      channelId: channel,
      timestamp: timeStr
    };

    setMessages(prev => [...prev, userMsg]);

    // Helper to send bot reply
    const sendBotEmbed = (embed: DiscordEmbed) => {
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: SIMULATED_MEMBERS[0],
        channelId: channel,
        timestamp: 'Today at ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        embed
      };
      setMessages(prev => [...prev, botMsg]);
    };

    // Parse command
    const parts = text.toLowerCase().split(/\s+/);
    const prefix = parts[0];

    let cmd = '';
    let arg1 = '';
    let arg2 = '';

    // Check retired prefixes 'o' / 'owo'
    if (prefix === 'o' || prefix === 'owo' || (prefix.startsWith('o') && !prefix.startsWith('owner') && !prefix.startsWith('http') && prefix.length > 1) || (prefix.startsWith('owo') && prefix.length > 3)) {
      sendBotEmbed({
        title: '⚠️ Prefix Updated: Use `m` prefix',
        description: 'The `o` and `owo` command prefixes are disabled. All commands now run using **`m`**!\n\n**Examples:**\n• `m cash` (check balance)\n• `m hunt` (safari pets)\n• `m cf 500 h` (coinflip)\n• `m slots 500` (slots)\n• `m bj 500` (blackjack)\n• `m daily` (daily reward)\n• `m owner` (CEO credentials)',
        color: '#f59e0b',
        actions: [
          { id: 'btn_switch_cash', label: '💵 m cash', style: 'primary', command: 'm cash' },
          { id: 'btn_switch_hunt', label: '🐾 m hunt', style: 'success', command: 'm hunt' },
          { id: 'btn_switch_cf', label: '🪙 m cf 500 h', style: 'secondary', command: 'm cf 500 h' }
        ]
      });
      return;
    }

    // Active prefix: 'm' or slash '/'
    if (prefix === 'm') {
      cmd = parts[1] || 'cash';
      arg1 = parts[2] || '';
      arg2 = parts[3] || '';
    } else if (prefix.startsWith('m') && prefix.length > 1 && !prefix.startsWith('http')) {
      cmd = prefix.slice(1);
      arg1 = parts[1] || '';
      arg2 = parts[2] || '';
    } else if (prefix.startsWith('/')) {
      cmd = prefix.slice(1);
      arg1 = parts[1] || '';
      arg2 = parts[2] || '';
    } else if (prefix === 'cash' || prefix === 'bal' || prefix === 'money' || prefix === 'balance') {
      cmd = 'cash';
      arg1 = parts[1] || '';
      arg2 = parts[2] || '';
    } else if (prefix === 'owner' || prefix === 'founder' || prefix === 'ceo' || prefix === 'developer' || prefix === 'dev' || prefix === 'wifey' || prefix === 'wife') {
      cmd = 'owner';
      arg1 = parts[1] || '';
      arg2 = parts[2] || '';
    } else {
      // Normal chat in channel
      return;
    }

    // Calculate luck from shop items
    const luckItem = shopItems.find(i => i.id === 'lucky_clover' && i.owned);
    const luckBonus = luckItem?.luckBonus || 0;
    const huntItem = shopItems.find(i => i.id === 'hunter_lens' && i.owned);
    const huntBonus = huntItem?.huntBonus || 0;

    // Helper to parse amount: e.g. "500", "all", "half", "1k", "5m"
    const parseAmount = (input?: string): number => {
      if (!input) return 0;
      if (input === 'all' || input === 'max') return stats.cash;
      if (input === 'half' || input === 'h') return Math.floor(stats.cash / 2);
      if (input.endsWith('k')) return parseFloat(input) * 1000;
      if (input.endsWith('m')) return parseFloat(input) * 1000000;
      const num = parseInt(input, 10);
      return isNaN(num) ? 0 : num;
    };

    /* ===== COMMANDS HANDLERS ===== */

    // 1. HELP
    if (cmd === 'help' || cmd === 'h' || cmd === 'commands') {
      sounds.playNotification();
      sendBotEmbed({
        title: '🌸 OwO Bot Commands & Cash Games Menu',
        description: 'Here are all the available commands to play games with cash, hunt pets, and level up!',
        color: '#f43f5e',
        fields: [
          { name: '🪙 Gambling Games', value: '`m cf <amt> [h/t]` — Coinflip\n`m slots <amt>` — 3-Reel Slot Machine\n`m bj <amt>` — Blackjack 21\n`m roll <amt> [high/low]` — Dice Duel vs Bot\n`m rps <amt> [r/p/s]` — Rock Paper Scissors', inline: false },
          { name: '🐾 Economy & Zoo', value: '`m hunt` (or `m h`) — Catch wild animals\n`m zoo` — View your animal sanctuary\n`m sell <animal>` or `m sell all` — Sell pets for cash\n`m cash` / `m money` — Check your balance\n`m owner` — View Founder & CEO credentials', inline: false },
          { name: '🎁 Rewards & Transfers', value: '`m daily` — Claim daily streak cowoncy\n`m give <amt> <@user>` — Gift cash to friend\n`m quest` — View active quests\n`m shop` — View lucky shop items\n`m beg` — Emergency cash relief', inline: false }
        ],
        footer: { text: 'OwO Bot v3.5 • Prefix: m' },
        actions: [
          { id: 'h_cf', label: '🪙 Flip Coin', style: 'primary', command: 'm cf 500 h' },
          { id: 'h_slots', label: '🎰 Play Slots', style: 'success', command: 'm slots 500' },
          { id: 'h_bj', label: '🃏 Blackjack', style: 'primary', command: 'm bj 500' },
          { id: 'h_hunt', label: '🐾 Hunt Pets', style: 'secondary', command: 'm hunt' }
        ]
      });
      return;
    }

    // 1.5 OWNER / FOUNDER / CEO / WIFEY
    if (cmd === 'owner' || cmd === 'founder' || cmd === 'ceo' || cmd === 'developer' || cmd === 'dev' || cmd === 'wife' || cmd === 'wifey') {
      sounds.playWin();
      sendBotEmbed({
        title: '👑 OwO Bot Official Ownership & Leadership Profile',
        description: 'Official verified credentials, executive leadership & royal management:',
        color: '#eab308',
        fields: [
          { name: '👑 Founder & CEO', value: '**Supreme Bot Owner & Chief Executive Officer**\n🆔 Discord ID: `1522197368601055304` (<@1522197368601055304>)', inline: false },
          { name: '💖 CEO Wifey / First Lady', value: '**Verified Royal Co-Owner & Executive Wifey**\n🆔 Discord ID: `1353275137574699060` (<@1353275137574699060>)', inline: false },
          { name: '🌟 Status & Permissions', value: '✅ **Verified Supreme Bot Authority** (Full System Immunity & Executive Rights)', inline: false },
          { name: '💼 Project Organization', value: 'OwO Casino & Safari Wildlife Network • Official Core Team', inline: false },
          { name: '💰 Treasury Fund', value: '**200,000,000 OwO Cash Allocated**', inline: true }
        ],
        footer: { text: 'OwO Bot System Verified • Founder: 1522197368601055304 • CEO Wifey: 1353275137574699060' },
        actions: [
          { id: 'btn_owner_cash', label: '👑 Check Cash', style: 'primary', command: 'm cash' },
          { id: 'btn_owner_cf', label: '🪙 Coinflip', style: 'success', command: 'm cf 500 h' }
        ]
      });
      return;
    }

    // 2. CASH / BALANCE
    if (cmd === 'cash' || cmd === 'money' || cmd === 'balance' || cmd === 'bal') {
      sounds.playCoin();
      const { level, currentXp, nextLevelXp, progressPercent } = getLevelFromXp(stats.xp);
      sendBotEmbed({
        title: `💵 ${SIMULATED_MEMBERS[1].name}'s Financial Profile`,
        color: '#22c55e',
        fields: [
          { name: '💵 Wallet Cash', value: `**${formatCash(stats.cash)} Cash**`, inline: true },
          { name: '🏦 Bank Vault', value: `**${formatCash(stats.bank)} Cash**`, inline: true },
          { name: '🌟 Level & XP', value: `**Lvl ${level}** (${formatCash(currentXp)} / ${formatCash(nextLevelXp)} XP - ${progressPercent.toFixed(0)}%)`, inline: true },
          { name: '🔥 Win Streak', value: `**${stats.currentStreak}** (Best: ${stats.bestStreak})`, inline: true },
          { name: '🏆 Win Rate', value: `${stats.totalGames > 0 ? ((stats.totalWins / stats.totalGames) * 100).toFixed(1) : 0}% (${stats.totalWins}W / ${stats.totalLosses}L)`, inline: true },
          { name: '💎 Total Wagered', value: `**${formatCash(stats.totalWagered)} Cash**`, inline: true }
        ],
        actions: [
          { id: 'bal_daily', label: '🎁 Claim Daily', style: 'success', command: 'm daily' },
          { id: 'bal_hunt', label: '🐾 Go Hunting', style: 'secondary', command: 'm hunt' }
        ]
      });
      return;
    }

    // 3. DAILY
    if (cmd === 'daily') {
      claimDaily();
      return;
    }

    // 4. BEG / EMERGENCY CASH
    if (cmd === 'beg' || cmd === 'emergency') {
      if (stats.cash < 200) {
        claimEmergencyFunds();
      } else {
        sounds.playNotification();
        sendBotEmbed({
          title: '😅 You still have enough cash!',
          description: `You have **${formatCash(stats.cash)} Cash** in your wallet! Emergency funds are reserved for bankrupt players (< 200 Cash).`,
          color: '#f59e0b'
        });
      }
      return;
    }

    // 5. COINFLIP (cf)
    if (cmd === 'cf' || cmd === 'coinflip' || cmd === 'coin') {
      const bet = parseAmount(arg1);
      if (bet <= 0) {
        sendBotEmbed({
          title: '❓ Coinflip Usage',
          description: 'Usage: `m cf <amount> [heads/tails/h/t]`\nExample: `m cf 500 h` or `m cf all heads`',
          color: '#f43f5e'
        });
        return;
      }
      if (bet > stats.cash) {
        sounds.playLoss();
        sendBotEmbed({
          title: '🚫 Insufficient Cash',
          description: `You only have **${formatCash(stats.cash)} Cash**! You need **${formatCash(bet)} Cash**.`,
          color: '#ef4444'
        });
        return;
      }

      const choice = (arg2 === 't' || arg2 === 'tails') ? 'tails' : 'heads';
      const result = playCoinflip(bet, choice, luckBonus);

      if (result.won) {
        sounds.playWin();
        if (bet >= 2000 || stats.currentStreak >= 2) {
          confetti({ particleCount: 50, spread: 60 });
        }
        addXpAndCash(Math.floor(bet * 0.1) + 25, bet, true, bet);
        updateQuests('coinflip', 1);
        if (stats.currentStreak + 1 >= 3) {
          updateQuests('win_streak', 1);
        }

        sendBotEmbed({
          title: `🪙 Coinflip — ${result.resultSide.toUpperCase()}!`,
          description: `You chose **${choice.toUpperCase()}** and the coin landed on **${result.resultSide.toUpperCase()}**! 🎉\n\n**Payout:** 💵 **+${formatCash(result.payout)} Cash** (+${formatCash(bet)} profit)\n**Win Streak:** 🔥 **${stats.currentStreak + 1}**`,
          color: '#22c55e',
          actions: [
            { id: 'cf_again', label: `🪙 Flip Again (${formatCash(bet)})`, style: 'success', command: `m cf ${bet} ${choice}` },
            { id: 'cf_double', label: `⚡ Double Bet (${formatCash(bet * 2)})`, style: 'primary', command: `m cf ${bet * 2} ${choice}` }
          ]
        });
      } else {
        sounds.playLoss();
        addXpAndCash(15, -bet, false, bet);
        sendBotEmbed({
          title: `🪙 Coinflip — ${result.resultSide.toUpperCase()}!`,
          description: `You chose **${choice.toUpperCase()}** but the coin landed on **${result.resultSide.toUpperCase()}**! 💀\n\n**Lost:** 💵 **-${formatCash(bet)} Cash**`,
          color: '#ef4444',
          actions: [
            { id: 'cf_retry', label: `🪙 Retry (${formatCash(bet)})`, style: 'danger', command: `m cf ${bet} ${choice}` }
          ]
        });
      }
      return;
    }

    // 6. SLOTS (s)
    if (cmd === 'slots' || cmd === 's' || cmd === 'slot') {
      const bet = parseAmount(arg1);
      if (bet <= 0) {
        sendBotEmbed({
          title: '❓ Slots Usage',
          description: 'Usage: `m slots <amount>` (or `m s <amount>`)\nExample: `m s 500` or `m slots all`',
          color: '#f43f5e'
        });
        return;
      }
      if (bet > stats.cash) {
        sounds.playLoss();
        sendBotEmbed({
          title: '🚫 Insufficient Cash',
          description: `You only have **${formatCash(stats.cash)} Cash**! You need **${formatCash(bet)} Cash**.`,
          color: '#ef4444'
        });
        return;
      }

      sounds.playSlotSpin();
      const result = playSlots(bet, luckBonus);
      updateQuests('slots', 1);

      if (result.won) {
        if (result.isJackpot) {
          sounds.playJackpot();
          confetti({ particleCount: 120, spread: 90, origin: { y: 0.4 } });
        } else {
          sounds.playWin();
          confetti({ particleCount: 40, spread: 50 });
        }
        const profit = result.payout - bet;
        addXpAndCash(Math.floor(bet * 0.15) + 35, profit, true, bet);
        if (stats.currentStreak + 1 >= 3) {
          updateQuests('win_streak', 1);
        }

        sendBotEmbed({
          title: `🎰 Slot Machine — ${result.isJackpot ? '💥 MEGA JACKPOT!' : result.winType}`,
          description: `[ ${result.reels[0].emoji} | ${result.reels[1].emoji} | ${result.reels[2].emoji} ]\n\n**Multiplier:** ⚡ **${result.multiplier}x**\n**Payout:** 💵 **+${formatCash(result.payout)} Cash** (+${formatCash(profit)} profit)!`,
          color: result.isJackpot ? '#eab308' : '#22c55e',
          actions: [
            { id: 's_spin_again', label: `🎰 Spin Again (${formatCash(bet)})`, style: 'success', command: `m s ${bet}` },
            { id: 's_double', label: `⚡ Double Spin (${formatCash(bet * 2)})`, style: 'primary', command: `m s ${bet * 2}` }
          ]
        });
      } else {
        sounds.playLoss();
        addXpAndCash(15, -bet, false, bet);
        sendBotEmbed({
          title: '🎰 Slot Machine — No Match',
          description: `[ ${result.reels[0].emoji} | ${result.reels[1].emoji} | ${result.reels[2].emoji} ]\n\n**Lost:** 💵 **-${formatCash(bet)} Cash**! Better luck next spin!`,
          color: '#ef4444',
          actions: [
            { id: 's_spin_retry', label: `🎰 Spin Again (${formatCash(bet)})`, style: 'danger', command: `m s ${bet}` }
          ]
        });
      }
      return;
    }

    // 7. BLACKJACK (bj)
    if (cmd === 'bj' || cmd === 'blackjack' || cmd === '21') {
      const bet = parseAmount(arg1);
      if (bet <= 0) {
        sendBotEmbed({
          title: '❓ Blackjack Usage',
          description: 'Usage: `m bj <amount>`\nExample: `m bj 500`\nCommands during game: `m hit`, `m stand`, `m double`',
          color: '#f43f5e'
        });
        return;
      }
      if (bet > stats.cash) {
        sounds.playLoss();
        sendBotEmbed({
          title: '🚫 Insufficient Cash',
          description: `You only have **${formatCash(stats.cash)} Cash**! You need **${formatCash(bet)} Cash**.`,
          color: '#ef4444'
        });
        return;
      }

      sounds.playCardFlip();
      const deck = createDeck();
      const p1 = deck.pop()!;
      const d1 = deck.pop()!;
      const p2 = deck.pop()!;
      const d2 = deck.pop()!;

      const playerCards = [p1, p2];
      const dealerCards = [d1, d2];
      const pScore = calculateHandScore(playerCards);
      const dScore = calculateHandScore(dealerCards);

      // Check instant blackjack
      if (pScore.isBlackjack) {
        if (dScore.isBlackjack) {
          sendBotEmbed({
            title: '🃏 Blackjack — Push!',
            description: `Both you and Dealer have Natural Blackjacks! Bet of **${formatCash(bet)} Cash** returned.`,
            color: '#eab308',
            fields: [
              { name: 'Your Hand (21)', value: formatCardsString(playerCards), inline: true },
              { name: 'Dealer Hand (21)', value: formatCardsString(dealerCards), inline: true }
            ]
          });
          return;
        }

        sounds.playJackpot();
        confetti({ particleCount: 100, spread: 80 });
        const payout = Math.floor(bet * 2.5); // 3:2 payout
        addXpAndCash(80, payout - bet, true, bet);
        updateQuests('blackjack', 1);

        sendBotEmbed({
          title: '🃏 NATURAL BLACKJACK! 21! 🎉',
          description: `You got a Natural Blackjack! Payout (3:2): **+${formatCash(payout)} Cash**!`,
          color: '#22c55e',
          fields: [
            { name: 'Your Hand (21)', value: formatCardsString(playerCards), inline: true },
            { name: 'Dealer Hand', value: formatCardsString(dealerCards), inline: true }
          ]
        });
        return;
      }

      // Ongoing game
      const newBj: ActiveBlackjack = {
        bet,
        deck,
        playerCards,
        dealerCards,
        status: 'playing',
        channelId: channel
      };
      setActiveBlackjack(newBj);

      sendBotEmbed({
        title: `🃏 Blackjack Game Started (${formatCash(bet)} Cash)`,
        description: `**Your Hand:** ${formatCardsString(playerCards)} (Score: **${pScore.score}**)\n**Dealer Hand:** ${formatCardsString(dealerCards, true)}\n\nType \`m hit\` to draw, \`m stand\` to hold, or \`m double\` to double down!`,
        color: '#3b82f6',
        actions: [
          { id: 'act_bj_hit', label: '🃏 Hit', style: 'primary', command: 'm hit' },
          { id: 'act_bj_stand', label: '🛑 Stand', style: 'success', command: 'm stand' },
          { id: 'act_bj_double', label: '⚡ Double Down', style: 'secondary', command: 'm double' }
        ]
      });
      return;
    }

    if (cmd === 'hit' || cmd === 'h') {
      if (activeBlackjack) blackjackHit();
      else sendBotEmbed({ title: '❓ No Active Blackjack Game', description: 'Start a new round with `m bj <amount>`!', color: '#f59e0b' });
      return;
    }

    if (cmd === 'stand' || cmd === 's') {
      if (activeBlackjack) blackjackStand();
      else sendBotEmbed({ title: '❓ No Active Blackjack Game', description: 'Start a new round with `m bj <amount>`!', color: '#f59e0b' });
      return;
    }

    if (cmd === 'double' || cmd === 'd') {
      if (activeBlackjack) blackjackDouble();
      else sendBotEmbed({ title: '❓ No Active Blackjack Game', description: 'Start a new round with `m bj <amount>`!', color: '#f59e0b' });
      return;
    }

    // 8. HUNT / ANIMAL SAFARI (hunt / h)
    if (cmd === 'hunt' || cmd === 'h' || cmd === 'safari') {
      sounds.playHuntSuccess();
      const huntResult = executeHunt(huntBonus);

      // Add animals to inventory
      setInventory(prev => {
        const next = [...prev];
        huntResult.caught.forEach(c => {
          const idx = next.findIndex(item => item.id === c.id);
          if (idx >= 0) {
            next[idx] = { ...next[idx], count: next[idx].count + 1 };
          } else {
            next.push({ ...c, count: 1 });
          }
        });
        return next;
      });

      // Check if mythic/fabled caught
      const hasLegendary = huntResult.caught.some(a => a.rarity === 'mythical' || a.rarity === 'fabled');
      if (hasLegendary) {
        sounds.playJackpot();
        confetti({ particleCount: 90, spread: 80 });
      }

      setStats(prev => ({
        ...prev,
        xp: prev.xp + huntResult.xpGained,
        huntsCount: prev.huntsCount + 1
      }));
      updateQuests('hunt', 1);

      const animalLines = huntResult.caught.map(a => {
        let tag = '🟢 Common';
        if (a.rarity === 'uncommon') tag = '🔵 Uncommon';
        if (a.rarity === 'rare') tag = '🟣 Rare';
        if (a.rarity === 'epic') tag = '🔥 EPIC';
        if (a.rarity === 'mythical') tag = '🌌 MYTHICAL';
        if (a.rarity === 'fabled') tag = '💎 FABLED GOD';

        return `${a.emoji} **${a.name}** \`${a.ascii}\` — **${tag}** (Value: ${formatCash(a.sellValue)} Cash)`;
      }).join('\n');

      sendBotEmbed({
        title: '🐾 Safari Hunt Expedition Result!',
        description: `You ventured into the wild and caught **${huntResult.caught.length} animal${huntResult.caught.length > 1 ? 's' : ''}**!\n\n${animalLines}\n\n**XP Gained:** 🌟 **+${huntResult.xpGained} XP**`,
        color: hasLegendary ? '#eab308' : '#a855f7',
        actions: [
          { id: 'hunt_again', label: '🐾 Hunt Again', style: 'primary', command: 'm hunt' },
          { id: 'hunt_zoo', label: '🏞️ View Zoo', style: 'secondary', command: 'm zoo' },
          { id: 'hunt_sell_all', label: '💰 Sell All Pets', style: 'success', command: 'm sell all' }
        ]
      });
      return;
    }

    // 9. ZOO / INVENTORY (zoo / inv)
    if (cmd === 'zoo' || cmd === 'inventory' || cmd === 'inv') {
      sounds.playNotification();
      if (inventory.length === 0) {
        sendBotEmbed({
          title: '🏞️ Your OwO Zoo Sanctuary',
          description: 'Your zoo is currently empty! Use `m hunt` to catch cute and mythical animals!',
          color: '#3b82f6',
          actions: [{ id: 'zoo_hunt', label: '🐾 Go Hunting', style: 'primary', command: 'm hunt' }]
        });
        return;
      }

      const totalVal = inventory.reduce((s, a) => s + a.sellValue * a.count, 0);
      const totalCount = inventory.reduce((s, a) => s + a.count, 0);

      const fields = inventory.slice(0, 10).map(a => ({
        name: `${a.emoji} ${a.name} (x${a.count})`,
        value: `Rarity: **${a.rarity.toUpperCase()}** • Sell: **${formatCash(a.sellValue * a.count)} Cash**`,
        inline: true
      }));

      sendBotEmbed({
        title: `🏞️ Your OwO Zoo (${totalCount} Animals)`,
        description: `Total Zoo Value: 💵 **${formatCash(totalVal)} Cash**\nUse \`m sell all\` to cash out or keep them in your sanctuary!`,
        color: '#10b981',
        fields,
        actions: [
          { id: 'zoo_sell_btn', label: `💰 Sell All (${formatCash(totalVal)})`, style: 'success', command: 'm sell all' },
          { id: 'zoo_hunt_btn', label: '🐾 Hunt More', style: 'primary', command: 'm hunt' }
        ]
      });
      return;
    }

    // 10. SELL / SELL ALL
    if (cmd === 'sell') {
      if (arg1 === 'all') {
        sellAllAnimals();
      } else if (arg1) {
        const pet = inventory.find(a => a.name.toLowerCase().includes(arg1) || a.id.toLowerCase() === arg1);
        if (pet) {
          sellAnimal(pet.id, 1);
        } else {
          sendBotEmbed({
            title: '❓ Animal Not Found',
            description: `Could not find "${arg1}" in your zoo. Type \`m zoo\` to check your pets!`,
            color: '#ef4444'
          });
        }
      } else {
        sendBotEmbed({
          title: '❓ Sell Usage',
          description: 'Usage: `m sell all` or `m sell <animal_name>`',
          color: '#f59e0b'
        });
      }
      return;
    }

    // 11. DICE / ROLL (dice / roll)
    if (cmd === 'dice' || cmd === 'roll') {
      const bet = parseAmount(arg1);
      if (bet <= 0) {
        sendBotEmbed({
          title: '❓ Dice Duel Usage',
          description: 'Usage: `m roll <amount> [high/low]` (or duel bot total)\nExample: `m roll 500` or `m roll 1000 high`',
          color: '#f43f5e'
        });
        return;
      }
      if (bet > stats.cash) {
        sounds.playLoss();
        sendBotEmbed({
          title: '🚫 Insufficient Cash',
          description: `You only have **${formatCash(stats.cash)} Cash**!`,
          color: '#ef4444'
        });
        return;
      }

      sounds.playDice();
      const guess = (arg2 === 'high' || arg2 === 'low') ? arg2 : undefined;
      const result = playDiceDuel(bet, guess);

      if (result.won) {
        sounds.playWin();
        addXpAndCash(30, bet, true, bet);
        sendBotEmbed({
          title: '🎲 Dice Duel — Victory! 🎉',
          description: `**Your Roll:** 🎲 [${result.playerRoll[0]}] + [${result.playerRoll[1]}] = **${result.playerTotal}**\n**Bot Roll:** 🎲 [${result.botRoll[0]}] + [${result.botRoll[1]}] = **${result.botTotal}**\n\n**Payout:** 💵 **+${formatCash(result.payout)} Cash** (+${formatCash(bet)} profit)!`,
          color: '#22c55e',
          actions: [
            { id: 'dice_again', label: `🎲 Roll Again (${formatCash(bet)})`, style: 'primary', command: `m roll ${bet}` }
          ]
        });
      } else if (result.tied) {
        sounds.playNotification();
        sendBotEmbed({
          title: '🎲 Dice Duel — Tie!',
          description: `Both rolled **${result.playerTotal}**! Bet returned.`,
          color: '#eab308'
        });
      } else {
        sounds.playLoss();
        addXpAndCash(15, -bet, false, bet);
        sendBotEmbed({
          title: '🎲 Dice Duel — Defeat! 💀',
          description: `**Your Roll:** 🎲 [${result.playerRoll[0]}] + [${result.playerRoll[1]}] = **${result.playerTotal}**\n**Bot Roll:** 🎲 [${result.botRoll[0]}] + [${result.botRoll[1]}] = **${result.botTotal}**\n\n**Lost:** 💵 **-${formatCash(bet)} Cash**!`,
          color: '#ef4444',
          actions: [
            { id: 'dice_retry', label: `🎲 Roll Again (${formatCash(bet)})`, style: 'danger', command: `m roll ${bet}` }
          ]
        });
      }
      return;
    }

    // 12. SHOP / BUY
    if (cmd === 'shop') {
      sounds.playNotification();
      const fields = shopItems.map(item => ({
        name: `${item.emoji} ${item.name} ${item.owned ? '✅ [OWNED]' : `— 💵 ${formatCash(item.price)} Cash`}`,
        value: `${item.description}\nCommand: \`m buy ${item.id}\``,
        inline: false
      }));

      sendBotEmbed({
        title: '🛍️ OwO Lucky Charms & Upgrades Shop',
        description: 'Boost your gambling luck, catch rarer pets, and unlock VIP multipliers!',
        color: '#a855f7',
        fields,
        actions: shopItems.filter(i => !i.owned).slice(0, 4).map(i => ({
          id: `buy_${i.id}`,
          label: `Buy ${i.name}`,
          style: 'primary',
          command: `m buy ${i.id}`,
          emoji: i.emoji
        }))
      });
      return;
    }

    if (cmd === 'buy') {
      if (!arg1) {
        sendBotEmbed({
          title: '❓ Buy Usage',
          description: 'Usage: `m buy <item_id>`\nType `m shop` to view all items!',
          color: '#f59e0b'
        });
        return;
      }
      buyShopItem(arg1);
      return;
    }

    // 13. QUESTS
    if (cmd === 'quest' || cmd === 'quests') {
      sounds.playNotification();
      const fields = quests.map(q => ({
        name: `${q.completed ? (q.claimed ? '✅' : '🎁 [READY TO CLAIM]') : '⏳'} ${q.title} (${q.current}/${q.target})`,
        value: `${q.description}\n**Reward:** 💵 ${formatCash(q.rewardCash)} Cash • 🌟 ${q.rewardXp} XP`,
        inline: false
      }));

      sendBotEmbed({
        title: '📜 Daily Quests & Bounties',
        description: 'Complete daily tasks to earn tons of bonus cash and XP!',
        color: '#eab308',
        fields,
        actions: quests.filter(q => q.completed && !q.claimed).map(q => ({
          id: `claim_${q.id}`,
          label: `Claim ${q.title}`,
          style: 'success',
          command: `claim_quest_${q.id}`
        }))
      });
      return;
    }

    // 13.5 GIVE / SEND / PAY / GIFT
    if (cmd === 'give' || cmd === 'send' || cmd === 'pay' || cmd === 'gift') {
      let targetName = '';
      let amountStr = '';

      if (arg1.startsWith('@') || arg1.startsWith('<@')) {
        targetName = arg1.replace(/[@<>!]/g, '');
        amountStr = arg2;
      } else if (arg2.startsWith('@') || arg2.startsWith('<@')) {
        targetName = arg2.replace(/[@<>!]/g, '');
        amountStr = arg1;
      } else if (isNaN(Number(arg1)) && !isNaN(Number(arg2))) {
        targetName = arg1;
        amountStr = arg2;
      } else {
        amountStr = arg1;
        targetName = arg2;
      }

      const amt = parseAmount(amountStr);

      if (!amt || amt <= 0) {
        sendBotEmbed({
          title: '❓ Give Cash Usage',
          description: 'Transfer cash to a friend!\n\n**Usage:** `m give <amount> <@username>` or `m give <@username> <amount>`\n**Example:** `m give 500 @Aiyan` or `m send 1000 @friend`',
          color: '#f59e0b'
        });
        return;
      }

      if (amt > stats.cash) {
        sounds.playLoss();
        sendBotEmbed({
          title: '🚫 Insufficient Cash',
          description: `You only have **💵 ${formatCash(stats.cash)} Cash** in your wallet!`,
          color: '#ef4444'
        });
        return;
      }

      if (!targetName) {
        sendBotEmbed({
          title: '❓ Missing Recipient',
          description: 'Please specify the user you want to send cash to!\n**Example:** `m give 500 @username`',
          color: '#f59e0b'
        });
        return;
      }

      sounds.playWin();
      setStats(prev => ({
        ...prev,
        cash: prev.cash - amt,
        xp: prev.xp + 15
      }));

      sendBotEmbed({
        title: '🎁 OwO Cash Transfer Successful!',
        description: `You successfully transferred **${formatCash(amt)} Cash** to **@${targetName}**! 🎉`,
        color: '#22c55e',
        fields: [
          { name: '📤 Sent Amount', value: `**${formatCash(amt)} Cash**`, inline: true },
          { name: '💵 Remaining Balance', value: `**${formatCash(stats.cash - amt)} Cash**`, inline: true },
          { name: '🌟 XP Gained', value: '**+15 XP**', inline: true }
        ],
        footer: { text: 'OwO Peer-to-Peer Cash Transfer • Prefix: m' }
      });
      return;
    }

    // 14. ADMIN / GIVECASH (Admin Override)
    if (cmd === 'givecash' || cmd === 'addcash' || cmd === 'setcash' || cmd === 'admin') {
      sounds.playWin();
      const amt = parseAmount(arg1) || 200_000_000;
      setStats(prev => ({
        ...prev,
        cash: prev.cash + amt,
        totalWon: prev.totalWon + amt,
        title: '👑 OwO Bot Administrator'
      }));
      sendBotEmbed({
        title: '👑 Admin Grant — 200,000,000 OwO Cash Added!',
        description: `Admin ID **1522197368601055304** authorized! Granted **+${formatCash(amt)} Cash** to your balance!`,
        color: '#eab308',
        fields: [
          { name: '💵 New Wallet Balance', value: `**${formatCash(stats.cash + amt)} Cash**`, inline: true },
          { name: '👑 Admin Status', value: '**Active (Full Access)**', inline: true }
        ]
      });
      return;
    }

    // Unknown command
    sendBotEmbed({
      title: '❓ Unknown OwO Command',
      description: `Command \`${text}\` not recognized! Type \`owo help\` to see all cash gambling games and features!`,
      color: '#f43f5e'
    });
  };

  return (
    <GameContext.Provider
      value={{
        stats,
        inventory,
        shopItems,
        quests,
        servers,
        currentServerId,
        currentChannelId,
        messages,
        activeBlackjack,
        soundEnabled,
        activeGameModal,
        setCurrentServerId,
        setCurrentChannelId,
        setSoundEnabled,
        setActiveGameModal,
        executeCommand,
        claimQuest,
        buyShopItem,
        sellAnimal,
        sellAllAnimals,
        claimDaily,
        claimEmergencyFunds,
        blackjackHit,
        blackjackStand,
        blackjackDouble,
        resetAllData
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
