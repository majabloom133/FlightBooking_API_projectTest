import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

// Main chatbot component for lexicon airline AI assistant
function App() {
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Hello! I am your Lexicon Airline assistant. How can I help you today?' }
  ]);


  const [input, setInput] = useState('');

  const [chatId, setChatId] = useState(null);

  const [loading, setLoading] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = {sender: 'user', text: input};
    setMessages((prev) => [...prev, userMessage]);

    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8080/api/chat', {
        message: currentInput,
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
        { sender: 'ai', text: 'Sorry, I could not connect to the server. Please ensure backend is running.' }
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
                <p>{msg.text}</p>
              </div>
          ))}
          {loading && <div className="message-bubble ai loading ">Thinking...</div>}
        </div>

        <form className="chat-input-form" onSubmit={sendMessage}>
          <input
            type="text"
            placeholder="Ask about flights, book or cancel..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            />
          <button type="submit" disabled={loading}>Send</button>
        </form>
      </div>
  );
}

export default App;