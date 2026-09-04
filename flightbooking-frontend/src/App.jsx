import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
import ReactMarkdown from 'react-markdown';

// Main chatbot component for lexicon airline AI assistant
function App() {
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Hello! I am your Lexicon Airline assistant. How can I help you today?' }
  ]);


  const [input, setInput] = useState('');

  const [chatId, setChatId] = useState(null);

  const [loading, setLoading] = useState(false);

  const suggestedPrompts = [
      "✈️ Show available flights",
      "🌍 What destinations are available?",
      "💰 Find flights under 200 USD",
      "📋 Show my bookings"
  ];

const handlePromptClick = (promptText) => {
  const cleanText = promptText.replace(/^[^\s]+\s*/, '');
  sendChatMessage(cleanText);
};

const sendMessage = async (e) => {
  e.preventDefault();
  if (!input.trim() || loading) return;

  const currentInput = input;
  setInput('');
  await sendChatMessage(currentInput);
};

const sendChatMessage = async (messageText) => {
  if (!messageText.trim() || loading) return;

  const userMessage = { sender: 'user', text: messageText };
  setMessages((prev) => [...prev, userMessage]);
  setLoading(true);

  try {
    const response = await axios.post('http://localhost:8080/api/chat', {
      message: messageText,
      chatId: chatId
    });

    if (response.data.chatId) {
      setChatId(response.data.chatId);
    }

    setMessages((prev) => [
        ...prev,
      { sender: 'ai', text: response.data.response }
    ]);
  } catch (error) {
    setMessages((prev) => [
        ...prev,
      { sender: 'ai', text: 'Sorry, I could not connect to the server. Please ensure backend is running.'}
    ]);
  } finally {
    setLoading(false);
  }
};

  return (
      <div className="chat-container">
        <header className="chat-header">
          <h2>✈️ Lexicon Airline Assistant</h2>
        </header>

        <div className="chat-window">
          {messages.map((msg, index) => (
              <div key={index} className={`message-bubble ${msg.sender}`}>
                <strong>{msg.sender === 'user' ? 'You' : 'AI Assistant'}:</strong>
                {msg.sender === 'ai' ? (
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                ) : (
                    <p>{msg.text}</p>
                )}
              </div>
          ))}
          {loading && (
              <div className="message-bubble ai loading ">
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
            placeholder="Ask about flights, book or cancel..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            />
          <button type="submit" disabled={loading || !input.trim()}>Send</button>
        </form>
      </div>
  );
}

export default App;