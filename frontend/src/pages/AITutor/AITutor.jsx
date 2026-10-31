import { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../../contexts/AppContext';
import { sendChatMessage } from '../../services/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './AITutor.css';

const suggestedQuestions = [
  { text: 'What is an LLM?', icon: '🤖' },
  { text: 'How does ChatGPT work?', icon: '💬' },
  { text: 'What is a Transformer?', icon: '⚡' },
  { text: 'Explain tokenization', icon: '🔤' },
  { text: 'What are embeddings?', icon: '📊' },
  { text: 'How do I train an LLM?', icon: '🏋️' },
  { text: 'What is LoRA?', icon: '🔧' },
  { text: 'What is RAG?', icon: '📚' },
  { text: 'How do I build my own chatbot?', icon: '🛠️' },
];

// Code block with copy button
function CodeBlock({ children, className }) {
  const [copied, setCopied] = useState(false);
  const language = className?.replace('language-', '') || '';

  const handleCopy = () => {
    navigator.clipboard.writeText(children).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="code-block-wrapper">
      <div className="code-block-header">
        <span className="code-language">{language || 'code'}</span>
        <button className="code-copy-btn" onClick={handleCopy}>
          {copied ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
              Copy
            </>
          )}
        </button>
      </div>
      <pre className="code-block"><code>{children}</code></pre>
    </div>
  );
}

export default function AITutor() {
  const { state } = useApp();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [skillLevel, setSkillLevel] = useState(state.user.level);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + 'px';
    }
  }, [input]);

  const sendMessage = async (messageText) => {
    const text = messageText || input.trim();
    if (!text || isLoading) return;

    const userMessage = { role: 'user', content: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setError(null);
    setIsLoading(true);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      const data = await sendChatMessage(text, skillLevel);
      const assistantMessage = {
        role: 'assistant',
        content: data.reply,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      setError(
        err.message.includes('Failed to fetch') || err.message.includes('NetworkError')
          ? 'Cannot connect to the backend. Please ensure the FastAPI server is running on http://127.0.0.1:8000'
          : err.message
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  // Custom renderers for markdown
  const markdownComponents = {
    code({ node: _node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      if (!inline && (match || String(children).includes('\n'))) {
        return <CodeBlock className={className}>{String(children).replace(/\n$/, '')}</CodeBlock>;
      }
      return <code className="inline-code" {...props}>{children}</code>;
    },
  };

  return (
    <div className="tutor-page fade-in">
      {/* Tutor header */}
      <div className="tutor-header">
        <div className="tutor-header-left">
          <div className="tutor-avatar">
            <span>🧠</span>
          </div>
          <div>
            <h2 className="tutor-title">AI Tutor</h2>
            <p className="tutor-subtitle">Your personal LLM development teacher — powered by Qwen</p>
          </div>
        </div>
        <div className="tutor-controls">
          <div className="skill-selector">
            <label className="skill-label">Level:</label>
            {['beginner', 'intermediate', 'advanced'].map(level => (
              <button
                key={level}
                className={`skill-btn ${skillLevel === level ? 'active' : ''}`}
                onClick={() => setSkillLevel(level)}
              >
                {level === 'beginner' && '🌱'}
                {level === 'intermediate' && '🌿'}
                {level === 'advanced' && '🌳'}
                <span>{level.charAt(0).toUpperCase() + level.slice(1)}</span>
              </button>
            ))}
          </div>
          {messages.length > 0 && (
            <button className="clear-chat-btn" onClick={clearChat}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="chat-container card">
        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="chat-empty">
              <div className="empty-illustration">
                <span className="empty-emoji">🎓</span>
                <div className="empty-rings">
                  <div className="empty-ring r1"></div>
                  <div className="empty-ring r2"></div>
                </div>
              </div>
              <h3>Start a conversation with your AI Tutor</h3>
              <p>Ask anything about AI, LLMs, Transformers, Python, or machine learning. I'll adapt my explanations to your skill level.</p>
              
              <div className="suggested-questions">
                {suggestedQuestions.map((q, i) => (
                  <button
                    key={i}
                    className="suggestion-chip"
                    onClick={() => sendMessage(q.text)}
                  >
                    <span className="chip-icon">{q.icon}</span>
                    <span>{q.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`message ${msg.role}`}>
                <div className="message-avatar">
                  {msg.role === 'user' ? (
                    <span className="avatar-letter">
                      {state.user.name.charAt(0).toUpperCase()}
                    </span>
                  ) : (
                    <span className="avatar-emoji">🧠</span>
                  )}
                </div>
                <div className="message-bubble">
                  <div className="message-header">
                    <span className="message-sender">
                      {msg.role === 'user' ? 'You' : 'AI Tutor'}
                    </span>
                    <span className="message-time">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="message-content">
                    {msg.role === 'assistant' ? (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={markdownComponents}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    ) : (
                      <p>{msg.content}</p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Loading indicator */}
          {isLoading && (
            <div className="message assistant">
              <div className="message-avatar">
                <span className="avatar-emoji">🧠</span>
              </div>
              <div className="message-bubble">
                <div className="typing-indicator">
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="chat-error">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span>{error}</span>
              <button onClick={() => setError(null)} className="error-dismiss">✕</button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Message composer */}
        <div className="chat-composer">
          <div className="composer-wrapper">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about AI and LLMs..."
              className="composer-input"
              rows={1}
              disabled={isLoading}
            />
            <button
              className="send-btn"
              onClick={() => sendMessage()}
              disabled={!input.trim() || isLoading}
              aria-label="Send message"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
          <p className="composer-hint">
            Press Enter to send · Shift + Enter for new line · Powered by Qwen 2.5
          </p>
        </div>
      </div>
    </div>
  );
}
