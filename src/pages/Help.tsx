import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Search, ExternalLink, ChevronDown, ArrowUp, Menu, X, Loader2 } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import Markdown from 'react-markdown';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Initialize Gemini
const apiKey = process.env.GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: Date;
}

export default function Help() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Load chats from Supabase on mount
  useEffect(() => {
    const loadChats = async () => {
      console.log("Loading chats from Supabase...");
      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (error) {
        console.error("Error loading chats from Supabase:", error);
      } else if (data) {
        console.log("Chats loaded successfully:", data);
        setChats(data.map(c => ({
          id: c.id,
          title: c.title,
          messages: c.messages,
          updatedAt: new Date(c.updated_at)
        })));
      }
    };
    loadChats();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats, currentChatId, isTyping]);

  const currentChat = chats.find(c => c.id === currentChatId);
  const messages = currentChat?.messages || [];

  const handleNewQuestion = () => {
    setCurrentChatId(null);
    setQuestion('');
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const handleSend = async (text: string = question) => {
    if (!text.trim() || isTyping) return;
    
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text.trim() };
    setQuestion('');
    
    let activeChatId = currentChatId;
    let updatedChats = [...chats];
    
    if (!activeChatId) {
      activeChatId = Date.now().toString();
      const newChat: ChatSession = {
        id: activeChatId,
        title: text.trim().substring(0, 30) + (text.length > 30 ? '...' : ''),
        messages: [userMsg],
        updatedAt: new Date()
      };
      updatedChats = [newChat, ...updatedChats];
      setCurrentChatId(activeChatId);
      
      // Save new chat to Supabase
      await supabase.from('chats').insert({
        id: activeChatId,
        title: newChat.title,
        messages: newChat.messages,
        updated_at: newChat.updatedAt
      });
    } else {
      const chatIndex = updatedChats.findIndex(c => c.id === activeChatId);
      if (chatIndex > -1) {
        updatedChats[chatIndex] = {
          ...updatedChats[chatIndex],
          messages: [...updatedChats[chatIndex].messages, userMsg],
          updatedAt: new Date()
        };
        // Move active chat to top
        const chat = updatedChats.splice(chatIndex, 1)[0];
        updatedChats.unshift(chat);
        
        // Update chat in Supabase
        await supabase.from('chats').update({
          messages: chat.messages,
          updated_at: chat.updatedAt
        }).eq('id', activeChatId);
      }
    }
    
    setChats(updatedChats);
    setIsTyping(true);
    
    try {
      // Format history for Gemini
      const activeChat = updatedChats.find(c => c.id === activeChatId);
      const contents = activeChat?.messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      })) || [];
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: contents,
        config: {
          systemInstruction: "You are a helpful customer support assistant. Answer questions about orders, products, quotes, turnaround times, proofs, etc. Be concise, friendly, and helpful."
        }
      });
      
      const aiMsg: Message = { 
        id: Date.now().toString(), 
        role: 'ai', 
        content: response.text || "I'm sorry, I couldn't process that." 
      };
      
      setChats(prev => {
        const newPrev = [...prev];
        const idx = newPrev.findIndex(c => c.id === activeChatId);
        if (idx > -1) {
          newPrev[idx] = {
            ...newPrev[idx],
            messages: [...newPrev[idx].messages, aiMsg],
            updatedAt: new Date()
          };
          
          // Update chat in Supabase
          supabase.from('chats').update({
            messages: newPrev[idx].messages,
            updated_at: newPrev[idx].updatedAt
          }).eq('id', activeChatId).then();
        }
        return newPrev;
      });
      
    } catch (error) {
      console.error("Gemini Error:", error);
      const errorMsg: Message = { 
        id: Date.now().toString(), 
        role: 'ai', 
        content: "Sorry, I'm having trouble connecting right now. Please try again later." 
      };
      setChats(prev => {
        const newPrev = [...prev];
        const idx = newPrev.findIndex(c => c.id === activeChatId);
        if (idx > -1) {
          newPrev[idx] = {
            ...newPrev[idx],
            messages: [...newPrev[idx].messages, errorMsg],
            updatedAt: new Date()
          };
          
          // Update chat in Supabase
          supabase.from('chats').update({
            messages: newPrev[idx].messages,
            updated_at: newPrev[idx].updatedAt
          }).eq('id', activeChatId).then();
        }
        return newPrev;
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const filteredChats = chats.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-64px)] bg-white overflow-hidden relative font-sans">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-20 w-64 bg-white border-r border-gray-100 transform transition-transform duration-200 ease-in-out flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-4 flex flex-col gap-1 h-full">
          {/* Mobile Close Button */}
          <div className="flex justify-end md:hidden mb-2">
            <button onClick={toggleSidebar} className="p-1 text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>

          <button 
            onClick={handleNewQuestion}
            className="flex items-center gap-3 font-semibold text-[#111111] hover:bg-gray-50 px-3 py-2.5 rounded-md transition-colors w-full text-left text-[15px]"
          >
            <div className="bg-[#f37021] rounded-full flex items-center justify-center w-5 h-5">
              <PlusCircle className="w-5 h-5 text-white fill-current" />
            </div>
            New question
          </button>

          {isSearching ? (
            <div className="px-3 py-2.5">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Search history..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-8 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#f37021] focus:border-[#f37021]"
                />
                <button 
                  onClick={() => { setIsSearching(false); setSearchQuery(''); }}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => setIsSearching(true)}
              className="flex items-center gap-3 font-medium text-[#555555] hover:bg-gray-50 px-3 py-2.5 rounded-md transition-colors w-full text-left text-[15px]"
            >
              <Search className="w-5 h-5" />
              Search questions
            </button>
          )}

          {/* FAQs - Hidden as requested */}
          {/*
          <a href="/faq" className="flex items-center justify-between font-medium text-[#555555] hover:bg-gray-50 px-3 py-2.5 rounded-md transition-colors w-full text-[15px]">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </div>
              FAQs
            </div>
            <ExternalLink className="w-4 h-4" />
          </a>
          */}

          <div className="mt-6 flex-1 overflow-y-auto px-3">
            <div className="flex items-center gap-2 text-[13px] font-semibold text-[#777777] w-full text-left py-2">
              History
              <ChevronDown className="w-4 h-4" />
            </div>
            <div className="mt-1 flex flex-col gap-1">
              {filteredChats.length === 0 ? (
                <div className="text-sm text-gray-400 py-2 pl-4 italic">
                  {searchQuery ? "No matching questions" : "No history yet"}
                </div>
              ) : (
                filteredChats.map(chat => (
                  <button 
                    key={chat.id}
                    onClick={() => {
                      setCurrentChatId(chat.id);
                      if (window.innerWidth < 768) setIsSidebarOpen(false);
                    }}
                    className={`text-[15px] font-medium py-2 pl-4 border-l-2 text-left truncate transition-colors ${
                      currentChatId === chat.id 
                        ? 'border-[#f37021] text-[#111111] bg-gray-50' 
                        : 'border-[#e5e5e5] text-[#555555] hover:bg-gray-50 hover:text-[#111111]'
                    }`}
                  >
                    {chat.title}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-white">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <button onClick={toggleSidebar} className="p-2 -ml-2 text-gray-600">
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-semibold ml-2">Ask anything</span>
        </div>

        {/* Chat Area / Initial Screen */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col">
          <div className="max-w-[800px] mx-auto w-full flex-1 flex flex-col">
            
            {messages.length === 0 ? (
              // Initial Screen
              <div className="flex-1 flex flex-col items-center justify-center py-12">
                {/* Mascot Image */}
                <div className="mb-6 w-32 h-32 md:w-40 md:h-40 relative flex items-center justify-center">
                  <img 
                    src="https://i.ibb.co.com/hxGczjp9/herman-animation-8e07226b97ca3a27.gif" 
                    alt="Mascot" 
                    className="w-full h-full object-contain"
                  />
                </div>

                <h1 className="text-[32px] md:text-[40px] font-bold text-[#111111] mb-2 text-center tracking-tight">Ask anything</h1>
                <p className="text-[#555555] mb-10 text-center text-[15px]">Powered by Grok 4.1 with human assistance.</p>
                
                {/* Suggestions */}
                <div className="w-full flex flex-col gap-3 mb-12">
                  <button 
                    onClick={() => handleSend("Can I see a proof before ordering?")}
                    className="w-full text-left px-5 py-4 bg-[#f9f9f9] hover:bg-[#f0f0f0] border border-transparent rounded-md text-[#333333] transition-colors text-[15px]"
                  >
                    Can I see a proof before ordering?
                  </button>
                  <button 
                    onClick={() => handleSend("Can I get physical samples before placing a large order?")}
                    className="w-full text-left px-5 py-4 bg-[#f9f9f9] hover:bg-[#f0f0f0] border border-transparent rounded-md text-[#333333] transition-colors text-[15px]"
                  >
                    Can I get physical samples before placing a large order?
                  </button>
                  <button 
                    onClick={() => handleSend("What's the turnaround time?")}
                    className="w-full text-left px-5 py-4 bg-[#f9f9f9] hover:bg-[#f0f0f0] border border-transparent rounded-md text-[#333333] transition-colors text-[15px]"
                  >
                    What's the turnaround time?
                  </button>
                </div>
              </div>
            ) : (
              // Chat Messages
              <div className="flex-1 flex flex-col gap-6 py-4">
                {messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-3.5 text-[15px] leading-relaxed ${
                        msg.role === 'user' 
                          ? 'bg-[#f37021] text-white rounded-tr-sm' 
                          : 'bg-[#f9f9f9] text-[#333333] border border-[#e5e5e5] rounded-tl-sm'
                      }`}
                    >
                      {msg.role === 'ai' ? (
                        <div className="markdown-body prose prose-sm max-w-none">
                          <Markdown>{msg.content}</Markdown>
                        </div>
                      ) : (
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                      )}
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-4 bg-[#f9f9f9] text-[#333333] border border-[#e5e5e5] rounded-tl-sm flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-[#f37021]" />
                      <span className="text-sm text-gray-500">Thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Input Area (Sticky Bottom) */}
        <div className="p-4 md:p-6 bg-white border-t border-gray-100">
          <div className="max-w-[800px] mx-auto w-full relative">
            <textarea
              ref={textareaRef}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about orders, products, quotes, or anything else..."
              className="w-full border border-[#e5e5e5] rounded-md py-4 pl-4 pr-14 min-h-[56px] max-h-[200px] resize-y focus:outline-none focus:ring-1 focus:ring-[#f37021] focus:border-[#f37021] text-[#333333] shadow-sm text-[15px] placeholder:text-[#888888] overflow-y-auto"
              rows={1}
              style={{ minHeight: '56px' }}
              disabled={isTyping}
            />
            <button 
              onClick={() => handleSend()}
              disabled={!question.trim() || isTyping}
              className={`absolute right-2 top-2 p-2 rounded transition-colors ${question.trim() && !isTyping ? 'bg-[#f37021] hover:bg-[#e06015] text-white' : 'bg-[#f37021] text-white opacity-50 cursor-not-allowed'}`}
            >
              <ArrowUp className="w-5 h-5" strokeWidth={2.5} />
            </button>
            
            {/* Textarea resize handle styling */}
            <div className="absolute bottom-1 right-1 pointer-events-none text-gray-400">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M9 1L1 9M9 5L5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
          
          {/* Footer */}
          {messages.length === 0 && (
            <p className="text-[13px] text-gray-500 text-center mt-4">
              By continuing, you agree to Sticker Mule's <a href="/privacy" className="text-[#0066cc] hover:underline">privacy policy</a> and <a href="/terms" className="text-[#0066cc] hover:underline">terms</a>.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
