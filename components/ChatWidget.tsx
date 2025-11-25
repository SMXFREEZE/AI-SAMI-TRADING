import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, MinusCircle, Maximize2, Loader2, Bot } from 'lucide-react';
import { createChatSession } from '../services/geminiService';
import { GenerateContentResponse, Chat } from "@google/genai";

interface Message {
  role: 'user' | 'model';
  text: string;
}

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Hello. I am Sami, your AI trading assistant. How can I help you analyze the markets today?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize chat session on mount
    try {
        chatSessionRef.current = createChatSession();
    } catch (e) {
        console.error("Failed to init chat", e);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!inputValue.trim() || !chatSessionRef.current) return;

    const userMsg = inputValue;
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const result = await chatSessionRef.current.sendMessageStream({ message: userMsg });
      
      let fullResponse = "";
      setMessages(prev => [...prev, { role: 'model', text: "" }]);

      for await (const chunk of result) {
          const c = chunk as GenerateContentResponse;
          if (c.text) {
              fullResponse += c.text;
              setMessages(prev => {
                  const newMsgs = [...prev];
                  newMsgs[newMsgs.length - 1].text = fullResponse;
                  return newMsgs;
              });
          }
      }
    } catch (error) {
      console.error("Chat Error", error);
      setMessages(prev => [...prev, { role: 'model', text: "Error: Unable to connect to trading mainframe." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-terminal-green text-black p-4 rounded-full shadow-lg shadow-green-900/50 hover:bg-white transition-all z-50 border-2 border-transparent hover:border-terminal-green group"
      >
        <MessageSquare className="w-6 h-6 group-hover:scale-110 transition-transform" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 sm:w-96 h-[500px] bg-terminal-black border border-terminal-green shadow-2xl flex flex-col z-50 rounded-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div className="bg-terminal-dim p-3 flex justify-between items-center border-b border-terminal-dim/50">
        <div className="flex items-center space-x-2">
            <Bot className="w-4 h-4 text-terminal-green" />
            <span className="text-sm font-bold text-white tracking-wider">SAMI ASSISTANT</span>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
            <MinusCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-terminal-black">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`max-w-[85%] p-3 rounded text-xs font-mono leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-terminal-green text-black rounded-tr-none' 
                  : 'bg-terminal-dim text-gray-200 border border-gray-700 rounded-tl-none'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex justify-start">
                <div className="bg-terminal-dim p-2 rounded rounded-tl-none border border-gray-700">
                    <Loader2 className="w-4 h-4 animate-spin text-terminal-green" />
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 bg-terminal-dim/30 border-t border-terminal-dim flex items-center space-x-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about markets..."
          className="flex-1 bg-terminal-black border border-terminal-dim text-white text-xs p-2 rounded-sm focus:border-terminal-green outline-none font-mono"
        />
        <button 
            onClick={handleSend}
            disabled={isLoading || !inputValue.trim()}
            className="p-2 bg-terminal-dim hover:bg-terminal-green text-terminal-green hover:text-black rounded-sm transition-colors disabled:opacity-50"
        >
            <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};