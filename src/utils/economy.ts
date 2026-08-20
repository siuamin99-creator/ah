import { Animal, AnimalRarity, BlackjackHand } from '../types';
import { ANIMALS_DATABASE } from '../data/items';

export function formatCash(amount: number): string {
  return new Intl.NumberFormat('en-US').format(Math.floor(amount));
}

export function formatShortCash(amount: number): string {
  if (amount >= 1_000_000_000) return (amount / 1_000_000_000).toFixed(1) + 'B';
  if (amount >= 1_000_000) return (amount / 1_000_000).toFixed(1) + 'M';
  if (amount >= 1_000) return (amount / 1_000).toFixed(1) + 'K';
  return Math.floor(amount).toString();
}

export function getLevelFromXp(xp: number): { level: number; currentXp: number; nextLevelXp: number; progressPercent: number } {
  // Level formula: Level = floor(sqrt(xp / 100)) + 1
  const level = Math.floor(Math.sqrt(xp / 100)) + 1;
  const currentLevelBaseXp = Math.pow(level - 1, 2) * 100;
  const nextLevelBaseXp = Math.pow(level, 2) * 100;
  const xpNeeded = nextLevelBaseXp - currentLevelBaseXp;
  const xpIntoLevel = xp - currentLevelBaseXp;
  const progressPercent = Math.min(100, Math.max(0, (xpIntoLevel / xpNeeded) * 100));

  return {
    level,
    currentXp: xpIntoLevel,
    nextLevelXp: xpNeeded,
    progressPercent
  };
}

export function getTitleForLevel(level: number): string {
  if (level >= 50) return '👑 OwO Supreme Deity';
  if (level >= 30) return '💎 Mythic High Roller';
  if (level >= 20) return '🎰 Casino VIP Master';
  if (level >= 15) return '🦁 Apex Safari Lord';
  if (level >= 10) return '🎲 Lucky High Roller';
  if (level >= 5) return '🦊 Clever Gambler';
  return '🌱 Novice Roller';
}

/* ================= COINFLIP ================= */
export function playCoinflip(
  bet: number,
  userChoice: 'heads' | 'tails' | 'h' | 't' = 'heads',
  luckBonus: number = 0
): {
  won: boolean;
  resultSide: 'heads' | 'tails';
  payout: number;
  multiplier: number;
} {
  const normalizedChoice = (userChoice === 'h' || userChoice === 'heads') ? 'heads' : 'tails';
  
  // Realistic 48.5% base win rate (1.5% house edge) + small luck bonus (max +3%)
  const winProbability = 0.485 + Math.min(0.03, luckBonus * 0.5);
  const isLuckyWin = Math.random() < winProbability;
  
  const resultSide = isLuckyWin ? normalizedChoice : (normalizedChoice === 'heads' ? 'tails' : 'heads');
  const won = resultSide === normalizedChoice;
  
  const multiplier = won ? 2.0 : 0;
  const payout = won ? Math.floor(bet * multiplier) : 0;

  return { won, resultSide, payout, multiplier };
}

/* ================= SLOTS ================= */
export interface SlotSymbol {
  id: string;
  emoji: string;
  name: string;
  weight: number;
  threeMatchMultiplier: number;
  twoMatchMultiplier: number;
}

export const SLOT_SYMBOLS: SlotSymbol[] = [
  { id: 'seven', emoji: '7️⃣', name: 'Lucky 7', weight: 6, threeMatchMultiplier: 12, twoMatchMultiplier: 1.2 },
  { id: 'diamond', emoji: '💎', name: 'Diamond', weight: 10, threeMatchMultiplier: 8, twoMatchMultiplier: 1.0 },
  { id: 'crown', emoji: '👑', name: 'Crown', weight: 14, threeMatchMultiplier: 6, twoMatchMultiplier: 0 },
  { id: 'bell', emoji: '🔔', name: 'Golden Bell', weight: 18, threeMatchMultiplier: 4, twoMatchMultiplier: 0 },
  { id: 'cherry', emoji: '🍒', name: 'Cherry', weight: 24, threeMatchMultiplier: 3, twoMatchMultiplier: 0.5 },
  { id: 'lemon', emoji: '🍋', name: 'Lemon', weight: 28, threeMatchMultiplier: 2, twoMatchMultiplier: 0 }
];

