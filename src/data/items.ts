import { Animal, ShopItem, Quest, DiscordServer } from '../types';

export const ANIMALS_DATABASE: Omit<Animal, 'count'>[] = [
  // Common (50% drop)
  { id: 'cat', name: 'Cat', emoji: '🐱', ascii: '( =^･ω･^= )', rarity: 'common', sellValue: 60, attack: 5, defense: 4 },
  { id: 'dog', name: 'Dog', emoji: '🐶', ascii: '(❍ᴥ❍ʋ)', rarity: 'common', sellValue: 60, attack: 6, defense: 5 },
  { id: 'mouse', name: 'Mouse', emoji: '🐭', ascii: 'ᘛ⁐̤ᕐᐷ', rarity: 'common', sellValue: 40, attack: 3, defense: 2 },
  { id: 'rabbit', name: 'Bunny', emoji: '🐰', ascii: '( ᐢ. ̫ .ᐢ )', rarity: 'common', sellValue: 50, attack: 4, defense: 3 },
  { id: 'duck', name: 'Duck', emoji: '🦆', ascii: '(`･⊝･´)', rarity: 'common', sellValue: 45, attack: 4, defense: 3 },
  { id: 'hamster', name: 'Hamster', emoji: '🐹', ascii: '( ˶•o•˶ )', rarity: 'common', sellValue: 55, attack: 3, defense: 4 },

  // Uncommon (25% drop)
  { id: 'fox', name: 'Fox', emoji: '🦊', ascii: '(◕ᴥ◕)', rarity: 'uncommon', sellValue: 180, attack: 14, defense: 10 },
  { id: 'panda', name: 'Panda', emoji: '🐼', ascii: 'ʕ •ᴥ•ʔ', rarity: 'uncommon', sellValue: 200, attack: 12, defense: 16 },
  { id: 'koala', name: 'Koala', emoji: '🐨', ascii: 'ʕ •̀ ω •́ ʔ', rarity: 'uncommon', sellValue: 190, attack: 10, defense: 15 },
  { id: 'hedgehog', name: 'Hedgehog', emoji: '🦔', ascii: '(•ө•)', rarity: 'uncommon', sellValue: 175, attack: 11, defense: 18 },
  { id: 'wolf', name: 'Wolf', emoji: '🐺', ascii: '🐺( `ᴥ´ )', rarity: 'uncommon', sellValue: 220, attack: 18, defense: 12 },

  // Rare (14% drop)
  { id: 'lion', name: 'Lion King', emoji: '🦁', ascii: '🦁( ʘ̆ ╭͜ʖ╮ ʘ̆ )', rarity: 'rare', sellValue: 650, attack: 42, defense: 35 },
  { id: 'tiger', name: 'Bengal Tiger', emoji: '🐯', ascii: '🐯( •̀ ⌂ •́ )', rarity: 'rare', sellValue: 700, attack: 48, defense: 32 },
  { id: 'shark', name: 'Great Shark', emoji: '🦈', ascii: '🦈(◣_◢)', rarity: 'rare', sellValue: 600, attack: 45, defense: 28 },
  { id: 'owl', name: 'Mystic Owl', emoji: '🦉', ascii: '🦉( O v O )', rarity: 'rare', sellValue: 580, attack: 38, defense: 34 },

  // Epic (7% drop)
  { id: 'unicorn', name: 'Starlight Unicorn', emoji: '🦄', ascii: '🦄(✿╹◡╹)', rarity: 'epic', sellValue: 2200, attack: 95, defense: 88 },
  { id: 'phoenix', name: 'Sun Phoenix', emoji: '🦅', ascii: '🔥(ง •̀_•́)ง🔥', rarity: 'epic', sellValue: 2600, attack: 115, defense: 75 },
  { id: 'dragon', name: 'Inferno Dragon', emoji: '🐉', ascii: '🐉(╬ Ò ‸ Ó)', rarity: 'epic', sellValue: 3000, attack: 130, defense: 110 },

  // Mythical (3.5% drop)
  { id: 'cosmic_whale', name: 'Cosmic Whale', emoji: '🌌', ascii: '🐋✧･ﾟ:*( ͡° ͜ʖ ͡°)', rarity: 'mythical', sellValue: 8500, attack: 260, defense: 240 },
  { id: 'golden_owo', name: 'Golden OwO God', emoji: '👑', ascii: '👑(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧', rarity: 'mythical', sellValue: 12000, attack: 320, defense: 300 },
  { id: 'thunderbird', name: 'Raiju Thunderbird', emoji: '⚡', ascii: '⚡(ʘдʘ╬)⚡', rarity: 'mythical', sellValue: 9500, attack: 290, defense: 220 },

  // Fabled (0.5% drop)
  { id: 'leviathan', name: 'Diamond Void Leviathan', emoji: '💎', ascii: '💎✨(✪ω✪)✨💎', rarity: 'fabled', sellValue: 35000, attack: 850, defense: 780 }
];

