import { useState, useEffect, useRef } from "react";

//  mini icon 
const Icon = ({ d, size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const icons = {
  submit:      "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
  review:      "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
  resolved:    "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  water:       "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z",
  road:        "M3 12h18M3 6l9-3 9 3M3 18l9 3 9-3",
  electric:    "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  garbage:     "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
  parks:       "M12 22V12m0 0C12 7 7 4 7 4s0 5 5 8zm0 0c0-5 5-8 5-8s0 5-5 8z",
  streetlight: "M12 3v1m0 16v1M4.22 4.22l.707.707M19.07 4.22l-.707.707M3 12H2m20 0h-1M12 8a4 4 0 100 8 4 4 0 000-8z",
  health:      "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
  other:       "M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z",
  arrow:       "M17 8l4 4m0 0l-4 4m4-4H3",
  brain:       "M9.5 2a2.5 2.5 0 100 5 2.5 2.5 0 000-5zM14.5 2a2.5 2.5 0 100 5 2.5 2.5 0 000-5zM4 9a4 4 0 014-4h8a4 4 0 014 4v2a4 4 0 01-4 4H8a4 4 0 01-4-4V9z",
  pin:         "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z",
  bell:        "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
  chart:       "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  users:       "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
  doc:         "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  eye:         "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
  rocket:      "M15.05 5A5 5 0 0119 8.95M15.05 5A5 5 0 0120 12v1.5M15.05 5H9a7 7 0 000 14h1.5M9 3H7.5A1.5 1.5 0 006 4.5v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  shield:      "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  access:      "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
  mail:        "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  phone:       "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
  github:      "M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22",
  send:        "M12 19l9 2-9-18-9 18 9-2zm0 0v-8",
  facebook:    "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3V2z",
  twitter:     "M18 6L6 18M6 6l12 12",
  chat:        "M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z",
  globe:       "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z",
  sms:         "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z",
  building:    "M5 21V7l7-4 7 4v14M3 21h18M9 9h.01M9 13h.01M9 17h.01M15 9h.01M15 13h.01M15 17h.01",
  clock:       "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
};

//  animated counter 
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
  useEffect(() => {
    const t = setTimeout(() => setActive(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
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

//  section heading helper 
function SectionHeading({ label, title, sub, style = {} }) {
  return (
    <div style={{ textAlign: "center", marginBottom: 28, ...style }}>
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "var(--primary)", textTransform: "uppercase" }}>{label}</span>
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700, color: "var(--text-primary)", marginTop: 6, letterSpacing: -0.5 }}>{title}</h2>
      {sub && <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 6 }}>{sub}</p>}
    </div>
  );
}

//  data 
const depts = [
  { label: "Water Supply",  icon: "water" },
  { label: "Roads",         icon: "road" },
  { label: "Electricity",   icon: "electric" },
  { label: "Garbage",       icon: "garbage" },
  { label: "Parks",         icon: "parks" },
  { label: "Street Lights", icon: "streetlight" },
  { label: "Health",        icon: "health" },
  { label: "Others",        icon: "other" },
];

const services = [
  { icon: "doc",     title: "Complaint Submission",      tag: "Core Feature", desc: "Submit detailed reports with photo evidence, GPS location, and category selection. Our form is fast and accessible on any device." },
  { icon: "brain",   title: "AI-Powered Categorisation", tag: "AI Feature",   desc: "Our AI model automatically classifies complaints, identifies urgency, and routes them to the correct department no manual sorting delays." },
  { icon: "pin",     title: "Real-Time Tracking",        tag: "Transparency", desc: "Follow your complaint's journey from submission to resolution with a live status timeline. Know exactly where things stand at every step." },
  { icon: "bell",    title: "Smart Notifications",       tag: "Alerts",       desc: "Receive email and in-app alerts whenever your complaint status changes, a department responds, or your issue is marked resolved." },
  { icon: "chart",   title: "Public Dashboard",          tag: "Open Data",    desc: "Explore city-wide complaint trends, department performance metrics, and resolution rates fully transparent and open to every citizen." },
  { icon: "users",   title: "Department Portal",         tag: "Admin",        desc: "Staff and admins get a dedicated portal to manage and resolve assigned complaints with role-based access control and audit logs." },
];

