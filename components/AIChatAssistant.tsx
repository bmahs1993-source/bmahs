
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { SchoolData } from '../types';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface AIChatAssistantProps {
  schoolData: SchoolData;
}

const AIChatAssistant: React.FC<AIChatAssistantProps> = ({ schoolData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: `Hello! I'm the ${schoolData.schoolName} AI assistant. How can I help you today?` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      // Use named parameter for apiKey as required by the latest @google/genai SDK
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      
      const systemInstruction = `
        You are an AI assistant for "${schoolData.schoolName}". 
        School Motto: ${schoolData.motto}
        EIIN: ${schoolData.eiin}
        Address: ${schoolData.address}
        Email: ${schoolData.email}
        Phone: ${schoolData.phone}
        
        Use the following information to answer questions:
        About: ${schoolData.aboutContent}
        Administration: ${schoolData.administrationContent}
        Admissions: ${schoolData.admissionInfo}
        Recent Notices: ${schoolData.notices.map(n => n.title).join(', ')}
        
        Be helpful, professional, and friendly. If you don't know the answer based on the provided data, suggest they contact the school office at ${schoolData.phone}.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview', // Updated to supported Gemini 3 model
        contents: [
          { role: 'user', parts: [{ text: `System context: ${systemInstruction}\n\nUser Question: ${userMessage}` }] }
        ],
      });

      const modelText = response.text || "I'm sorry, I couldn't process that request.";
      setMessages(prev => [...prev, { role: 'model', text: modelText }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I'm having trouble connecting to my brain right now. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[2000] flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-[350px] h-[500px] bg-white dark:bg-slate-900 rounded-[35px] shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
          <div className="bg-heading p-6 text-white flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">🤖</div>
              <div>
                <h4 className="font-black text-xs uppercase tracking-widest">School AI</h4>
                <p className="text-[9px] opacity-70 font-bold uppercase">Online Assistant</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white transition-colors">✕</button>
          </div>

          <div className="flex-grow overflow-y-auto p-6 space-y-4 no-scrollbar">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-xs font-bold leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-accent text-white rounded-tr-none' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200 dark:border-slate-700'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl rounded-tl-none">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
            <div className="relative">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask me anything..."
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 pr-12 rounded-2xl text-[11px] font-bold outline-none focus:ring-2 focus:ring-accent transition-all"
              />
              <button 
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-heading text-white rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-30 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 19l9-7-9-7V7l7 5-7 5v-2z" /></svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-heading text-white rounded-full flex items-center justify-center text-3xl shadow-[0_20px_40px_-10px_rgba(0,64,113,0.5)] hover:scale-110 active:scale-95 transition-all relative border-4 border-white dark:border-slate-800"
      >
        {isOpen ? '✕' : '💬'}
        {!isOpen && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>
          </div>
        )}
      </button>
    </div>
  );
};

export default AIChatAssistant;
