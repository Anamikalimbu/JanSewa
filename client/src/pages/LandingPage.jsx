import { useState, useEffect } from "react";

//  mini icon components 
const Icon = ({ d, size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const icons = {
  submit:     "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
  review:     "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
  resolved:   "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  water:      "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z",
  road:       "M3 12h18M3 6l9-3 9 3M3 18l9 3 9-3",
  electric:   "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  garbage:    "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
  parks:      "M12 22V12m0 0C12 7 7 4 7 4s0 5 5 8zm0 0c0-5 5-8 5-8s0 5-5 8z",
  streetlight:"M12 3v1m0 16v1M4.22 4.22l.707.707M19.07 4.22l-.707.707M3 12H2m20 0h-1M12 8a4 4 0 100 8 4 4 0 000-8z",
  health:     "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
  other:      "M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z",
  menu:       "M4 6h16M4 12h16M4 18h16",
  x:          "M6 18L18 6M6 6l12 12",
  arrow:      "M17 8l4 4m0 0l-4 4m4-4H3",
};

//  stat counter hook 
function useCountUp(target, duration = 1800) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setVal(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return val;
}

//  stat card 
function StatCard({ value, suffix = "", label, delay = 0, loading }) {
  const [active, setActive] = useState(false);
  useEffect(() => { const t = setTimeout(() => setActive(true), delay); return () => clearTimeout(t); }, [delay]);
  const count = useCountUp(active ? value : 0);
  return (
    <div style={{ flex: 1, textAlign: "center", padding: "18px 8px", borderRight: "1px solid var(--border)" }}>
      {loading ? (
        <div className="skeleton" style={{ width: 64, height: 28, margin: "0 auto" }} />
      ) : (
        <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, color: "var(--text-primary)", letterSpacing: -1 }}>
          {count.toLocaleString()}{suffix}
        </div>
      )}
      <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: loading ? 8 : 2, fontWeight: 500 }}>{label}</div>
    </div>
  );
}

//  department chip   
const depts = [
  { label: "Water Supply", icon: "water" },
  { label: "Roads",        icon: "road" },
  { label: "Electricity",  icon: "electric" },
  { label: "Garbage",      icon: "garbage" },
  { label: "Parks",        icon: "parks" },
  { label: "Street Lights",icon: "streetlight" },
  { label: "Health",       icon: "health" },
  { label: "Others",       icon: "other" },
];

