'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Calendar,
  Lock,
  Download
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

  // Attachment State
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState('image');
  const chatFileInputRef = useRef<HTMLInputElement>(null);

  // New Chat Modal
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatNumber, setNewChatNumber] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchChats();
    const interval = setInterval(() => {
      fetchChats();
      if (selectedContact) {
        fetchChatMessages(selectedContact, false);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [selectedContact]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

  const fetchChats = async () => {
    try {
      const res = await api.get('/whatsapp/chats');
      const chatList = res.data?.result || [];
      if (Array.isArray(chatList)) {
        setChats(chatList);
        if (!selectedContact && chatList.length > 0 && typeof window !== 'undefined' && window.innerWidth >= 768) {
          handleSelectContact(chatList[0].phone, chatList[0].name, chatList[0].profilePicUrl);
        }
      }
    } catch (err) {
      console.error('Error loading chats');
    } finally {
      setLoadingChats(false);
    }
  };

  const fetchChatMessages = async (chatNumber: string, showLoading = true) => {
    if (!chatNumber) return;
    if (showLoading) setLoadingMessages(true);
    try {
      const res = await api.get(`/whatsapp/chats/${chatNumber}`);
      const msgList = res.data?.result || [];
      if (Array.isArray(msgList)) {
        setMessages(msgList);
      }
    } catch (err) {
      console.error('Error loading chat messages');
    } finally {
      if (showLoading) setLoadingMessages(false);
    }
  };

  const handleSelectContact = (phone: string, name?: string | null, picUrl?: string | null) => {
    setSelectedContact(phone);
    setSelectedContactName(name && name !== `+${phone}` ? name : null);
    setSelectedContactPic(picUrl || null);
    fetchChatMessages(phone, true);
    if (!picUrl) {
      fetchProfilePic(phone);
    }
  };

  const fetchProfilePic = async (phone: string) => {
    try {
      const res = await api.get(`/whatsapp/contact-profile?phone=${phone}`);
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
        mediaUrl: uploadedMediaUrl,
        mediaType: mediaFile ? mediaType : null
      });

      if (res.data?.status) {
        removeMedia();
        fetchChatMessages(selectedContact, false);
        fetchChats();
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

  const filteredChats = chats.filter((c) =>
    c.phone.toLowerCase().includes(search.toLowerCase()) ||
    (c.name && c.name.toLowerCase().includes(search.toLowerCase())) ||
    c.lastMessage.toLowerCase().includes(search.toLowerCase())
  );

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

  if (loadingChats) return <div className="flex items-center justify-center h-full">Loading WhatsApp Web...</div>;

  return (
    <div className="h-[calc(100vh-6rem)] md:h-[calc(100vh-7rem)] w-full max-w-6xl mx-auto flex bg-[#f0f2f5] border rounded-2xl shadow-lg overflow-hidden relative font-sans">
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
            <span className="font-bold text-[#111b21] text-base">Chats</span>
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
              onClick={fetchChats}
              className="p-2 text-[#54656f] hover:bg-[#e9edef] rounded-full transition-colors"
              title="Refresh Chats"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>

        {/* SEARCH BAR CONTAINER */}
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
        <div className="flex-1 overflow-y-auto divide-y divide-[#f0f2f5]">
          {filteredChats.length === 0 ? (
            <div className="p-8 text-center text-[#54656f] text-xs">
              <p className="font-semibold text-gray-700">No chats found</p>
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

              return (
                <div
                  key={c.phone}
                  onClick={() => handleSelectContact(c.phone, c.name, c.profilePicUrl)}
                  className={`px-4 py-3 flex items-center space-x-3 cursor-pointer transition-all ${
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

                    <p className="text-xs text-[#667781] truncate mt-0.5 font-normal">
                      {c.lastMessage}
                    </p>
                  </div>
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

              <div className="flex items-center space-x-1 shrink-0">
                <button
                  onClick={() => {
                    fetchChatMessages(selectedContact, true);
                    fetchProfilePic(selectedContact);
                  }}
                  className="p-2 text-[#54656f] hover:bg-[#e9edef] rounded-full transition-colors"
                  title="Refresh Conversation"
                >
                  <RefreshCw size={18} />
                </button>
              </div>
            </div>

            {/* MESSAGES THREAD WALL WITH WHATSAPP PATTERN */}
            <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4 bg-[#efeae2] bg-[radial-gradient(#d1c7bd_1px,transparent_1px)] [background-size:16px_16px]">
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
                      const isMe = m.status === 'sent' || (m.sender !== selectedContact && m.status !== 'received');
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
                            {!isMe && m.senderName && (
                              <p className="text-[11px] font-bold text-[#00a884] mb-0.5">
                                {m.senderName}
                              </p>
                            )}

                            {/* Media Display */}
                            {m.mediaUrl && (
                              <div className="rounded-lg overflow-hidden mb-1 border border-black/10">
                                {m.mediaType === 'image' || m.mediaUrl.match(/\.(jpeg|jpg|gif|png|webp)/i) ? (
                                  <img src={m.mediaUrl} alt="Attachment" className="max-h-60 w-full object-cover" />
                                ) : (
                                  <a
                                    href={m.mediaUrl}
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
                                {m.message}
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
                  <ImageIcon size={16} className="text-[#00a884] shrink-0" />
                  <span className="truncate">{mediaFile.name}</span>
                </div>
                <button onClick={removeMedia} className="p-1 text-red-500 hover:bg-red-50 rounded-lg shrink-0">
                  <X size={16} />
                </button>
              </div>
            )}

            {/* BOTTOM MESSAGE COMPOSER BAR (WHATSAPP WEB EXACT STYLE) */}
            <div className="p-2.5 bg-[#f0f2f5] border-t border-[#e9edef] shrink-0">
              <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => chatFileInputRef.current?.click()}
                  className="p-2 text-[#54656f] hover:bg-[#e9edef] rounded-full transition-colors shrink-0"
                  title="Attach Media"
                >
                  <Paperclip size={20} />
                </button>

                <input
                  type="file"
                  ref={chatFileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*,video/*,audio/*,application/*"
                />

                <input
                  type="text"
                  placeholder="Type a message"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-white rounded-lg text-xs md:text-sm text-[#111b21] placeholder-[#54656f] focus:outline-none shadow-sm min-w-0 border-none"
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
              Send and receive messages seamlessly with full chat history.
            </p>
          </div>
        )}
      </div>

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
