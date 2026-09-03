import { useEffect, useRef, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useLanguage } from "../../context/LanguageContext";
import { chatService } from "../../services/chatService";

const SUGGESTED_PROMPTS = [
  { icon: "💧", title: "Water Leakage Issue", text: "Which department handles pipe leaks and water supply issues?" },
  { icon: "🚦", title: "Broken Streetlights", text: "How can I report broken streetlights in my ward?" },
  { icon: "📋", title: "Check Complaint Status", text: "How can I track the progress of my submitted complaints?" },
  { icon: "⏳", title: "Resolution Timeline", text: "What are the standard resolution timeframes for complaints?" },
];

export default function ChatPage() {
  const { t } = useLanguage();
  const [messages, setMessages] = useState([
    {
      role: "model",
      text: "Namaste! 🙏 I am your JanSewa AI Assistant. How can I help you today with reporting issues, checking complaint status, or understanding municipal services?",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sending]);

  const handleSend = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || sending) return;

    const newHistory = [...messages, { role: "user", text: query }];
    setMessages(newHistory);
    if (!textToSend) setInput("");
    setSending(true);

    try {
      const historyPayload = newHistory
        .filter((m) => m.role === "user" || m.role === "model")
        .slice(0, -1);

      const { data } = await chatService.sendMessage(query, historyPayload);
      const reply = data?.data?.reply || "I'm sorry, I couldn't process your request right now.";
      setMessages((prev) => [...prev, { role: "model", text: reply }]);
    } catch (err) {
      const errMsg = err?.response?.data?.message || "There was a problem connecting to the AI assistant.";
      setMessages((prev) => [...prev, { role: "model", text: errMsg }]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        {/* Title Header */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: "linear-gradient(135deg, var(--primary), var(--secondary))",
              color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20, boxShadow: "0 4px 12px rgba(0,128,128,0.2)"
            }}>
              ✨
            </div>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0, fontFamily: "var(--font-display)" }}>
                JanSewa AI Assistant
              </h1>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "2px 0 0" }}>
                Ask questions about complaint categories, status updates, or municipal guidelines.
              </p>
            </div>
          </div>
        </div>

        {/* Chat Window Container */}
        <div style={{
          background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16,
          boxShadow: "0 4px 20px rgba(15,23,42,0.06)", display: "flex", flexDirection: "column",
          height: "calc(80vh - 120px)", minHeight: 480, overflow: "hidden"
        }}>
          {/* Scrollable Message List */}
          <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
            {messages.map((m, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex", gap: 12,
                  flexDirection: m.role === "user" ? "row-reverse" : "row",
                  alignItems: "flex-start",
                }}
              >
                <div style={{
                  width: 34, height: 34, borderRadius: "50%", shrink: 0,
                  background: m.role === "user" ? "var(--primary)" : "linear-gradient(135deg, var(--secondary), var(--primary))",
                  color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 700, flexShrink: 0
                }}>
                  {m.role === "user" ? "You" : "AI"}
                </div>
                <div style={{
                  maxWidth: "75%",
                  background: m.role === "user" ? "var(--primary)" : "var(--background)",
                  color: m.role === "user" ? "#fff" : "var(--text-primary)",
                  padding: "12px 16px", borderRadius: 16,
                  borderTopRightRadius: m.role === "user" ? 4 : 16,
                  borderTopLeftRadius: m.role === "user" ? 16 : 4,
                  fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-line",
                  boxShadow: m.role === "user" ? "0 2px 8px rgba(0,128,128,0.2)" : "none",
                  border: m.role === "user" ? "none" : "1px solid var(--border)",
                }}>
                  {m.text}
                </div>
              </div>
            ))}

            {sending && (
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{
                  width: 34, height: 34, borderRadius: "50%",
                  background: "linear-gradient(135deg, var(--secondary), var(--primary))",
                  color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 700, flexShrink: 0
                }}>
                  AI
                </div>
                <div style={{
                  background: "var(--background)", border: "1px solid var(--border)",
                  padding: "10px 16px", borderRadius: 16, borderTopLeftRadius: 4,
                  fontSize: 13.5, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 8
                }}>
                  <span>Thinking...</span>
                </div>
              </div>
            )}
          </div>

          {/* Suggested Prompts Bar (Shown when history is short) */}
          {messages.length <= 2 && (
            <div style={{ padding: "0 20px 12px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8 }}>
              {SUGGESTED_PROMPTS.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSend(p.text)}
                  style={{
                    display: "flex", alignItems: "center", gap: 8, padding: "10px 12px",
                    borderRadius: 10, border: "1px solid var(--border)", background: "var(--background)",
                    color: "var(--text-primary)", textAlign: "left", cursor: "pointer",
                    fontSize: 12.5, transition: "all 0.15s ease",
                  }}
                >
                  <span style={{ fontSize: 16 }}>{p.icon}</span>
                  <span style={{ fontWeight: 600, flex: 1 }}>{p.title}</span>
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div style={{ padding: 16, borderTop: "1px solid var(--border)", background: "var(--card)" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask JanSewa AI anything..."
                disabled={sending}
                style={{
                  flex: 1, padding: "12px 16px", borderRadius: 12, border: "1px solid var(--border)",
                  background: "var(--background)", color: "var(--text-primary)", fontSize: 14,
                  outline: "none", fontFamily: "var(--font-body)",
                }}
              />
              <button
                type="button"
                onClick={() => handleSend()}
                disabled={sending || !input.trim()}
                style={{
                  padding: "12px 22px", borderRadius: 12, border: "none",
                  background: sending || !input.trim() ? "var(--border)" : "var(--primary)",
                  color: "#fff", fontWeight: 600, fontSize: 14, cursor: sending || !input.trim() ? "not-allowed" : "pointer",
                  boxShadow: sending || !input.trim() ? "none" : "0 4px 12px rgba(0,128,128,0.3)",
                  transition: "all 0.15s ease",
                }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
