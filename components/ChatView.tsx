
import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { getGeminiAI, CHAT_MODEL } from '../services/geminiService';
import MessageItem from './MessageItem';

const STORAGE_KEY = 'benkayrabot_chat_history';

const ChatView: React.FC = () => {
  // LocalStorage'dan yükle veya varsayılan mesajla başlat
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Sohbet geçmişi yüklenemedi", e);
      }
    }
    return [{
      id: '1',
      role: 'assistant',
      content: 'Merhaba! Ben BenKayraBot. Bugün size nasıl yardımcı olabilirim?',
      timestamp: Date.now()
    }];
  });

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Mesajlar her değiştiğinde localStorage'a kaydet
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const ai = getGeminiAI();
      const chat = ai.chats.create({
        model: CHAT_MODEL,
        config: {
          systemInstruction: 'Sen BenKayraBot isminde yardımsever, bilgili ve arkadaş canlısı bir yapay zekasın. Cevapların her zaman Türkçe olsun. Kullanıcıya asla doğrudan "Kayra" diye hitap etme, kullanıcıya karşı nazik ve genel bir hitap kullan. Kendi ismin BenKayraBot olarak kalsın.',
        }
      });

      const stream = await chat.sendMessageStream({ message: input });
      
      let assistantMsgContent = '';
      const assistantId = (Date.now() + 1).toString();
      
      setMessages(prev => [...prev, {
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp: Date.now()
      }]);

      for await (const chunk of stream) {
        assistantMsgContent += chunk.text;
        setMessages(prev => 
          prev.map(m => m.id === assistantId ? { ...m, content: assistantMsgContent } : m)
        );
      }
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Üzgünüm, bir hata oluştu. Lütfen tekrar dene.',
        timestamp: Date.now()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearHistory = () => {
    const defaultMsg = [{
      id: Date.now().toString(),
      role: 'assistant',
      content: 'Sohbet temizlendi. Nasıl yardımcı olabilirim?',
      timestamp: Date.now()
    }];
    setMessages(defaultMsg as Message[]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950">
      <header className="p-4 border-b border-slate-800/50 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Yapay Zeka Sohbet</h2>
          <p className="text-xs text-slate-500">Geçmişiniz otomatik olarak kaydedilir</p>
        </div>
        <button 
            onClick={clearHistory}
            className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-800"
            title="Temizle"
        >
            <i className="fas fa-trash-alt"></i>
        </button>
      </header>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar"
      >
        {messages.map((msg) => (
          <MessageItem key={msg.id} message={msg} />
        ))}
        {isTyping && (
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-lg bg-cyan-600/20 flex items-center justify-center flex-shrink-0">
              <i className="fas fa-robot text-cyan-500 text-xs"></i>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 md:p-6 border-t border-slate-800/50 bg-slate-950">
        <form 
          onSubmit={handleSendMessage}
          className="max-w-4xl mx-auto relative group"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Bir şeyler yazın..."
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 pr-14 focus:outline-none focus:border-cyan-500/50 transition-all focus:ring-1 focus:ring-cyan-500/20 shadow-xl"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-cyan-600 text-white flex items-center justify-center hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-cyan-900/20"
          >
            <i className="fas fa-paper-plane"></i>
          </button>
        </form>
        <p className="text-[10px] text-center text-slate-600 mt-3">
          BenKayraBot hatalar yapabilir. Önemli bilgileri kontrol edin.
        </p>
      </div>
    </div>
  );
};

export default ChatView;
