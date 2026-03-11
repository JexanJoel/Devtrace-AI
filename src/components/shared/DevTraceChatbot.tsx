import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Minimize2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useProfile } from '../../hooks/useProfile';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SYSTEM_PROMPT = `You are DevTrace AI Assistant — a friendly, concise helper built into the DevTrace AI debugging platform.

CORE FEATURES:
- Debug Sessions: Log errors with title, error message, stack trace, and severity (low/medium/high/critical). Statuses: open, in_progress, resolved.
- AI Fix: On any session detail page, click "Get AI Fix" for an instant fix powered by Groq + Llama 3.3 70B with confidence score and explanation.
- Fix Library: Save AI-generated fixes for reuse. Access via "Fix Library" in the sidebar.
- Projects: Organize sessions under projects. Add a GitHub URL to see live repo stats (stars, forks, issues).
- Dashboard: Shows total sessions, resolution rate, open issues, and activity charts.
- Export: On any session page, click "Export .md" to download the session as Markdown.

NAVIGATION:
- Dashboard → overview stats and charts
- Projects → manage your projects
- Sessions → all debug sessions
- Fix Library → saved AI fixes
- Settings → profile, dark mode, GitHub username

OFFLINE SUPPORT:
- Works fully offline via PowerSync — data syncs to local SQLite in the browser
- Orange banner appears when offline
- Items created offline auto-sync on reconnect

TIPS:
- Always add an error message before clicking "Get AI Fix"
- Link a GitHub repo to a project to see live stats
- Use Fix Library to avoid solving the same error twice
- Change session status with the "Change Status" dropdown

Be helpful, warm, and concise. Answer in 2-4 sentences unless a step-by-step guide is needed. Gently redirect off-topic questions back to DevTrace.`;

const suggestedQuestions = [
  'How do I get an AI fix?',
  'How does offline mode work?',
  'How do I save a fix to my library?',
  'How do I create a project?',
];

const callGroq = async (messages: Message[]): Promise<string> => {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
      temperature: 0.5,
      max_tokens: 512,
    }),
  });
  if (!response.ok) throw new Error('Groq API error');
  const data = await response.json();
  return data?.choices?.[0]?.message?.content ?? "Sorry, I couldn't get a response. Try again!";
};

const TypingIndicator = () => (
  <div className="flex items-end gap-2">
    <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center flex-shrink-0">
      <Bot size={14} className="text-indigo-600 dark:text-indigo-400" />
    </div>
    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-bl-sm px-4 py-3">
      <div className="flex gap-1 items-center h-4">
        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  </div>
);

const formatMessage = (text: string) =>
  text.split('\n').map((line, i) => {
    const html = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    if (line.startsWith('- '))
      return (
        <div key={i} className="flex gap-2 my-0.5">
          <span className="text-indigo-400 mt-0.5">•</span>
          <span dangerouslySetInnerHTML={{ __html: html.slice(2) }} />
        </div>
      );
    return line
      ? <p key={i} className="my-0.5" dangerouslySetInnerHTML={{ __html: html }} />
      : <div key={i} className="h-1" />;
  });

const DevTraceChatbot = () => {
  const { user } = useAuthStore();
  const { profile } = useProfile();

  const avatarUrl = profile?.avatar_url ?? null;
  const userName = profile?.name ?? user?.email ?? 'You';
  const firstName = profile?.name?.split(' ')[0] ?? null;

  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: `Hey! 👋 I'm your DevTrace assistant. Ask me anything about the app or how to debug smarter.` },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Personalise greeting once profile loads
  useEffect(() => {
    if (firstName) {
      setMessages([{
        role: 'assistant',
        content: `Hey ${firstName}! 👋 I'm your DevTrace assistant. Ask me anything about the app or how to debug smarter.`,
      }]);
    }
  }, [firstName]);

  useEffect(() => {
    if (open && !minimized) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [messages, open, minimized]);

  const sendMessage = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    setInput('');
    setShowSuggestions(false);
    const userMsg: Message = { role: 'user', content };
    const next = [...messages, userMsg];
    setMessages(next);
    setLoading(true);
    try {
      const reply = await callGroq(next);
      setMessages([...next, { role: 'assistant', content: reply }]);
    } catch {
      setMessages([...next, { role: 'assistant', content: "Hmm, something went wrong. Check your connection and try again!" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">

      {open && (
        <div className={`w-[360px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden transition-all duration-300 ${minimized ? 'h-0 opacity-0 pointer-events-none' : 'h-[520px] opacity-100'}`}>

          {/* Header */}
          <div className="bg-indigo-600 px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Bot size={16} className="text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm leading-none">DevTrace Assistant</p>
                <p className="text-indigo-200 text-xs mt-0.5">Always here to help</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setMinimized(true)}
                className="w-7 h-7 rounded-lg hover:bg-white/20 flex items-center justify-center transition text-white/80 hover:text-white">
                <Minimize2 size={14} />
              </button>
              <button onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-white/20 flex items-center justify-center transition text-white/80 hover:text-white">
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth">
            {messages.map((msg, i) => (
              <div key={i} className={`flex items-end gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                {msg.role === 'assistant' ? (
                  <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center flex-shrink-0">
                    <Bot size={14} className="text-indigo-600 dark:text-indigo-400" />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    {avatarUrl
                      ? <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" />
                      : <span className="text-xs font-bold text-gray-600 dark:text-gray-300">{userName[0].toUpperCase()}</span>
                    }
                  </div>
                )}
                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-sm'
                    : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-sm'
                }`}>
                  {msg.role === 'assistant' ? formatMessage(msg.content) : msg.content}
                </div>
              </div>
            ))}

            {loading && <TypingIndicator />}

            {showSuggestions && messages.length <= 2 && (
              <div className="space-y-2 pt-1">
                <p className="text-xs text-gray-400 text-center">Quick questions</p>
                {suggestedQuestions.map((q) => (
                  <button key={q} onClick={() => sendMessage(q)}
                    className="w-full text-left text-xs bg-indigo-50 dark:bg-indigo-950 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800 px-3 py-2 rounded-xl transition">
                    {q}
                  </button>
                ))}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-3 py-2 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-50 dark:focus-within:ring-indigo-950 transition">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Ask me anything..."
                className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none"
              />
              <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
                className="w-7 h-7 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg flex items-center justify-center transition flex-shrink-0">
                <Send size={13} className="text-white" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => { setOpen(!open); setMinimized(false); }}
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 ${open ? 'bg-gray-700 hover:bg-gray-800' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
        {open ? <X size={22} className="text-white" /> : <MessageCircle size={22} className="text-white" />}
      </button>
    </div>
  );
};

export default DevTraceChatbot;