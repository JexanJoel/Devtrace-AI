import { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, Loader2 } from 'lucide-react';
import type { ChatMessage } from '../../hooks/useCollaboration';

interface Props {
  messages: ChatMessage[];
  onSend: (message: string) => Promise<void>;
  currentUserId: string;
}

const getInitial = (name: string) => (name ?? '?')[0].toUpperCase();

const COLORS = [
  'bg-indigo-500', 'bg-violet-500', 'bg-pink-500',
  'bg-amber-500', 'bg-emerald-500', 'bg-blue-500',
];

// Consistent color per user
const colorForUser = (userId: string) => {
  const hash = userId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return COLORS[hash % COLORS.length];
};

const formatTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const SessionChat = ({ messages, onSend, currentUserId }: Props) => {
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Only auto-scroll when the current user sends a message,
  // or when the user is already near the bottom (within 100px)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const lastMessage = messages[messages.length - 1];
    const isMyMessage = lastMessage?.user_id === currentUserId;
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    const isNearBottom = distanceFromBottom < 100;

    if (isMyMessage || isNearBottom) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    await onSend(input.trim());
    setInput('');
    setSending(false);
  };

  return (
    <div className="flex flex-col bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">

      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
        <div className="w-7 h-7 bg-indigo-50 dark:bg-indigo-950 rounded-xl flex items-center justify-center">
          <MessageSquare size={13} className="text-indigo-600" />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900 dark:text-white">Team Chat</p>
          <p className="text-xs text-gray-400">Messages sync live via PowerSync</p>
        </div>
      </div>

      {/* Message list */}
      <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-3 max-h-72 min-h-[120px]">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-20 text-center">
            <MessageSquare size={20} className="text-gray-200 dark:text-gray-700 mb-1.5" />
            <p className="text-xs text-gray-400">No messages yet</p>
            <p className="text-xs text-gray-300 dark:text-gray-600">Start the conversation about this bug</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMe = msg.user_id === currentUserId;
            const showAvatar = i === 0 || messages[i - 1].user_id !== msg.user_id;

            return (
              <div key={msg.id} className={`flex gap-2.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>

                {/* Avatar */}
                <div className={`flex-shrink-0 ${showAvatar ? 'visible' : 'invisible'}`}>
                  {msg.avatar_url ? (
                    <img
                      src={msg.avatar_url}
                      alt={msg.display_name}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                  ) : (
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold ${colorForUser(msg.user_id)}`}>
                      {getInitial(msg.display_name)}
                    </div>
                  )}
                </div>

                {/* Bubble */}
                <div className={`max-w-[75%] sm:max-w-[65%] space-y-0.5 ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                  {showAvatar && (
                    <span className={`text-xs text-gray-400 px-1 ${isMe ? 'text-right' : 'text-left'}`}>
                      {isMe ? 'You' : msg.display_name}
                    </span>
                  )}
                  <div className={`px-3.5 py-2 rounded-2xl text-sm leading-relaxed break-words ${
                    isMe
                      ? 'bg-indigo-600 text-white rounded-tr-sm'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-sm'
                  }`}>
                    {msg.message}
                  </div>
                  <span className="text-[10px] text-gray-400 px-1">
                    {formatTime(msg.created_at)}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input — pr-16 on mobile clears the floating action button */}
      <div className="flex gap-2 p-3 pr-16 sm:pr-3 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="Message your team..."
          className="flex-1 border-2 border-gray-100 dark:border-gray-700 focus:border-indigo-400 text-gray-900 dark:text-white dark:bg-gray-800 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none transition placeholder-gray-300 min-w-0"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || sending}
          className="flex items-center justify-center w-10 h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition disabled:opacity-40 flex-shrink-0"
        >
          {sending
            ? <Loader2 size={14} className="animate-spin" />
            : <Send size={14} />
          }
        </button>
      </div>
    </div>
  );
};

export default SessionChat;