const values = [
  { icon: "eye",    title: "Transparency",   desc: "All complaint data and resolution stats are publicly visible." },
  { icon: "rocket", title: "Speed",          desc: "AI routing eliminates delays in getting issues to the right team." },
  { icon: "shield", title: "Accountability", desc: "Departments are tracked and rated on resolution performance." },
  { icon: "access", title: "Accessibility",  desc: "Designed for every citizen works on any device, any connection." },
];

const team = [
  { initials: "AL", name: "Anamika Limbu",  role: "Full-Stack Developer",         bg: "rgba(0,128,128,0.12)", color: "#006666" },
  { initials: "DB", name: "Divya Bhandari", role: "Full-Stack Developer & Project Lead", bg: "rgba(255,193,7,0.15)", color: "#a07000" },
];

const channels = [
  { icon: "globe",    label: "Online",   value: "jansewa.gov.np",      href: "/register" },
  { icon: "facebook", label: "Facebook", value: "@jansewa.np",         href: "https://www.facebook.com/" },
  { icon: "twitter",  label: "X",        value: "@jansewa_np",         href: "https://x.com/" },
  { icon: "phone",    label: "Phone",    value: "1111",                href: "tel:1111" },
  { icon: "sms",      label: "SMS",      value: "+977-98XXXXXXXX",     href: "sms:+97798XXXXXXXX" },
  { icon: "chat",     label: "WhatsApp", value: "+977-98XXXXXXXX",     href: "https://wa.me/" },
];

const complaintStats = [
  { key: "total",      label: "Total Complaints", desc: "A complaint has been registered on the portal.",                 icon: "doc" },
  { key: "seen",        label: "Seen",             desc: "The relevant department has reviewed the complaint.",           icon: "eye" },
  { key: "processing",  label: "Processing",       desc: "The relevant department is investigating the complaint.",      icon: "chart" },
  { key: "unseen",      label: "Unseen",           desc: "The relevant department has not yet addressed the complaint.", icon: "bell" },
  { key: "solved",      label: "Solved",           desc: "The complaint has been resolved by the office.",                icon: "resolved" },
  { key: "closed",      label: "Closed",           desc: "The relevant authority has closed the complaint.",              icon: "shield" },
];

const topOffices = [
  { name: "Ward Office, Itahari-3",              count: 0 },
  { name: "Water Supply & Sanitation Office",     count: 0 },
  { name: "Roads Division Office, Sunsari",       count: 0 },
  { name: "Nepal Electricity Authority, Itahari", count: 0 },
  { name: "District Health Office, Sunsari",      count: 0 },
];

const contactItems = [
  { icon: "mail",   title: "Email",   lines: ["hello@jansewa.gov.np", "support@jansewa.gov.np"] },
  { icon: "phone",  title: "Phone",   lines: ["+977-1-4XXXXXX (Office)", "Mon-Fri, 10 am - 5 pm NST"] },
  { icon: "pin",    title: "Address", lines: ["Itahari, Sunsari District", "Koshi Province, Nepal"] },
  { icon: "github", title: "GitHub",  lines: ["https://github.com/Divya-Bhandari/JanSewa"] },
];

