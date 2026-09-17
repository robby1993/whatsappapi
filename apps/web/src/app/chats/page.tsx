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
  Smartphone
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
        if (!selectedContact && chatList.length > 0) {
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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContact || !inputMessage.trim()) return;

    const msgToSend = inputMessage.trim();
    setInputMessage('');
    setSending(true);

    try {
      const res = await api.post('/whatsapp/send-message', {
        phone: selectedContact,
        message: msgToSend,
      });

      if (res.data?.status) {
        toast.success('Message sent!');
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
    <div className="h-[calc(100vh-8rem)] max-w-6xl mx-auto flex bg-white border rounded-2xl shadow-sm overflow-hidden">
      {/* LEFT CHATS LIST */}
      <div className="w-80 md:w-96 border-r flex flex-col h-full bg-gray-50/50 shrink-0">
        <div className="p-4 border-b space-y-3 bg-white">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
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
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-gray-900 text-sm truncate">+{c.phone}</h4>
                      <span className="text-[10px] text-gray-400 font-mono">
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
      <div className="flex-1 flex flex-col h-full bg-gray-50">
        {selectedContact ? (
          <>
            {/* CHAT HEADER */}
            <div className="p-4 bg-white border-b flex items-center justify-between shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                  <User size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">+{selectedContact}</h3>
                  <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Active WhatsApp Conversation
                  </span>
                </div>
              </div>

              <button
                onClick={() => fetchChatMessages(selectedContact, true)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100"
                title="Refresh Messages"
              >
                <RefreshCw size={18} />
              </button>
            </div>

            {/* MESSAGES THREAD */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
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
                        className={`max-w-md px-4 py-2.5 rounded-2xl text-sm shadow-sm space-y-1 ${
                          isMe
                            ? 'bg-emerald-600 text-white rounded-br-none'
                            : 'bg-white text-gray-900 border rounded-bl-none'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{m.message}</p>
                        <div
                          className={`flex items-center justify-end space-x-1 text-[10px] ${
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

            {/* MESSAGE COMPOSER INPUT */}
            <div className="p-4 bg-white border-t">
              <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  className="flex-1 px-4 py-3 border rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  disabled={sending || !inputMessage.trim()}
                  className="p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all shadow disabled:opacity-50"
                >
                  {sending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
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
