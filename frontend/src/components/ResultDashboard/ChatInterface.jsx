import { useState, useRef, useEffect } from "react";
import { sendChat } from "../../api";            // ← ADD

const SUGGESTIONS = [
  "Is this compound safe to handle?",
  "What are the long-term effects?",
  "How does it affect water sources?",
  "What safety measures are needed?",
];

export default function ChatInterface({ compound = "", context = {} }) {   // ← ADD context prop
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: `Hi! I'm your ToxiScan assistant 🧬. Ask me anything about **${compound || "this compound"}**.`,
    },
  ]);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: msg }]);
    setLoading(true);

    try {
      const { response } = await sendChat(msg, context);   // ← REAL API CALL
      setMessages((prev) => [...prev, { role: "assistant", text: response }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Sorry, I couldn't connect to the server." },
      ]);
    } finally {
      setLoading(false);
    }
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
            {m.role === "assistant" && <span className="chat-avatar">🧬</span>}
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