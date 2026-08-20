import {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Message,
  Interaction,
  ComponentType
} from 'discord.js';

// In-memory persistent database for Discord users
export interface DiscordUserEconomy {
  userId: string;
  username: string;
  cash: number;
  bank: number;
  xp: number;
  level: number;
  dailyStreak: number;
  lastDaily: number;
  inventory: { id: string; name: string; emoji: string; count: number; sellValue: number; rarity: string }[];
  stats: {
    totalGames: number;
    totalWins: number;
    totalLosses: number;
    totalWagered: number;
    totalWon: number;
  };
}

export const ADMIN_IDS = ['1522197368601055304', '1353275137574699060'];
export const ADMIN_STARTING_CASH = 200_000_000; // 200 Million OwO Cash

const userDatabase = new Map<string, DiscordUserEconomy>();

export function getOrCreateUser(userId: string, username: string): DiscordUserEconomy {
  const isAdmin = ADMIN_IDS.includes(userId);
  if (!userDatabase.has(userId)) {
    userDatabase.set(userId, {
      userId,
      username,
      cash: isAdmin ? ADMIN_STARTING_CASH : 0, // All new users start with 0 cash
      bank: isAdmin ? 50_000_000 : 0,
      xp: isAdmin ? 500000 : 0,
      level: isAdmin ? 100 : 1,
      dailyStreak: isAdmin ? 50 : 0,
      lastDaily: 0,
      inventory: isAdmin
        ? [
            { id: 'celestial_god', name: 'Celestial Deity', emoji: '👑', count: 5, sellValue: 80000, rarity: 'fabled' },
            { id: 'dragon', name: 'Dragon', emoji: '🐉', count: 10, sellValue: 18000, rarity: 'mythical' },
            { id: 'unicorn', name: 'Unicorn', emoji: '🦄', count: 20, sellValue: 5000, rarity: 'epic' }
          ]
        : [],
      stats: {
        totalGames: 0,
        totalWins: 0,
        totalLosses: 0,
        totalWagered: 0,
        totalWon: 0
      }
    });
  }
  const user = userDatabase.get(userId)!;
  user.username = username;
  // If admin cash was somehow below 200m upon load, ensure they have at least 200m
  if (isAdmin && user.cash < ADMIN_STARTING_CASH) {
    user.cash = ADMIN_STARTING_CASH;
  }
  return user;
}

export function formatCash(amount: number): string {
  return new Intl.NumberFormat('en-US').format(Math.floor(amount));
}

export function getLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

// Animal database for Discord hunting
const ANIMALS_DB = [
  { id: 'dog', name: 'Dog', emoji: '🐶', rarity: 'common', sellValue: 100 },
  { id: 'cat', name: 'Cat', emoji: '🐱', rarity: 'common', sellValue: 150 },
  { id: 'rabbit', name: 'Rabbit', emoji: '🐰', rarity: 'common', sellValue: 200 },
  { id: 'fox', name: 'Fox', emoji: '🦊', rarity: 'uncommon', sellValue: 450 },
  { id: 'bear', name: 'Bear', emoji: '🐻', rarity: 'uncommon', sellValue: 600 },
  { id: 'panda', name: 'Panda', emoji: '🐼', rarity: 'uncommon', sellValue: 750 },
  { id: 'lion', name: 'Lion', emoji: '🦁', rarity: 'rare', sellValue: 1600 },
  { id: 'tiger', name: 'Tiger', emoji: '🐯', rarity: 'rare', sellValue: 1800 },
  { id: 'unicorn', name: 'Unicorn', emoji: '🦄', rarity: 'epic', sellValue: 5000 },
  { id: 'dragon', name: 'Dragon', emoji: '🐉', rarity: 'mythical', sellValue: 18000 },
  { id: 'phoenix', name: 'Phoenix', emoji: '🔥', rarity: 'mythical', sellValue: 25000 },
  { id: 'celestial_god', name: 'Celestial Deity', emoji: '👑', rarity: 'fabled', sellValue: 80000 }
];

export interface BotLog {
  timestamp: string;
  type: 'info' | 'command' | 'error' | 'success';
  message: string;
}

