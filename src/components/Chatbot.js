import React, { useState, useRef, useEffect } from 'react';
import { sendChatMessage, createChatSession, getChatMessages } from '../services/api';

// Global function to clear chat session (can be called from login/logout)
export const clearStoredChatSession = () => {
  localStorage.removeItem('chatSessionId');
};

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize chat session when component mounts or when expanded for the first time
  useEffect(() => {
    const initializeChat = async () => {
      if (isExpanded && !hasInitialized) {
        try {
          setIsLoading(true);
          
          // Check if we have an existing session ID in localStorage
          const storedSessionId = localStorage.getItem('chatSessionId');
          let currentSessionId = storedSessionId;
          
          // If no stored session or session is invalid, create a new one
          if (!currentSessionId) {
            const sessionData = await createChatSession({
              user_id: 'demo-user', // In a real app, this would come from auth context
              title: 'Financial Planning Chat'
            });
            currentSessionId = sessionData.session_id;
            localStorage.setItem('chatSessionId', currentSessionId);
          }
          
          setSessionId(currentSessionId);
          
          // Load existing messages for this session
          try {
            const messagesData = await getChatMessages(currentSessionId);
            
            if (messagesData.messages && messagesData.messages.length > 0) {
              // Convert backend message format to frontend format
              const convertedMessages = messagesData.messages.map(msg => ({
                type: msg.role === 'user' ? 'user' : 'bot',
                content: msg.content,
                timestamp: new Date(msg.created_at)
              }));
              setMessages(convertedMessages);
            } else {
              // Add welcome message if no history exists
              const welcomeMessage = {
                type: 'bot',
                content: 'Hello! I\'m your Personal Finance Assistant. I can help you record expenses, track trades, and answer finance-related questions. Try saying something like "I spent $12 on lunch at Chipotle today" or "Help me understand my budget".',
                timestamp: new Date()
              };
              setMessages([welcomeMessage]);
            }
          } catch (sessionError) {
            console.error('Failed to load chat messages:', sessionError);
            // If we can't load messages, still set up the session but with welcome message
            const welcomeMessage = {
              type: 'bot',
              content: 'Hello! I\'m your Personal Finance Assistant. I can help you record expenses, track trades, and answer finance-related questions. Try saying something like "I spent $12 on lunch at Chipotle today" or "Help me understand my budget".',
              timestamp: new Date()
            };
            setMessages([welcomeMessage]);
          }
          
          setHasInitialized(true);
        } catch (error) {
          console.error('Failed to initialize chat:', error);
          // Add error message
          setMessages([{
            type: 'bot',
            content: 'Hello! I\'m your Personal Finance Assistant. I\'m having trouble connecting to the server right now, but I\'m here to help with your financial questions.',
            timestamp: new Date()
          }]);
          setHasInitialized(true);
        } finally {
          setIsLoading(false);
        }
      }
    };

    initializeChat();
  }, [isExpanded, hasInitialized]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading || !sessionId) return;

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
        user_id: 'demo-user', // In a real app, this would come from auth
        session_id: sessionId,
        message: userMessage
      });

      // Add bot response to chat
      const botMessage = {
        type: 'bot',
        content: response.reply,
        timestamp: new Date(),
        status: response.status, // 'saved', 'clarify', 'rejected', 'answered'
        meta: response.meta
      };
      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        type: 'bot',
        content: 'Sorry, I encountered an error connecting to the server. Please make sure the backend is running on http://localhost:5000 and try again.',
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

  const clearChatSession = async () => {
    try {
      // Clear stored session
      localStorage.removeItem('chatSessionId');
      
      // Reset state
      setSessionId(null);
      setMessages([]);
      setHasInitialized(false);
      
      // Re-initialize with a new session
      if (isExpanded) {
        const sessionData = await createChatSession({
          user_id: 'demo-user',
          title: 'Financial Planning Chat'
        });
        
        setSessionId(sessionData.session_id);
        localStorage.setItem('chatSessionId', sessionData.session_id);
        
        // Add welcome message
        const welcomeMessage = {
          type: 'bot',
          content: 'Hello! I\'m your Personal Finance Assistant. I can help you record expenses, track trades, and answer finance-related questions. Try saying something like "I spent $12 on lunch at Chipotle today" or "Help me understand my budget".',
          timestamp: new Date()
        };
        setMessages([welcomeMessage]);
        setHasInitialized(true);
      }
    } catch (error) {
      console.error('Failed to clear chat session:', error);
    }
  };

  const quickReplies = [
    "I spent $15 on lunch today",
    "Help me understand my budget",
    "I bought 10 shares of AAPL at $150",
    "What should I pay first?"
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
            {isExpanded && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearChatSession();
                }}
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors duration-200"
                title="Clear Chat History"
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
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
                placeholder="Record expenses, trades, or ask finance questions..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                disabled={isLoading || !sessionId}
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading || !sessionId}
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