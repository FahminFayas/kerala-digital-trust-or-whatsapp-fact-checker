"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, MoreVertical, Phone, Video, CheckCheck,
  Paperclip, Mic, Send, Smile, ShieldCheck, Forward,
  MessageSquare, CircleDashed, Users, Plus, X, Info,
  Archive, Lock, ChevronDown, Check, ShieldAlert, BadgeCheck,
  UserPlus, Sparkles, ArrowLeft
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
type AnalyzeResult = {
  trust_score: number;
  verdict: string;
  explanation: string;
  red_flags: string[];
};

type ChatMessage = {
  id: string;
  text?: string;
  sender: 'user' | 'bot' | 'other';
  time: string;
  isForwarded?: boolean;
  result?: AnalyzeResult;
  isTyping?: boolean;
};

type Contact = {
  id: string;
  name: string;
  type: 'human' | 'bot';
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  messages: ChatMessage[];
};

// --- Authentic Malayalam & Manglish Mock Hacks ---
const SCAM_1_KSEB = `Kerala State Electricity Board: Ningalude current bill adachittilla. Udane adakkathirunnal vaikaatte line disconnect aakum. EE link vazhi bill update cheyyuka: http://kseb-quickpay.xyz`;

const RESPONSE_1_KSEB: AnalyzeResult = {
  trust_score: 12,
  verdict: "High Risk - Proven Scam",
  explanation: "This is the classic 'KSEB disconnection' phishing scam rampant in Kerala. The message uses Manglish ('Udane adakkathirunnal') to bypass English fraud detectors and creates false urgency. The URL is a malicious unverified domain designed to steal credit card data.",
  red_flags: ["False Urgency Threat", "Impostor (KSEB)", "Malicious Data-Harvester Link"]
};

const SCAM_2_KYC = `Sir/Madam, ningalude SBI NetBanking block aakan pokunnu. Account protect cheyyan PAN card udan update cheyyuka. Athyavashyam! Click: https://sbi-kyc-update-portal.info/login`;

const RESPONSE_2_KYC: AnalyzeResult = {
  trust_score: 4,
  verdict: "Critical Risk - Credential Harvester",
  explanation: "This is a bank impersonation scam exploiting the fear of account blockages. 'Athyavashyam!' (Urgent!) is a localized psychological trigger. The link attempts to clone the SBI portal to steal dual-factor authentication tokens.",
  red_flags: ["Account Suspension Threat", "Fake Bank Portal URL", "Manglish Fraud Vector"]
};

const SCAM_3_LULU = `LULU MALL 25th Anniversary Free Gift 🎉! Spin the wheel to win iPhone 15 Pro Max! Njan spin cheythew nokki, enikkitu kitti! 🎁👇 http://lulu-anniversary-gifts.com/spin`;

const RESPONSE_3_LULU: AnalyzeResult = {
  trust_score: 20,
  verdict: "Suspicious - Clickbait / Adware",
  explanation: "This is a widespread promotional scam masquerading as a LuLu Mall anniversary giveaway. It utilizes Malayalam testimonials ('Njan spin cheythew nokki') to enforce social proof among friends and family. The link leads to adware and highly intrusive surveys.",
  red_flags: ["Too-Good-To-Be-True Offer", "Fake Social Proof", "Non-Official Domain"]
};

const GENERIC_RESPONSE: AnalyzeResult = {
  trust_score: 95,
  verdict: "Safe Environment",
  explanation: "Linguistic scan indicates a normal conversational tone with no detectable urgency metrics, financial requests, or unsafe hyperlinks.",
  red_flags: []
};

// --- WhatsApp Web Dark Theme Colors ---
const theme = {
  bgApp: "bg-[#0b141a]",
  bgSidebar: "bg-[#111b21]",
  bgHeader: "bg-[#202c33]",
  bgChat: "bg-[#0b141a]",
  bgSearch: "bg-[#202c33]",
  textPrimary: "text-[#e9edef]",
  textSecondary: "text-[#8696a0]",
  bubbleOut: "bg-[#005c4b]",
  bubbleIn: "bg-[#202c33]",
  blueLink: "text-[#53bdeb]",
  accent: "bg-[#00a884]",
  border: "border-[#222d34]",
  hover: "hover:bg-[#202c33]"
};

const scrollbarCSS = `
  .custom-scrollbar::-webkit-scrollbar { width: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(134, 150, 160, 0.2); border-radius: 20px; }
  .custom-scrollbar:hover::-webkit-scrollbar-thumb { background-color: rgba(134, 150, 160, 0.4); }
`;

