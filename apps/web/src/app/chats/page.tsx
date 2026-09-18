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
  ArrowLeft
} from 'lucide-react';

interface ChatContact {
  phone: string;
  lastMessage: string;
  timestamp: string;
  status?: string;
}

interface Message {
  id: number;
  sender: string;
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [search, setSearch] = useState('');
  const [inputMessage, setInputMessage] = useState('');
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  // Attachment state
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

  const fetchChats = async () => {
    try {
      const res = await api.get('/whatsapp/chats');
      const chatList = res.data?.result || [];
      if (Array.isArray(chatList)) {
        setChats(chatList);
        if (!selectedContact && chatList.length > 0 && typeof window !== 'undefined' && window.innerWidth >= 768) {
          setSelectedContact(chatList[0].phone);
          fetchChatMessages(chatList[0].phone, true);
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

  const handleSelectContact = (phone: string) => {
    setSelectedContact(phone);
    fetchChatMessages(phone, true);
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
        toast.success('Message sent!');
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

    setSelectedContact(cleanNum);
    setShowNewChatModal(false);
    setNewChatNumber('');
    fetchChatMessages(cleanNum, true);
  };

  const filteredChats = chats.filter((c) =>
    c.phone.toLowerCase().includes(search.toLowerCase()) ||
    c.lastMessage.toLowerCase().includes(search.toLowerCase())
  );

  if (loadingChats) return <div className="flex items-center justify-center h-full">Loading WhatsApp Chats...</div>;

  return (
    <div className="h-[calc(100vh-6rem)] md:h-[calc(100vh-7rem)] w-full max-w-6xl mx-auto flex bg-white border rounded-2xl shadow-sm overflow-hidden relative">
      {/* LEFT CHATS LIST */}
      <div
        className={`w-full md:w-80 lg:w-96 border-r flex flex-col h-full bg-gray-50/50 shrink-0 ${
          selectedContact ? 'hidden md:flex' : 'flex'
        }`}
      >
        <div className="p-4 border-b space-y-3 bg-white shrink-0">
          <div className="flex items-center justify-between">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
              <MessageSquare size={20} className="text-emerald-600" />
              <span>WhatsApp Chats</span>
            </h3>

            <button
              onClick={() => setShowNewChatModal(true)}
              className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow transition-colors"
              title="New Chat"
            >
              <Plus size={18} />
            </button>
          </div>

          <div className="relative">
            <Search size={16} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search chat or number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border rounded-xl text-xs bg-gray-50 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* CHATS SCROLLABLE LIST */}
        <div className="flex-1 overflow-y-auto divide-y">
          {filteredChats.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-xs">
              <MessageSquare size={32} className="mx-auto mb-2 text-gray-300" />
              <p>No chat history found</p>
              <button
                onClick={() => setShowNewChatModal(true)}
                className="mt-3 text-emerald-600 font-bold hover:underline"
              >
                + Start New Chat
              </button>
            </div>
          ) : (
            filteredChats.map((c) => {
              const isSelected = selectedContact === c.phone;
              return (
                <div
                  key={c.phone}
                  onClick={() => handleSelectContact(c.phone)}
                  className={`p-4 flex items-center space-x-3 cursor-pointer transition-colors ${
                    isSelected ? 'bg-emerald-50 border-l-4 border-emerald-600' : 'hover:bg-gray-100/80'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0">
                    <User size={20} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="font-bold text-gray-900 text-sm truncate">+{c.phone}</h4>
                      <span className="text-[10px] text-gray-400 font-mono shrink-0">
                        {new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{c.lastMessage}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT LIVE CHAT FEED */}
      <div
        className={`flex-1 flex flex-col h-full bg-gray-50 min-w-0 ${
          selectedContact ? 'flex' : 'hidden md:flex'
        }`}
      >
        {selectedContact ? (
          <>
            {/* CHAT HEADER */}
            <div className="p-3 md:p-4 bg-white border-b flex items-center justify-between shadow-sm shrink-0">
              <div className="flex items-center space-x-3 min-w-0">
                {/* Mobile Back Button */}
                <button
                  onClick={() => setSelectedContact(null)}
                  className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg md:hidden transition-colors shrink-0"
                  title="Back to Chats"
                >
                  <ArrowLeft size={20} />
                </button>

                <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  <User size={20} />
                </div>

                <div className="min-w-0">
                  <h3 className="font-bold text-gray-900 text-sm md:text-base truncate">+{selectedContact}</h3>
                  <span className="text-[10px] md:text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Active WhatsApp Conversation
                  </span>
                </div>
              </div>

              <button
                onClick={() => fetchChatMessages(selectedContact, true)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 shrink-0"
                title="Refresh Messages"
              >
                <RefreshCw size={18} />
              </button>
            </div>

            {/* MESSAGES THREAD */}
            <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full text-xs text-gray-400 space-x-2">
                  <Loader2 size={18} className="animate-spin text-emerald-600" />
                  <span>Loading messages...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-400 text-xs py-12">
                  <p>No messages yet. Send a message below to start chatting!</p>
                </div>
              ) : (
                messages.map((m) => {
                  const isMe = m.status === 'sent' || (m.sender !== selectedContact && m.status !== 'received');
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[85%] sm:max-w-sm md:max-w-md px-3.5 md:px-4 py-2.5 rounded-2xl text-xs md:text-sm shadow-sm space-y-1.5 ${
                          isMe
                            ? 'bg-emerald-600 text-white rounded-br-none'
                            : 'bg-white text-gray-900 border rounded-bl-none'
                        }`}
                      >
                        {/* Media Display */}
                        {m.mediaUrl && (
                          <div className="rounded-xl overflow-hidden mb-1 border border-black/10">
                            {m.mediaType === 'image' || m.mediaUrl.match(/\.(jpeg|jpg|gif|png|webp)/i) ? (
                              <img src={m.mediaUrl} alt="Attachment" className="max-h-60 w-full object-cover" />
                            ) : (
                              <a
                                href={m.mediaUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center space-x-2 p-2 bg-black/10 rounded-lg text-xs font-semibold underline"
                              >
                                <FileText size={16} />
                                <span>View Attachment</span>
                              </a>
                            )}
                          </div>
                        )}

                        {m.message && <p className="whitespace-pre-wrap break-words leading-relaxed">{m.message}</p>}

                        <div
                          className={`flex items-center justify-end space-x-1 text-[10px] pt-0.5 shrink-0 ${
                            isMe ? 'text-emerald-100' : 'text-gray-400'
                          }`}
                        >
                          <span>
                            {new Date(m.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {isMe && <CheckCheck size={12} />}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* ATTACHMENT PREVIEW */}
            {mediaFile && (
              <div className="px-4 py-2 bg-gray-100 border-t flex items-center justify-between shrink-0">
                <div className="flex items-center space-x-2 text-xs font-semibold text-gray-700 truncate">
                  <ImageIcon size={16} className="text-emerald-600 shrink-0" />
                  <span className="truncate">{mediaFile.name}</span>
                </div>
                <button onClick={removeMedia} className="p-1 text-red-500 hover:bg-red-100 rounded-lg shrink-0">
                  <X size={16} />
                </button>
              </div>
            )}

            {/* MESSAGE COMPOSER INPUT */}
            <div className="p-3 md:p-4 bg-white border-t shrink-0">
              <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => chatFileInputRef.current?.click()}
                  className="p-2.5 text-gray-500 hover:text-emerald-600 hover:bg-gray-100 rounded-xl transition-colors shrink-0"
                  title="Attach Media"
                >
                  <Paperclip size={18} />
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
                  placeholder="Type a message..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 md:py-3 border rounded-xl text-xs md:text-sm focus:outline-none focus:border-emerald-500 min-w-0"
                />

                <button
                  type="submit"
                  disabled={sending || (!inputMessage.trim() && !mediaFile)}
                  className="p-2.5 md:p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all shadow disabled:opacity-50 shrink-0"
                >
                  {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400">
            <MessageSquare size={48} className="text-gray-300 mb-3" />
            <h4 className="font-bold text-gray-700 text-base">Select a Chat</h4>
            <p className="text-xs text-gray-400 mt-1">Choose a contact on the left or start a new chat.</p>
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
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow"
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
