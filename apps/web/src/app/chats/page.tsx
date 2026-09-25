'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import {
  MessageSquare,
  Search,
  Send,
  User,
  Plus,
  RefreshCw,
  Loader2,
  CheckCheck,
  Paperclip,
  X,
  Image as ImageIcon,
  FileText,
  ArrowLeft,
  Smile,
  Video,
  Mic,
  ChevronDown,
  Pin,
  Archive,
  BellOff,
  Mail,
  Trash2,
  Eraser,
} from 'lucide-react';

interface ChatContact {
  phone: string;
  name?: string | null;
  profilePicUrl?: string | null;
  lastMessage: string;
  timestamp: string;
  status?: string;
}

interface Message {
  id: number;
  sender: string;
  senderName?: string;
  receiver: string;
  message: string;
  mediaUrl?: string;
  mediaType?: string;
  status: string;
  createdAt: string;
}

export default function BaileysChatsPage() {
  const [chats, setChats] = useState<ChatContact[]>([]);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [selectedContactName, setSelectedContactName] = useState<string | null>(null);
  const [selectedContactPic, setSelectedContactPic] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [search, setSearch] = useState('');
  const [inputMessage, setInputMessage] = useState('');
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [connectedPhone, setConnectedPhone] = useState<string | null>(null);
  const [connectedPhones, setConnectedPhones] = useState<string[]>([]);

  // Attachment State
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState('image');
  const chatFileInputRef = useRef<HTMLInputElement>(null);

  // New Chat Modal
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatNumber, setNewChatNumber] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [showAttach, setShowAttach] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [menuPhone, setMenuPhone] = useState<string | null>(null);
  const [headerMenu, setHeaderMenu] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [chatPrefs, setChatPrefs] = useState<Record<string, { pinned?: boolean; archived?: boolean; muted?: boolean; unread?: boolean }>>({});
  const [confirmAction, setConfirmAction] = useState<{ phone: string; name: string; mode: 'clear' | 'delete' } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const stickToBottomRef = useRef(true);

  const emojis = ['😀','😁','😂','🤣','😊','😍','😘','😎','😭','😡','👍','👎','🙏','👏','🔥','❤️','💚','✅','🎉','📷'];

  useEffect(() => {
    const loadConnection = async () => {
      try {
        const res = await api.get('/whatsapp/user-sessions');
        const sessions = Array.isArray(res.data?.result) ? res.data.result : [];
        const phones = sessions
          .map((session: { phone?: string }) => String(session.phone || '').replace(/\D/g, ''))
          .filter(Boolean);
        setConnectedPhones(phones);
        setConnectedPhone((current) => {
          if (current && phones.includes(current)) return current;
          const primary = sessions.find((session: { isPrimary?: boolean; phone?: string }) => session.isPrimary);
          const next = String(primary?.phone || phones[0] || '').replace(/\D/g, '');
          return next || null;
        });
      } catch (err) {
        setConnectedPhones([]);
        setConnectedPhone(null);
      }
    };

    loadConnection();
    const interval = setInterval(loadConnection, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!connectedPhone) {
      setChatPrefs({});
      return;
    }
    try {
      const saved = localStorage.getItem(`wa-chat-prefs:${connectedPhone}`);
      setChatPrefs(saved ? JSON.parse(saved) : {});
    } catch {
      setChatPrefs({});
    }
    setShowArchived(false);
  }, [connectedPhone]);

  const savePrefs = (next: typeof chatPrefs) => {
    setChatPrefs(next);
    if (connectedPhone) localStorage.setItem(`wa-chat-prefs:${connectedPhone}`, JSON.stringify(next));
  };

  const togglePref = (phone: string, key: 'pinned' | 'archived' | 'muted' | 'unread') => {
    const current = chatPrefs[phone] || {};
    savePrefs({ ...chatPrefs, [phone]: { ...current, [key]: !current[key] } });
    setMenuPhone(null);
    setHeaderMenu(false);
  };

  useEffect(() => {
    if (!connectedPhone) {
      setChats([]);
      setMessages([]);
      setSelectedContact(null);
      setLoadingChats(false);
      return;
    }

    setLoadingChats(true);
    fetchChats(connectedPhone);
    const interval = setInterval(() => {
      fetchChats(connectedPhone);
      if (selectedContact) {
        fetchChatMessages(selectedContact, connectedPhone, false);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [connectedPhone, selectedContact]);

  useEffect(() => {
    if (stickToBottomRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const onThreadScroll = () => {
    const el = threadRef.current;
    if (!el) return;
    stickToBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  // Smart Date Formatter for Chat List (Today -> 10:45 AM, Yesterday -> Yesterday, Older -> 15/09/2026)
  const formatChatListTime = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();

    const isToday =
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();

    if (isToday) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
      d.getDate() === yesterday.getDate() &&
      d.getMonth() === yesterday.getMonth() &&
      d.getFullYear() === yesterday.getFullYear();

    if (isYesterday) {
      return 'Yesterday';
    }

    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 7) {
      return d.toLocaleDateString([], { weekday: 'short' });
    }

    return d.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Smart Date Header Pill Formatter (TODAY, YESTERDAY, SEPTEMBER 15, 2026)
  const formatDateHeader = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();

    const isToday =
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();

    if (isToday) return 'TODAY';

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
      d.getDate() === yesterday.getDate() &&
      d.getMonth() === yesterday.getMonth() &&
      d.getFullYear() === yesterday.getFullYear();

    if (isYesterday) return 'YESTERDAY';

    return d.toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase();
  };

  const resolveMediaUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api').replace(/\/api\/?$/, '');
      return url.replace(/http:\/\/localhost:5001/g, apiBase);
    }
    const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api').replace(/\/api\/?$/, '');
    return `${apiBase}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const fetchChats = async (accountPhone: string) => {
    try {
      const res = await api.get('/whatsapp/chats', { params: { phone: accountPhone } });
      const payload = res.data?.result;
      const chatList = Array.isArray(payload) ? payload : payload?.chats || [];
      const returnedPhone = String(payload?.connectedPhone || accountPhone).replace(/\D/g, '');
      if (returnedPhone !== accountPhone.replace(/\D/g, '')) return;
      if (Array.isArray(chatList)) {
        setChats(chatList.filter((chat) => !chat.accountPhone || String(chat.accountPhone).replace(/\D/g, '') === returnedPhone));
      }
    } catch (err) {
      console.error('Error loading chats');
    } finally {
      setLoadingChats(false);
    }
  };

  const fetchChatMessages = async (chatNumber: string, accountPhone: string, showLoading = true) => {
    if (!chatNumber || !accountPhone) return;
    if (showLoading) setLoadingMessages(true);
    try {
      const res = await api.get(`/whatsapp/chats/${chatNumber}`, { params: { phone: accountPhone } });
      const payload = res.data?.result;
      const msgList = Array.isArray(payload) ? payload : payload?.messages || [];
      const account = accountPhone.replace(/\D/g, '');
      const contact = chatNumber.replace(/\D/g, '');
      if (Array.isArray(msgList)) {
        setMessages(msgList.filter((message) => {
          const sender = String(message.sender || '').replace(/\D/g, '');
          const receiver = String(message.receiver || '').replace(/\D/g, '');
          const betweenAccountAndContact =
            (sender === account && receiver === contact) ||
            (sender === contact && receiver === account);
          return betweenAccountAndContact;
        }));
      }
    } catch (err) {
      console.error('Error loading chat messages');
    } finally {
      if (showLoading) setLoadingMessages(false);
    }
  };

  const linkify = (text: string) => {
    const parts = text.split(/(https?:\/\/[^\s]+)/g);
    return parts.map((part, index) =>
      /^https?:\/\//.test(part) ? (
        <a key={index} href={part} target="_blank" rel="noreferrer" className="text-[#027eb5] underline break-all">
          {part}
        </a>
      ) : (
        <span key={index}>{part}</span>
      )
    );
  };

  const openFilePicker = (accept: string) => {
    if (!chatFileInputRef.current) return;
    chatFileInputRef.current.accept = accept;
    setShowAttach(false);
    chatFileInputRef.current.click();
  };

  const handleSelectContact = (phone: string, name?: string | null, picUrl?: string | null) => {
    stickToBottomRef.current = true;
    setShowEmoji(false);
    setMenuPhone(null);
    setHeaderMenu(false);
    if (chatPrefs[phone]?.unread) togglePref(phone, 'unread');
    setSelectedContact(phone);
    setSelectedContactName(name && name !== `+${phone}` ? name : null);
    setSelectedContactPic(picUrl || null);
    if (connectedPhone) fetchChatMessages(phone, connectedPhone, true);
    if (!picUrl) {
      fetchProfilePic(phone);
    }
  };

  const fetchProfilePic = async (phone: string) => {
    try {
      const res = await api.get('/whatsapp/contact-profile', {
        params: { phone, account: connectedPhone || undefined },
      });
      if (res.data?.result?.profilePicUrl) {
        setSelectedContactPic(res.data.result.profilePicUrl);
      }
    } catch (e) {
      // Ignore picture fetch error
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaFile(file);
      const type = file.type.split('/')[0];
      setMediaType(type === 'application' ? 'document' : type);

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => setMediaPreview(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        setMediaPreview(null);
      }
    }
  };

  const removeMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    if (chatFileInputRef.current) chatFileInputRef.current.value = '';
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContact || (!inputMessage.trim() && !mediaFile)) return;

    const msgToSend = inputMessage.trim();
    setInputMessage('');
    setSending(true);

    try {
      let uploadedMediaUrl = null;
      if (mediaFile) {
        const formData = new FormData();
        formData.append('file', mediaFile);
        const uploadRes = await api.post('/whatsapp/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        uploadedMediaUrl = uploadRes.data?.result?.url;
      }

      const res = await api.post('/whatsapp/send-message', {
        phone: selectedContact,
        message: msgToSend,
        from: connectedPhone,
        mediaUrl: uploadedMediaUrl,
        mediaType: mediaFile ? mediaType : null
      });

      if (res.data?.status) {
        removeMedia();
        if (connectedPhone) {
          fetchChatMessages(selectedContact, connectedPhone, false);
          fetchChats(connectedPhone);
        }
      } else {
        toast.error(res.data?.message || 'Failed to send message');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error sending message');
    } finally {
      setSending(false);
    }
  };

  const handleStartNewChat = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNum = newChatNumber.replace(/\D/g, '');
    if (!cleanNum || cleanNum.length < 10) {
      toast.error('Please enter a valid phone number with country code');
      return;
    }

    handleSelectContact(cleanNum, null, null);
    setShowNewChatModal(false);
    setNewChatNumber('');
  };

  const archivedCount = chats.filter((c) => chatPrefs[c.phone]?.archived).length;

  const filteredChats = chats
    .filter((c) => {
      const archived = !!chatPrefs[c.phone]?.archived;
      if (showArchived ? !archived : archived) return false;
      const q = search.toLowerCase();
      return c.phone.toLowerCase().includes(q) ||
        (c.name && c.name.toLowerCase().includes(q)) ||
        c.lastMessage.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      const pinA = chatPrefs[a.phone]?.pinned ? 1 : 0;
      const pinB = chatPrefs[b.phone]?.pinned ? 1 : 0;
      if (pinA !== pinB) return pinB - pinA;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

  const clearOrDeleteChat = async (phone: string, mode: 'clear' | 'delete') => {
    if (!connectedPhone) return;
    try {
      await api.delete(`/whatsapp/chats/${phone}`, { params: { phone: connectedPhone } });
      setChats((list) => list.filter((chat) => chat.phone !== phone));
      if (selectedContact === phone) {
        setMessages([]);
        if (mode === 'delete') {
          setSelectedContact(null);
          setSelectedContactName(null);
          setSelectedContactPic(null);
        }
      }
      const next = { ...chatPrefs };
      delete next[phone];
      savePrefs(next);
      toast.success(mode === 'delete' ? 'Chat deleted' : 'Chat cleared');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not update this chat');
    } finally {
      setConfirmAction(null);
      setMenuPhone(null);
    }
  };

  // Group Messages by Date for Date Header Pills (TODAY, YESTERDAY, 15 SEPT 2026)
  const groupedMessages: { dateHeader: string; msgs: Message[] }[] = [];
  let currentHeader = '';
  let currentGroup: Message[] = [];

  messages.forEach((m) => {
    const header = formatDateHeader(m.createdAt);
    if (header !== currentHeader) {
      if (currentGroup.length > 0) {
        groupedMessages.push({ dateHeader: currentHeader, msgs: currentGroup });
      }
      currentHeader = header;
      currentGroup = [m];
    } else {
      currentGroup.push(m);
    }
  });

  if (currentGroup.length > 0) {
    groupedMessages.push({ dateHeader: currentHeader, msgs: currentGroup });
  }

  return (
    <div className="h-full w-full flex bg-[#efeae2] overflow-hidden relative font-sans">
      {/* LEFT CHATS SIDEBAR (WHATSAPP WEB EXACT UI) */}
      <div
        className={`w-full md:w-80 lg:w-96 border-r border-[#e9edef] flex flex-col h-full bg-white shrink-0 ${
          selectedContact ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* SIDEBAR HEADER */}
        <div className="p-3.5 bg-[#f0f2f5] border-b border-[#e9edef] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-full bg-[#00a884] text-white flex items-center justify-center font-bold text-sm shadow-sm">
              <span className="font-mono text-xs font-black">WA</span>
            </div>
            <div className="min-w-0">
              <span className="font-bold text-[#111b21] text-base block leading-tight">Chats</span>
              {connectedPhone ? (
                <span className="text-[11px] text-[#667781] font-mono block truncate">+{connectedPhone}</span>
              ) : (
                <span className="text-[11px] text-[#667781] block">No WhatsApp connected</span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowNewChatModal(true)}
              className="p-2 text-[#54656f] hover:bg-[#e9edef] rounded-full transition-colors"
              title="Start New Chat"
            >
              <Plus size={20} />
            </button>
            <button
              onClick={() => connectedPhone && fetchChats(connectedPhone)}
              className="p-2 text-[#54656f] hover:bg-[#e9edef] rounded-full transition-colors"
              title="Refresh Chats"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>

        {/* SEARCH BAR CONTAINER */}
        {connectedPhones.length > 1 && (
          <div className="px-3 py-2 bg-white border-b border-[#f0f2f5]">
            <select
              value={connectedPhone || ''}
              onChange={(e) => {
                setConnectedPhone(e.target.value);
                setSelectedContact(null);
                setMessages([]);
              }}
              className="w-full px-3 py-1.5 bg-[#f0f2f5] rounded-lg text-xs text-[#111b21] focus:outline-none"
            >
              {connectedPhones.map((phone) => (
                <option key={phone} value={phone}>+{phone}</option>
              ))}
            </select>
          </div>
        )}

        <div className="p-2.5 bg-white border-b border-[#f0f2f5]">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-2.5 text-[#54656f]" />
            <input
              type="text"
              placeholder="Search or start new chat"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-1.5 bg-[#f0f2f5] rounded-lg text-xs text-[#111b21] placeholder-[#54656f] focus:outline-none"
            />
          </div>
        </div>

        {/* CHATS SCROLLABLE LIST */}
        {!showArchived && archivedCount > 0 && (
          <button
            onClick={() => setShowArchived(true)}
            className="w-full px-4 py-3 flex items-center gap-3 text-sm text-[#111b21] hover:bg-[#f5f6f6] border-b border-[#f0f2f5]"
          >
            <Archive size={18} className="text-[#54656f]" />
            Archived
            <span className="ml-auto text-xs text-[#667781]">{archivedCount}</span>
          </button>
        )}
        {showArchived && (
          <button
            onClick={() => setShowArchived(false)}
            className="w-full px-4 py-3 flex items-center gap-3 text-sm text-[#00a884] hover:bg-[#f5f6f6] border-b border-[#f0f2f5]"
          >
            <ArrowLeft size={18} />
            Back to chats
          </button>
        )}

        <div className="flex-1 overflow-y-auto divide-y divide-[#f0f2f5]">
          {loadingChats ? (
            <div className="p-8 flex justify-center text-[#00a884]">
              <Loader2 size={22} className="animate-spin" />
            </div>
          ) : !connectedPhone ? (
            <div className="p-8 text-center text-[#54656f] text-xs">
              <p className="font-semibold text-gray-700">Connect a WhatsApp number</p>
              <p className="mt-1">Chats appear here only for the WhatsApp account that is connected.</p>
              <Link href="/connections" className="mt-3 inline-block text-[#00a884] font-bold hover:underline">
                Open Connections
              </Link>
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="p-8 text-center text-[#54656f] text-xs">
              <p className="font-semibold text-gray-700">No chats on +{connectedPhone}</p>
              <button
                onClick={() => setShowNewChatModal(true)}
                className="mt-3 text-[#00a884] font-bold hover:underline"
              >
                + Start New Chat
              </button>
            </div>
          ) : (
            filteredChats.map((c) => {
              const isSelected = selectedContact === c.phone;
              const hasPushName = c.name && c.name !== `+${c.phone}`;
              const pref = chatPrefs[c.phone] || {};
              const label = hasPushName ? c.name! : `+${c.phone}`;

              return (
                <div
                  key={c.phone}
                  onClick={() => handleSelectContact(c.phone, c.name, c.profilePicUrl)}
                  className={`relative px-4 py-3 flex items-center space-x-3 cursor-pointer transition-all group ${
                    isSelected ? 'bg-[#f0f2f5]' : 'hover:bg-[#f5f6f6]'
                  }`}
                >
                  {/* CONTACT PHOTO AVATAR */}
                  <div className="w-12 h-12 rounded-full bg-[#dfe5e7] text-[#54656f] flex items-center justify-center font-bold text-base shrink-0 overflow-hidden border">
                    {c.profilePicUrl ? (
                      <img src={c.profilePicUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : hasPushName ? (
                      c.name?.charAt(0).toUpperCase()
                    ) : (
                      <User size={22} />
                    )}
                  </div>

                  {/* CONTACT NAME & LAST MSG */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="font-bold text-[#111b21] text-sm truncate">
                        {hasPushName ? c.name : `+${c.phone}`}
                      </h4>
                      <span className="text-[11px] text-[#667781] font-mono shrink-0">
                        {formatChatListTime(c.timestamp)}
                      </span>
                    </div>

                    {hasPushName && (
                      <p className="text-[10px] text-[#667781] font-mono">+{c.phone}</p>
                    )}

                    <p className="text-xs text-[#667781] truncate mt-0.5 font-normal flex items-center gap-1">
                      {pref.pinned && <Pin size={12} className="text-[#54656f] shrink-0" />}
                      {pref.muted && <BellOff size={12} className="text-[#54656f] shrink-0" />}
                      {pref.unread && <span className="w-2 h-2 rounded-full bg-[#00a884] shrink-0" />}
                      <span className="truncate">{c.lastMessage}</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    title="Chat actions"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuPhone(menuPhone === c.phone ? null : c.phone);
                    }}
                    className={`absolute right-2 top-2 p-1 rounded-full text-[#54656f] hover:bg-[#e9edef] ${
                      menuPhone === c.phone ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    <ChevronDown size={18} />
                  </button>
                  {menuPhone === c.phone && (
                    <div
                      className="absolute right-2 top-10 z-30 w-52 bg-white rounded-lg shadow-xl border border-[#e9edef] py-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button type="button" className="w-full px-3 py-2 text-left text-sm hover:bg-[#f5f6f6] flex items-center gap-2" onClick={() => togglePref(c.phone, 'archived')}><Archive size={15} /> {pref.archived ? 'Unarchive chat' : 'Archive chat'}</button>
                      <button type="button" className="w-full px-3 py-2 text-left text-sm hover:bg-[#f5f6f6] flex items-center gap-2" onClick={() => togglePref(c.phone, 'muted')}><BellOff size={15} /> {pref.muted ? 'Unmute' : 'Mute notifications'}</button>
                      <button type="button" className="w-full px-3 py-2 text-left text-sm hover:bg-[#f5f6f6] flex items-center gap-2" onClick={() => togglePref(c.phone, 'pinned')}><Pin size={15} /> {pref.pinned ? 'Unpin chat' : 'Pin chat'}</button>
                      <button type="button" className="w-full px-3 py-2 text-left text-sm hover:bg-[#f5f6f6] flex items-center gap-2" onClick={() => togglePref(c.phone, 'unread')}><Mail size={15} /> {pref.unread ? 'Mark as read' : 'Mark as unread'}</button>
                      <button type="button" className="w-full px-3 py-2 text-left text-sm hover:bg-[#f5f6f6] flex items-center gap-2" onClick={() => { setConfirmAction({ phone: c.phone, name: label, mode: 'clear' }); setMenuPhone(null); }}><Eraser size={15} /> Clear chat</button>
                      <button type="button" className="w-full px-3 py-2 text-left text-sm hover:bg-[#f5f6f6] text-red-600 flex items-center gap-2" onClick={() => { setConfirmAction({ phone: c.phone, name: label, mode: 'delete' }); setMenuPhone(null); }}><Trash2 size={15} /> Delete chat</button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT MAIN CHAT FEED (WHATSAPP WEB CHAT SCREEN) */}
      <div
        className={`flex-1 flex flex-col h-full bg-[#efeae2] min-w-0 relative ${
          selectedContact ? 'flex' : 'hidden md:flex'
        }`}
      >
        {selectedContact ? (
          <>
            {/* CHAT HEADER */}
            <div className="px-4 py-2.5 bg-[#f0f2f5] border-b border-[#e9edef] flex items-center justify-between shadow-sm shrink-0 z-10">
              <div className="flex items-center space-x-3 min-w-0">
                {/* Mobile Back Button */}
                <button
                  onClick={() => setSelectedContact(null)}
                  className="p-1.5 text-[#54656f] hover:bg-[#e9edef] rounded-full md:hidden transition-colors shrink-0"
                  title="Back to Chats"
                >
                  <ArrowLeft size={20} />
                </button>

                {/* HEADER AVATAR */}
                <div className="w-10 h-10 rounded-full bg-[#dfe5e7] text-[#54656f] flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden border">
                  {selectedContactPic ? (
                    <img src={selectedContactPic} alt="Avatar" className="w-full h-full object-cover" />
                  ) : selectedContactName ? (
                    selectedContactName.charAt(0).toUpperCase()
                  ) : (
                    <User size={20} />
                  )}
                </div>

                <div className="min-w-0">
                  <h3 className="font-bold text-[#111b21] text-sm md:text-base truncate">
                    {selectedContactName || `+${selectedContact}`}
                  </h3>
                  <p className="text-[11px] text-[#667781] font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00a884] animate-pulse"></span>
                    <span>+{selectedContact} • Active on WhatsApp</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-1 shrink-0 relative">
                <button
                  onClick={() => {
                    if (connectedPhone) fetchChatMessages(selectedContact, connectedPhone, true);
                    fetchProfilePic(selectedContact);
                  }}
                  className="p-2 text-[#54656f] hover:bg-[#e9edef] rounded-full transition-colors"
                  title="Refresh Conversation"
                >
                  <RefreshCw size={18} />
                </button>
                <button
                  type="button"
                  title="Chat actions"
                  onClick={() => { setHeaderMenu((open) => !open); setMenuPhone(null); }}
                  className="p-2 text-[#54656f] hover:bg-[#e9edef] rounded-full transition-colors"
                >
                  <ChevronDown size={18} />
                </button>
                {headerMenu && (
                  <div className="absolute right-0 top-11 z-30 w-52 bg-white rounded-lg shadow-xl border border-[#e9edef] py-1">
                    <button type="button" className="w-full px-3 py-2 text-left text-sm hover:bg-[#f5f6f6] flex items-center gap-2" onClick={() => togglePref(selectedContact, 'archived')}><Archive size={15} /> {chatPrefs[selectedContact]?.archived ? 'Unarchive chat' : 'Archive chat'}</button>
                    <button type="button" className="w-full px-3 py-2 text-left text-sm hover:bg-[#f5f6f6] flex items-center gap-2" onClick={() => togglePref(selectedContact, 'muted')}><BellOff size={15} /> {chatPrefs[selectedContact]?.muted ? 'Unmute' : 'Mute notifications'}</button>
                    <button type="button" className="w-full px-3 py-2 text-left text-sm hover:bg-[#f5f6f6] flex items-center gap-2" onClick={() => togglePref(selectedContact, 'pinned')}><Pin size={15} /> {chatPrefs[selectedContact]?.pinned ? 'Unpin chat' : 'Pin chat'}</button>
                    <button type="button" className="w-full px-3 py-2 text-left text-sm hover:bg-[#f5f6f6] flex items-center gap-2" onClick={() => { setConfirmAction({ phone: selectedContact, name: selectedContactName || `+${selectedContact}`, mode: 'clear' }); setHeaderMenu(false); }}><Eraser size={15} /> Clear chat</button>
                    <button type="button" className="w-full px-3 py-2 text-left text-sm hover:bg-[#f5f6f6] text-red-600 flex items-center gap-2" onClick={() => { setConfirmAction({ phone: selectedContact, name: selectedContactName || `+${selectedContact}`, mode: 'delete' }); setHeaderMenu(false); }}><Trash2 size={15} /> Delete chat</button>
                  </div>
                )}
              </div>
            </div>

            {/* MESSAGES THREAD WALL WITH WHATSAPP PATTERN */}
            <div
              ref={threadRef}
              onScroll={onThreadScroll}
              className="flex-1 p-4 md:p-6 overflow-y-auto space-y-1 bg-[#efeae2] bg-[radial-gradient(#d1d7db_0.6px,transparent_0.6px)] [background-size:22px_22px]"
            >
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full text-xs text-[#667781] space-x-2">
                  <Loader2 size={18} className="animate-spin text-[#00a884]" />
                  <span>Loading messages...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-[#667781] text-xs py-12 bg-white/80 max-w-sm mx-auto p-4 rounded-xl shadow-sm">
                  <p className="font-bold">No message history yet</p>
                  <p className="mt-1">Send a message below to start chatting!</p>
                </div>
              ) : (
                groupedMessages.map((group, groupIdx) => (
                  <div key={groupIdx} className="space-y-3">
                    {/* STICKY DATE HEADER PILL (TODAY, YESTERDAY, 15 SEPT 2026) */}
                    <div className="flex justify-center sticky top-2 z-10 my-2">
                      <span className="bg-white/90 text-[#54656f] text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-lg shadow-sm border border-[#e9edef]">
                        {group.dateHeader}
                      </span>
                    </div>

                    {/* MESSAGES IN DATE GROUP */}
                    {group.msgs.map((m) => {
                      const isMe = connectedPhone
                        ? String(m.sender || '').replace(/\D/g, '') === connectedPhone
                        : m.status === 'sent';
                      return (
                        <div
                          key={m.id}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          {/* BUBBLE */}
                          <div
                            className={`max-w-[85%] sm:max-w-sm md:max-w-md px-3 py-2 rounded-lg text-xs md:text-sm shadow-sm space-y-1 relative ${
                              isMe
                                ? 'bg-[#d9fdd3] text-[#111b21] rounded-tr-none'
                                : 'bg-white text-[#111b21] rounded-tl-none border border-[#e9edef]'
                            }`}
                          >
                            {/* Sender Push Name for Received Messages */}
                            {!m.mediaUrl && m.mediaType && (
                              <p className="text-xs text-[#667781] italic">
                                {m.mediaType === 'image' ? 'Photo' : m.mediaType === 'video' ? 'Video' : m.mediaType === 'audio' ? 'Voice message' : 'Document'}
                              </p>
                            )}

                            {/* Media Display */}
                            {m.mediaUrl && (
                              <div className="rounded-lg overflow-hidden mb-1 border border-black/10">
                                {m.mediaType === 'image' || m.mediaUrl.match(/\.(jpeg|jpg|gif|png|webp)/i) ? (
                                  <img
                                    src={resolveMediaUrl(m.mediaUrl)}
                                    alt="Attachment"
                                    className="max-h-60 w-full object-cover cursor-pointer"
                                    onClick={() => setPreviewImage(resolveMediaUrl(m.mediaUrl))}
                                  />
                                ) : m.mediaType === 'video' || m.mediaUrl.match(/\.(mp4|webm|mov)/i) ? (
                                  <video src={resolveMediaUrl(m.mediaUrl)} controls className="max-h-60 w-full" />
                                ) : m.mediaType === 'audio' || m.mediaUrl.match(/\.(ogg|mp3|m4a|wav|opus)/i) ? (
                                  <audio src={resolveMediaUrl(m.mediaUrl)} controls className="w-full" />
                                ) : (
                                  <a
                                    href={resolveMediaUrl(m.mediaUrl)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center space-x-2 p-2 bg-black/5 rounded text-xs font-bold text-[#111b21] underline"
                                  >
                                    <FileText size={16} />
                                    <span>View Attachment</span>
                                  </a>
                                )}
                              </div>
                            )}

                            {m.message && (
                              <p className="whitespace-pre-wrap break-words leading-relaxed text-[#111b21]">
                                {linkify(m.message)}
                              </p>
                            )}

                            {/* TIME & CHECKMARKS */}
                            <div className="flex items-center justify-end space-x-1 text-[10px] text-[#667781] shrink-0 pt-0.5">
                              <span>
                                {new Date(m.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                              {isMe && <CheckCheck size={14} className="text-[#53bdeb]" />}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* ATTACHMENT PREVIEW BAR */}
            {mediaFile && (
              <div className="px-4 py-2 bg-[#f0f2f5] border-t border-[#e9edef] flex items-center justify-between shrink-0">
                <div className="flex items-center space-x-2 text-xs font-semibold text-[#111b21] truncate">
                  {mediaPreview ? (
                    <img src={mediaPreview} alt="" className="w-10 h-10 rounded object-cover" />
                  ) : (
                    <ImageIcon size={16} className="text-[#00a884] shrink-0" />
                  )}
                  <span className="truncate">{mediaFile.name}</span>
                </div>
                <button onClick={removeMedia} className="p-1 text-red-500 hover:bg-red-50 rounded-lg shrink-0">
                  <X size={16} />
                </button>
              </div>
            )}

            {/* BOTTOM MESSAGE COMPOSER BAR (WHATSAPP WEB EXACT STYLE) */}
            <div className="p-2 bg-[#f0f2f5] shrink-0 relative">
              {showEmoji && (
                <div className="absolute bottom-16 left-2 z-20 bg-white border border-[#e9edef] rounded-xl shadow-lg p-2 grid grid-cols-10 gap-1 w-[280px]">
                  {emojis.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      className="text-xl hover:bg-[#f0f2f5] rounded"
                      onClick={() => setInputMessage((value) => value + emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
              {showAttach && (
                <div className="absolute bottom-16 left-12 z-20 bg-white border border-[#e9edef] rounded-xl shadow-lg py-1 w-44">
                  <button type="button" onClick={() => openFilePicker('image/*')} className="w-full px-3 py-2 text-left text-sm hover:bg-[#f5f6f6] flex items-center gap-2"><ImageIcon size={16} className="text-[#00a884]" /> Photos</button>
                  <button type="button" onClick={() => openFilePicker('video/*')} className="w-full px-3 py-2 text-left text-sm hover:bg-[#f5f6f6] flex items-center gap-2"><Video size={16} className="text-[#7f66ff]" /> Videos</button>
                  <button type="button" onClick={() => openFilePicker('audio/*')} className="w-full px-3 py-2 text-left text-sm hover:bg-[#f5f6f6] flex items-center gap-2"><Mic size={16} className="text-[#ff7a59]" /> Audio</button>
                  <button type="button" onClick={() => openFilePicker('.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip')} className="w-full px-3 py-2 text-left text-sm hover:bg-[#f5f6f6] flex items-center gap-2"><FileText size={16} className="text-[#5157ae]" /> Document</button>
                </div>
              )}
              <form onSubmit={handleSendMessage} className="flex items-end space-x-2">
                <button
                  type="button"
                  onClick={() => { setShowEmoji((open) => !open); setShowAttach(false); }}
                  className="p-2 text-[#54656f] hover:bg-[#e9edef] rounded-full transition-colors shrink-0"
                  title="Emoji"
                >
                  <Smile size={22} />
                </button>
                <button
                  type="button"
                  onClick={() => { setShowAttach((open) => !open); setShowEmoji(false); }}
                  className="p-2 text-[#54656f] hover:bg-[#e9edef] rounded-full transition-colors shrink-0"
                  title="Attach"
                >
                  <Paperclip size={20} />
                </button>

                <input
                  type="file"
                  ref={chatFileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />

                <textarea
                  rows={1}
                  placeholder="Type a message"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      e.currentTarget.form?.requestSubmit();
                    }
                  }}
                  className="flex-1 px-4 py-2.5 bg-white rounded-lg text-sm text-[#111b21] placeholder-[#54656f] focus:outline-none shadow-sm min-w-0 border-none resize-none max-h-28"
                />

                <button
                  type="submit"
                  disabled={sending || (!inputMessage.trim() && !mediaFile)}
                  className="p-2.5 bg-[#00a884] hover:bg-[#008f6f] text-white rounded-full transition-all shadow disabled:opacity-50 shrink-0"
                >
                  {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[#54656f] bg-[#f0f2f5]">
            <div className="w-16 h-16 rounded-full bg-[#dfe5e7] flex items-center justify-center mb-3">
              <MessageSquare size={32} className="text-[#54656f]" />
            </div>
            <h4 className="font-bold text-[#111b21] text-base">WhatsApp Web for MsgPilot</h4>
            <p className="text-xs text-[#667781] mt-1 max-w-xs">
              {connectedPhone
                ? `Messages for +${connectedPhone}, the WhatsApp number connected on this account.`
                : 'Connect a WhatsApp number to see its chats here.'}
            </p>
          </div>
        )}
      </div>

      {confirmAction && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-[#111b21]">
              {confirmAction.mode === 'delete' ? 'Delete chat?' : 'Clear this chat?'}
            </h3>
            <p className="text-sm text-[#667781]">
              {confirmAction.mode === 'delete'
                ? `Delete the chat with ${confirmAction.name}? Messages on this account will be removed.`
                : `Clear messages with ${confirmAction.name}? This only removes them from your account.`}
            </p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setConfirmAction(null)} className="px-4 py-2 text-sm text-[#54656f] hover:bg-[#f0f2f5] rounded-lg">Cancel</button>
              <button
                type="button"
                onClick={() => clearOrDeleteChat(confirmAction.phone, confirmAction.mode)}
                className={`px-4 py-2 text-sm text-white rounded-lg ${confirmAction.mode === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-[#00a884] hover:bg-[#008f6f]'}`}
              >
                {confirmAction.mode === 'delete' ? 'Delete' : 'Clear'}
              </button>
            </div>
          </div>
        </div>
      )}

      {previewImage && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setPreviewImage(null)}>
          <button className="absolute top-4 right-4 text-white" onClick={() => setPreviewImage(null)}><X size={28} /></button>
          <img src={previewImage} alt="Preview" className="max-h-[85vh] max-w-full rounded-lg" />
        </div>
      )}

      {/* NEW CHAT MODAL */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Start New WhatsApp Chat</h3>
            <form onSubmit={handleStartNewChat} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                  Recipient Mobile Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 919876543210"
                  value={newChatNumber}
                  onChange={(e) => setNewChatNumber(e.target.value)}
                  className="w-full px-4 py-2.5 border rounded-xl text-sm font-mono"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewChatModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#00a884] hover:bg-[#008f6f] text-white font-bold rounded-xl text-xs shadow"
                >
                  Start Chat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