export const INITIAL_SHOP_ITEMS: ShopItem[] = [
  {
    id: 'lucky_clover',
    name: 'Four-Leaf Clover',
    emoji: '🍀',
    description: '+5% higher win probability on Coinflip & Slots',
    price: 3000,
    category: 'luck',
    luckBonus: 0.05,
    owned: false
  },
  {
    id: 'golden_dice',
    name: 'Golden Gambler Dice',
    emoji: '🎲',
    description: '+10% jackpot payout bonus on all wins',
    price: 8000,
    category: 'luck',
    luckBonus: 0.08,
    owned: false
  },
  {
    id: 'hunter_lens',
    name: 'Golden Safari Lens',
    emoji: '🔍',
    description: 'Increases chance of catching Rare, Epic & Mythical animals by 40%',
    price: 5000,
    category: 'hunt',
    huntBonus: 0.40,
    owned: false
  },
  {
    id: 'piggy_bank',
    name: 'Auto-Mining OwO Farm',
    emoji: '🏦',
    description: 'Generates 150 Cash every 30 seconds automatically',
    price: 10000,
    category: 'passive',
    passiveIncome: 150,
    owned: false
  },
  {
    id: 'diamond_ring',
    name: 'Billionaire Diamond Ring',
    emoji: '💍',
    description: 'Flex badge + unlocks High Roller VIP channels & 15% discount in shop',
    price: 25000,
    category: 'badge',
    owned: false
  },
  {
    id: 'crown_of_owo',
    name: 'Crown of OwO Lords',
    emoji: '👑',
    description: 'Supreme status symbol. Multiplies Daily Rewards by 3x permanently!',
    price: 50000,
    category: 'badge',
    owned: false
  }
];

export const DEFAULT_QUESTS: Quest[] = [
  {
    id: 'q1',
    title: 'Coin Toss Master',
    description: 'Win 3 Coinflip games (`owo cf <amt>`)',
    target: 3,
    current: 0,
    rewardCash: 1200,
    rewardXp: 150,
    completed: false,
    claimed: false,
    type: 'coinflip'
  },
  {
    id: 'q2',
    title: 'Spin to Win',
    description: 'Play 3 Slot machine spins (`owo slots <amt>`)',
    target: 3,
    current: 0,
    rewardCash: 1500,
    rewardXp: 200,
    completed: false,
    claimed: false,
    type: 'slots'
  },
  {
    id: 'q3',
    title: 'Safari Hunter',
    description: 'Hunt for wild animals 4 times (`owo hunt`)',
    target: 4,
    current: 0,
    rewardCash: 2000,
    rewardXp: 250,
    completed: false,
    claimed: false,
    type: 'hunt'
  },
  {
    id: 'q4',
    title: 'High Stakes Blackjack',
    description: 'Play 2 rounds of Blackjack (`owo bj <amt>`)',
    target: 2,
    current: 0,
    rewardCash: 2500,
    rewardXp: 300,
    completed: false,
    claimed: false,
    type: 'blackjack'
  },
  {
    id: 'q5',
    title: 'Hot Streak',
    description: 'Achieve a 3-game winning streak in any cash game',
    target: 3,
    current: 0,
    rewardCash: 3500,
    rewardXp: 400,
    completed: false,
    claimed: false,
    type: 'win_streak'
  }
];

export const DEFAULT_SERVERS: DiscordServer[] = [
  {
    id: 'owo_official',
    name: 'OwO Casino & Bot Lounge',
    icon: '🎰',
    unreadCount: 0,
    channels: [
      { id: 'bot-commands', name: 'bot-commands', topic: 'General OwO bot testing, help & profile commands', category: 'GENERAL' },
      { id: 'gambling-den', name: 'gambling-den', topic: 'All cash gambling games: Coinflip, Slots, Blackjack, Dice', category: 'GAMBLING' },
      { id: 'coinflip-arena', name: 'coinflip-arena', topic: 'Double your cash with heads or tails! owo cf <amount> [h/t]', category: 'GAMBLING' },
      { id: 'slots-jackpot', name: 'slots-jackpot', topic: 'Spin for 10x 777 Jackpot! owo slots <amount>', category: 'GAMBLING' },
      { id: 'blackjack-table', name: 'blackjack-table', topic: 'Beat the dealer to 21! owo bj <amount>', category: 'GAMBLING' },
      { id: 'zoo-and-hunting', name: 'zoo-and-hunting', topic: 'Catch rare wild animals & manage your zoo! owo hunt, owo zoo', category: 'ECONOMY' },
      { id: 'shop-and-market', name: 'shop-and-market', topic: 'Buy lucky charms, clovers & gear! owo shop, owo buy <item>', category: 'ECONOMY' },
      { id: 'leaderboard', name: 'leaderboard-rich', topic: 'Top richest OwO players & gambling kings', category: 'COMMUNITY' }
    ]
  },
  {
    id: 'vip_high_rollers',
    name: 'High Rollers VIP Club',
    icon: '💎',
    channels: [
      { id: 'vip-lounge', name: 'vip-high-stakes', topic: 'High bet limits and legendary beasts', category: 'VIP EXCLUSIVE' },
      { id: 'whale-bets', name: 'whale-bets-feed', topic: 'Live feed of massive wins and jackpots', category: 'VIP EXCLUSIVE' }
    ]
  }
];

export const SIMULATED_MEMBERS = [
  { id: 'owo_bot', name: 'OwO Bot', avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80', isBot: true, botTag: 'BOT', roleColor: '#f43f5e', status: 'online', activity: 'Playing with Cowoncy | owo help' },
  { id: 'user_me', name: 'You (Player)', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80', roleColor: '#38bdf8', status: 'online', activity: 'Winning big in #gambling-den' },
  { id: 'luna_owo', name: 'Luna_OwO', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80', roleColor: '#a855f7', status: 'online', activity: 'owo cf 5000 h' },
  { id: 'crypto_whale', name: 'CryptoWhale99', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80', roleColor: '#eab308', status: 'idle', activity: '1,450,000 Cash' },
  { id: 'kawaii_neko', name: 'KawaiiNeko', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80', roleColor: '#ec4899', status: 'online', activity: 'Hunting Mythical Pets' },
  { id: 'senpai_gambler', name: 'Senpai_Luck', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80', roleColor: '#22c55e', status: 'dnd', activity: '10x win streak!' }
];