export function playSlots(bet: number, luckBonus: number = 0): {
  reels: [SlotSymbol, SlotSymbol, SlotSymbol];
  won: boolean;
  isJackpot: boolean;
  multiplier: number;
  payout: number;
  winType: string;
} {
  const getRandomSymbol = (): SlotSymbol => {
    const totalWeight = SLOT_SYMBOLS.reduce((sum, s) => sum + s.weight, 0);
    let rand = Math.random() * totalWeight;
    
    if (luckBonus > 0 && Math.random() < luckBonus) {
      rand = rand * 0.8; // subtle bias towards high symbols
    }

    for (const sym of SLOT_SYMBOLS) {
      if (rand < sym.weight) return sym;
      rand -= sym.weight;
    }
    return SLOT_SYMBOLS[SLOT_SYMBOLS.length - 1];
  };

  const reel1 = getRandomSymbol();
  const reel2 = getRandomSymbol();
  const reel3 = getRandomSymbol();

  let multiplier = 0;
  let winType = 'No match';
  let isJackpot = false;

  if (reel1.id === reel2.id && reel2.id === reel3.id) {
    // 3 matching symbols! Big win or jackpot!
    multiplier = reel1.threeMatchMultiplier;
    winType = `Triple ${reel1.name}! 🎉`;
    if (reel1.id === 'seven' || reel1.id === 'diamond') {
      isJackpot = true;
    }
  } else if (reel1.id === 'cherry' && reel2.id === 'cherry') {
    // Double cherries gives half refund (0.5x)
    multiplier = 0.5;
    winType = 'Double Cherries (Partial Refund) 🍒';
  } else if (reel1.id === 'seven' && reel2.id === 'seven') {
    // Double 7s gives 1.2x mini win
    multiplier = 1.2;
    winType = 'Double Lucky 7s! ✨';
  } else if (reel1.id === 'diamond' && reel2.id === 'diamond') {
    // Double Diamonds gives 1.0x break-even
    multiplier = 1.0;
    winType = 'Double Diamonds (Break Even) 💎';
  }

  const won = multiplier >= 1.0;
  const payout = Math.floor(bet * multiplier);

  return {
    reels: [reel1, reel2, reel3],
    won,
    isJackpot,
    multiplier,
    payout,
    winType
  };
}

/* ================= BLACKJACK ================= */
export interface Card {
  suit: '♠' | '♥' | '♦' | '♣';
  value: string;
  numVal: number;
}

const SUITS: Card['suit'][] = ['♠', '♥', '♦', '♣'];
const VALUES = [
  { val: 'A', num: 11 },
  { val: '2', num: 2 },
  { val: '3', num: 3 },
  { val: '4', num: 4 },
  { val: '5', num: 5 },
  { val: '6', num: 6 },
  { val: '7', num: 7 },
  { val: '8', num: 8 },
  { val: '9', num: 9 },
  { val: '10', num: 10 },
  { val: 'J', num: 10 },
  { val: 'Q', num: 10 },
  { val: 'K', num: 10 }
];

export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const s of SUITS) {
    for (const v of VALUES) {
      deck.push({ suit: s, value: v.val, numVal: v.num });
    }
  }
  // Shuffle Fisher-Yates
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export function calculateHandScore(cards: Card[]): { score: number; isBusted: boolean; isBlackjack: boolean } {
  let score = 0;
  let aces = 0;

  for (const card of cards) {
    if (card.value === 'A') {
      aces++;
      score += 11;
    } else {
      score += card.numVal;
    }
  }

  while (score > 21 && aces > 0) {
    score -= 10;
    aces--;
  }

  const isBusted = score > 21;
  const isBlackjack = cards.length === 2 && score === 21;

  return { score, isBusted, isBlackjack };
}

