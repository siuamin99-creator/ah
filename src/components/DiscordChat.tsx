import React, { useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { DiscordEmbed, DiscordEmbedAction } from '../types';
import { Bot, Check, Flame, Sparkles } from 'lucide-react';

export const DiscordChat: React.FC = () => {
  const { messages, currentChannelId, executeCommand, claimQuest } = useGame();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Filter messages for current channel, or show general/gambling messages
  const channelMessages = messages.filter(
    m => m.channelId === currentChannelId || m.channelId === 'bot-commands'
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleActionClick = (action: DiscordEmbedAction) => {
    if (action.command.startsWith('claim_quest_')) {
      const qId = action.command.replace('claim_quest_', '');
      claimQuest(qId);
    } else {
      executeCommand(action.command, currentChannelId);
    }
  };

  const renderEmbed = (embed: DiscordEmbed) => {
    const borderColor = embed.color || '#5865F2';

    return (
      <div
        className="mt-2 rounded-lg bg-[#2b2d31] p-3.5 border-l-4 shadow-md max-w-2xl text-xs space-y-2.5"
        style={{ borderLeftColor: borderColor }}
      >
        {/* Author / Header */}
        {embed.author && (
          <div className="flex items-center gap-2 font-bold text-gray-300">
            {embed.author.iconUrl && (
              <img src={embed.author.iconUrl} alt="Author" className="w-5 h-5 rounded-full" />
            )}
            <span>{embed.author.name}</span>
          </div>
        )}

        {/* Title */}
        {embed.title && (
          <h4 className="font-extrabold text-sm text-white tracking-wide">
            {embed.title}
          </h4>
        )}

        {/* Description */}
        {embed.description && (
          <div className="text-gray-300 leading-relaxed whitespace-pre-line font-medium">
            {embed.description}
          </div>
        )}

        {/* Fields */}
        {embed.fields && embed.fields.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {embed.fields.map((f, idx) => (
              <div
                key={idx}
                className={`bg-[#1e1f22]/70 p-2 rounded-md border border-[#35373c]/50 ${
                  f.inline ? '' : 'sm:col-span-2'
                }`}
              >
                <div className="font-bold text-[11px] text-gray-400 uppercase tracking-wider mb-0.5">
                  {f.name}
                </div>
                <div className="text-gray-200 font-medium whitespace-pre-line">
                  {f.value}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        {embed.footer && (
          <div className="text-[10px] text-gray-400 pt-1 border-t border-[#35373c]/40 flex items-center gap-1.5">
            {embed.footer.iconUrl && (
              <img src={embed.footer.iconUrl} alt="Footer" className="w-3.5 h-3.5 rounded-full" />
            )}
            <span>{embed.footer.text}</span>
          </div>
        )}

        {/* Interactive Action Buttons */}
        {embed.actions && embed.actions.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-[#35373c]">
            {embed.actions.map((act) => {
              let btnClass = 'bg-[#4e5058] hover:bg-[#6d6f78] text-white';
              if (act.style === 'primary') btnClass = 'bg-[#5865F2] hover:bg-[#4752C4] text-white shadow-sm';
              if (act.style === 'success') btnClass = 'bg-[#23a55a] hover:bg-[#1f934f] text-white shadow-sm';
              if (act.style === 'danger') btnClass = 'bg-[#da373c] hover:bg-[#b82e32] text-white shadow-sm';

              return (
                <button
                  key={act.id}
                  type="button"
                  onClick={() => handleActionClick(act)}
                  disabled={act.disabled}
                  className={`px-3 py-1.5 rounded-md font-bold text-xs flex items-center gap-1.5 transition active:scale-95 ${btnClass}`}
                >
                  {act.emoji && <span>{act.emoji}</span>}
                  <span>{act.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div id="discord-chat-feed" className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#313338]">
      {/* Welcome Banner in Channel */}
      <div className="py-6 border-b border-[#3f4147]/50 mb-4">
        <div className="w-14 h-14 rounded-full bg-[#5865F2] flex items-center justify-center text-white text-2xl font-black mb-3">
          #
        </div>
        <h2 className="text-xl font-extrabold text-white">
          Welcome to #{currentChannelId}!
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          This is the start of the #{currentChannelId} channel. Try typing <code className="bg-[#2b2d31] px-1.5 py-0.5 rounded text-pink-400 font-mono">owo cf 500 h</code>, <code className="bg-[#2b2d31] px-1.5 py-0.5 rounded text-pink-400 font-mono">owo slots 500</code>, or <code className="bg-[#2b2d31] px-1.5 py-0.5 rounded text-pink-400 font-mono">owo hunt</code>!
        </p>
      </div>

      {/* Messages */}
      {channelMessages.map((msg) => {
        const isBot = msg.sender.isBot;

        return (
          <div
            key={msg.id}
            className="flex items-start gap-3.5 hover:bg-[#2e3035]/60 -mx-4 px-4 py-1.5 rounded transition group"
          >
            <img
              src={msg.sender.avatar}
              alt={msg.sender.name}
              className="w-10 h-10 rounded-full object-cover shrink-0 mt-0.5 border border-[#3f4147]"
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className="font-bold text-sm"
                  style={{ color: msg.sender.roleColor || '#ffffff' }}
                >
                  {msg.sender.name}
                </span>

                {isBot && (
                  <span className="bg-[#5865F2] text-white text-[10px] font-black px-1.5 py-0.2 rounded flex items-center gap-0.5 tracking-wider">
                    <Check className="w-2.5 h-2.5" /> BOT
                  </span>
                )}

                <span className="text-[10px] text-gray-400">{msg.timestamp}</span>
              </div>

              {/* Text message */}
              {msg.content && (
                <div className="text-gray-200 text-sm mt-0.5 leading-relaxed font-sans select-text">
                  {msg.content}
                </div>
              )}

              {/* Rich Embed */}
              {msg.embed && renderEmbed(msg.embed)}
            </div>
          </div>
        );
      })}

      <div ref={messagesEndRef} />
    </div>
  );
};
