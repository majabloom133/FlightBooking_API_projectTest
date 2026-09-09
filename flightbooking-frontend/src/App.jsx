import React, { useState } from "react";
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from "remark-gfm";
import './App.css';

// Main chatbot component for Lexicon Airline AI assistant
function App() {
    const [currentView, setCurrentView] = useState('welcome');

    const [messages, setMessages] = useState([
        {sender: 'ai', text: 'Hello! I am your Lexicon Airline assistant. How can I help you today?'}
    ]);

    const [input, setInput] = useState('');
    const [chatId, setChatId] = useState(null);
    const [loading, setLoading] = useState(false);

    // List of predefined quick action chips
    const suggestedPrompts = [
        "✈️ Show available flights",
        "🌍 What destinations are available?",
        "💰 Find flights under 200 USD",
        "📋 Show my bookings",
        "👥 Book for a group or family"
    ];

    // Send message to Spring Boot backend using Axios
    const sendChatMessage = async (messageText) => {
        if (!messageText.trim() || loading) return;

        // Append user's message immediately to UI state
        const userMessage = {sender: 'user', text: messageText};
        setMessages((prev) => [...prev, userMessage]);
        setLoading(true);

        try {
            // Send API POST request to Spring Boot backend chat endpoint
            const response = await axios.post('http://localhost:8080/api/chat', {
                message: messageText,
                chatId: chatId
            });

            if (response.data.chatId) {
                setChatId(response.data.chatId);
            }

            setMessages((prev) => [
                ...prev,
                {sender: 'ai', text: response.data.response}
            ]);
        } catch (error) {
            setMessages((prev) => [
                ...prev,
                {sender: 'ai', text: 'Sorry, I could not connect to the server. Please make sure backend is running.'}
            ]);
        } finally {
            setLoading(false);
        }
    };

    // Handle suggested prompt chips in chat
    const handlePromptClick = (promptText) => {
        const cleanText = promptText.replace(/^[^\s]+\s*/, '');
        sendChatMessage(cleanText);
    };

    // Form submit handler
    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const currentInput = input;
        setInput('');
        await sendChatMessage(currentInput);
    };

    // Dashboard card actions
    const handleDashboardAction = (promptText) => {
        setCurrentView('chat');
        if (promptText) {
            sendChatMessage(promptText);
        }
    };

    // Start a fresh chat session
    const handleNewChat = () => {
        setMessages([
            {sender: 'ai', text: 'Hello! I am your Lexicon Airline assistant. How can I help you today?'}
        ]);
        setChatId(null);
        setCurrentView('chat');
    };

    return (
        <div className="app-viewport">
            <div className="app-card">

                {/* ==================== WELCOME SCREEN ==================== */}
                {currentView === 'welcome' && (
                    <div className="view-welcome">
                        <div className="welcome-illustration">
                            <div className="icon-badge">✈️</div>
                        </div>

                        <h1 className="welcome-title">Lexicon Airline Assistant</h1>
                        <p className="welcome-subtitle">
                            Your smart companion for searching available flights, managing bookings, and instant travel
                            support.
                        </p>

                        <button
                            className="btn-primary"
                            onClick={() => setCurrentView('dashboard')}
                        >
                            <span>Get Started</span>
                            <span className="arrow-icon">→</span>
                        </button>
                    </div>
                )}

                {/* ==================== DASHBOARD MENU ==================== */}
                {currentView === 'dashboard' && (
                    <div className="view-dashboard">
                        <div className="dashboard-header">
                            <h2>Hello! 👋</h2>
                            <p>How can we assist your journey today?</p>
                        </div>

                        <div className="dashboard-grid">
                            <div className="card-option" onClick={handleNewChat}>
                                <div className="card-icon bg-blue">💬</div>
                                <div>
                                    <h3>Start New Chat</h3>
                                    <p>Ask open questions about flights and bookings</p>
                                </div>
                            </div>

                            <div className="card-option"
                                 onClick={() => handleDashboardAction('Show available flights')}>
                                <div className="card-icon bg-cyan">✈️</div>
                                <div>
                                    <h3>Show Available Flights</h3>
                                    <p>View all active flight schedules and fares</p>
                                </div>
                            </div>

                            <div className="card-option" onClick={() => handleDashboardAction('Show my bookings')}>
                                <div className="card-icon bg-indigo">📋</div>
                                <div>
                                    <h3>My Bookings</h3>
                                    <p>Check status of existing reservations</p>
                                </div>
                            </div>

                            <div className="card-option"
                                 onClick={() => handleDashboardAction('I want to cancel a flight booking')}>
                                <div className="card-icon bg-red">❌</div>
                                <div>
                                    <h3>Cancel Reservations</h3>
                                    <p>Modify or cancel an active ticket</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}


                {/* ==================== CHAT INTERFACE ==================== */}
                {currentView === 'chat' && (
                    <div className="view-chat">
                        <div className="chat-topbar">
                            <button className="btn-back" onClick={() => setCurrentView('dashboard')}>
                                ← Back
                            </button>
                            <div className="topbar-info">
                                <h3>✈️ Lexicon Airline Assistant</h3>
                                <span className="status-online">● Online</span>
                            </div>
                            <button className="btn-secondary-sm" onClick={handleNewChat}>
                                New Chat
                            </button>
                        </div>

                        <div className="chat-window">
                            {messages.map((msg, index) => (
                                <div key={index} className={`message-bubble ${msg.sender}`}>
                                    <div className="message-header">
                                        {msg.sender === 'user' ? 'You' : 'Lexicon AI'}
                                    </div>
                                    {msg.sender === 'ai' ? (
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                                    ) : (
                                        <p>{msg.text}</p>
                                    )}
                                </div>
                            ))}

                            {loading && (
                                <div className="message-bubble ai loading">
                                    <div className="typing-indicator">
                                        <div className="typing-dot"></div>
                                        <div className="typing-dot"></div>
                                        <div className="typing-dot"></div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="suggested-prompts">
                            {suggestedPrompts.map((prompt, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    className="prompt-chip"
                                    onClick={() => handlePromptClick(prompt)}
                                    disabled={loading}
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>

                        <form className="chat-input-form" onSubmit={sendMessage}>
                            <input
                                type="text"
                                placeholder="Type a message or ask about flights..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                disabled={loading}
                            />
                            <button type="submit" disabled={loading || !input.trim()}>
                                Send
                            </button>
                        </form>
                    </div>
                )}

            </div>
        </div>
    );
}

export default App;
