import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Send, Paperclip, Smile, Loader2 } from 'lucide-react';
import { LayoutDashboard, Search, Calendar, Heart, MessageCircle, Wallet, Settings, User, Inbox } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import useAuthStore from '../store/authStore';
import { getMyChats, getChatById, sendChatMessage } from '../services/api';

const LINKS = [
  { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/search', label: 'Find a Tutor', icon: Search },
  { to: '/student/bookings', label: 'My Bookings', icon: Calendar },
  { to: '/student/favorites', label: 'Favorites', icon: Heart },
  { to: '/chat', label: 'Chat', icon: MessageCircle, end: true },
  { to: '/student/payments', label: 'Payments', icon: Wallet },
  { to: '/student/settings', label: 'Settings', icon: Settings },
];

const TUTOR_LINKS = [
  { to: '/tutor/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/tutor/profile', label: 'My Profile', icon: User },
  { to: '/tutor/schedule', label: 'Availability', icon: Calendar },
  { to: '/tutor/bookings', label: 'Requests', icon: Inbox },
  { to: '/tutor/earnings', label: 'Earnings', icon: Wallet },
  { to: '/chat', label: 'Chat', icon: MessageCircle, end: true },
  { to: '/tutor/settings', label: 'Settings', icon: Settings },
];

export default function ChatPage() {
  const { user } = useAuthStore();
  const location = useLocation();
  const activeChatIdFromState = location.state?.activeChatId;

  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);

  // Helper to find the other participant in a conversation
  const getParticipant = (chatObj) => {
    if (!chatObj || !chatObj.participants || !user) return { fullName: 'User', avatar: '' };
    return chatObj.participants.find((p) => String(p._id) !== String(user._id)) || { fullName: 'User', avatar: '' };
  };

  // Fetch conversations list on mount
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const data = await getMyChats();
        setConversations(data.chats || []);
        
        // Auto-select chat from navigation state, or fallback to the first active thread
        if (activeChatIdFromState) {
          setActiveId(activeChatIdFromState);
        } else if (data.chats?.length > 0 && !activeId) {
          setActiveId(data.chats[0]._id);
        }
      } catch (err) {
        console.error('Failed to load chats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [activeChatIdFromState]);

  // Load message thread for active conversation & start polling
  useEffect(() => {
    if (!activeId) return;
    
    const fetchMessages = async () => {
      try {
        const data = await getChatById(activeId);
        setMessages(data.chat?.messages || []);
      } catch (err) {
        console.error('Failed to load thread:', err);
      }
    };

    fetchMessages();

    // Poll every 3 seconds to keep message thread updated in real-time
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [activeId]);

  const send = async () => {
    if (!text.trim() || !activeId) return;
    try {
      const data = await sendChatMessage(activeId, text);
      setMessages((m) => [...m, data.message]);
      setText('');
      
      // Update conversations sidebar last message
      setConversations((prev) => 
        prev.map((c) => 
          c._id === activeId 
            ? { ...c, messages: [...(c.messages || []), data.message], lastMessageAt: new Date() } 
            : c
        )
      );
    } catch (err) {
      alert('Failed to send message: ' + err.message);
    }
  };

  const activeChat = conversations.find((c) => c._id === activeId);
  const activeParticipant = activeChat ? getParticipant(activeChat) : null;
  const sidebarLinks = user?.role === 'tutor' ? TUTOR_LINKS : LINKS;

  return (
    <DashboardLayout links={sidebarLinks} title="Chat">
      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="animate-spin text-cyan-electric" size={32} />
        </div>
      ) : (
        <div className="grid h-[70vh] grid-cols-1 overflow-hidden rounded-2xl glass-panel md:grid-cols-[280px_1fr]">
          {/* Conversation list */}
          <div className="overflow-y-auto border-r border-white/10">
            {conversations.map((c) => {
              const p = getParticipant(c);
              const lastMsg = c.messages?.length > 0 ? c.messages[c.messages.length - 1].text : 'No messages yet';
              
              return (
                <button
                  key={c._id}
                  onClick={() => setActiveId(c._id)}
                  className={`flex w-full items-center gap-3 border-b border-white/5 p-4 text-left transition-colors ${
                    activeId === c._id ? 'bg-violet/10' : 'hover:bg-white/5'
                  }`}
                >
                  <img
                    src={p.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${p.fullName}`}
                    alt=""
                    className="h-10 w-10 rounded-full object-cover border border-white/10"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">{p.fullName}</p>
                    <p className="truncate text-xs text-white/50">{lastMsg}</p>
                  </div>
                </button>
              );
            })}
            {conversations.length === 0 && (
              <p className="p-8 text-center text-xs text-white/40">No conversations active yet.</p>
            )}
          </div>

          {/* Active conversation */}
          {activeChat && activeParticipant ? (
            <div className="flex flex-col h-full overflow-hidden">
              <div className="flex items-center gap-3 border-b border-white/10 p-4">
                <img
                  src={activeParticipant.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${activeParticipant.fullName}`}
                  alt=""
                  className="h-9 w-9 rounded-full object-cover border border-white/10"
                />
                <p className="text-sm font-medium text-white">{activeParticipant.fullName}</p>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {messages.map((m) => {
                  const isMe = String(m.sender) === String(user?._id);
                  return (
                    <motion.div
                      key={m._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${
                        isMe ? 'ml-auto bg-brand-gradient text-slate-deep font-semibold' : 'bg-white/10 text-white'
                      }`}
                    >
                      {m.text}
                    </motion.div>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 border-t border-white/10 p-4 bg-white/2">
                <button className="text-white/40 hover:text-white/70"><Paperclip size={18} /></button>
                <button className="text-white/40 hover:text-white/70"><Smile size={18} /></button>
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && send()}
                  placeholder="Type a message…"
                  className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-violet"
                />
                <button onClick={send} className="rounded-full bg-brand-gradient p-2.5 text-slate-deep active:scale-90 transition-transform">
                  <Send size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-white/30">
              <MessageCircle size={48} className="stroke-[1.5]" />
              <p className="mt-3 text-sm">Select a conversation or visit a tutor's profile to start chatting.</p>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
