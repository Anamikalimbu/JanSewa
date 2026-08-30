import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { chatService } from "../../services/chatService";

const iconPaths = {
  chat: "M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z",
  close: "M18 6L6 18M6 6l12 12",
  send: "M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z",
  sparkles: "M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z",
};
const Icon = ({ d, size = 18, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...rest}>
    <path d={d} />
  </svg>
);

export default function AIChatWidget() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState([]); // { role: "user"|"model", text }
  const scrollRef = useRef(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ role: "model", text: t("chat_greeting") }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sending]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;

    const nextMessages = [...messages, { role: "user", text }];
    setMessages(nextMessages);
    setInput("");
    setSending(true);

    try {
      const history = nextMessages
        .filter((m) => m.role === "user" || m.role === "model")
        .slice(0, -1); // exclude the message we're about to send (sent separately)

      const { data } = await chatService.sendMessage(text, history);
      const reply = data?.data?.reply || t("chat_error");
      setMessages((prev) => [...prev, { role: "model", text: reply }]);
    } catch (err) {
      const errMsg = err?.response?.data?.message || t("chat_error");
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
    <div style={{ position: "fixed", right: 24, bottom: 24, zIndex: 100 }}>
      {open && (
        <div style={{
          width: 340, height: 460, marginBottom: 12, borderRadius: 16,
          background: "var(--card)", border: "1px solid var(--border)",
          boxShadow: "0 16px 40px rgba(15,23,42,0.18)", display: "flex",
          flexDirection: "column", overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{
            padding: "14px 16px", background: "linear-gradient(135deg, var(--primary), var(--secondary))",
            display: "flex", alignItems: "center", gap: 10, color: "#fff", flexShrink: 0,
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.18)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <Icon d={iconPaths.sparkles} size={15} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, fontFamily: "var(--font-display)" }}>{t("chat_title")}</div>
              <div style={{ fontSize: 10.5, opacity: 0.9 }}>{t("chat_subtitle")}</div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label={t("chat_closeAria")}
              style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", padding: 4, display: "flex" }}
            >
              <Icon d={iconPaths.close} size={16} />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "85%",
                  background: m.role === "user" ? "var(--primary)" : "var(--background)",
                  color: m.role === "user" ? "#fff" : "var(--text-primary)",
                  padding: "9px 12px", borderRadius: 12,
                  borderBottomRightRadius: m.role === "user" ? 3 : 12,
                  borderBottomLeftRadius: m.role === "user" ? 12 : 3,
                  fontSize: 12.8, lineHeight: 1.5, whiteSpace: "pre-line",
                }}
              >
                {m.text}
              </div>
            ))}
            {sending && (
              <div style={{
                alignSelf: "flex-start", background: "var(--background)", color: "var(--text-muted)",
                padding: "9px 12px", borderRadius: 12, borderBottomLeftRadius: 3, fontSize: 12.5,
              }}>
                {t("chat_thinking")}
              </div>
            )}
          </div>

          {/* Input */}
          <div style={{ display: "flex", gap: 8, padding: 12, borderTop: "1px solid var(--border)", flexShrink: 0 }}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("chat_placeholder")}
              rows={1}
              style={{
                flex: 1, resize: "none", border: "1px solid var(--border)", borderRadius: 10,
                padding: "8px 10px", fontSize: 12.8, fontFamily: "var(--font-body)",
                color: "var(--text-primary)", outline: "none", maxHeight: 70,
              }}
            />
            <button
              onClick={handleSend}
              disabled={sending || !input.trim()}
              aria-label={t("chat_send")}
              style={{
                width: 36, height: 36, flexShrink: 0, borderRadius: 10, border: "none",
                background: "var(--primary)", color: "#fff", display: "flex",
                alignItems: "center", justifyContent: "center",
                cursor: sending || !input.trim() ? "not-allowed" : "pointer",
                opacity: sending || !input.trim() ? 0.6 : 1,
              }}
            >
              <Icon d={iconPaths.send} size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Floating toggle button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? t("chat_closeAria") : t("chat_openAria")}
        style={{
          width: 56, height: 56, borderRadius: "50%", border: "none",
          background: "linear-gradient(135deg, var(--primary), var(--secondary))",
          color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 8px 24px rgba(0,128,128,0.4)", cursor: "pointer", marginLeft: "auto",
        }}
      >
        <Icon d={open ? iconPaths.close : iconPaths.chat} size={22} />
      </button>
    </div>
  );
}
