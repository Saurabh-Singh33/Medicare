import React, { useState, useRef, useEffect } from 'react';
import styles from './Chatbot.module.css';

const API_KEY = "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";
const API_URL = "https://openrouter.ai/api/v1/chat/completions";

const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
);

const MessageIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

const BotIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8" y2="16"></line><line x1="16" y1="16" x2="16" y2="16"></line></svg>
);

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hello! I'm your Medicare assistant. How can I help you with your health appointments today?", sender: 'bot' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleChat = () => setIsOpen(!isOpen);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setMessages(prev => [...prev, { text: userMessage, sender: 'user' }]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`,
          "HTTP-Referer": window.location.origin,
          "X-Title": "Prescripto Health",
        },
        body: JSON.stringify({
          model: "openai/gpt-3.5-turbo",
          messages: [{ role: "user", content: userMessage }],
        }),
      });

      const data = await response.json();
      
      if (data.choices && data.choices[0]) {
        const reply = data.choices[0].message.content;
        setMessages(prev => [...prev, { text: reply, sender: 'bot' }]);
      } else {
        setMessages(prev => [...prev, { text: "Sorry, I couldn't understand that. Please try again.", sender: 'bot' }]);
      }
    } catch (error) {
      console.error("Chatbot Error:", error);
      setMessages(prev => [...prev, { text: "Sorry, there was an error connecting to the health assistant. Please try again later.", sender: 'bot' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className={styles.chatbotContainer}>
      {/* Chat Window */}
      <div className={`${styles.chatWindow} ${isOpen ? styles.chatWindowVisible : ''}`}>
        <div className={styles.chatHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BotIcon />
            <h2>Medicare Assistant</h2>
          </div>
          <button onClick={toggleChat} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: '5px' }}>
            <CloseIcon />
          </button>
        </div>

        <div className={styles.chatMessages}>
          {messages.map((msg, index) => (
            <div key={index} className={`${styles.message} ${msg.sender === 'user' ? styles.userMessage : styles.botMessage}`}>
              {msg.text}
            </div>
          ))}
          {isLoading && (
            <div className={`${styles.message} ${styles.botMessage}`}>
              <div className={styles.loading}>Thinking...</div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className={styles.chatInput}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Write a message..."
            disabled={isLoading}
          />
          <button onClick={handleSendMessage} className={styles.sendButton} disabled={isLoading}>
            <SendIcon />
          </button>
        </div>
      </div>

      {/* Floating Button */}
      <button 
        className={styles.chatButton} 
        onClick={toggleChat}
        title={isOpen ? "Close Chat" : "Open Medicare Assistant"}
      >
        {isOpen ? <CloseIcon /> : <MessageIcon />}
      </button>
    </div>
  );
}
