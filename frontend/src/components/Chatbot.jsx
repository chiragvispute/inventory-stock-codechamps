import { useState, useRef, useEffect } from 'react';
import '../styles/Chatbot.css';

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { id: 1, type: 'bot', text: 'Hi! Ask me about inventory. Try: "How much aluminum do we have?"' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMsg = { id: Date.now(), type: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(
        `http://localhost:8000/query?query=${encodeURIComponent(input)}`,
        { method: 'POST' }
      );

      if (!response.ok) throw new Error('Failed to get response');
      
      const data = await response.json();
      const botMsg = { 
        id: Date.now() + 1, 
        type: 'bot', 
        text: data.response 
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      const errorMsg = { 
        id: Date.now() + 1, 
        type: 'bot', 
        text: '❌ Error: Could not connect to AI Agent. Make sure it\'s running on port 8000.' 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <h2>📦 Inventory AI Assistant</h2>
        <p>Ask questions about your inventory</p>
      </div>

      <div className="messages-box">
        {messages.map(msg => (
          <div key={msg.id} className={`message ${msg.type}`}>
            <div className="message-content">
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="message bot">
            <div className="message-content typing">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="input-form">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask about inventory..."
          disabled={loading}
          autoFocus
        />
        <button type="submit" disabled={loading}>
          {loading ? '⏳' : '→'}
        </button>
      </form>

      <div className="chatbot-hints">
        <p><small>Examples: "How much aluminum?", "Where is copper?", "Low stock items?", "Warehouse summary"</small></p>
      </div>
    </div>
  );
}
