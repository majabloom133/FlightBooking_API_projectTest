import React, { useState } from "react";
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from "remark-gfm";
import './App.css';
import { BookingModal } from "./BookingModal.jsx";

// Main chatbot component
function App() {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [currentView, setCurrentView] = useState('landing');

    const [selectedFlightForModal, setSelectedFlightForModal] = useState(null);

    const [messages, setMessages] = useState([
        {sender: 'ai', text: 'Hello! I am your Coastal Air assistant. How can I help you today?'}
    ]);

    const [input, setInput] = useState('');
    const [chatId, setChatId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [flights, setFlights] = useState([]);

    React.useEffect(() => {
        if (currentView === 'flights') {
            axios.get('http://localhost:8080/api/flights')
                .then((response) => {
                    setFlights(response.data);
                })
                .catch((error) => {
                    console.error("Could not fetch flights:", error);
                });
        }
    }, [currentView]);

    // List of predefined quick action chips
    const suggestedPrompts = [
        "✈️ Show available flights",
        "🌍 What destinations are available?",
        "💰 Find flights under 200 USD",
        "📋 Show my bookings"
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
            {sender: 'ai', text: 'Hello! I am your Coastal Air assistant. How can I help you today?'}
        ]);
        setChatId(null);
        setCurrentView('chat');
    };

    const handleModalBookingSubmit = (bookingData) => {
        const flightNum = bookingData.flightNumber || bookingData.flightId;
        const passengerList = bookingData.passengers.join(', ');
        const mainEmail = bookingData.email;

        setSelectedFlightForModal(null);
        setIsChatOpen(true);

        setTimeout(() => {
            const promptMessage = `I want to book flight ${flightNum} for ${bookingData.passengers.length} passenger(s): ${passengerList}. Primary contact email for all passengers is ${mainEmail}. Please review these details and ask me "Are you sure you want to confirm this booking?"`;
            sendChatMessage(promptMessage);
        }, 100);
    };

    return (
        <div className="landing-page-container">

            <header className="site-header">
                <div className="brand-logo">⚡ Coastal Air</div>
                <nav className="site-nav">
                    <button className="nav-btn active" onClick={() => setCurrentView('flights')}>✈️ All Flights</button>
                    <button className="nav-btn" onClick={() => setCurrentView('flights')}>🛫 Available</button>
                    <button className="nav-btn" onClick={() => { setIsChatOpen(true); sendChatMessage('Show my bookings'); }}>📋 My Bookings</button>                </nav>
            </header>

            <section className="hero-banner">
                <h1>Where Are You Flying To Next?</h1>
                <p>Explore coastlines and sunny destinations with Coastal Air. Easy booking and reliable flights.</p>
            </section>

            <main className="main-content">
                {currentView === 'landing' && (
                    <div className="hero-grid">

                        {/* Flight search navigation */}
                        <div
                            className="hero-card"
                            onClick={() => setCurrentView('flights')}
                        >
                            <div className="hero-card-icon">✈️</div>
                            <h3>Show Available Flights</h3>
                            <p>Explore all active flight schedules, seat maps, and pricing in real time.</p>
                            <button className="hero-card-btn">Browse Flights →</button>
                        </div>

                        {/* AI Chat Assistant */}
                        <div
                            className="hero-card highlight-card"
                            onClick={() => {
                                setIsChatOpen(true);
                            }}
                        >

                            <div className="hero-card-icon">🤖</div>
                            <h3>AI Assistant</h3>
                            <p>Ask questions, get travel recommendations, or let our bot handle your booking.</p>
                            <button className="hero-card-btn primary">Start AI Chat →</button>
                        </div>

                    </div>
                )}

                {currentView === 'flights' && (
                    <div className="flights-view-container">
                        <h2>All Scheduled Flights</h2>
                        {flights.length === 0 ? (
                            <p>Loading flights or no active flights available...</p>
                        ) : (
                            (() => {
                                const groupedFlights = flights.reduce((acc, flight) => {
                                    const destination = flight.destination || flight.arrival || flight.to || flight.arrivalAirport || flight.destinationCity || 'Other Destinations';
                                    if (!acc[destination]) acc[destination] = [];
                                    acc[destination].push(flight);
                                    return acc;
                                }, {});

                                return Object.entries(groupedFlights).map(([destination, flightList]) => (
                                    <div key={destination} className="destination-group" style={{ marginBottom: '2rem' }}>
                                        <h3 style={{ borderBottom: '2px solid #ccc', paddingBottom: '0.5rem', marginBottom: '1rem', textAlign: 'left' }}>
                                            📍 Flights to {destination}
                                        </h3>

                                        <div className="flights-grid">
                                            {flightList.map((flight) => {
                                                const departureCity = flight.origin || flight.departure || flight.from || flight.departureAirport || flight.originCity || 'Stockholm';

                                                const formatDateTime = (rawTime) => {
                                                    if (!rawTime) return null;
                                                    if (typeof rawTime === 'string' && rawTime.includes('T')) {
                                                        return rawTime.slice(0, 16).replace('T', ' ');
                                                    }
                                                    return rawTime;
                                                };

                                                const depFormatted = formatDateTime(flight.departureTime || flight.depTime || flight.startTime) || '2026-07-28 08:28';
                                                const arrFormatted = formatDateTime(flight.arrivalTime || flight.arrTime || flight.endTime) || '2026-07-28 10:28';

                                                return (
                                                    <div key={flight.id || flight.flightNumber} className="hero-card">
                                                        <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                                                            ✈️ {departureCity} → {destination}
                                                        </h4>

                                                        <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                                            Flight: <strong>{flight.flightNumber || flight.id}</strong>
                                                        </p>

                                                        <div style={{ backgroundColor: '#f8f9fa', padding: '0.6rem', borderRadius: '8px', margin: '0.5rem 0', fontSize: '0.95rem' }}>
                                                            <p style={{ margin: '0.2rem 0' }}>
                                                                🕒 <strong>Departure:</strong> {depFormatted} | <strong>Arrival:</strong> {arrFormatted}
                                                            </p>
                                                        </div>

                                                        <p style={{ fontSize: '1.1rem', margin: '0.5rem 0' }}>
                                                            <strong>Price:</strong> {flight.price ? `${flight.price} USD` : 'N/A'}
                                                        </p>

                                                        <button
                                                            className="hero-card-btn primary"
                                                            onClick={() => setSelectedFlightForModal(flight)}
                                                        >
                                                            Book Flight ✈️
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ));
                            })()
                        )}
                    </div>
                )}
            </main>


            <div className="chat-widget-wrapper">
                <button
                    type="button"
                    className="chat-widget-toggle"
                    onClick={() => {
                        setIsChatOpen(!isChatOpen);
                    }}
                >
                    {isChatOpen ? '✕' : '💬'}
                </button>

                {isChatOpen && (
                    <div className="app-card widget-popup">

                        {/* ==================== WELCOME SCREEN ==================== */}
                        {currentView === 'welcome' && (
                            <div className="view-welcome">
                                <div className="welcome-illustration">
                                    <div className="icon-badge">✈️</div>
                                </div>

                                <h1 className="welcome-title">Coastal Air Assistant</h1>
                                <p className="welcome-subtitle">
                                    Your smart companion for searching available flights, managing bookings, and instant travel support.
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

                                    <div className="card-option" onClick={() => handleDashboardAction('Show available flights')}>
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

                                    <div className="card-option" onClick={() => handleDashboardAction('I want to cancel a flight booking')}>
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
                            <div className="view-chat">
                                <div className="chat-topbar">
                                    <button className="btn-back" onClick={() => setCurrentView('dashboard')}>
                                        ← Back
                                    </button>
                                    <div className="topbar-info">
                                        <h3>✈️ Coastal Air Assistant</h3>
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
                                                {msg.sender === 'user' ? 'You' : 'Coastal Air AI'}
                                            </div>

                                            {msg.sender === 'ai' ? (
                                                <ReactMarkdown
                                                    remarkPlugins={[remarkGfm]}
                                                    components={{
                                                        thead: ({node, children, ...props}) => (
                                                            <thead {...props}>
                                                            {React.Children.map(children, headerRow => {
                                                                if (React.isValidElement(headerRow)) {
                                                                    return React.cloneElement(headerRow, {
                                                                        children: [
                                                                            ...React.Children.toArray(headerRow.props.children),
                                                                            <th key="actions-header" style={{ textAlign: 'right' }}>ACTIONS</th>
                                                                        ]
                                                                    });
                                                                }
                                                                return headerRow;
                                                            })}
                                                            </thead>
                                                        ),


                                                        tr: ({node, children, ...props}) => {
                                                            const rowText = node?.children
                                                                ?.map((cell) => cell.children?.[0]?.value || '')
                                                                .join(' ') || '';

                                                            const lowerMsg = msg.text.toLowerCase();
                                                            const isConfirmation = lowerMsg.includes('successfully') || lowerMsg.includes('completed');

                                                            const previousUserMsg = messages[index - 1]?.text?.toLowerCase() || '';

                                                            const isBookingList =
                                                                previousUserMsg.includes('my booking') ||
                                                                previousUserMsg.includes('cancel') ||
                                                                ((lowerMsg.includes('booking id') || lowerMsg.includes('your booking')) && !lowerMsg.includes('available flight'));

                                                            const match = rowText.match(/(?:BK|FL|\b)\d+\b/i);
                                                            const itemId = match ? match[0] : null;

                                                            return (
                                                                <tr {...props}>
                                                                    {children}
                                                                    {!isConfirmation && itemId && (
                                                                        <td className="table-actions-cell" style={{whiteSpace: 'nowrap'}}>
                                                                            {isBookingList ? (

                                                                                <button
                                                                                    type="button"
                                                                                    className="btn-secondary-sm"
                                                                                    style={{ backgroundColor: '#dc3545', color: '#fff', borderColor: '#dc3545' }}
                                                                                    onClick={() => sendChatMessage(`I want to cancel booking ${itemId}. Please ask me: "Are you sure you want to cancel booking ${itemId}?" before proceeding.`)}
                                                                                >
                                                                                    Cancel ❌
                                                                                </button>

                                                                            ) : (
                                                                                <button
                                                                                    type="button"
                                                                                    className="btn-primary-sm"
                                                                                    onClick={() => setSelectedFlightForModal({
                                                                                        flightNumber: itemId,
                                                                                        id: itemId
                                                                                    })}
                                                                                >
                                                                                    Book ✈️
                                                                                </button>
                                                                            )}
                                                                        </td>
                                                                    )}
                                                                </tr>
                                                            );
                                                        }



                                                    }}
                                                >
                                                    {msg.text}
                                                </ReactMarkdown>

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

                    </div>
                )}
            </div>

            {selectedFlightForModal && (
                <BookingModal
                    flight={selectedFlightForModal}
                    onClose={() => setSelectedFlightForModal(null)}
                    onSubmit={handleModalBookingSubmit}
                />
            )}
        </div>
    );
}

export default App;