export default function LandingPage() {
  const [menuOpen,     setMenuOpen]    = useState(false);
  const [hoveredDept,  setHoveredDept] = useState(null);
  const [hoveredNav,   setHoveredNav]  = useState(null);
  const [hoveredSvc,   setHoveredSvc]  = useState(null);
  const [stats,        setStats]       = useState({
    total: 0, seen: 0, processing: 0, unseen: 0, solved: 0, closed: 0, departments: 8,
  });
  const [loading,      setLoading]     = useState(false);

  // contact form state
  const [form,       setForm]       = useState({ name: "", email: "", subject: "", message: "" });
  const [formStatus, setFormStatus] = useState(null); // null | "success" | "error"

  const navLinks = [
    { label: "Home",     href: "#home" },
    { label: "Services", href: "#services" },
    { label: "About Us", href: "#about" },
    { label: "Contact",  href: "#contact" },
  ];

  const handleFormChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setFormStatus("error");
      return;
    }
    setFormStatus("success");
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  const scrollTo = (href) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div style={{
      minHeight: "100vh",
      width: "100%",
      background: "var(--background)",
      color: "var(--text-primary)",
      fontFamily: "var(--font-body)",
    }}>

      {/*  TOP UTILITY BAR  */}
      <div style={{
        width: "100%", boxSizing: "border-box", background: "var(--secondary)",
        color: "rgba(255,255,255,0.9)", fontSize: 12, padding: "6px 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <a href="https://www.facebook.com/" style={{ display: "flex", alignItems: "center", color: "inherit" }} aria-label="Facebook">
            <Icon d={icons.facebook} size={14} />
          </a>
          <a href="https://x.com/" style={{ display: "flex", alignItems: "center", color: "inherit" }} aria-label="X">
            <Icon d={icons.twitter} size={14} />
          </a>
          <a href="tel:1111" style={{ display: "flex", alignItems: "center", gap: 5, color: "inherit" }}>
            <Icon d={icons.phone} size={13} /> 1111
          </a>
          <a href="mailto:support@jansewa.gov.np" style={{ display: "flex", alignItems: "center", gap: 5, color: "inherit" }}>
            <Icon d={icons.mail} size={13} /> support@jansewa.gov.np
          </a>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 600 }}>
          <span style={{ opacity: 0.65, cursor: "pointer" }}>नेपाली</span>
          <span style={{ opacity: 0.4 }}>|</span>
          <span style={{ cursor: "pointer" }}>English</span>
        </div>
      </div>

      {/*  INSTITUTIONAL HEADER  */}
      <div style={{
        width: "100%", boxSizing: "border-box", background: "var(--card)",
        borderBottom: "1px solid var(--border)", padding: "16px 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 52, height: 52, borderRadius: "50%",
            background: "linear-gradient(135deg, var(--primary), var(--secondary))",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <span style={{ color: "#fff", fontWeight: 800, fontSize: 20, fontFamily: "var(--font-display)" }}>J</span>
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, color: "var(--text-primary)" }}>
              Local Government of Itahari
            </div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>Municipal Complaint &amp; Grievance Portal</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Itahari, Sunsari District, Koshi Province, Nepal</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: "linear-gradient(135deg, var(--accent), var(--accent-light))",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ color: "#fff", fontWeight: 800, fontSize: 15, fontFamily: "var(--font-display)" }}>JS</span>
          </div>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22, color: "var(--text-primary)", letterSpacing: -0.5 }}>
            JanSewa
          </span>
        </div>
      </div>

      {/*  NAVBAR  */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100, width: "100%",
        background: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border)",
        padding: "0 32px", height: 56, boxSizing: "border-box",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: "linear-gradient(135deg, var(--primary), var(--secondary))",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ color: "#fff", fontWeight: 800, fontSize: 13, fontFamily: "var(--font-display)" }}>J</span>
          </div>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--text-primary)", letterSpacing: -0.3 }}>
            JanSewa
          </span>
        </div>

        {/* Desktop nav */}
        <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
          {navLinks.map(({ label, href }) => (
            <a key={label} href={href}
              onClick={e => { e.preventDefault(); scrollTo(href); }}
              onMouseEnter={() => setHoveredNav(label)}
              onMouseLeave={() => setHoveredNav(null)}
              style={{
                fontSize: 14, fontWeight: 500, cursor: "pointer",
                color: hoveredNav === label ? "var(--primary)" : "var(--text-secondary)",
                transition: "color 0.15s",
              }}>{label}</a>
          ))}
          <a href="/login" style={{
            fontSize: 13, fontWeight: 600, padding: "7px 18px", borderRadius: 8,
            border: "1.5px solid var(--primary)", color: "var(--primary)", transition: "all 0.15s",
          }}>Login</a>
          <a href="/register" style={{
            fontSize: 13, fontWeight: 600, padding: "7px 18px", borderRadius: 8,
            background: "var(--primary)", color: "#fff",
            boxShadow: "0 1px 4px rgba(0,128,128,0.3)",
          }}>Register</a>
        </div>
      </nav>

      {/*  HERO  */}
      <section id="home" style={{
        width: "100%", boxSizing: "border-box",
        background: "linear-gradient(135deg, rgba(0,128,128,0.08) 0%, rgba(0,102,102,0.06) 50%, rgba(255,193,7,0.06) 100%)",
        padding: "80px 32px 60px", textAlign: "center", position: "relative", overflow: "hidden",
      }}>
        {/* decorative blobs */}
        <div style={{ position: "absolute", top: -60, right: -60, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(77,182,182,0.18), transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -40, left: -40, width: 240, height: 240, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,193,7,0.14), transparent 70%)", pointerEvents: "none" }} />

        <div style={{ position: "relative", maxWidth: 680, margin: "0 auto" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "rgba(0,128,128,0.08)", borderRadius: 20, padding: "4px 14px",
            fontSize: 12, fontWeight: 600, color: "var(--primary)", marginBottom: 20,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--primary-Light)", display: "inline-block" }} />
            AI-Powered Public Service Platform for Nepal
          </div>

          <h1 style={{
            fontFamily: "var(--font-display)", fontSize: 38, fontWeight: 800,
            color: "var(--text-primary)", lineHeight: 1.25, letterSpacing: -0.8, marginBottom: 16,
            maxWidth: 640, margin: "0 auto 16px",
          }}>
            Do you have any inquiries, complaints, or suggestions regarding public services?{" "}
            <span style={{ color: "var(--primary)" }}>Share it with JanSewa — we're ready to help.</span>
          </h1>

          <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 32, maxWidth: 480, margin: "0 auto 32px" }}>
            Let us know — we're here to resolve it. Every complaint is reviewed, routed to the responsible office, and tracked until it's closed.
          </p>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/submit" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "var(--primary)", color: "#fff",
              padding: "13px 28px", borderRadius: 10, fontWeight: 600, fontSize: 15,
              boxShadow: "0 4px 14px rgba(0,128,128,0.4)", transition: "transform 0.15s",
            }}>
              Submit Complaint <Icon d={icons.arrow} size={18} />
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

      {/*  CHANNELS AVAILABLE FOR COMPLAINTS  */}
      <section style={{
        width: "100%", boxSizing: "border-box", padding: "36px 32px",
        background: "var(--background)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)",
      }}>
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "var(--primary)", textTransform: "uppercase" }}>
            Reach Us Anywhere
          </span>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--text-primary)", marginTop: 6 }}>
            Channels Available for Complaints
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 12 }}>
          {channels.map(({ icon, label, value, href }) => (
            <a key={label} href={href} style={{
              background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12,
              padding: "16px 8px", textAlign: "center", boxSizing: "border-box",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
              transition: "box-shadow 0.15s, transform 0.15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,128,128,0.14)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: "50%",
                background: "rgba(0,128,128,0.1)", display: "flex", alignItems: "center",
                justifyContent: "center", color: "var(--primary)",
              }}>
                <Icon d={icons[icon]} size={20} />
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>{label}</div>
              <div style={{ fontSize: 10, color: "var(--text-secondary)", wordBreak: "break-word" }}>{value}</div>
            </a>
          ))}
        </div>
      </section>

      {/*  STATS  */}
      <section style={{
        background: "var(--card)", borderBottom: "1px solid var(--border)",
        width: "100%", boxSizing: "border-box", padding: "36px 32px",
      }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "var(--primary)", textTransform: "uppercase" }}>
            Transparency
          </span>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--text-primary)", marginTop: 6 }}>
            Latest Status of Complaints
          </h2>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 6 }}>
            Your complaints, our commitment — stay updated on how issues are being addressed.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 12 }}>
          {complaintStats.map(({ key, label, desc, icon }) => (
            <div key={key} style={{
              border: "1px solid var(--border)", borderRadius: 12, padding: "16px 12px",
              textAlign: "center", boxSizing: "border-box",
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10, margin: "0 auto 10px",
                background: "rgba(0,128,128,0.1)", display: "flex", alignItems: "center",
                justifyContent: "center", color: "var(--primary)",
              }}>
                <Icon d={icons[icon]} size={18} />
              </div>
              {loading ? (
                <div className="skeleton" style={{ width: 44, height: 22, margin: "0 auto" }} />
              ) : (
                <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--text-primary)" }}>
                  {stats[key].toLocaleString()}
                  {key !== "total" && (
                    <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-secondary)" }}>
                      {" "}({stats.total ? Math.round((stats[key] / stats.total) * 100) : 0}%)
                    </span>
                  )}
                </div>
              )}
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", marginTop: 6 }}>{label}</div>
              <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 4, lineHeight: 1.4 }}>{desc}</div>
            </div>
          ))}
        </div>
      </section>

      <main style={{ width: "100%", boxSizing: "border-box", padding: "0 32px 48px" }}>

        {/*  HOW IT WORKS  */}
        <div style={{ marginTop: 52, marginBottom: 28 }}>
          <SectionHeading label="Process" title="How It Works" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 52 }}>
          {[
            { step: "01", icon: icons.submit,   title: "Submit Complaint",  desc: "Fill the form with issue details, photos, and your location." },
            { step: "02", icon: icons.review,   title: "Department Review", desc: "AI categorises and routes your complaint to the right department." },
            { step: "03", icon: icons.resolved, title: "Get It Resolved",   desc: "Track progress and get notified when your issue is fixed." },
          ].map(({ step, icon, title, desc }) => (
            <div key={step} style={{
              background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14,
              padding: "24px 20px", textAlign: "center", boxSizing: "border-box",
              boxShadow: "0 1px 4px rgba(0,0,0,0.05)", transition: "box-shadow 0.2s, transform 0.2s",
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
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", letterSpacing: 1.5, marginBottom: 6 }}>STEP {step}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>{title}</div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>{desc}</div>
            </div>
          ))}
        </div>

        {/*  DEPARTMENTS  */}
        <SectionHeading label="Coverage" title="Departments" sub="Report issues across all public service departments" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 52 }}>
          {depts.map(({ label, icon }) => (
            <div key={label}
              onMouseEnter={() => setHoveredDept(label)}
              onMouseLeave={() => setHoveredDept(null)}
              style={{
                background: hoveredDept === label ? "rgba(0,128,128,0.08)" : "var(--card)",
                border: hoveredDept === label ? "1.5px solid var(--primary-Light)" : "1.5px solid var(--border)",
                borderRadius: 12, padding: "16px 10px", textAlign: "center",
                cursor: "pointer", transition: "all 0.15s",
                color: hoveredDept === label ? "var(--primary)" : "var(--text-secondary)",
                boxSizing: "border-box",
              }}
            >
              <div style={{ marginBottom: 8, display: "flex", justifyContent: "center" }}>
                <Icon d={icons[icon]} size={22} />
              </div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{label}</div>
            </div>
          ))}
        </div>

        {/*  OFFICES WITH MOST COMPLAINTS  */}
        <SectionHeading
          label="Accountability"
          title="Offices with the Most Complaints Received"
          sub="Monitoring the offices with the most complaints to improve service and transparency"
        />
        <div style={{
          background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14,
          padding: "8px 20px", marginBottom: 52, boxSizing: "border-box",
        }}>
          {topOffices.map(({ name, count }, i) => (
            <div key={name} style={{
              display: "flex", alignItems: "center", gap: 14, padding: "14px 0",
              borderBottom: i < topOffices.length - 1 ? "1px solid var(--border)" : "none",
            }}>
              <div style={{
                width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                background: "rgba(0,128,128,0.1)", display: "flex", alignItems: "center",
                justifyContent: "center", color: "var(--primary)",
              }}>
                <Icon d={icons.building} size={17} />
              </div>
              <div style={{ flex: 1, textAlign: "left", fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                {name}
              </div>
              {loading ? (
                <div className="skeleton" style={{ width: 32, height: 16 }} />
              ) : (
                <div style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, color: "var(--primary)" }}>
                  {count}
                </div>
              )}
            </div>
          ))}
        </div>

        {/*  SERVICES  */}
        <section id="services" style={{ paddingTop: 8 }}>
          <SectionHeading
            label="What We Offer"
            title="Our Services"
            sub="Everything you need to make your voice heard and track change"
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 52 }}>
            {services.map(({ icon, title, tag, desc }) => (
              <div key={title}
                onMouseEnter={() => setHoveredSvc(title)}
                onMouseLeave={() => setHoveredSvc(null)}
                style={{
                  background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14,
                  padding: "22px 18px", textAlign: "left", boxSizing: "border-box",
                  boxShadow: hoveredSvc === title ? "0 8px 24px rgba(0,128,128,0.14)" : "0 1px 4px rgba(0,0,0,0.05)",
                  transform: hoveredSvc === title ? "translateY(-2px)" : "none",
                  transition: "box-shadow 0.2s, transform 0.2s",
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 10,
                  background: "rgba(0,128,128,0.1)", display: "flex", alignItems: "center",
                  justifyContent: "center", color: "var(--primary)", marginBottom: 12,
                }}>
                  <Icon d={icons[icon]} size={22} />
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>{title}</div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.55, marginBottom: 12 }}>{desc}</div>
                <span style={{
                  display: "inline-block", background: "rgba(0,128,128,0.1)", color: "var(--secondary)",
                  fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, letterSpacing: 0.5,
                }}>{tag}</span>
              </div>
            ))}
          </div>
        </section>

        {/*  ABOUT US  */}
        <section id="about" style={{ paddingTop: 8 }}>
          <SectionHeading label="Who We Are" title="About JanSewa" />

          {/* mission + values */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 36, marginBottom: 44, alignItems: "start" }}>
            {/* left: narrative */}
            <div style={{ textAlign: "left" }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--text-primary)", marginBottom: 14, letterSpacing: -0.5 }}>
                Built for Nepal's Citizens
              </h3>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 12 }}>
                <strong>JanSewa</strong> (जनसेवा) meaning "public service" is an AI-powered complaint management platform designed to bridge the gap between Nepal's citizens and local government departments.
              </p>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 12 }}>
                We believe every person deserves to have their voice heard. Whether it's a broken streetlight, a pothole-ridden road, or a water supply failure, JanSewa ensures your complaint reaches the right hands, fast.
              </p>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 16 }}>
                Built as part of the <strong>Learning</strong> initiative, this is a civic tech project developed by students committed to making public services more accountable and transparent.
              </p>
              <a href="#contact"
                onClick={e => { e.preventDefault(); scrollTo("#contact"); }}
                style={{ color: "var(--primary)", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
                Get in touch →
              </a>
            </div>

            {/* right: values grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {values.map(({ icon, title, desc }) => (
                <div key={title} style={{
                  background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12,
                  padding: "16px", textAlign: "left", boxSizing: "border-box",
                }}>
                  <div style={{ color: "var(--primary)", marginBottom: 8 }}>
                    <Icon d={icons[icon]} size={20} />
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>{title}</div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* team */}
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "var(--primary)", textTransform: "uppercase" }}>The Team</span>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--text-primary)", marginTop: 6, letterSpacing: -0.4 }}>
              Meet the Builders
            </h3>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 52 }}>
            {team.map(({ initials, name, role, bg, color }) => (
              <div key={name} style={{
                background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14,
                padding: "22px 14px", textAlign: "center", boxSizing: "border-box",
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: "50%", background: bg,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 10px", fontSize: 16, fontWeight: 700, color,
                }}>{initials}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>{name}</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{role}</div>
              </div>
            ))}
          </div>
        </section>

        {/*  CONTACT  */}
        <section id="contact" style={{ paddingTop: 8 }}>
          <SectionHeading
            label="Get In Touch"
            title="Contact Us"
            sub="Have questions, feedback, or want to collaborate? We'd love to hear from you."
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, marginBottom: 52 }}>
            {/* contact info */}
            <div style={{ textAlign: "left" }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "var(--text-primary)", marginBottom: 10 }}>Let's Talk</h3>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.65, marginBottom: 20 }}>
                Whether you're a citizen, a government partner, or a fellow developer reach out and let's work together on making Nepal's public services better.
              </p>
              {contactItems.map(({ icon, title, lines }) => (
                <div key={title} style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 16 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 9, background: "rgba(0,128,128,0.1)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "var(--primary)", flexShrink: 0,
                  }}>
                    <Icon d={icons[icon]} size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 2 }}>{title}</div>
                    {lines.map(l => (
                      <div key={l} style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>{l}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* contact form */}
            <div style={{
              background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14,
              padding: "24px", boxSizing: "border-box",
            }}>
              <form onSubmit={handleFormSubmit} noValidate>
                {/* name + email row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                  {[
                    { name: "name",  label: "Your name",     type: "text",  placeholder: "Divya Bhandari" },
                    { name: "email", label: "Email address", type: "email", placeholder: "divya@gmail.com" },
                  ].map(f => (
                    <div key={f.name}>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
                        {f.label}
                      </label>
                      <input
                        type={f.type} name={f.name} value={form[f.name]}
                        onChange={handleFormChange} placeholder={f.placeholder}
                        style={{
                          width: "100%", padding: "9px 12px", border: "1px solid var(--border)",
                          borderRadius: 8, fontSize: 13, background: "var(--background)",
                          color: "var(--text-primary)", outline: "none", boxSizing: "border-box",
                          fontFamily: "var(--font-body)",
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* subject */}
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>Subject</label>
                  <select name="subject" value={form.subject} onChange={handleFormChange}
                    style={{
                      width: "100%", padding: "9px 12px", border: "1px solid var(--border)",
                      borderRadius: 8, fontSize: 13, background: "var(--background)",
                      color: "var(--text-primary)", outline: "none", boxSizing: "border-box",
                      fontFamily: "var(--font-body)",
                    }}>
                    <option value="">Select a topic</option>
                    <option>General Inquiry</option>
                    <option>Partnership / Collaboration</option>
                    <option>Report a Bug</option>
                    <option>Feedback</option>
                    <option>Press / Media</option>
                  </select>
                </div>

                {/* message */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>Message</label>
                  <textarea name="message" value={form.message} onChange={handleFormChange}
                    placeholder="Tell us how we can help..."
                    rows={4}
                    style={{
                      width: "100%", padding: "9px 12px", border: "1px solid var(--border)",
                      borderRadius: 8, fontSize: 13, background: "var(--background)",
                      color: "var(--text-primary)", outline: "none", resize: "vertical",
                      boxSizing: "border-box", fontFamily: "var(--font-body)",
                    }}
                  />
                </div>

                <button type="submit" style={{
                  width: "100%", padding: "11px", background: "var(--primary)", color: "#fff",
                  border: "none", borderRadius: 9, fontSize: 14, fontWeight: 600,
                  cursor: "pointer", display: "flex", alignItems: "center",
                  justifyContent: "center", gap: 8, fontFamily: "var(--font-body)",
                }}>
                  Send Message <Icon d={icons.send} size={16} />
                </button>

                {formStatus === "success" && (
                  <p style={{ textAlign: "center", fontSize: 12, color: "var(--primary)", marginTop: 10 }}>
                    ✓ Message sent! We'll get back to you soon.
                  </p>
                )}
                {formStatus === "error" && (
                  <p style={{ textAlign: "center", fontSize: 12, color: "#dc2626", marginTop: 10 }}>
                    Please fill in your name, email, and message.
                  </p>
                )}
              </form>
            </div>
          </div>
        </section>

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