class DiscordBotManager {
  public client: Client | null = null;
  public isOnline: boolean = false;
  public botTag: string = '';
  public botAvatar: string = '';
  public botId: string = '1475437715888541780';
  public guildsCount: number = 0;
  public ping: number = 0;
  public logs: BotLog[] = [];
  public currentToken: string = '';
  private reconnectTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.addLog('info', 'Discord Bot Manager initialized');
  }

  public addLog(type: BotLog['type'], message: string) {
    const timestamp = new Date().toLocaleTimeString();
    this.logs.unshift({ timestamp, type, message });
    if (this.logs.length > 50) this.logs.pop();
    console.log(`[DiscordBot][${type.toUpperCase()}] ${message}`);
  }

  public async start(token?: string) {
    const botToken = token || process.env.DISCORD_BOT_TOKEN || 'MTQ3NTQzNzcxNTg4ODU0MTc4MA.GkVIv0.sES_bHxmfAXG1VyXba110e-TmM7-hmK_Om6354';
    if (!botToken || botToken.trim() === '') {
      this.addLog('error', 'No Discord Bot Token provided. Set DISCORD_BOT_TOKEN.');
      return false;
    }

    this.currentToken = botToken;

    if (this.client) {
      try {
        await this.client.destroy();
      } catch {
        /* ignore */
      }
    }

    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages
      ]
    });

    this.client.on('ready', () => {
      this.isOnline = true;
      this.botTag = this.client?.user?.tag || 'OwO Bot';
      this.botAvatar = this.client?.user?.displayAvatarURL() || '';
      this.botId = this.client?.user?.id || '1475437715888541780';
      this.guildsCount = this.client?.guilds.cache.size || 0;
      this.ping = this.client?.ws.ping || 0;
      this.addLog('success', `Bot is ONLINE as ${this.botTag} (Serving ${this.guildsCount} server(s))`);
    });

    this.client.on('error', (err) => {
      this.addLog('error', `Discord Client Error: ${err.message}`);
    });

    this.client.on('messageCreate', async (msg) => {
      if (msg.author.bot) return;
      await this.handleMessage(msg);
    });

    try {
      this.addLog('info', 'Logging into Discord Gateway...');
      await this.client.login(botToken);
      return true;
    } catch (err: any) {
      this.isOnline = false;
      this.addLog('error', `Failed to login to Discord: ${err?.message || err}`);
      // Fallback advice if token was reset by Discord scanner
      if (err?.message?.includes('TOKEN_INVALID') || err?.message?.includes('An invalid token was provided')) {
        this.addLog('error', 'The token appears to be invalid or was reset. Please regenerate a fresh token at discord.com/developers/applications');
      }
      return false;
    }
  }

  private async handleMessage(msg: Message) {
    const text = msg.content.trim();
    if (!text) return;
    const lower = text.toLowerCase();
    const parts = lower.split(/\s+/);
    let prefix = parts[0];

    // Determine command and arguments
    let cmd = '';
    let arg1 = '';
    let arg2 = '';

    // Check retired prefixes: 'o' / 'owo'
    if (prefix === 'o' || prefix === 'owo' || (prefix.startsWith('o') && !prefix.startsWith('owner') && !prefix.startsWith('http') && prefix.length > 1) || (prefix.startsWith('owo') && prefix.length > 3)) {
      const embed = new EmbedBuilder()
        .setTitle('⚠️ Command Prefix Updated to `m`')
        .setDescription('The `o` and `owo` command prefixes are disabled. Please use **`m`** prefix for all commands!\n\n**Examples:**\n• `m cash` (check balance)\n• `m hunt` (safari pets)\n• `m cf 500 h` (coinflip)\n• `m slots 500` (slots)\n• `m bj 500` (blackjack)\n• `m daily` (daily reward)\n• `m owner` (CEO credentials)')
        .setColor('#f59e0b')
        .setFooter({ text: 'OwO Bot • Use m prefix' });
      await msg.reply({ embeds: [embed] });
      return;
    }

    // Active prefix: 'm' or slash commands '/'
    if (prefix === 'm') {
      cmd = parts[1] || 'cash';
      arg1 = parts[2] || '';
      arg2 = parts[3] || '';
    } else if (prefix.startsWith('m') && prefix.length > 1 && !prefix.startsWith('http')) {
      // E.g. 'mcash', 'mbal', 'mcf', 'mhunt', 'mslots', 'mbj', 'mzoo'
      cmd = prefix.slice(1);
      arg1 = parts[1] || '';
      arg2 = parts[2] || '';
    } else if (prefix.startsWith('/')) {
      // E.g. '/cash', '/bal', '/cf'
      cmd = prefix.slice(1);
      arg1 = parts[1] || '';
      arg2 = parts[2] || '';
    } else if (prefix === 'cash' || prefix === 'bal' || prefix === 'money' || prefix === 'balance') {
      // Direct command without prefix
      cmd = 'cash';
      arg1 = parts[1] || '';
      arg2 = parts[2] || '';
    } else if (prefix === 'owner' || prefix === 'founder' || prefix === 'ceo' || prefix === 'developer' || prefix === 'dev' || prefix === 'wifey' || prefix === 'wife') {
      cmd = 'owner';
      arg1 = parts[1] || '';
      arg2 = parts[2] || '';
    } else {
      // Not a bot command
      return;
    }

    const user = getOrCreateUser(msg.author.id, msg.author.username);

    this.addLog('command', `User @${msg.author.username} ran "${text}" in #${(msg.channel as any).name || 'DM'}`);

    // Helper to parse amount: "500", "all", "half", "1k", "5m"
    const parseAmount = (input?: string): number => {
      if (!input) return 0;
      if (input === 'all' || input === 'max') return user.cash;
      if (input === 'half' || input === 'h') return Math.floor(user.cash / 2);
      if (input.endsWith('k')) return parseFloat(input) * 1000;
      if (input.endsWith('m')) return parseFloat(input) * 1000000;
      const num = parseInt(input, 10);
      return isNaN(num) ? 0 : num;
    };

    try {
      // 1. HELP
      if (cmd === 'help' || cmd === 'h') {
        const embed = new EmbedBuilder()
          .setTitle('🌸 OwO Discord Bot — Commands & Cash Games')
          .setDescription('Welcome to the OwO Casino & Zoo Sanctuary! Here are the available commands to play and earn cash:')
          .setColor('#f43f5e')
          .addFields(
            { name: '🪙 Gambling Games', value: '`m cf <amt> [h/t]` — Coinflip (2x)\n`m slots <amt>` (or `m s`) — 3-Reel Slots (up to 12x)\n`m bj <amt>` — Blackjack 21 vs Dealer\n`m roll <amt> [high/low]` — Dice Duel vs Bot', inline: false },
            { name: '🐾 Safari Zoo & Hunting', value: '`m hunt` (or `m h`) — Catch wild & mythical animals\n`m zoo` (or `m inv`) — View caught pets\n`m sell <animal>` / `m sell all` — Sell pets for cash\n`m cash` / `m bal` — Check balance & stats', inline: false },
            { name: '🎁 Daily & Transfers', value: '`m daily` — Claim daily streak cowoncy\n`m give <amt> <@user>` — Gift cash to another player\n`m beg` — Emergency cash relief if broke (< 200)\n`m owner` — View Founder & CEO credentials', inline: false }
          )
          .setFooter({ text: 'OwO Bot • Prefix: m' });

        await msg.reply({ embeds: [embed] });
        return;
      }

      // 2. PING
      if (cmd === 'ping') {
        const ping = this.client?.ws.ping || 0;
        await msg.reply(`🏓 Pong! Latency is **${ping}ms**.`);
        return;
      }

      // 2.5 OWNER / FOUNDER / CEO
      if (cmd === 'owner' || cmd === 'founder' || cmd === 'ceo' || cmd === 'developer' || cmd === 'dev' || cmd === 'wife' || cmd === 'wifey') {
        const embed = new EmbedBuilder()
          .setTitle('👑 OwO Bot Official Ownership & Leadership Profile')
          .setDescription('Official bot ownership, executive leadership, and royal management:')
          .setColor('#eab308')
          .addFields(
            { name: '👑 Founder & CEO', value: '**Supreme Bot Owner & Chief Executive Officer**\n🆔 Discord ID: `1522197368601055304` (<@1522197368601055304>)', inline: false },
            { name: '💖 CEO Wifey / First Lady', value: '**Verified Royal Co-Owner & Executive Wifey**\n🆔 Discord ID: `1353275137574699060` (<@1353275137574699060>)', inline: false },
            { name: '🌟 Status & Permissions', value: '✅ **Verified Supreme Bot Authority** (Full System Immunity & Executive Rights)', inline: false },
            { name: '💼 Project Organization', value: 'OwO Casino & Safari Wildlife Network • Official Core Team', inline: false }
          )
          .setFooter({ text: 'OwO Bot System Verified • Founder: 1522197368601055304 • CEO Wifey: 1353275137574699060' })
          .setTimestamp();

        await msg.reply({ embeds: [embed] });
        return;
      }

      // 3. CASH / BAL
      if (cmd === 'cash' || cmd === 'bal' || cmd === 'money' || cmd === 'balance') {
        const isAdmin = ADMIN_IDS.includes(msg.author.id);
        const userLevel = getLevel(user.xp);
        const embed = new EmbedBuilder()
          .setTitle(`${isAdmin ? '👑 [OWNER / ADMIN] ' : '💵 '}${msg.author.username}'s Wallet & Profile`)
          .setColor(isAdmin ? '#eab308' : '#22c55e')
          .addFields(
            { name: '💵 Wallet Cash', value: `**${formatCash(user.cash)} Cash**`, inline: true },
            { name: '🏦 Bank Vault', value: `**${formatCash(user.bank)} Cash**`, inline: true },
            { name: '🌟 Level & XP', value: `**Level ${userLevel}** (${formatCash(user.xp)} XP)`, inline: true },
            { name: '🔥 Daily Streak', value: `**${user.dailyStreak} Days**`, inline: true },
            { name: '🏆 Win Rate', value: `${user.stats.totalGames > 0 ? ((user.stats.totalWins / user.stats.totalGames) * 100).toFixed(1) : 0}% (${user.stats.totalWins}W / ${user.stats.totalLosses}L)`, inline: true },
            { name: '💎 Total Wagered', value: `**${formatCash(user.stats.totalWagered)} Cash**`, inline: true },
            { name: '🐾 Zoo Pets Count', value: `**${user.inventory.reduce((s, a) => s + a.count, 0)} pets**`, inline: true }
          )
          .setFooter({ text: isAdmin ? '👑 Unlimited Admin Privileges Active • OwO Bot' : 'Use `m daily` or `m hunt` to earn more cash!' });

        if (isAdmin) {
          embed.setDescription('👑 **Supreme Admin Account**: Initialized with **200,000,000 OwO Cash** & Mythical Zoo Collection!');
        }

        await msg.reply({ embeds: [embed] });
        return;
      }

      // 4. DAILY
      if (cmd === 'daily') {
        const now = Date.now();
        const cooldown = 12 * 60 * 60 * 1000;
        if (now - user.lastDaily < cooldown && user.lastDaily > 0) {
          const remainingMs = cooldown - (now - user.lastDaily);
          const hrs = Math.floor(remainingMs / (60 * 60 * 1000));
          const mins = Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000));
          await msg.reply(`⏳ You already claimed your daily reward! Come back in **${hrs}h ${mins}m**.`);
          return;
        }

        const reward = 2500 + user.dailyStreak * 400;
        user.cash += reward;
        user.xp += 150;
        user.dailyStreak += 1;
        user.lastDaily = now;

        const embed = new EmbedBuilder()
          .setTitle('🎁 Daily Cowoncy Claimed!')
          .setDescription(`You received **+${formatCash(reward)} Cash** and **+150 XP**!\n**Daily Streak:** 🔥 **${user.dailyStreak} Days**`)
          .setColor('#22c55e');

        await msg.reply({ embeds: [embed] });
        return;
      }

      // 5. BEG / EMERGENCY
      if (cmd === 'beg') {
        if (user.cash < 200) {
          user.cash += 3000;
          await msg.reply('💸 **OwO Bailout!** Here is **+3,000 Cash** to get you back in the game!');
        } else {
          await msg.reply(`😅 You still have **${formatCash(user.cash)} Cash**! Emergency bailout is only for bankrupt players (< 200).`);
        }
        return;
      }

      // 6. COINFLIP
      if (cmd === 'cf' || cmd === 'coinflip') {
        const bet = parseAmount(arg1);
        if (bet <= 0) {
          await msg.reply('❓ Usage: `m cf <amount> [heads/tails/h/t]`\nExample: `m cf 500 h`');
          return;
        }
        if (bet > user.cash) {
          await msg.reply(`🚫 You only have **${formatCash(user.cash)} Cash**! You cannot bet **${formatCash(bet)} Cash**.`);
          return;
        }

        const choice = (arg2 === 't' || arg2 === 'tails') ? 'tails' : 'heads';
        // Authentic 48.5% win rate (1.5% house edge)
        const won = Math.random() < 0.485;
        const resultSide = won ? choice : (choice === 'heads' ? 'tails' : 'heads');

        user.stats.totalGames++;
        user.stats.totalWagered += bet;

        if (won) {
          user.cash += bet;
          user.xp += 30;
          user.stats.totalWins++;
          user.stats.totalWon += bet;

          const embed = new EmbedBuilder()
            .setTitle(`🪙 Coinflip — ${resultSide.toUpperCase()}! 🎉`)
            .setDescription(`**${msg.author.username}** chose **${choice.toUpperCase()}** and won **+${formatCash(bet * 2)} Cash** (+${formatCash(bet)} profit)!\n**New Balance:** 💵 **${formatCash(user.cash)} Cash**`)
            .setColor('#22c55e');
          await msg.reply({ embeds: [embed] });
        } else {
          user.cash -= bet;
          user.xp += 10;
          user.stats.totalLosses++;

          const embed = new EmbedBuilder()
            .setTitle(`🪙 Coinflip — ${resultSide.toUpperCase()}! 💀`)
            .setDescription(`**${msg.author.username}** chose **${choice.toUpperCase()}** and lost **-${formatCash(bet)} Cash**!\n**New Balance:** 💵 **${formatCash(user.cash)} Cash**`)
            .setColor('#ef4444');
          await msg.reply({ embeds: [embed] });
        }
        return;
      }

      // 7. SLOTS
      if (cmd === 'slots' || cmd === 's' || cmd === 'slot') {
        const bet = parseAmount(arg1);
        if (bet <= 0) {
          await msg.reply('❓ Usage: `m slots <amount>` (or `m s 500`)');
          return;
        }
        if (bet > user.cash) {
          await msg.reply(`🚫 You only have **${formatCash(user.cash)} Cash**!`);
          return;
        }

        const symbols = [
          { name: 'Lucky 7', emoji: '7️⃣', mult: 12, weight: 6 },
          { name: 'Diamond', emoji: '💎', mult: 8, weight: 10 },
          { name: 'Crown', emoji: '👑', mult: 6, weight: 14 },
          { name: 'Bell', emoji: '🔔', mult: 4, weight: 18 },
          { name: 'Cherry', emoji: '🍒', mult: 3, weight: 24 },
          { name: 'Lemon', emoji: '🍋', mult: 2, weight: 28 }
        ];

        const totalWeight = symbols.reduce((acc, s) => acc + s.weight, 0);
        const getRandomSym = () => {
          let r = Math.random() * totalWeight;
          for (const s of symbols) {
            if (r < s.weight) return s;
            r -= s.weight;
          }
          return symbols[symbols.length - 1];
        };

        const s1 = getRandomSym();
        const s2 = getRandomSym();
        const s3 = getRandomSym();

        user.stats.totalGames++;
        user.stats.totalWagered += bet;

        let multiplier = 0;
        let isJackpot = false;
        let winTitle = 'No Match';

        if (s1.name === s2.name && s2.name === s3.name) {
          multiplier = s1.mult;
          isJackpot = s1.name === 'Lucky 7' || s1.name === 'Diamond';
          winTitle = `TRIPLE ${s1.name.toUpperCase()}! 🎉`;
        } else if (s1.name === 'Lucky 7' && s2.name === 'Lucky 7') {
          multiplier = 1.2;
          winTitle = 'Double 7s! ✨';
        } else if (s1.name === 'Diamond' && s2.name === 'Diamond') {
          multiplier = 1.0;
          winTitle = 'Double Diamonds 💎';
        } else if (s1.name === 'Cherry' && s2.name === 'Cherry') {
          multiplier = 0.5;
          winTitle = 'Double Cherries (Partial Refund) 🍒';
        }

        if (multiplier >= 1.0) {
          const payout = Math.floor(bet * multiplier);
          const profit = payout - bet;
          user.cash += profit;
          user.xp += 40;
          user.stats.totalWins++;
          user.stats.totalWon += profit;

          const embed = new EmbedBuilder()
            .setTitle(`🎰 Slots — ${isJackpot ? '💥 MEGA JACKPOT!' : winTitle}`)
            .setDescription(`[ ${s1.emoji} | ${s2.emoji} | ${s3.emoji} ]\n\n**Multiplier:** ⚡ **${multiplier}x**\n**Payout:** 💵 **+${formatCash(payout)} Cash** (+${formatCash(profit)} profit)!\n**Balance:** 💵 **${formatCash(user.cash)} Cash**`)
            .setColor(isJackpot ? '#eab308' : '#22c55e');

          await msg.reply({ embeds: [embed] });
        } else if (multiplier === 0.5) {
          const refund = Math.floor(bet * 0.5);
          user.cash -= (bet - refund);
          user.xp += 15;
          user.stats.totalLosses++;

          const embed = new EmbedBuilder()
            .setTitle('🎰 Slots — Double Cherries 🍒 (Half Refund)')
            .setDescription(`[ ${s1.emoji} | ${s2.emoji} | ${s3.emoji} ]\n\n**Refund (0.5x):** 💵 **${formatCash(refund)} Cash** (Lost -${formatCash(bet - refund)})\n**Balance:** 💵 **${formatCash(user.cash)} Cash**`)
            .setColor('#f59e0b');

          await msg.reply({ embeds: [embed] });
        } else {
          user.cash -= bet;
          user.xp += 10;
          user.stats.totalLosses++;

          const embed = new EmbedBuilder()
            .setTitle('🎰 Slots — No Match 💀')
            .setDescription(`[ ${s1.emoji} | ${s2.emoji} | ${s3.emoji} ]\n\n**Lost:** 💵 **-${formatCash(bet)} Cash**\n**Balance:** 💵 **${formatCash(user.cash)} Cash**`)
            .setColor('#ef4444');

          await msg.reply({ embeds: [embed] });
        }
        return;
      }

      // 8. HUNT
      if (cmd === 'hunt' || cmd === 'h') {
        const count = Math.random() < 0.4 ? 2 : 1;
        const caught: typeof ANIMALS_DB = [];

        for (let i = 0; i < count; i++) {
          const rand = Math.random();
          let picked = ANIMALS_DB[0];
          if (rand < 0.01) picked = ANIMALS_DB.find(a => a.rarity === 'fabled') || picked;
          else if (rand < 0.05) picked = ANIMALS_DB.find(a => a.rarity === 'mythical') || picked;
          else if (rand < 0.15) picked = ANIMALS_DB.find(a => a.rarity === 'epic') || picked;
          else if (rand < 0.35) picked = ANIMALS_DB.find(a => a.rarity === 'rare') || picked;
          else if (rand < 0.65) picked = ANIMALS_DB.find(a => a.rarity === 'uncommon') || picked;
          else picked = ANIMALS_DB.filter(a => a.rarity === 'common')[Math.floor(Math.random() * 3)];

          caught.push(picked);

          // Add to inventory
          const existing = user.inventory.find(item => item.id === picked.id);
          if (existing) {
            existing.count++;
          } else {
            user.inventory.push({ ...picked, count: 1 });
          }
        }

        user.xp += 50 * count;
        const lines = caught.map(a => `${a.emoji} **${a.name}** (${a.rarity.toUpperCase()}) — Value: **${formatCash(a.sellValue)} Cash**`).join('\n');

        const embed = new EmbedBuilder()
          .setTitle('🐾 Safari Hunt Expedition!')
          .setDescription(`**${msg.author.username}** went hunting and caught:\n\n${lines}\n\nType \`m zoo\` to view your pets, or \`m sell all\` to cash out!`)
          .setColor('#a855f7');

        await msg.reply({ embeds: [embed] });
        return;
      }

      // 9. ZOO
      if (cmd === 'zoo' || cmd === 'inv') {
        if (user.inventory.length === 0) {
          await msg.reply('🏞️ Your zoo is empty! Use `m hunt` to catch animals.');
          return;
        }

        const totalVal = user.inventory.reduce((s, a) => s + a.sellValue * a.count, 0);
        const totalPets = user.inventory.reduce((s, a) => s + a.count, 0);

        const list = user.inventory.map(a => `${a.emoji} **${a.name}** (x${a.count}) • ${a.rarity.toUpperCase()} — **${formatCash(a.sellValue * a.count)} Cash**`).join('\n');

        const embed = new EmbedBuilder()
          .setTitle(`🏞️ ${msg.author.username}'s Zoo Sanctuary (${totalPets} Pets)`)
          .setDescription(`${list}\n\n**Total Zoo Value:** 💵 **${formatCash(totalVal)} Cash**\nUse \`m sell all\` to sell all pets for instant cash!`)
          .setColor('#10b981');

        await msg.reply({ embeds: [embed] });
        return;
      }

      // 10. SELL
      if (cmd === 'sell') {
        if (arg1 === 'all') {
          if (user.inventory.length === 0) {
            await msg.reply('Your zoo is already empty!');
            return;
          }
          const totalVal = user.inventory.reduce((s, a) => s + a.sellValue * a.count, 0);
          const count = user.inventory.reduce((s, a) => s + a.count, 0);
          user.cash += totalVal;
          user.inventory = [];

          await msg.reply(`💰 Sold all **${count}** animals for **+${formatCash(totalVal)} Cash**! New balance: **${formatCash(user.cash)} Cash**.`);
          return;
        }
        await msg.reply('❓ Usage: `m sell all`');
        return;
      }

      // 11. DICE / ROLL
      if (cmd === 'roll' || cmd === 'dice') {
        const bet = parseAmount(arg1);
        if (bet <= 0) {
          await msg.reply('❓ Usage: `m roll <amount>`\nExample: `m roll 500`');
          return;
        }
        if (bet > user.cash) {
          await msg.reply(`🚫 You only have **${formatCash(user.cash)} Cash**!`);
          return;
        }

        const p1 = Math.floor(Math.random() * 6) + 1;
        const p2 = Math.floor(Math.random() * 6) + 1;
        const playerSum = p1 + p2;

        const b1 = Math.floor(Math.random() * 6) + 1;
        const b2 = Math.floor(Math.random() * 6) + 1;
        const botSum = b1 + b2;

        user.stats.totalGames++;
        user.stats.totalWagered += bet;

        if (playerSum > botSum) {
          user.cash += bet;
          user.xp += 25;
          user.stats.totalWins++;
          user.stats.totalWon += bet;

          const embed = new EmbedBuilder()
            .setTitle('🎲 Dice Duel — Victory! 🎉')
            .setDescription(`**You:** 🎲 [${p1}]+[${p2}] = **${playerSum}**\n**Bot:** 🎲 [${b1}]+[${b2}] = **${botSum}**\n\n**Won:** 💵 **+${formatCash(bet * 2)} Cash** (+${formatCash(bet)} profit)!`)
            .setColor('#22c55e');
          await msg.reply({ embeds: [embed] });
        } else if (playerSum === botSum) {
          await msg.reply(`🎲 Tie! Both rolled **${playerSum}**. Bet of **${formatCash(bet)} Cash** returned.`);
        } else {
          user.cash -= bet;
          user.xp += 10;
          user.stats.totalLosses++;

          const embed = new EmbedBuilder()
            .setTitle('🎲 Dice Duel — Defeat! 💀')
            .setDescription(`**You:** 🎲 [${p1}]+[${p2}] = **${playerSum}**\n**Bot:** 🎲 [${b1}]+[${b2}] = **${botSum}**\n\n**Lost:** 💵 **-${formatCash(bet)} Cash**!`)
            .setColor('#ef4444');
          await msg.reply({ embeds: [embed] });
        }
        return;
      }

      // 12. GIVE / SEND / PAY / GIFT
      if (cmd === 'give' || cmd === 'send' || cmd === 'pay' || cmd === 'gift') {
        // Detect which argument is the target user and which is the amount
        let targetId = '';
        let targetName = '';
        let amountStr = '';

        // Check if there is a direct mention
        const mentionedUser = msg.mentions.users.first();
        if (mentionedUser) {
          targetId = mentionedUser.id;
          targetName = mentionedUser.username;
          // The other argument should be the amount
          if (arg1.includes(targetId) || arg1.startsWith('<@')) {
            amountStr = arg2;
          } else {
            amountStr = arg1;
          }
        } else {
          // Check regex mentions <@123456789>
          const mentionMatch1 = arg1.match(/<@!?(\d+)>/);
          const mentionMatch2 = arg2.match(/<@!?(\d+)>/);
          if (mentionMatch1) {
            targetId = mentionMatch1[1];
            amountStr = arg2;
          } else if (mentionMatch2) {
            targetId = mentionMatch2[1];
            amountStr = arg1;
          } else if (arg1.startsWith('@')) {
            targetName = arg1.slice(1);
            amountStr = arg2;
          } else if (arg2.startsWith('@')) {
            targetName = arg2.slice(1);
            amountStr = arg1;
          } else if (isNaN(Number(arg1)) && !isNaN(Number(arg2))) {
            targetName = arg1;
            amountStr = arg2;
          } else {
            amountStr = arg1;
            targetName = arg2;
          }
        }

        const amt = parseAmount(amountStr);

        if (!amt || amt <= 0) {
          await msg.reply('❓ **Usage:** `m give <amount> <@user>` or `m give <@user> <amount>`\n**Example:** `m give 500 @username`');
          return;
        }

        if (amt > user.cash) {
          await msg.reply(`🚫 You only have **${formatCash(user.cash)} Cash** in your wallet!`);
          return;
        }

        // If targetId is not set, try to resolve from guild or name
        if (!targetId) {
          if (!targetName) {
            await msg.reply('❓ Please specify which user to give cash to! Example: `m give 500 @username`');
            return;
          }
          const foundMember = msg.guild?.members.cache.find(m => 
            m.user.username.toLowerCase() === targetName.toLowerCase() ||
            m.displayName.toLowerCase() === targetName.toLowerCase()
          );
          if (foundMember) {
            targetId = foundMember.id;
            targetName = foundMember.user.username;
          } else {
            targetId = `user_${targetName.toLowerCase()}`;
          }
        }

        if (targetId === msg.author.id) {
          await msg.reply('🚫 You cannot transfer cash to yourself!');
          return;
        }

        const targetUser = getOrCreateUser(targetId, targetName || 'Player');

        // Execute transfer
        user.cash -= amt;
        targetUser.cash += amt;
        user.xp += 15;

        const embed = new EmbedBuilder()
          .setTitle('🎁 OwO Cash Transfer Successful!')
          .setDescription(`**<@${msg.author.id}>** has gifted **${formatCash(amt)} Cash** to **<@${targetUser.userId}>**! 🎉`)
          .setColor('#22c55e')
          .addFields(
            { name: '📤 Sent By', value: `<@${msg.author.id}> (Balance: **${formatCash(user.cash)} Cash**)`, inline: true },
            { name: '📥 Received By', value: `<@${targetUser.userId}> (Balance: **${formatCash(targetUser.cash)} Cash**)`, inline: true },
            { name: '💵 Amount Transferred', value: `**${formatCash(amt)} Cash**`, inline: true }
          )
          .setFooter({ text: 'OwO Economy • Safe & Instant Peer-to-Peer Transfer • Prefix: m' })
          .setTimestamp();

        await msg.reply({ embeds: [embed] });
        return;
      }

      // 13. ADMIN COMMANDS (GIVECASH / SETCASH / ADDMOENY)
      if (cmd === 'givecash' || cmd === 'addcash' || cmd === 'setcash' || cmd === 'admin') {
        const isAdmin = ADMIN_IDS.includes(msg.author.id);
        if (!isAdmin) {
          await msg.reply('🚫 Only bot administrators can use this command.');
          return;
        }

        const amt = parseAmount(arg1) || 200_000_000;
        user.cash += amt;
        await msg.reply(`👑 **Admin Override:** Granted **+${formatCash(amt)} Cash** to <@${msg.author.id}>! New Balance: **${formatCash(user.cash)} Cash**.`);
        return;
      }

      // Default: unknown
      await msg.reply(`❓ Unknown command \`${text}\`. Type \`m help\` to see all commands!`);
    } catch (error: any) {
      this.addLog('error', `Error handling command "${text}": ${error?.message || error}`);
    }
  }

  public getStatus() {
    return {
      online: this.isOnline,
      tag: this.botTag || 'OwO Bot',
      avatar: this.botAvatar || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&h=150&fit=crop&crop=faces',
      botId: this.botId,
      guildsCount: this.client?.guilds.cache.size || this.guildsCount,
      ping: this.client?.ws.ping || this.ping,
      inviteUrl: `https://discord.com/oauth2/authorize?client_id=${this.botId}&permissions=8&scope=bot%20applications.commands`,
      logs: this.logs,
      userCount: userDatabase.size
    };
  }
}

export const discordBot = new DiscordBotManager();
