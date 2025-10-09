import React, { useState, useRef, useEffect } from 'react';
import { useData } from '../hooks/useData';

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

const AIAnalystAssistant: React.FC = () => {
  const { loans, users } = useData();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);
  
  const API_KEY = typeof process !== 'undefined' && process.env ? process.env.API_KEY : undefined;

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    if (!API_KEY) {
      setError("API_KEY is not configured. Please set the API_KEY environment variable.");
      return;
    }

    const userMessage: Message = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: API_KEY });
      
      const prompt = `
        You are an expert financial data analyst for a loan management company.
        Analyze the provided JSON data to answer the user's question.
        The data contains two arrays: 'users' and 'loans'.
        Provide clear, concise answers. Format your response in simple markdown.

        Here is the data:
        Users: ${JSON.stringify(users, null, 2)}
        Loans: ${JSON.stringify(loans, null, 2)}

        Question: "${input}"
      `;

      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
      });
      
      const aiMessage: Message = { sender: 'ai', text: response.text };
      setMessages(prev => [...prev, aiMessage]);

    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to get response from AI: ${errorMessage}`);
      const aiErrorMessage: Message = { sender: 'ai', text: `Sorry, I encountered an error. ${errorMessage}` };
      setMessages(prev => [...prev, aiErrorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 lg:col-span-2 flex flex-col h-[500px]">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">AI Analyst Assistant</h2>
      <div className="flex-grow overflow-y-auto pr-4 space-y-4 mb-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-lg px-4 py-2 rounded-lg ${msg.sender === 'user' ? 'bg-indigo-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
              <p style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="max-w-lg px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-gray-500 animate-pulse"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-500 animate-pulse [animation-delay:0.2s]"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-500 animate-pulse [animation-delay:0.4s]"></div>
                </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
      <div className="flex">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && handleSend()}
          placeholder="Ask about the loan data..."
          className="flex-grow p-2 border rounded-l-lg dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          disabled={!API_KEY}
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !input.trim() || !API_KEY}
          className="px-4 py-2 bg-indigo-600 text-white rounded-r-lg shadow hover:bg-indigo-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </div>
       {!API_KEY && <p className="text-yellow-500 text-xs mt-2">Note: AI Assistant is disabled because the API key is not configured.</p>}
    </div>
  );
};

export default AIAnalystAssistant;