//  main component 
export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [stats, setStats] = useState({ total: 0, resolved: 0, rate: 0, departments: 5 });
  const [loading, setLoading] = useState(true);
  const [hoveredDept, setHoveredDept] = useState(null);
  const [hoveredNav, setHoveredNav] = useState(null);

  // Fetch live stats from backend
  useEffect(() => {
    fetch("/api/complaints/stats")
      .then(r => r.json())
      .then(d => { if (d.success && d.data) setStats(d.data); })
      .catch(() => {}) // fallback to defaults
      .finally(() => setLoading(false));
  }, []);

  const navLinks = ["Home", "Services", "About Us", "Contact"];

  return (
    <div style={{ minHeight: "100vh", width: "100%", background: "var(--background)", color: "var(--text-primary)", fontFamily: "var(--font-body)" }}>

      {/*  NAVBAR  */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100, width: "100%",
        background: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border)",
        padding: "0 32px", height: 60, boxSizing: "border-box",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "linear-gradient(135deg, var(--primary), var(--secondary))",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ color: "var(--card)", fontWeight: 800, fontSize: 14, fontFamily: "var(--font-display)" }}>J</span>
          </div>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, color: "var(--text-primary)", letterSpacing: -0.3 }}>JanSewa</span>
        </div>

        {/* Desktop nav */}
        <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
          {navLinks.map(l => (
            <a key={l} href="#"
              onMouseEnter={() => setHoveredNav(l)}
              onMouseLeave={() => setHoveredNav(null)}
              style={{
                fontSize: 14, fontWeight: 500,
                color: hoveredNav === l ? "var(--primary)" : "var(--text-secondary)",
                transition: "color 0.15s",
              }}>{l}</a>
          ))}
          <a href="/login" style={{
            fontSize: 13, fontWeight: 600, padding: "7px 18px", borderRadius: 8,
            border: "1.5px solid var(--primary)", color: "var(--primary)",
            transition: "all 0.15s",
          }}>Login</a>
          <a href="/register" style={{
            fontSize: 13, fontWeight: 600, padding: "7px 18px", borderRadius: 8,
            background: "var(--primary)", color: "var(--card)",
            boxShadow: "0 1px 4px rgba(0,128,128,0.3)",
          }}>Register</a>
        </div>
      </nav>

      {/*  HERO  */}
      <section style={{
        width: "100%", boxSizing: "border-box",
        background: "linear-gradient(135deg, rgba(0,128,128,0.08) 0%, rgba(0,102,102,0.06) 50%, rgba(255,193,7,0.06) 100%)",
        padding: "80px 32px 60px",
        textAlign: "center",
        position: "relative", overflow: "hidden",
      }}>
        {/* decorative blobs */}
        <div style={{
          position: "absolute", top: -60, right: -60, width: 300, height: 300,
          borderRadius: "50%", background: "radial-gradient(circle, rgba(77,182,182,0.18), transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: -40, left: -40, width: 240, height: 240,
          borderRadius: "50%", background: "radial-gradient(circle, rgba(255,193,7,0.14), transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative", maxWidth: 680, margin: "0 auto" }}>
          {/* badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "var(--accent-light)", borderRadius: 20, padding: "4px 14px",
            fontSize: 12, fontWeight: 600, color: "var(--primary)", marginBottom: 20,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--primary-Light)", display: "inline-block" }} />
            AI-Powered Public Service Platform for Nepal
          </div>

          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: 48, fontWeight: 800, color: "var(--text-primary)",
            lineHeight: 1.1, letterSpacing: -1.5, marginBottom: 16,
          }}>
            We're Here to{" "}
            <span style={{ color: "var(--primary)" }}>Solve Together</span>
          </h1>

          <p style={{ fontSize: 17, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 32, maxWidth: 480, margin: "0 auto 32px" }}>
            Report public service issues, track progress in real time, and help build a better Nepal one complaint at a time.
          </p>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/submit" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "var(--primary)", color: "var(--card)",
              padding: "13px 28px", borderRadius: 10, fontWeight: 600, fontSize: 15,
              boxShadow: "0 4px 14px rgba(0,128,128,0.4)",
              transition: "transform 0.15s",
            }}>
              Submit Complaint
              <Icon d={icons.arrow} size={18} />
            </a>
            <a href="/track" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "var(--card)", color: "var(--text-primary)",
              padding: "13px 28px", borderRadius: 10, fontWeight: 600, fontSize: 15,
              border: "1.5px solid var(--border)",
            }}>
              Track Complaint
            </a>
          </div>
        </div>
      </section>

      {/*  STATS  */}
      <section style={{
        background: "var(--card)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)",
        width: "100%", boxSizing: "border-box", padding: "0 32px",
      }}>
        <div style={{ display: "flex", width: "100%" }}>
          <StatCard value={stats.total}       label="Total Complaints"  delay={0}   loading={loading} />
          <StatCard value={stats.resolved}    label="Resolved"          delay={150} loading={loading} />
          <StatCard value={stats.rate} suffix="%" label="Resolution Rate" delay={300} loading={loading} />
          <div style={{ flex: 1, textAlign: "center", padding: "18px 8px" }}>
            {loading ? (
              <div className="skeleton" style={{ width: 64, height: 28, margin: "0 auto" }} />
            ) : (
              <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, color: "var(--text-primary)", letterSpacing: -1 }}>{stats.departments}</div>
            )}
            <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: loading ? 8 : 2, fontWeight: 500 }}>Departments</div>
          </div>
        </div>
      </section>

      {/*  MAIN BODY  */}
      <main style={{ width: "100%", boxSizing: "border-box", margin: 0, padding: "0 32px 48px" }}>

        {/*  HOW IT WORKS  */}
        <div style={{ textAlign: "center", marginTop: 52, marginBottom: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "var(--primary)", textTransform: "uppercase" }}>Process</span>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700, color: "var(--text-primary)", marginTop: 6, letterSpacing: -0.5 }}>How It Works</h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 48, width: "100%" }}>
          {[
            { step: "01", icon: icons.submit,   title: "Submit Complaint",    desc: "Fill the form with issue details, photos, and your location." },
            { step: "02", icon: icons.review,   title: "Department Review",   desc: "AI categorises and routes your complaint to the right department." },
            { step: "03", icon: icons.resolved, title: "Get It Resolved",     desc: "Track progress and get notified when your issue is fixed." },
          ].map(({ step, icon, title, desc }) => (
            <div key={step} style={{
              background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14,
              padding: "24px 20px", textAlign: "center", width: "100%", boxSizing: "border-box",
              boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
              transition: "box-shadow 0.2s, transform 0.2s",
            }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,128,128,0.15)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.05)"; e.currentTarget.style.transform = "none"; }}
            >
              <div style={{
                width: 52, height: 52, borderRadius: 12,
                background: "linear-gradient(135deg, rgba(0,128,128,0.14), rgba(0,102,102,0.06))",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 12px", color: "var(--primary)",
              }}>
                <Icon d={icon} size={24} />
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: 1.5, marginBottom: 6 }}>STEP {step}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>{title}</div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>{desc}</div>
            </div>
          ))}
        </div>

        {/*  DEPARTMENTS  */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "var(--primary)", textTransform: "uppercase" }}>Coverage</span>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700, color: "var(--text-primary)", marginTop: 6, letterSpacing: -0.5 }}>Departments</h2>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 6 }}>Report issues across all public service departments</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 52, width: "100%" }}>
          {depts.map(({ label, icon }) => (
            <div key={label}
              onMouseEnter={() => setHoveredDept(label)}
              onMouseLeave={() => setHoveredDept(null)}
              style={{
                background: hoveredDept === label ? "rgba(0,128,128,0.08)" : "var(--card)",
                border: `1.5px solid ${hoveredDept === label ? "var(--primary-Light)" : "var(--border)"}`,
                borderRadius: 12, padding: "16px 10px", textAlign: "center", width: "100%", boxSizing: "border-box",
                cursor: "pointer", transition: "all 0.15s",
                color: hoveredDept === label ? "var(--primary)" : "var(--text-secondary)",
              }}
            >
              <div style={{ marginBottom: 8, color: "inherit", display: "flex", justifyContent: "center" }}>
                <Icon d={icons[icon]} size={22} />
              </div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{label}</div>
            </div>
          ))}
        </div>

        {/*  CTA BANNER  */}
        <div style={{
          background: "linear-gradient(135deg, var(--accent), var(--accent-light))",
          borderRadius: 16, padding: "36px 40px", width: "100%", boxSizing: "border-box",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: 20,
          boxShadow: "0 8px 32px rgba(0,128,128,0.35)",
        }}>
          <div>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--card)", marginBottom: 6 }}>
              Have an issue to report?
            </h3>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.8)" }}>
              Join thousands of citizens making Nepal's public services better.
            </p>
          </div>
          <a href="/register" style={{
            background: "var(--card)", color: "var(--text-primary)",
            padding: "12px 28px", borderRadius: 10, fontWeight: 700, fontSize: 14,
            whiteSpace: "nowrap",
          }}>
            Get Started Free
          </a>
        </div>
      </main>

      {/*  FOOTER  */}
      <footer style={{
        background: "var(--card)", borderTop: "1px solid var(--border)",
        padding: "20px 32px", width: "100%", boxSizing: "border-box",
        display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 26, height: 26, borderRadius: 6,
            background: "linear-gradient(135deg, var(--primary), var(--secondary))",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ color: "var(--card)", fontWeight: 800, fontSize: 11, fontFamily: "var(--font-display)" }}>J</span>
          </div>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>JanSewa</span>
        </div>
        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
          © 2025 JanSewa &nbsp;·&nbsp; Privacy Policy &nbsp;·&nbsp; Terms of Service
        </div>
      </footer>
    </div>
  );
}