export function formatCardsString(cards: Card[], hideSecondCard = false): string {
  if (hideSecondCard && cards.length > 1) {
    return `[${cards[0].value}${cards[0].suit}] [🂠 ?]`;
  }
  return cards.map(c => `[${c.value}${c.suit}]`).join(' ');
}

/* ================= ANIMAL HUNT ================= */
export function executeHunt(huntBonus: number = 0): {
  caught: Animal[];
  rarityCount: Record<AnimalRarity, number>;
  xpGained: number;
  totalSellValue: number;
} {
  const numAnimals = Math.random() < 0.35 ? 3 : (Math.random() < 0.65 ? 2 : 1);
  const caught: Animal[] = [];
  const rarityCount: Record<AnimalRarity, number> = {
    common: 0,
    uncommon: 0,
    rare: 0,
    epic: 0,
    mythical: 0,
    fabled: 0
  };

  for (let i = 0; i < numAnimals; i++) {
    const rand = Math.random();
    let selectedRarity: AnimalRarity = 'common';

    // Rarity weights with optional huntBonus
    const fabledThreshold = 0.005 * (1 + huntBonus);
    const mythicalThreshold = fabledThreshold + 0.035 * (1 + huntBonus);
    const epicThreshold = mythicalThreshold + 0.09 * (1 + huntBonus);
    const rareThreshold = epicThreshold + 0.20 * (1 + huntBonus);
    const uncommonThreshold = rareThreshold + 0.30;

    if (rand < fabledThreshold) {
      selectedRarity = 'fabled';
    } else if (rand < mythicalThreshold) {
      selectedRarity = 'mythical';
    } else if (rand < epicThreshold) {
      selectedRarity = 'epic';
    } else if (rand < rareThreshold) {
      selectedRarity = 'rare';
    } else if (rand < uncommonThreshold) {
      selectedRarity = 'uncommon';
    } else {
      selectedRarity = 'common';
    }

    const eligible = ANIMALS_DATABASE.filter(a => a.rarity === selectedRarity);
    const chosen = eligible[Math.floor(Math.random() * eligible.length)] || ANIMALS_DATABASE[0];

    caught.push({
      ...chosen,
      count: 1
    });
    rarityCount[selectedRarity]++;
  }

  const xpGained = caught.reduce((acc, a) => {
    switch (a.rarity) {
      case 'fabled': return acc + 500;
      case 'mythical': return acc + 200;
      case 'epic': return acc + 80;
      case 'rare': return acc + 40;
      case 'uncommon': return acc + 20;
      default: return acc + 10;
    }
  }, 30);

  const totalSellValue = caught.reduce((acc, a) => acc + a.sellValue, 0);

  return { caught, rarityCount, xpGained, totalSellValue };
}

/* ================= DICE DUEL ================= */
export function playDiceDuel(bet: number, guessHighLow?: 'high' | 'low'): {
  playerRoll: [number, number];
  playerTotal: number;
  botRoll: [number, number];
  botTotal: number;
  won: boolean;
  tied: boolean;
  multiplier: number;
  payout: number;
} {
  const p1 = Math.floor(Math.random() * 6) + 1;
  const p2 = Math.floor(Math.random() * 6) + 1;
  const playerTotal = p1 + p2;

  const b1 = Math.floor(Math.random() * 6) + 1;
  const b2 = Math.floor(Math.random() * 6) + 1;
  const botTotal = b1 + b2;

  let won = false;
  let tied = false;

  if (guessHighLow) {
    if (guessHighLow === 'high' && playerTotal >= 8) won = true;
    else if (guessHighLow === 'low' && playerTotal <= 6) won = true;
    // Note: If playerTotal is 7, the house wins (natural house roll)
  } else {
    if (playerTotal > botTotal) won = true;
    else if (playerTotal === botTotal) tied = true;
  }

  const multiplier = won ? 2.0 : (tied ? 1.0 : 0);
  const payout = Math.floor(bet * multiplier);

  return {
    playerRoll: [p1, p2],
    playerTotal,
    botRoll: [b1, b2],
    botTotal,
    won,
    tied,
    multiplier,
    payout
  };
}
