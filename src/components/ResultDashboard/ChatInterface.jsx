import { useState, useRef, useEffect } from "react";

const SUGGESTIONS = [
  "Is this compound safe to handle?",
  "What are the long-term effects?",
  "How does it affect water sources?",
  "What safety measures are needed?",
];

export default function ChatInterface({ compound = "" }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: `Hi! I'm your ToxiScan assistant 🧬. Ask me anything about **${compound || "this compound"}**.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: msg }]);
    setLoading(true);

    // Simulated AI reply — wire to your actual API here
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `Based on the analysis of **${compound}**: ${msg.endsWith("?") ? "That's a great question. The compound shows significant interactions in this area based on our model's predictions." : "Noted. Here's what the model says about that aspect of the compound."}`,
        },
      ]);
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="chat-wrap">
      <div className="chat-header">
        <span className="chat-header-icon">💬</span>
        <span className="chat-header-title">Ask ToxiScan</span>
        <span className="chat-online-dot" />
      </div>

      <div className="chat-messages">
        {messages.map((m, i) => (
          <div key={i} className={`chat-msg chat-msg--${m.role}`}>
            {m.role === "assistant" && (
              <span className="chat-avatar">🧬</span>
            )}
            <div className="chat-bubble">
              {m.text.split("**").map((chunk, j) =>
                j % 2 === 1 ? <strong key={j}>{chunk}</strong> : chunk
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="chat-msg chat-msg--assistant">
            <span className="chat-avatar">🧬</span>
            <div className="chat-bubble chat-typing">
              <span /><span /><span />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="chat-suggestions">
        {SUGGESTIONS.map((s, i) => (
          <button key={i} className="chat-suggestion" onClick={() => send(s)}>
            {s}
          </button>
        ))}
      </div>

      <div className="chat-input-row">
        <input
          className="chat-input"
          type="text"
          placeholder="Ask about this compound…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <button className="chat-send-btn" onClick={() => send()} disabled={!input.trim()}>
          ➤
        </button>
      </div>
    </div>
  );
}