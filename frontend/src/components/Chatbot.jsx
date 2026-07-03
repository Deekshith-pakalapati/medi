import { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Mic, Volume2, VolumeX, Maximize2, Minimize2, Sparkles, User as UserIcon } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'framer-motion';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([{ role: 'ai', content: 'Hello! I am your MediCare Assistant. How can I help you today?' }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(true); // Start muted by default
  
  const { getToken } = useAuth();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    let mounted = true;
    const loadHistory = async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const res = await fetch(`${import.meta.env.VITE_API_URL}/chat/history`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok && mounted) {
          const data = await res.json();
          if (data.length > 0) {
            const historyMessages = [];
            data.forEach(msg => {
              historyMessages.push({ role: 'user', content: msg.message });
              historyMessages.push({ role: 'ai', content: msg.aiResponse });
            });
            setMessages([{ role: 'ai', content: 'Welcome back! How can I help you today?' }, ...historyMessages]);
          }
        }
      } catch (error) {
        console.error('Failed to load chat history:', error);
      }
    };
    
    loadHistory();
    return () => { mounted = false; };
  }, [getToken]);
  const audioRef = useRef(null);

  const speak = (text) => {
    if (isMuted) return;
    const isTelugu = /[\u0C00-\u0C7F]/.test(text);
    const lang = isTelugu ? 'te' : 'en';
    
    if (audioRef.current) {
        audioRef.current.pause();
    }
    
    const apiUrl = import.meta.env.VITE_API_URL.replace('/api', '');
    const url = `${apiUrl}/api/tts?lang=${lang}&text=${encodeURIComponent(text)}`;
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.play().catch(e => console.error("Audio playback failed", e));
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support Speech Recognition.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setIsLoading(true);

    try {
      const token = await getToken();
      const res = await fetch(`${import.meta.env.VITE_API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ message: userMessage })
      });
      
      if (!res.ok) {
        throw new Error('Failed to get response from AI');
      }
      
      const data = await res.json();
      
      setMessages(prev => [...prev, { role: 'ai', content: data.reply }]);
      speak(data.reply);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'ai', content: 'Sorry, I am having trouble connecting right now.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSize = (e) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-24 md:bottom-6 right-4 md:right-6 p-4 bg-black dark:bg-white text-white dark:text-black rounded-full shadow-xl hover:scale-105 transition-transform z-50 ${isOpen ? 'hidden' : 'block'}`}
      >
        <MessageSquare size={24} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`fixed bottom-0 right-0 md:bottom-6 md:right-6 bg-white dark:bg-[#212121] rounded-t-2xl md:rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 border border-black/10 dark:border-white/10 ${
              isExpanded ? 'w-full md:w-[80vw] h-[90vh] max-w-5xl left-0 md:left-auto' : 'w-full md:w-[400px] h-[85vh] md:h-[600px]'
            }`}
          >
            {/* Header */}
            <div className="flex justify-between items-center px-4 py-3 border-b border-black/5 dark:border-white/5 bg-white dark:bg-[#212121]">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-black dark:text-white flex items-center gap-2">
                  MediCare AI
                  <span className="text-[10px] font-medium text-black/60 dark:text-white/60 bg-[#f4f4f4] dark:bg-[#2f2f2f] px-2 py-0.5 rounded-full uppercase tracking-wider">Beta</span>
                </span>
              </div>
              <div className="flex items-center gap-1 text-black/60 dark:text-white/60">
                <button onClick={(e) => { 
                  e.stopPropagation(); 
                  const nextMuted = !isMuted;
                  setIsMuted(nextMuted); 
                  if (nextMuted && audioRef.current) audioRef.current.pause();
                }} className="hover:bg-black/5 dark:hover:bg-white/10 p-2 rounded-md transition-colors">
                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                <button onClick={toggleSize} className="hover:bg-black/5 dark:hover:bg-white/10 p-2 rounded-md transition-colors hidden sm:block">
                  {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </button>
                <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} className="hover:bg-black/5 dark:hover:bg-white/10 p-2 rounded-md transition-colors">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 bg-white dark:bg-[#212121]">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'ai' ? (
                    <div className="flex gap-4 max-w-[90%]">
                      <div className="w-8 h-8 rounded-full border border-black/10 dark:border-white/10 flex items-center justify-center flex-shrink-0 bg-white dark:bg-black shadow-sm">
                        <Sparkles size={16} className="text-black dark:text-white" />
                      </div>
                      <div className="pt-1 text-[15px] leading-relaxed text-black dark:text-gray-200">
                        {msg.content}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[#f4f4f4] dark:bg-[#2f2f2f] text-black dark:text-white px-5 py-3 rounded-[24px] rounded-br-sm max-w-[85%] text-[15px] leading-relaxed shadow-sm">
                      {msg.content}
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex w-full justify-start">
                  <div className="flex gap-4 max-w-[90%]">
                    <div className="w-8 h-8 rounded-full border border-black/10 dark:border-white/10 flex items-center justify-center flex-shrink-0 bg-white dark:bg-black shadow-sm">
                      <Sparkles size={16} className="text-black dark:text-white animate-pulse" />
                    </div>
                    <div className="pt-3 flex gap-1.5">
                      <span className="w-1.5 h-1.5 bg-black/40 dark:bg-white/40 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-black/40 dark:bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                      <span className="w-1.5 h-1.5 bg-black/40 dark:bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} className="h-2" />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-[#212121]">
              <form onSubmit={handleSend} className="relative flex items-center">
                <button 
                  type="button" 
                  onClick={startListening} 
                  className={`absolute left-3 p-2 rounded-full transition-colors ${isListening ? 'text-red-500 bg-red-50 dark:bg-red-900/20' : 'text-black/50 dark:text-white/50 hover:bg-black/5 dark:hover:bg-white/10'}`}
                  title="Speak"
                >
                  <Mic size={20} />
                </button>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Message MediCare AI..."
                  className="w-full bg-[#f4f4f4] dark:bg-[#2f2f2f] text-black dark:text-white pl-12 pr-12 py-3.5 rounded-[24px] focus:outline-none text-[15px] border border-transparent focus:border-black/10 dark:focus:border-white/10 transition-colors shadow-sm"
                />
                <button 
                  type="submit" 
                  disabled={!input.trim()} 
                  className="absolute right-2 p-2 bg-black dark:bg-white text-white dark:text-black rounded-full hover:opacity-80 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Send size={16} />
                </button>
              </form>
              <div className="text-center mt-3">
                <span className="text-[11px] text-black/40 dark:text-white/40">AI can make mistakes. Check important info.</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
