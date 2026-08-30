import { Link } from "react-router-dom";
import PublicLayout from "../components/site/PublicLayout";
import { Icon, icons } from "../components/site/icons";

const values = [
  { icon: icons.shield, title: "Transparency", text: "Every complaint has a public status timeline, so citizens always know exactly where things stand." },
  { icon: icons.rocket, title: "Responsiveness", text: "Complaints are routed straight to the right department, cutting out the paperwork and the runaround." },
  { icon: icons.users, title: "Accountability", text: "Departments are measured on resolution time and citizen feedback, not just complaint counts." },
  { icon: icons.check, title: "Accessibility", text: "A simple, mobile-friendly interface anyone can use — no technical knowledge required." },
];

const milestones = [
  { year: "2024", text: "JanSewa was conceived as a digital front door between citizens and local government departments." },
  { year: "2025", text: "Piloted across 8 departments covering water, roads, sanitation, and electricity complaints." },
  { year: "2026", text: "Rebuilt on a modern, production-ready platform with real-time tracking and department accountability." },
];

export default function AboutPage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section style={{ textAlign: "center", marginBottom: 56 }}>
        <div style={{
          display: "inline-block", fontSize: 12, fontWeight: 700, color: "var(--primary)",
          background: "rgba(0,128,128,0.1)", padding: "6px 14px", borderRadius: 20, marginBottom: 16,
        }}>
          ABOUT JANSEWA
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 700, color: "var(--text-primary)", marginBottom: 14, lineHeight: 1.25 }}>
          Building a more responsive government, one complaint at a time
        </h1>
        <p style={{ fontSize: 15, color: "var(--text-secondary)", maxWidth: 680, margin: "0 auto", lineHeight: 1.7 }}>
          JanSewa is a Smart Public Service Complaint Management System that gives citizens a direct,
          transparent channel to report public service issues — and gives government departments the
          tools to resolve them faster.
        </p>
      </section>

      {/* Mission */}
      <section style={{
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "center",
        background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 32, marginBottom: 48,
      }} className="ls-grid-2">
        <div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Our Mission</h2>
          <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 12 }}>
            Too often, reporting a broken street light or a water leak means standing in line, filling out
            paper forms, and never hearing back. JanSewa replaces that with a single online platform where
            any citizen can submit a complaint in minutes, track it in real time, and hold the responsible
            department accountable.
          </p>
          <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7 }}>
            We believe local government works best when citizens and officials share the same information —
            so nothing gets lost, delayed, or forgotten.
          </p>
        </div>
        <div style={{
          background: "var(--background)", borderRadius: 12, padding: 24, border: "1px solid var(--border)",
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { label: "Departments onboarded", value: "24+" },
              { label: "Categories covered", value: "7" },
              { label: "Avg. first response", value: "< 48 hrs" },
            ].map((s) => (
              <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px dashed var(--border)", paddingBottom: 12 }}>
                <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{s.label}</span>
                <span style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "var(--primary)" }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, textAlign: "center", marginBottom: 28 }}>
          What We Stand For
        </h2>
        <div className="ls-grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18 }}>
          {values.map((v) => (
            <div key={v.title} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 20 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10, background: "rgba(0,128,128,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)", marginBottom: 12,
              }}>
                <Icon d={v.icon} size={20} />
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 700, marginBottom: 6 }}>{v.title}</div>
              <div style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.6 }}>{v.text}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, textAlign: "center", marginBottom: 28 }}>
          Our Journey
        </h2>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          {milestones.map((m, i) => (
            <div key={m.year} style={{ display: "flex", gap: 16 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{
                  width: 44, height: 44, borderRadius: "50%", background: "var(--primary)", color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0,
                }}>
                  {m.year}
                </div>
                {i < milestones.length - 1 && <div style={{ width: 2, flex: 1, background: "var(--border)", minHeight: 36 }} />}
              </div>
              <div style={{ paddingBottom: 28, paddingTop: 10 }}>
                <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6 }}>{m.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        background: "linear-gradient(135deg, var(--accent), var(--accent-light))", borderRadius: 16,
        padding: "36px 40px", display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: 20, boxShadow: "0 8px 32px rgba(0,128,128,0.25)",
      }}>
        <div>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 6 }}>
            Ready to raise your voice?
          </h3>
          <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.85)" }}>Join thousands of citizens already using JanSewa.</p>
        </div>
        <Link to="/register" style={{ background: "#fff", color: "var(--text-primary)", padding: "12px 26px", borderRadius: 10, fontWeight: 700, fontSize: 13.5, whiteSpace: "nowrap" }}>
          Get Started
        </Link>
      </section>
    </PublicLayout>
  );
}
