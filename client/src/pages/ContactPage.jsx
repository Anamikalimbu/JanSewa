import { useState } from "react";
import PublicLayout from "../components/site/PublicLayout";
import { Icon, icons } from "../components/site/icons";
import { contactService } from "../services/contactService";

const contactInfo = [
  { icon: icons.phone, label: "Toll-free helpline", value: "1111", href: "tel:1111" },
  { icon: icons.mail, label: "Email support", value: "support@jansewa.gov.np", href: "mailto:support@jansewa.gov.np" },
  { icon: icons.pin, label: "Head office", value: "Singha Durbar, Kathmandu, Nepal", href: null },
];

const subjectOptions = [
  "General Inquiry",
  "Technical Support",
  "Complaint Follow-up",
  "Partnership / Government Department",
  "Feedback on the Platform",
];

const initialForm = { name: "", email: "", subject: subjectOptions[0], message: "" };

export default function ContactPage() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState(null); // null | "sending" | "success" | "error"
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setStatus("error");
      setErrorMsg("Please fill in your name, email, and message.");
      return;
    }
    setStatus("sending");
    setErrorMsg("");
    try {
      await contactService.send(form);
      setStatus("success");
      setForm(initialForm);
    } catch (err) {
      setStatus("error");
      setErrorMsg(err?.response?.data?.message || "Something went wrong sending your message. Please try again.");
    }
  };

  return (
    <PublicLayout>
      <section style={{ textAlign: "center", marginBottom: 44 }}>
        <div style={{
          display: "inline-block", fontSize: 12, fontWeight: 700, color: "var(--primary)",
          background: "rgba(0,128,128,0.1)", padding: "6px 14px", borderRadius: 20, marginBottom: 16,
        }}>
          CONTACT US
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 700, marginBottom: 12 }}>
          We're here to help
        </h1>
        <p style={{ fontSize: 14.5, color: "var(--text-secondary)", maxWidth: 560, margin: "0 auto" }}>
          Have a question about the platform, a partnership inquiry, or feedback for us? Send a message and
          our team will get back to you.
        </p>
      </section>

      <div className="ls-grid-2" style={{ display: "grid", gridTemplateColumns: "0.85fr 1.15fr", gap: 32, alignItems: "start" }}>
        {/* Contact info */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {contactInfo.map((c) => {
            const Wrapper = c.href ? "a" : "div";
            return (
              <Wrapper key={c.label} href={c.href || undefined} style={{
                display: "flex", alignItems: "center", gap: 14, background: "var(--card)",
                border: "1px solid var(--border)", borderRadius: 14, padding: 18, color: "inherit",
              }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 11, background: "rgba(0,128,128,0.1)", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)",
                }}>
                  <Icon d={c.icon} size={19} />
                </div>
                <div>
                  <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{c.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{c.value}</div>
                </div>
              </Wrapper>
            );
          })}

          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 18 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 8 }}>Office Hours</div>
            <div style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.7 }}>
              Sunday – Friday: 10:00 AM – 5:00 PM<br />
              Saturday &amp; public holidays: Closed
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 28 }}>
          <div className="ls-grid-2-tight" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 6 }}>Full Name</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Your name" style={inputStyle} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 6 }}>Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" style={inputStyle} />
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 6 }}>Subject</label>
            <select name="subject" value={form.subject} onChange={handleChange} style={inputStyle}>
              {subjectOptions.map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 6 }}>Message</label>
            <textarea
              name="message" value={form.message} onChange={handleChange} rows={5}
              placeholder="Tell us how we can help…" style={{ ...inputStyle, resize: "vertical" }}
            />
          </div>

          <button
            type="submit"
            disabled={status === "sending"}
            style={{
              width: "100%", padding: 13, background: "var(--primary)", color: "#fff", border: "none",
              borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              opacity: status === "sending" ? 0.7 : 1,
            }}
          >
            {status === "sending" ? "Sending…" : "Send Message"} <Icon d={icons.send} size={16} />
          </button>

          {status === "success" && (
            <p style={{ textAlign: "center", fontSize: 12.5, color: "#1e7a34", marginTop: 12 }}>
              Thanks for reaching out — we'll get back to you soon.
            </p>
          )}
          {status === "error" && (
            <p style={{ textAlign: "center", fontSize: 12.5, color: "var(--accent)", marginTop: 12 }}>
              {errorMsg}
            </p>
          )}
        </form>
      </div>
    </PublicLayout>
  );
}

const inputStyle = {
  width: "100%", boxSizing: "border-box", padding: "10px 12px", border: "1px solid var(--border)",
  borderRadius: 8, fontSize: 13, background: "var(--background)", color: "var(--text-primary)",
  outline: "none", fontFamily: "var(--font-body)",
};
