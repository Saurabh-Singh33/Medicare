import React, { useState, useRef, useEffect, useContext } from 'react';
import styles from './Chatbot.module.css';
import { AdminContext } from '../context/AdminContext';
import { DoctorContext } from '../context/DoctorContext';

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
  const adminCtx = useContext(AdminContext);
  const doctorCtx = useContext(DoctorContext);

  const aToken = adminCtx?.aToken;
  const dToken = doctorCtx?.dToken;
  const backendUrl = adminCtx?.backendUrl || doctorCtx?.backendUrl || import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

  // Determine initial active role
  const isDoctorUser = Boolean(dToken && !aToken);
  const [activeRole, setActiveRole] = useState(isDoctorUser ? 'doctor' : 'admin');
  const [isOpen, setIsOpen] = useState(false);

  const getGreeting = (role) => {
    if (role === 'doctor') {
      return "Hello Doctor! I'm your Medicare Clinical & Practice Assistant. I can assist you with consultation fee strategies, appointment management, patient consultations, and clinical queries.";
    }
    return "Hello Admin! I'm your Medicare Administration Assistant. I can help you manage doctors, specialties, platform appointments, doctor fees, and system operations.";
  };

  const [messages, setMessages] = useState([
    { text: getGreeting(isDoctorUser ? 'doctor' : 'admin'), sender: 'bot' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (dToken && !aToken) {
      setActiveRole('doctor');
      setMessages([{ text: getGreeting('doctor'), sender: 'bot' }]);
    } else if (aToken) {
      setActiveRole('admin');
      setMessages([{ text: getGreeting('admin'), sender: 'bot' }]);
    }
  }, [aToken, dToken]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleChat = () => setIsOpen(!isOpen);

  const handleRoleChange = (newRole) => {
    if (newRole === activeRole) return;
    setActiveRole(newRole);
    setMessages([
      { text: getGreeting(newRole), sender: 'bot' }
    ]);
  };

  const handleSendMessage = async (customText) => {
    const textToSend = typeof customText === 'string' ? customText : inputValue;
    if (!textToSend.trim() || isLoading) return;

    const userMessage = textToSend.trim();
    const currentMessages = [...messages, { text: userMessage, sender: 'user' }];
    setMessages(currentMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      const apiUrl = `${backendUrl}/api/chat`;
      
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: userMessage,
          messages: currentMessages,
          role: activeRole
        }),
      });

      const data = await response.json();
      
      if (data.success && data.reply) {
        setMessages(prev => [...prev, { text: data.reply, sender: 'bot' }]);
      } else {
        setMessages(prev => [...prev, { 
          text: data.message || "I apologize, but I could not process your inquiry right now. Please try again.", 
          sender: 'bot' 
        }]);
      }
    } catch (error) {
      console.error("Chatbot Error:", error);
      setMessages(prev => [...prev, { 
        text: "Sorry, there was an issue connecting to Medicare assistant. Please ensure the backend server is running and try again.", 
        sender: 'bot' 
      }]);
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
            <div>
              <h2>{activeRole === 'doctor' ? 'Doctor Assistant' : 'Admin Assistant'}</h2>
              <span style={{ fontSize: '11px', opacity: 0.85 }}>
                {activeRole === 'doctor' ? 'Fees, Slots & Practice Management' : 'Doctor Onboarding & Platform Management'}
              </span>
            </div>
          </div>
          <button 
            onClick={toggleChat} 
            style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex' }}
          >
            <CloseIcon />
          </button>
        </div>

        {/* Role Toggle for Admin/Doctor flexibility */}
        <div style={{ display: 'flex', background: '#eef2ff', padding: '6px 12px', gap: '8px', borderBottom: '1px solid #e0e7ff' }}>
          <button 
            onClick={() => handleRoleChange('doctor')}
            style={{
              flex: 1,
              padding: '4px 8px',
              fontSize: '12px',
              fontWeight: activeRole === 'doctor' ? '600' : '400',
              borderRadius: '6px',
              border: 'none',
              background: activeRole === 'doctor' ? '#5f6fff' : 'transparent',
              color: activeRole === 'doctor' ? '#ffffff' : '#4b5563',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            👨‍⚕️ Doctor View (Fees)
          </button>
          <button 
            onClick={() => handleRoleChange('admin')}
            style={{
              flex: 1,
              padding: '4px 8px',
              fontSize: '12px',
              fontWeight: activeRole === 'admin' ? '600' : '400',
              borderRadius: '6px',
              border: 'none',
              background: activeRole === 'admin' ? '#5f6fff' : 'transparent',
              color: activeRole === 'admin' ? '#ffffff' : '#4b5563',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            ⚙️ Admin View (Doctors)
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div style={{ padding: '8px 12px', background: '#f9fafb', display: 'flex', gap: '6px', flexWrap: 'wrap', borderBottom: '1px solid #f3f4f6' }}>
          {activeRole === 'doctor' ? (
            <>
              <button 
                onClick={() => handleSendMessage("How should I set consultation fees for my specialty?")}
                style={{ fontSize: '11px', padding: '3px 8px', background: '#ffffff', border: '1px solid #d1d5db', borderRadius: '12px', cursor: 'pointer' }}
              >
                💡 Consultation Fees
              </button>
              <button 
                onClick={() => handleSendMessage("How can I increase my patient appointments and earnings?")}
                style={{ fontSize: '11px', padding: '3px 8px', background: '#ffffff', border: '1px solid #d1d5db', borderRadius: '12px', cursor: 'pointer' }}
              >
                📈 Optimize Earnings
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => handleSendMessage("How do I onboard and manage doctors on Medicare?")}
                style={{ fontSize: '11px', padding: '3px 8px', background: '#ffffff', border: '1px solid #d1d5db', borderRadius: '12px', cursor: 'pointer' }}
              >
                👨‍⚕️ Manage Doctors
              </button>
              <button 
                onClick={() => handleSendMessage("What are the recommended doctor fees across specialties?")}
                style={{ fontSize: '11px', padding: '3px 8px', background: '#ffffff', border: '1px solid #d1d5db', borderRadius: '12px', cursor: 'pointer' }}
              >
                💰 Fee Guidelines
              </button>
            </>
          )}
        </div>

        {/* Messages */}
        <div className={styles.chatMessages}>
          {messages.map((msg, index) => (
            <div 
              key={index} 
              className={`${styles.message} ${msg.sender === 'user' ? styles.userMessage : styles.botMessage}`}
            >
              {msg.text}
            </div>
          ))}
          {isLoading && (
            <div className={`${styles.message} ${styles.botMessage}`}>
              <div className={styles.loadingDots}>
                <span>.</span><span>.</span><span>.</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className={styles.chatInputContainer}>
          <input 
            type="text" 
            placeholder={activeRole === 'doctor' ? "Ask about fees, slots, patients..." : "Ask about doctors, specialties, platform..."}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={isLoading}
          />
          <button 
            onClick={() => handleSendMessage()} 
            disabled={isLoading || !inputValue.trim()}
          >
            <SendIcon />
          </button>
        </div>
      </div>

      {/* Floating Trigger Button */}
      <button 
        className={styles.chatButton} 
        onClick={toggleChat}
        aria-label="Toggle Medicare Assistant"
        title="Open Medicare Assistant"
      >
        {isOpen ? <CloseIcon /> : <MessageIcon />}
      </button>
    </div>
  );
}
