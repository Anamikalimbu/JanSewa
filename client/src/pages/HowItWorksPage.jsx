import { Link } from "react-router-dom";
import PublicLayout from "../components/site/PublicLayout";
import { Icon, icons } from "../components/site/icons";

const steps = [
  {
    step: "01",
    icon: icons.users,
    title: "Create an account",
    text: "Register with your name, email, and phone number. It takes less than a minute and there's no paperwork.",
  },
  {
    step: "02",
    icon: icons.submit,
    title: "Submit your complaint",
    text: "Choose a category and sub-category, describe the issue, add your location, and attach up to 5 photos as evidence.",
  },
  {
    step: "03",
    icon: icons.building,
    title: "It's routed to the right department",
    text: "An administrator reviews and assigns your complaint to the department responsible — Water, Roads, Electricity, and more.",
  },
  {
    step: "04",
    icon: icons.review,
    title: "Department takes action",
    text: "Assigned staff update the status as work progresses — Assigned → In Progress — with notes visible to you at every step.",
  },
  {
    step: "05",
    icon: icons.check,
    title: "Resolution & feedback",
    text: "Once resolved, you're notified immediately and can rate how the complaint was handled, helping departments improve.",
  },
];

const faqShortcuts = [
  { q: "How long does resolution take?", a: "It varies by category and priority, but most departments target under 7 days for standard-priority complaints." },
  { q: "Can I track multiple complaints?", a: "Yes — your dashboard lists every complaint you've filed with live status updates." },
  { q: "What if nothing happens?", a: "You can report an issue on any complaint to flag it for direct admin review." },
];

export default function HowItWorksPage() {
  return (
    <PublicLayout>
      <section style={{ textAlign: "center", marginBottom: 52 }}>
        <div style={{
          display: "inline-block", fontSize: 12, fontWeight: 700, color: "var(--primary)",
          background: "rgba(0,128,128,0.1)", padding: "6px 14px", borderRadius: 20, marginBottom: 16,
        }}>
          HOW IT WORKS
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 34, fontWeight: 700, marginBottom: 14, lineHeight: 1.25 }}>
          From reporting an issue to getting it resolved
        </h1>
        <p style={{ fontSize: 15, color: "var(--text-secondary)", maxWidth: 620, margin: "0 auto", lineHeight: 1.7 }}>
          Five simple steps connect you directly to the department that can actually fix the problem.
        </p>
      </section>

      <section style={{ maxWidth: 720, margin: "0 auto 56px" }}>
        {steps.map((s, i) => (
          <div key={s.step} style={{ display: "flex", gap: 20 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
              <div style={{
                width: 56, height: 56, borderRadius: 16, background: "var(--card)", border: "2px solid var(--primary)",
                display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)",
              }}>
                <Icon d={s.icon} size={24} />
              </div>
              {i < steps.length - 1 && <div style={{ width: 2, flex: 1, background: "var(--border)", minHeight: 40 }} />}
            </div>
            <div style={{ paddingBottom: 36, paddingTop: 6 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--primary)", letterSpacing: 1, marginBottom: 4 }}>STEP {s.step}</div>
              <div style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>{s.title}</div>
              <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, maxWidth: 520 }}>{s.text}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Quick FAQs */}
      <section style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 32, marginBottom: 40 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 700 }}>Quick Questions</h2>
          <Link to="/faqs" style={{ fontSize: 13, fontWeight: 700, color: "var(--primary)", display: "inline-flex", alignItems: "center", gap: 6 }}>
            View all FAQs <Icon d={icons.chevronRight} size={14} />
          </Link>
        </div>
        <div className="ls-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {faqShortcuts.map((f) => (
            <div key={f.q}>
              <div style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 6 }}>{f.q}</div>
              <div style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.6 }}>{f.a}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ textAlign: "center" }}>
        <Link to="/register" style={{
          display: "inline-flex", alignItems: "center", gap: 8, background: "var(--primary)", color: "#fff",
          padding: "13px 30px", borderRadius: 10, fontWeight: 700, fontSize: 14, boxShadow: "0 4px 16px rgba(0,128,128,0.3)",
        }}>
          File Your First Complaint <Icon d={icons.arrow} size={16} />
        </Link>
      </section>
    </PublicLayout>
  );
}