export default function WhatsAppWebClone() {
  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: 'family',
      name: 'Family Group Kudumbam 🏠',
      type: 'human',
      avatar: 'FG',
      lastMessage: '~ Ammavan: LULU MALL 25th Anniversary...',
      time: '12:54 pm',
      unread: 2,
      messages: [
        { id: '1', text: 'Evideya ellarum? Naattil ethiyo?', sender: 'other', time: '11:40 am' },
        { id: '2', text: 'Athe, inale rathri ethi.', sender: 'user', time: '11:45 am' },
        { id: '3', text: SCAM_3_LULU, sender: 'other', time: '12:54 pm', isForwarded: true }
      ]
    },
    {
      id: 'unknown1',
      name: '+91 98470 12345',
      type: 'human',
      avatar: 'UK',
      lastMessage: 'Sir/Madam, ningalude SBI NetBanking...',
      time: '10:30 am',
      unread: 1,
      messages: [
        { id: '1', text: SCAM_2_KYC, sender: 'other', time: '10:30 am', isForwarded: false }
      ]
    },
    {
      id: 'friends',
      name: 'College Gang 🎓',
      type: 'human',
      avatar: 'CG',
      lastMessage: '~ Shyam: Kerala State Electricity Board...',
      time: '09:15 am',
      unread: 0,
      messages: [
        { id: '1', text: 'Machaane evideya?', sender: 'other', time: '09:00 am' },
        { id: '2', text: 'Roomil und, entha?', sender: 'user', time: '09:05 am' },
        { id: '3', text: 'Ithu nokke, theendi!', sender: 'other', time: '09:14 am' },
        { id: '4', text: SCAM_1_KSEB, sender: 'other', time: '09:15 am', isForwarded: true }
      ]
    },
    {
      id: 'bot',
      name: 'Kerala AI Checker',
      type: 'bot',
      avatar: 'LG',
      lastMessage: 'Verified Fact-Checker',
      time: '12:00 pm',
      unread: 0,
      messages: [
        { id: 'b1', text: 'Hello! I am LinguistGuard, your regional AI fact-checking assistant. Forward any suspicious Malayalam/Manglish message to me, and I will analyze it using real-time phishing intelligence.', sender: 'bot', time: '12:00 pm' }
      ]
    }
  ]);

  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const [contextMenuMsgId, setContextMenuMsgId] = useState<string | null>(null);
  const [showForwardModal, setShowForwardModal] = useState<string | null>(null); // State for message being forwarded

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeChat = contacts.find(c => c.id === activeChatId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat?.messages.length, activeChatId]);

  useEffect(() => {
    const closeMenu = () => setContextMenuMsgId(null);
    document.addEventListener("click", closeMenu);
    return () => document.removeEventListener("click", closeMenu);
  }, []);

  const fetchAIResponse = async (text: string): Promise<AnalyzeResult> => {
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error analyzing text:", error);
      return {
        trust_score: 50,
        verdict: "Error / പിശക്",
        explanation: "Unable to process the request. സേവനവുമായി ബന്ധിപ്പിക്കാൻ കഴിഞ്ഞില്ല.",
        red_flags: ["Connection/API Error"]
      };
    }
  };

  const handleForwardToBot = async (msgText: string) => {
    setActiveChatId('bot');
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase();

    const initialUserMsg: ChatMessage = {
      id: Date.now().toString(),
      text: msgText,
      sender: 'user',
      time: timestamp,
      isForwarded: true
    };

    const typingMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      sender: 'bot',
      time: timestamp,
      isTyping: true
    };

    setContacts(prev => prev.map(c => {
      if (c.id === 'bot') {
        return { ...c, unread: 0, lastMessage: 'Scanning...', messages: [...c.messages, initialUserMsg, typingMsg] };
      }
      return c;
    }));

    const aiResponse = await fetchAIResponse(msgText);

    setContacts(prev => prev.map(c => {
      if (c.id === 'bot') {
        const filtered = c.messages.filter(m => !m.isTyping);
        return {
          ...c,
          lastMessage: 'Analysis Complete',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase(),
          messages: [...filtered, {
            id: Date.now().toString(),
            sender: 'bot',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase(),
            result: aiResponse
          }]
        };
      }
      return c;
    }));
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChat) return;

    const currentInputText = inputText;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase();
    const newMsg: ChatMessage = { id: Date.now().toString(), text: currentInputText, sender: 'user', time: timestamp };

    setContacts(prev => prev.map(c => {
      if (c.id === activeChatId) {
        return { ...c, unread: 0, lastMessage: currentInputText, time: timestamp, messages: [...c.messages, newMsg] };
      }
      return c;
    }));
    setInputText("");

    if (activeChatId === 'bot') {
      const typingMsg: ChatMessage = { id: (Date.now() + 1).toString(), sender: 'bot', time: timestamp, isTyping: true };
      setContacts(prev => prev.map(c => {
        if (c.id === 'bot') return { ...c, lastMessage: 'Scanning...', messages: [...c.messages, typingMsg] };
        return c;
      }));

      const aiResponse = await fetchAIResponse(currentInputText);

      setContacts(prev => prev.map(c => {
        if (c.id === 'bot') {
          const filtered = c.messages.filter(m => !m.isTyping);

          return {
            ...c,
            lastMessage: aiResponse.verdict,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase(),
            messages: [...filtered, {
              id: Date.now().toString(),
              sender: 'bot',
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase(),
              result: aiResponse
            }]
          };
        }
        return c;
      }));
    }
  };

  const handleForwardToChat = (contactId: string, msgText: string) => {
    // If forwarding specifically to the AI bot, use the specialized analysis logic
    if (contactId === 'bot') {
      handleForwardToBot(msgText);
      setShowForwardModal(null);
      return;
    }

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase();
    const forwardMsg: ChatMessage = {
      id: Date.now().toString(),
      text: msgText,
      sender: 'user',
      time: timestamp,
      isForwarded: true
    };

    setContacts(prev => prev.map(c => {
      if (c.id === contactId) {
        return { ...c, lastMessage: msgText, time: timestamp, messages: [...c.messages, forwardMsg] };
      }
      return c;
    }));

    setShowForwardModal(null);
    setActiveChatId(contactId);
  };

  return (
    <>
      <style>{scrollbarCSS}</style>
      <div className={cn("h-[100dvh] w-full flex text-[15px] font-sans selection:bg-[#00a884]/30 overflow-hidden", theme.bgApp, theme.textPrimary)}>

        {/* --- FORWARDING MODAL (PREMIUM UI) --- */}
        <AnimatePresence>
          {showForwardModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowForwardModal(null)}
                className="absolute inset-0 bg-[#0b141a]/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="w-full max-w-[500px] bg-[#233138]/95 backdrop-blur-xl rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden relative z-10 border border-white/10"
              >
                <div className="px-6 py-5 flex items-center justify-between border-b border-[#2a3942]">
                  <div className="flex items-center gap-4">
                    <X className="w-6 h-6 cursor-pointer text-[#aebac1] hover:text-white" onClick={() => setShowForwardModal(null)} />
                    <h3 className="text-xl font-normal">Forward message to</h3>
                  </div>
                </div>

                <div className="p-4">
                  <div className="bg-[#111b21] rounded-lg px-4 py-2 flex items-center mb-4">
                    <Search className="w-5 h-5 text-[#8696a0] mr-4" />
                    <input type="text" placeholder="Search..." className="bg-transparent outline-none w-full text-[#e9edef]" />
                  </div>

                  <div className="max-h-[400px] overflow-y-auto custom-scrollbar flex flex-col gap-1">
                    <p className="text-[#00a884] text-sm font-semibold px-2 py-3">RECENT CHATS</p>
                    {contacts.map(c => (
                      <div
                        key={c.id}
                        onClick={() => handleForwardToChat(c.id, showForwardModal)}
                        className="flex items-center gap-4 p-3 rounded-lg hover:bg-[#202c33] cursor-pointer group transition-colors"
                      >
                        <div className={cn("w-12 h-12 rounded-full flex items-center justify-center shrink-0 relative", c.type === 'bot' ? "bg-gradient-to-br from-[#00a884] to-[#018e6f] shadow-lg shadow-[#00a884]/20" : "bg-[#233138]")}>
                          {c.type === 'bot' && <div className="absolute inset-0 bg-[#00a884] rounded-full blur-md opacity-40 mix-blend-screen animate-pulse" />}
                          {c.type === 'bot' ? <ShieldCheck className="w-6 h-6 text-white relative z-10" /> : <span className="text-[#aebac1]">{c.avatar}</span>}
                        </div>
                        <div className="flex-1 border-b border-[#2a3942] group-last:border-transparent pb-3 pt-1">
                          <h4 className={cn("text-[17px]", c.type === 'bot' && "text-[#00a884] font-medium")}>{c.name}</h4>
                          {c.type === 'bot' && <p className="text-xs text-[#8696a0]">LinguistGuard Analysis Service</p>}
                        </div>
                      </div>
                    ))}
                    <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-[#202c33] cursor-pointer transition-colors mt-2">
                      <div className="w-12 h-12 rounded-full bg-[#00a884] flex items-center justify-center shrink-0">
                        <Plus className="w-6 h-6 text-[#111b21]" />
                      </div>
                      <span className="text-[17px]">New group</span>
                    </div>
                  </div>
                </div>

                <div className={cn("px-6 py-4 flex items-center border-t border-[#2a3942]", theme.bgHeader)}>
                  <Forward className="w-5 h-5 text-[#8696a0] mr-4" />
                  <p className="text-[#8696a0] text-sm truncate bg-[#111b21] px-4 py-2 rounded-md flex-1 italic">{showForwardModal}</p>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* --- LEFT SIDEBAR PANEL --- */}
        <div className={cn("w-full md:w-[420px] flex-col shrink-0 border-r z-20 shadow-xl", theme.border, theme.bgSidebar, activeChatId ? "hidden md:flex" : "flex")}>
          <div className={cn("h-[64px] px-4 flex items-center justify-between shrink-0", theme.bgHeader)}>
            <div className="w-[42px] h-[42px] rounded-full bg-[#182229] flex items-center justify-center shrink-0 border border-white/5 cursor-pointer hover:bg-[#202c33] transition">
              <span className="text-sm font-bold text-[#aebac1]">Me</span>
            </div>
            <div className={cn("flex items-center gap-6", theme.textSecondary)}>
              <Users className="w-[22px] h-[22px] cursor-pointer hover:text-white transition-colors" />
              <CircleDashed className="w-[22px] h-[22px] cursor-pointer hover:text-white transition-colors" />
              <MessageSquare className="w-[22px] h-[22px] cursor-pointer hover:text-white transition-colors" />
              <Plus className="w-[24px] h-[24px] cursor-pointer hover:text-white transition-colors" />
              <MoreVertical className="w-[22px] h-[22px] cursor-pointer hover:text-white transition-colors" />
            </div>
          </div>

          <div className="pt-2 pb-3 px-3 shadow-[0_1px_3px_rgba(11,20,26,.5)] z-10 shrink-0">
            <div className={cn("flex items-center rounded-lg px-4 py-[7px] focus-within:bg-[#202c33] transition-all duration-300 border border-transparent focus-within:border-[#00a884]/30 focus-within:shadow-[0_0_10px_rgba(0,168,132,0.05)]", theme.bgSearch)}>
              <Search className={cn("w-4 h-4 mr-4", theme.textSecondary)} />
              <input type="text" placeholder="Search or start a new chat" className={cn("bg-transparent outline-none flex-1 py-1 text-[15px] placeholder:text-[#8696a0]", theme.textPrimary)} />
            </div>
            <div className="flex items-center gap-2.5 mt-3 overflow-x-auto custom-scrollbar pb-1">
              <button className="px-3 py-[7px] rounded-full bg-[#202c33] text-[#aebac1] font-medium text-[14px] hover:bg-[#2a3942] transition-colors whitespace-nowrap flex items-center gap-1">
                <ShieldCheck className="w-[15px] h-[15px] text-[#00a884]" /> Guards
              </button>
              <button className="px-3 py-[7px] rounded-full bg-[#202c33] text-[#aebac1] font-medium text-[14px] hover:bg-[#2a3942] transition-colors whitespace-nowrap">Unread 3</button>
              <button className="px-3 py-[7px] rounded-full bg-[#202c33] text-[#aebac1] font-medium text-[14px] hover:bg-[#2a3942] transition-colors whitespace-nowrap">Favourites</button>
              <button className="px-3 py-[7px] rounded-full bg-[#202c33] text-[#aebac1] font-medium text-[14px] hover:bg-[#2a3942] transition-colors whitespace-nowrap">Groups 24</button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto w-full custom-scrollbar">
            <div className="mx-3 my-2 flex items-center justify-between bg-[#112320] text-[#00a884] p-3 rounded-xl border border-[#00a884]/20 hover:bg-[#162d29] cursor-default transition-colors">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-full bg-[#00a884] flex items-center justify-center shrink-0">
                  <CheckCheck className="w-[20px] h-[20px] text-[#112320]" />
                </span>
                <div className="text-[14px] leading-tight">
                  <p className="font-semibold text-[#00a884]">Sync is active</p>
                  <p className="text-[#00a884]/80 text-[13px]">Message notifications are muted.</p>
                </div>
              </div>
              <X className="w-5 h-5 cursor-pointer text-[#00a884]/60 hover:text-[#00a884]" />
            </div>

            <div className={cn("flex items-center justify-between px-5 py-3 cursor-pointer group", theme.hover)}>
              <div className="flex items-center gap-5 text-[#8696a0] group-hover:text-[#aebac1] transition-colors">
                <Archive className="w-[20px] h-[20px]" />
                <span className="font-medium text-[16px]">Archived</span>
              </div>
              <span className="text-[#00a884] text-xs font-semibold">15</span>
            </div>

            {contacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => setActiveChatId(contact.id)}
                className={cn(
                  "flex items-center pl-4 py-3 w-full cursor-pointer transition-colors group relative",
                  activeChatId === contact.id ? "bg-[#2a3942]" : theme.hover
                )}
              >
                <div className={cn("w-[50px] h-[50px] rounded-full flex items-center justify-center shrink-0 mr-4 shadow-sm relative", contact.type === 'bot' ? "bg-gradient-to-br from-[#00a884] to-[#018e6f]" : "bg-[#233138]")}>
                  {contact.type === 'bot' && (
                    <motion.div
                      animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.05, 1] }}
                      transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                      className="absolute inset-0 rounded-full bg-[#00a884] blur-md -z-10"
                    />
                  )}
                  {contact.type === 'bot' ? <ShieldCheck className="w-7 h-7 text-white" /> : <span className="text-[#aebac1] font-medium">{contact.avatar}</span>}
                </div>
                <div className="flex-1 min-w-0 pr-4 pb-3 border-b border-[#222d34] group-last:border-transparent flex flex-col justify-center h-full pt-1">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="font-normal text-[17px] text-[#e9edef] truncate">{contact.name}</span>
                    <span className={cn("text-[12px] shrink-0 ml-2 font-medium tracking-wide", contact.unread > 0 ? "text-[#00a884]" : theme.textSecondary)}>
                      {contact.time}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className={cn("text-[14px] truncate flex-1", contact.unread > 0 ? "text-[#e9edef] font-medium" : theme.textSecondary, activeChatId === contact.id && "text-[#aebac1]")}>{contact.lastMessage}</p>
                    {contact.unread > 0 && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="min-w-[20px] h-[20px] px-1 rounded-full bg-[#00a884] flex items-center justify-center text-[#111b21] text-[12px] font-bold shrink-0 ml-2 shadow-[0_1px_3px_rgba(0,0,0,.3)]">{contact.unread}</motion.span>}
                  </div>
                </div>
              </div>
            ))}
            <div className="flex flex-col items-center justify-center py-8 gap-1.5 text-[#8696a0] text-xs">
              <span className="flex items-center gap-1.5"><Lock className="w-[10px] h-[10px]" /> Your personal messages are</span>
              <span className={theme.blueLink}>end-to-end encrypted</span>
            </div>
          </div>
        </div>

        {/* --- RIGHT PANE (ACTIVE CHAT CONTEXT) --- */}
        <div className={cn("flex-1 flex-col h-full bg-[#0b141a] z-10 basis-auto overflow-hidden", !activeChatId ? "hidden md:flex" : "flex")}>
          <AnimatePresence mode="wait">
            {activeChat ? (
              <motion.div key={activeChat.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }} className="flex flex-col w-full h-full relative z-0">
                <header className={cn("h-[64px] px-4 flex items-center justify-between shrink-0 z-20 shadow-sm border-l border-white/5", theme.bgHeader)}>
                  <div className="flex items-center gap-3 cursor-pointer group">
                    <button onClick={() => setActiveChatId(null)} className="md:hidden p-1.5 -ml-2 rounded-full hover:bg-white/10 text-white/70 transition-colors">
                      <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div className={cn("w-[42px] h-[42px] rounded-full flex items-center justify-center shrink-0 shadow-sm relative", activeChat.type === 'bot' ? "bg-gradient-to-br from-[#00a884] to-[#018e6f]" : "bg-[#233138]")}>
                      {activeChat.type === 'bot' && (
                        <motion.div
                          animate={{ opacity: [0.3, 0.6, 0.3] }}
                          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                          className="absolute inset-0 rounded-full bg-[#00a884] blur-sm -z-10 pointer-events-none"
                        />
                      )}
                      {activeChat.type === 'bot' ? <ShieldCheck className="w-[22px] h-[22px] text-white" /> : <span className="text-[#aebac1] font-medium">{activeChat.avatar}</span>}
                    </div>
                    <div>
                      <h2 className="text-[17px] font-normal text-[#e9edef]">{activeChat.name}</h2>
                      {activeChat.type === 'bot' ? <p className={cn("text-[13px] flex items-center gap-1 text-[#00a884]")}><BadgeCheck className="w-[14px] h-[14px]" /> Official Fact-Checking Framework</p> : <p className={cn("text-[13px]", theme.textSecondary)}>click here for contact info</p>}
                    </div>
                  </div>
                  <div className={cn("flex items-center gap-6 pr-2", theme.textSecondary)}>
                    <Video className="w-[22px] h-[22px] cursor-pointer hover:text-white transition-colors" />
                    <Search className="w-[20px] h-[20px] cursor-pointer hover:text-white transition-colors" />
                    <MoreVertical className="w-[22px] h-[22px] cursor-pointer hover:text-white transition-colors" />
                  </div>
                </header>

                <div className="flex-1 overflow-y-auto p-[5%] lg:px-[8%] lg:py-[3%] relative custom-scrollbar flex flex-col z-0">
                  <div className="absolute inset-0 z-[-1] opacity-5 pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("https://w7.pngwing.com/pngs/351/365/png-transparent-whatsapp-background-pattern-whatsapp-doodle-texture-art-monochrome-thumbnail.png")', backgroundSize: '400px', backgroundRepeat: 'repeat', backgroundPosition: 'center' }} />
                  <div className="flex flex-col space-y-[4px]">
                    <div className="flex justify-center mb-6"><span className={cn("px-4 py-1.5 rounded-lg text-xs uppercase tracking-widest font-medium bg-[#182229] border border-[#222d34]", theme.textSecondary)}>TODAY</span></div>
                    {activeChat.messages.map((msg, index) => {
                      const showPointer = index === 0 || activeChat.messages[index - 1].sender !== msg.sender;
                      const isUser = msg.sender === 'user';
                      return (
                        <div key={msg.id} className={cn("flex w-full group items-center relative", isUser ? "flex-row-reverse" : "flex-row", showPointer ? "mt-1.5" : "")}>

                          {/* Main Bubble */}
                          <div className={cn(
                            "max-w-full lg:max-w-[70%] rounded-lg px-2.5 py-1.5 text-[15px] relative shadow-[0_1px_0.5px_rgba(11,20,26,.13)] flex flex-col items-start border border-transparent",
                            isUser ? theme.bubbleOut : theme.bubbleIn,
                            showPointer && isUser ? "rounded-tr-none border-[#016d5a]/30" : "",
                            showPointer && !isUser ? "rounded-tl-none border-[#2a3942]/50" : ""
                          )}>
                            {showPointer && (
                              <svg viewBox="0 0 8 13" className={cn("absolute top-0 w-2 h-[13px]", isUser ? "-right-2 text-[#005c4b]" : "-left-2 text-[#202c33]")} fill="currentColor">
                                {isUser ? <path d="M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z" /> : <path d="M2.812 1H8v11.193L1.533 3.568C.474 2.156 1.042 1 2.812 1z" />}
                              </svg>
                            )}
                            {msg.isForwarded && <div className={cn("flex items-center gap-1 text-[12px] italic mb-1 text-white/50 w-full")}><Forward className="w-3 h-3" /> Forwarded many times</div>}
                            {msg.text && <span className="break-words whitespace-pre-wrap leading-[20px] text-[#e9edef] pr-10 selection:bg-[#00a884]/40 font-normal">{msg.text}</span>}
                            {msg.isTyping && <div className="flex items-center gap-1.5 py-1.5 px-3"><motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.2 }} className="w-2 h-2 rounded-full bg-[#8696a0]" /><motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }} className="w-2 h-2 rounded-full bg-[#8696a0]" /><motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.4 }} className="w-2 h-2 rounded-full bg-[#8696a0]" /></div>}
                            {msg.result && (
                              <motion.div 
                                initial={{ opacity: 0, y: 5 }} 
                                animate={{ opacity: 1, y: 0 }} 
                                className="flex flex-col min-w-[320px] max-w-[400px] mt-3 pr-2 mb-1"
                              >
                                <div className={cn(
                                  "relative overflow-hidden rounded-[14px] p-4 shadow-xl backdrop-blur-xl border",
                                  msg.result.trust_score >= 80 ? "bg-[#0b141a]/90 border-[#00a884]/30" : 
                                  msg.result.trust_score >= 40 ? "bg-[#0b141a]/90 border-amber-500/30" : 
                                  "bg-[#0b141a]/90 border-rose-500/40"
                                )}>
                                  <div className={cn("absolute top-0 left-0 w-1.5 h-full opacity-80", 
                                    msg.result.trust_score >= 80 ? "bg-[#00a884]" : 
                                    msg.result.trust_score >= 40 ? "bg-amber-500" : 
                                    "bg-rose-500"
                                  )} />
                                  <div className={cn("absolute inset-0 opacity-10 blur-xl transition-all -z-10", 
                                    msg.result.trust_score >= 80 ? "bg-[#00a884]" : 
                                    msg.result.trust_score >= 40 ? "bg-amber-500" : 
                                    "bg-rose-500"
                                  )} />
                                  
                                  <div className="flex justify-between items-center mb-3 pb-3 border-b border-white/5 relative z-10">
                                    <span className={cn(
                                      "font-semibold text-[15px] flex items-center gap-2 drop-shadow-sm", 
                                      msg.result.trust_score >= 80 ? "text-[#00a884]" : 
                                      msg.result.trust_score >= 40 ? "text-amber-400" : 
                                      "text-rose-400"
                                    )}>
                                      {msg.result.trust_score >= 80 ? <ShieldCheck className="w-5 h-5 text-[#00a884]" /> : <ShieldAlert className={cn("w-5 h-5", msg.result.trust_score < 40 && "drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]")} />}
                                      {msg.result.verdict}
                                    </span>
                                    <div className="flex flex-col items-end">
                                      <span className={cn(
                                        "text-[9px] uppercase tracking-widest font-bold mb-0.5",
                                        msg.result.trust_score >= 80 ? "text-[#00a884]/70" : 
                                        msg.result.trust_score >= 40 ? "text-amber-500/70" : 
                                        "text-rose-500/70"
                                      )}>Safety Score</span>
                                      <span className="text-white text-[16px] font-bold font-mono leading-none tracking-tight">{msg.result.trust_score}<span className="text-white/30 text-[12px]">/100</span></span>
                                    </div>
                                  </div>
                                  
                                  <p className="text-[14px] text-[#e9edef] leading-[22px] mb-4 font-light opacity-90 relative z-10">{msg.result.explanation}</p>
                                  
                                  {msg.result.red_flags && msg.result.red_flags.length > 0 && (
                                    <div className="space-y-2 relative z-10">
                                      <p className="text-[10px] text-white/40 uppercase tracking-widest font-semibold ml-0.5">Detected Behaviors</p>
                                      <div className="flex flex-wrap gap-2">
                                        {msg.result.red_flags.map((flag, i) => (
                                          <span key={i} className="text-[12px] font-medium bg-black/40 text-[#d1d7db] px-2.5 py-1.5 rounded-lg border border-white/5 flex items-center gap-1.5 shadow-sm backdrop-blur-md">
                                            <Sparkles className={cn("w-[14px] h-[14px] opacity-70", 
                                              msg.result!.trust_score >= 80 ? "text-[#00a884]" : 
                                              msg.result!.trust_score >= 40 ? "text-amber-400" : 
                                              "text-rose-400"
                                            )} /> {flag}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            )}
                            {!msg.isTyping && <div className="absolute right-1.5 bottom-1 flex items-center gap-[3px] ml-4 bg-gradient-to-l from-[#005c4b] via-[#005c4b] to-transparent pl-4 pt-1"><span className={cn("text-[11px] font-medium leading-[15px]", isUser ? "text-[#8696a0] mix-blend-screen" : "text-[#8696a0]")}>{msg.time}</span>{isUser && <CheckCheck className="w-[16px] h-[16px] text-[#53bdeb]" />}</div>}
                            {!isUser && msg.text && <div className="absolute top-1 right-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer p-0.5 rounded-full z-10" onClick={(e) => { e.stopPropagation(); setContextMenuMsgId(contextMenuMsgId === msg.id ? null : msg.id); }}><ChevronDown className="w-6 h-6 text-[#8696a0] drop-shadow-md bg-gradient-to-l from-[#202c33] via-[#202c33] to-transparent pl-1" /></div>}
                            {/* Context Menu Dropdown - Match Reference Image */}
                            <AnimatePresence>
                              {contextMenuMsgId === msg.id && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.95 }}
                                  transition={{ duration: 0.1 }}
                                  className="absolute top-8 left-0 lg:left-auto lg:right-0 z-50 w-[180px] bg-[#233138] rounded-xl shadow-2xl py-2 flex flex-col text-[14.5px] font-normal text-[#d1d7db] border border-white/5"
                                >
                                  <button className="flex items-center px-4 py-2.5 hover:bg-[#182229] transition-colors"><MessageSquare className="w-[18px] h-[18px] mr-4 text-[#8696a0] rotate-180 scale-x-[-1]" /> Reply</button>
                                  <button className="flex items-center px-4 py-2.5 hover:bg-[#182229] transition-colors"><Check className="w-[18px] h-[18px] mr-4 text-[#8696a0]" /> Copy</button>
                                  <button className="flex items-center px-4 py-2.5 hover:bg-[#182229] transition-colors"><Smile className="w-[18px] h-[18px] mr-4 text-[#8696a0]" /> React</button>
                                  <button onClick={(e) => { e.stopPropagation(); setShowForwardModal(msg.text || ""); setContextMenuMsgId(null); }} className="flex items-center px-4 py-2.5 hover:bg-[#182229] transition-colors"><Forward className="w-[18px] h-[18px] mr-4 text-[#8696a0]" /> Forward</button>
                                  <button className="flex items-center px-4 py-2.5 hover:bg-[#182229] transition-colors"><Info className="w-[18px] h-[18px] mr-4 text-[#8696a0]" /> Pin</button>
                                  <button className="flex items-center px-4 py-2.5 hover:bg-[#182229] transition-colors"><Archive className="w-[18px] h-[18px] mr-4 text-[#8696a0]" /> Star</button>

                                  <div className="h-[1px] bg-white/5 my-1 mx-2" />

                                  {/* High-priority Hackathon Action */}
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleForwardToBot(msg.text || ""); setContextMenuMsgId(null); }}
                                    className="flex items-center px-4 py-3 relative group overflow-hidden hover:bg-[#182229]"
                                  >
                                    <div className="absolute inset-0 bg-gradient-to-r from-[#00a884]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#00a884] rounded-r-sm shadow-[0_0_8px_rgba(0,168,132,0.8)]" />
                                    <div className="flex items-center text-[#00a884] font-semibold relative z-10 w-full">
                                      <ShieldCheck className="w-5 h-5 mr-3" /> 
                                      Verify with Guard
                                      <Sparkles className="w-[14px] h-[14px] ml-auto opacity-70" />
                                    </div>
                                  </button>

                                  <div className="h-[1px] bg-white/5 my-1 mx-2" />

                                  <button className="flex items-center px-4 py-2.5 hover:bg-[#182229] transition-colors text-[#ef4444]/80"><ShieldAlert className="w-[18px] h-[18px] mr-4" /> Report</button>
                                  <button className="flex items-center px-4 py-2.5 hover:bg-[#182229] transition-colors text-[#ef4444]/80 underline decoration-transparent hover:decoration-rose-500"><X className="w-[18px] h-[18px] mr-4" /> Delete</button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          {/* Simplified Forward Trigger (Matching Screenshot style) */}
                          {!isUser && msg.text && !msg.isTyping && (
                            <button
                              onClick={() => setShowForwardModal(msg.text || "")}
                              className="ml-3 opacity-0 group-hover:opacity-100 transition-all p-2 rounded-full bg-[#202c33]/80 text-[#8696a0] hover:text-white"
                            >
                              <Forward className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div ref={messagesEndRef} className="h-4" />
                </div>

                <footer className={cn("min-h-[62px] px-5 py-2 flex items-center gap-4 shrink-0 z-10", theme.bgHeader)}>
                  <div className="flex gap-4 items-center shrink-0">
                    <Smile className={cn("w-[26px] h-[26px] cursor-pointer hover:text-white transition-colors", theme.textSecondary)} />
                    <div title="Attach File" className="cursor-pointer">
                      <Plus className={cn("w-[26px] h-[26px] hover:text-white transition-colors", theme.textSecondary)} />
                    </div>
                  </div>
                  <form onSubmit={handleSendMessage} className="flex-1 flex items-center">
                    <div className={cn("w-full rounded-[8px] px-3 py-[9px] flex items-center focus-within:bg-[#2a3942] transition-colors", theme.bgSearch)}>
                      <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Type a message" className="w-full bg-transparent outline-none text-[15px] placeholder:text-[#8696a0] text-[#e9edef]" />
                    </div>
                    <button type="submit" disabled={!inputText.trim()} className="shrink-0 ml-4 p-1">
                      {inputText.trim() ? <Send className={cn("w-[24px] h-[24px] text-[#00a884] hover:scale-110 transition-transform")} /> : <Mic className={cn("w-[26px] h-[26px] hover:text-white transition-colors", theme.textSecondary)} />}
                    </button>
                  </form>
                </footer>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex w-full h-full border-l border-[#222d34] items-center justify-center bg-[#222d34] border-b-[6px] border-[#00a884] relative overflow-hidden">
                <div className="absolute inset-0 bg-[#0b141a] z-0" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#00a884]/[0.03] rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#00a884]/[0.05] rounded-full blur-[80px] pointer-events-none" />
                <div className="flex flex-col items-center relative z-10 mt-[-5%] px-10">
                  <motion.div 
                    animate={{ y: [0, -12, 0] }} 
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    className="w-[320px] mb-10 relative flex justify-center"
                  >
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#00a884]/10 to-transparent blur-3xl rounded-full" />
                    <ShieldCheck className="w-[140px] h-[140px] text-[#2a3942] relative z-10 drop-shadow-2xl" />
                    <motion.div 
                      animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
                      transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                      className="absolute bottom-1 right-24 bg-[#0b141a] rounded-full p-2"
                    >
                       <Lock className="w-8 h-8 text-[#00a884]" />
                    </motion.div>
                  </motion.div>
                  
                  <h1 className="text-[36px] text-[#e9edef] font-light tracking-wide mb-4">LinguistGuard Web</h1>
                  <p className="text-[#8696a0] text-[15px] leading-[26px] max-w-md text-center">Your regional cybersecurity partner.<br />Fact-check Malayalam content in real-time.</p>
                  
                  <div className="mt-12 flex items-center gap-2 text-[#8696a0] text-sm bg-[#111b21] px-5 py-2.5 rounded-full border border-white/5">
                    <Lock className="w-3.5 h-3.5" /> End-to-end encrypted protocol
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
