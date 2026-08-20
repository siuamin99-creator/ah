export type AnimalRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'mythical' | 'fabled';

export interface Animal {
  id: string;
  name: string;
  emoji: string;
  ascii: string;
  rarity: AnimalRarity;
  count: number;
  sellValue: number;
  attack: number;
  defense: number;
}

export interface ShopItem {
  id: string;
  name: string;
  emoji: string;
  description: string;
  price: number;
  category: 'luck' | 'hunt' | 'passive' | 'badge';
  luckBonus?: number; // e.g. 0.05 for +5% luck
  huntBonus?: number; // e.g. 0.1 for +10% rare catch
  passiveIncome?: number; // cash per minute
  owned: boolean;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  rewardCash: number;
  rewardXp: number;
  completed: boolean;
  claimed: boolean;
  type: 'coinflip' | 'slots' | 'blackjack' | 'hunt' | 'win_streak' | 'spend';
}

export interface BlackjackHand {
  cards: { suit: string; value: string; numVal: number }[];
  score: number;
  isBusted: boolean;
  isBlackjack: boolean;
}

export interface DiscordEmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

export interface DiscordEmbedAction {
  id: string;
  label: string;
  style: 'primary' | 'secondary' | 'success' | 'danger';
  command: string;
  emoji?: string;
  disabled?: boolean;
}

export interface DiscordEmbed {
  title?: string;
  description?: string;
  color?: string; // hex e.g. '#f43f5e', '#5865F2', '#22c55e', '#ef4444'
  fields?: DiscordEmbedField[];
  author?: {
    name: string;
    iconUrl?: string;
  };
  footer?: {
    text: string;
    iconUrl?: string;
  };
  thumbnail?: string;
  image?: string;
  timestamp?: string;
  actions?: DiscordEmbedAction[];
}

export interface ChatMessage {
  id: string;
  sender: {
    id: string;
    name: string;
    avatar: string;
    isBot?: boolean;
    botTag?: string;
    roleColor?: string;
  };
  content?: string;
  embed?: DiscordEmbed;
  timestamp: string;
  channelId: string;
  isInteractive?: boolean;
  gameData?: {
    gameType?: 'coinflip' | 'slots' | 'blackjack' | 'dice' | 'hunt' | 'scratch';
    status?: 'playing' | 'won' | 'lost' | 'tied';
    amount?: number;
    payout?: number;
  };
}

export interface UserStats {
  cash: number;
  bank: number;
  xp: number;
  level: number;
  totalGames: number;
  totalWins: number;
  totalLosses: number;
  totalWagered: number;
  totalWon: number;
  biggestWin: number;
  currentStreak: number;
  bestStreak: number;
  dailyStreak: number;
  lastDailyTimestamp: number;
  huntsCount: number;
  title: string;
}

export interface Channel {
  id: string;
  name: string;
  topic: string;
  icon?: string;
  category: string;
}

export interface DiscordServer {
  id: string;
  name: string;
  icon: string;
  unreadCount?: number;
  channels: Channel[];
}
