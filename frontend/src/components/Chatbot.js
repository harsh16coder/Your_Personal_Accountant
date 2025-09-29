import React, { useState, useRef, useEffect } from 'react';
import { sendChatMessage, getChatHistory } from '../services/api';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationState, setConversationState] = useState({});
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasLoadedHistory, setHasLoadedHistory] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history when component mounts or when expanded for the first time
  useEffect(() => {
    const loadChatHistory = async () => {
      if (isExpanded && !hasLoadedHistory) {
        try {
          const history = await getChatHistory();
          setMessages(history);
          setHasLoadedHistory(true);
        } catch (error) {
          console.error('Failed to load chat history:', error);
          // Add a welcome message if history fails to load
          setMessages([{
            type: 'bot',
            content: 'Hello! Welcome to your Personal Accountant. I\'m here to help you manage your budget and financial planning. How can I assist you today?',
            timestamp: new Date()
          }]);
          setHasLoadedHistory(true);
        }
      }
    };

    loadChatHistory();
  }, [isExpanded, hasLoadedHistory]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    // Add user message to chat
    const newUserMessage = {
      type: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newUserMessage]);

    try {
      const response = await sendChatMessage({
        message: userMessage,
        conversation_state: conversationState
      });

      // Add bot response to chat
      const botMessage = {
        type: 'bot',
        content: response.response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);

      // Update conversation state
      setConversationState(response.conversation_state || {});

    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        type: 'bot',
        content: 'Sorry, I encountered an error. Please try again. In the meantime, I can still help you navigate the dashboard and explain your financial data.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickReply = (message) => {
    setInputMessage(message);
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const quickReplies = [
    "Help me prioritize my payments",
    "Show my budget analysis",
    "What should I pay first?",
    "Explain my financial status"
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Chat Header */}
      <div 
        className="bg-gradient-to-r from-card-blue to-primary-blue p-4 cursor-pointer hover:from-primary-blue hover:to-dark-blue transition-all duration-300"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.451L3 21l2.451-5.094A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Personal Finance Assistant</h3>
              <p className="text-sm text-blue-100">
                {messages.length > 0 ? `${messages.length} messages` : 'Ready to help with your finances'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {!isExpanded && (
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-100">Online</span>
              </div>
            )}
            <svg 
              className={`w-5 h-5 text-white transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Chat Content */}
      {isExpanded && (
        <div className="border-t-2 border-primary-blue">
          {/* Previous Chats Indicator */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 text-center text-sm border-b">
            <div className="flex items-center justify-center space-x-2 text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>AI-powered financial guidance • Secure & Private</span>
            </div>
          </div>

          {/* Messages Area */}
          <div className="h-96 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <p className="text-lg font-medium mb-2">Start Your Financial Journey</p>
                <p className="mb-4">I'm here to help you manage your budget, prioritize payments, and achieve your financial goals!</p>
                <button
                  onClick={() => handleQuickReply("Hello! Help me understand my financial situation.")}
                  className="bg-primary-blue text-white px-6 py-2 rounded-full hover:bg-dark-blue transition-colors duration-200"
                >
                  Get Started
                </button>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                    message.type === 'user'
                      ? 'bg-primary-blue text-white rounded-br-md'
                      : 'bg-white text-gray-800 rounded-bl-md border'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    <p className={`text-xs mt-2 ${
                      message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))
            )}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 px-4 py-3 rounded-2xl rounded-bl-md border shadow-sm">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <span className="text-sm text-gray-600">Assistant is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          {messages.length > 0 && (
            <div className="p-3 bg-gray-50 border-t">
              <div className="flex flex-wrap gap-2">
                {quickReplies.map((reply, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickReply(reply)}
                    className="px-3 py-1 text-xs bg-white border border-gray-300 rounded-full hover:bg-gray-100 transition-colors duration-200"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t p-4 bg-white">
            <form onSubmit={handleSendMessage} className="flex space-x-3">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask about your finances, budget, or payments..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="bg-primary-blue text-white px-6 py-3 rounded-full hover:bg-dark-blue disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                <span className="hidden sm:inline">Send</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;