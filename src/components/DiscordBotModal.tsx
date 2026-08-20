import React, { useState, useEffect } from 'react';
import { Bot, RefreshCw, ExternalLink, Activity, Server, Radio, CheckCircle, AlertTriangle, Terminal, X, Zap } from 'lucide-react';

interface Props {
  onClose: () => void;
}

interface BotStatusData {
  online: boolean;
  tag: string;
  avatar: string;
  botId: string;
  guildsCount: number;
  ping: number;
  inviteUrl: string;
  logs: { timestamp: string; type: 'info' | 'command' | 'error' | 'success'; message: string }[];
  userCount: number;
}

export const DiscordBotModal: React.FC<Props> = ({ onClose }) => {
  const [status, setStatus] = useState<BotStatusData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [restarting, setRestarting] = useState<boolean>(false);
  const [customToken, setCustomToken] = useState<string>('');
  const [showTokenInput, setShowTokenInput] = useState<boolean>(false);
  const [msg, setMsg] = useState<string>('');

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/bot/status');
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch (e) {
      console.error('Error fetching bot status:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleRestart = async () => {
    setRestarting(true);
    setMsg('');
    try {
      const res = await fetch('/api/bot/restart', { method: 'POST' });
      const data = await res.json();
      if (data.status) setStatus(data.status);
      setMsg('Bot restarted successfully!');
    } catch (e: any) {
      setMsg('Failed to restart bot.');
    } finally {
      setRestarting(false);
    }
  };

  const handleApplyToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customToken.trim()) return;
    setRestarting(true);
    setMsg('');
    try {
      const res = await fetch('/api/bot/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: customToken.trim() })
      });
      const data = await res.json();
      if (data.status) setStatus(data.status);
      setMsg(data.success ? 'New token applied & bot connected!' : 'Connection failed. Please check token validity.');
    } catch {
      setMsg('Failed to apply token.');
    } finally {
      setRestarting(false);
    }
  };

  const inviteUrl = status?.inviteUrl || 'https://discord.com/oauth2/authorize?client_id=1475437715888541780&permissions=8&scope=bot%20applications.commands';

  return (
    <div id="discord-bot-modal" className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-3 md:p-6 overflow-y-auto">
      <div className="bg-[#2b2d31] w-full max-w-2xl rounded-2xl border border-[#3f4147] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-[#3f4147] flex justify-between items-center bg-[#1e1f22]">
          <div className="flex items-center gap-3">
            <div className="relative">
              {status?.avatar ? (
                <img src={status.avatar} alt="Bot Avatar" className="w-10 h-10 rounded-full object-cover border-2 border-[#5865F2]" />
              ) : (
                <div className="p-2.5 rounded-xl bg-[#5865F2]/20 text-[#5865F2]">
                  <Bot className="w-6 h-6" />
                </div>
              )}
              <div
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-[#1e1f22] ${
                  status?.online ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
                }`}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white flex items-center gap-1.5">
                  <span>{status?.tag || 'OwO Discord Bot'}</span>
                </h2>
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    status?.online
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-red-500/20 text-red-400 border border-red-500/40'
                  }`}
                >
                  {status?.online ? '🟢 ONLINE IN DISCORD' : '🔴 CONNECTING...'}
                </span>
              </div>
              <p className="text-xs text-gray-400">Live Discord Gateway & Server Host</p>
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

        {/* Body Content */}
        <div className="p-4 md:p-5 overflow-y-auto flex-1 space-y-4 text-xs text-gray-300">
          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-[#1e1f22] p-3 rounded-xl border border-[#35373c]">
              <div className="text-gray-400 flex items-center gap-1 mb-1 text-[11px] font-bold">
                <Radio className="w-3.5 h-3.5 text-pink-400" /> Gateway Status
              </div>
              <div className="text-sm font-extrabold text-white">
                {status?.online ? 'Connected' : 'Offline / Idle'}
              </div>
            </div>

            <div className="bg-[#1e1f22] p-3 rounded-xl border border-[#35373c]">
              <div className="text-gray-400 flex items-center gap-1 mb-1 text-[11px] font-bold">
                <Server className="w-3.5 h-3.5 text-indigo-400" /> Discord Servers
              </div>
              <div className="text-sm font-extrabold text-white">
                {status?.guildsCount || 0} Guilds
              </div>
            </div>

            <div className="bg-[#1e1f22] p-3 rounded-xl border border-[#35373c]">
              <div className="text-gray-400 flex items-center gap-1 mb-1 text-[11px] font-bold">
                <Activity className="w-3.5 h-3.5 text-emerald-400" /> Response Ping
              </div>
              <div className="text-sm font-extrabold text-emerald-400 font-mono">
                {status?.ping || 0} ms
              </div>
            </div>

            <div className="bg-[#1e1f22] p-3 rounded-xl border border-[#35373c]">
              <div className="text-gray-400 flex items-center gap-1 mb-1 text-[11px] font-bold">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> Active Players
              </div>
              <div className="text-sm font-extrabold text-white">
                {status?.userCount || 0} Users
              </div>
            </div>
          </div>

          {/* Primary Action: Invite to Discord Server */}
          <div className="bg-gradient-to-r from-[#5865F2]/20 to-purple-600/20 p-4 rounded-xl border border-[#5865F2]/40 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                🚀 Add Bot to Your Discord Server
              </h3>
              <p className="text-gray-300 text-xs mt-0.5">
                Click to invite this OwO bot to your server so you and your friends can play directly in Discord channels!
              </p>
            </div>
            <a
              id="btn-invite-discord-bot"
              href={inviteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-4 py-2.5 bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition active:scale-95 shrink-0"
            >
              <span>Add to Server</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* Setup Guide in Discord */}
          <div className="bg-[#1e1f22] p-3.5 rounded-xl border border-[#35373c] space-y-2">
            <h4 className="font-bold text-amber-400 flex items-center gap-1.5 text-xs uppercase tracking-wider">
              <CheckCircle className="w-4 h-4" /> How to Play in Your Discord Server
            </h4>
            <ol className="list-decimal list-inside space-y-1.5 text-gray-300 leading-relaxed font-medium">
              <li>Click the <strong>"Add to Server"</strong> button above and select your Discord server.</li>
              <li>Ensure the bot has permissions to <strong>Send Messages</strong> and <strong>Embed Links</strong>.</li>
              <li>
                <span className="text-emerald-300">Crucial:</span> In <a href="https://discord.com/developers/applications" target="_blank" rel="noreferrer" className="text-blue-400 underline font-mono">discord.com/developers</a>, under <strong>Bot &gt; Privileged Gateway Intents</strong>, ensure <strong>MESSAGE CONTENT INTENT</strong> is checked/turned ON!
              </li>
              <li>Type <code className="bg-[#2b2d31] px-1.5 py-0.5 rounded text-pink-400 font-mono">m cf 500 h</code>, <code className="bg-[#2b2d31] px-1.5 py-0.5 rounded text-pink-400 font-mono">m slots 500</code>, or <code className="bg-[#2b2d31] px-1.5 py-0.5 rounded text-pink-400 font-mono">m hunt</code> in any text channel!</li>
            </ol>
          </div>

          {/* Live Console Logs */}
          <div className="bg-[#1e1f22] rounded-xl border border-[#35373c] overflow-hidden">
            <div className="p-2.5 bg-[#232428] border-b border-[#35373c] flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-400 flex items-center gap-1.5 font-mono">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" /> Live Bot Activity Logs
              </span>
              <button
                type="button"
                onClick={handleRestart}
                disabled={restarting}
                className="text-[10px] bg-[#2b2d31] hover:bg-[#35373c] text-gray-300 px-2 py-1 rounded flex items-center gap-1 transition"
              >
                <RefreshCw className={`w-3 h-3 ${restarting ? 'animate-spin' : ''}`} />
                <span>Restart Bot</span>
              </button>
            </div>

            <div className="p-3 max-h-40 overflow-y-auto font-mono text-[11px] space-y-1.5">
              {status?.logs && status.logs.length > 0 ? (
                status.logs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-gray-500 shrink-0">[{log.timestamp}]</span>
                    <span
                      className={`font-semibold shrink-0 uppercase text-[10px] px-1 rounded ${
                        log.type === 'error'
                          ? 'bg-red-950 text-red-400'
                          : log.type === 'command'
                          ? 'bg-pink-950 text-pink-400'
                          : log.type === 'success'
                          ? 'bg-emerald-950 text-emerald-400'
                          : 'bg-blue-950 text-blue-400'
                      }`}
                    >
                      {log.type}
                    </span>
                    <span className="text-gray-300 break-all">{log.message}</span>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 italic">No logs recorded yet. Bot is listening for commands...</div>
              )}
            </div>
          </div>

          {/* Token update toggle */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowTokenInput(!showTokenInput)}
              className="text-[11px] text-gray-400 hover:text-gray-200 underline"
            >
              {showTokenInput ? 'Hide Token Settings' : '⚙️ Reconnect with a different Discord Bot Token'}
            </button>

            {showTokenInput && (
              <form onSubmit={handleApplyToken} className="mt-2 space-y-2 bg-[#1e1f22] p-3 rounded-xl border border-[#35373c]">
                <label className="text-[11px] font-bold text-gray-300 block">
                  Custom Bot Token
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={customToken}
                    onChange={(e) => setCustomToken(e.target.value)}
                    placeholder="Enter bot token..."
                    className="flex-1 bg-[#2b2d31] text-xs text-white px-3 py-2 rounded-lg border border-[#3f4147] focus:outline-none focus:border-[#5865F2]"
                  />
                  <button
                    type="submit"
                    disabled={restarting || !customToken.trim()}
                    className="px-3 py-2 bg-[#5865F2] hover:bg-[#4752C4] disabled:bg-gray-700 text-white font-bold rounded-lg text-xs transition"
                  >
                    Connect
                  </button>
                </div>
              </form>
            )}

            {msg && (
              <div className="mt-2 p-2 bg-[#1e1f22] border border-[#35373c] text-emerald-400 rounded text-[11px] font-bold">
                {msg}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
