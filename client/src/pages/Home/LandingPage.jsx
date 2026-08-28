import { useState, useEffect } from "react";

//  mini icon 
const Icon = ({ d, size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

//  hero illustration — self-contained SVG so the hero never depends on an
//  external image host. Depicts a citizen filing a complaint from their
//  phone, routed to a government office, set against a Himalayan skyline.
const HeroIllustration = () => (
  <svg viewBox="0 0 480 400" width="100%" height="auto" role="img" aria-label="Citizen submitting a complaint through JanSewa">
    {/* sky blob */}
    <circle cx="240" cy="180" r="170" fill="rgba(0,128,128,0.07)" />

    {/* mountains */}
    <path d="M20 260 L110 140 L165 210 L230 110 L300 260 Z" fill="var(--secondary)" opacity="0.9" />
    <path d="M150 260 L235 150 L300 230 L360 160 L460 260 Z" fill="var(--primary)" opacity="0.85" />
    <path d="M95 175 L110 140 L125 172 Z" fill="#fff" opacity="0.9" />
    <path d="M212 145 L230 110 L248 145 Z" fill="#fff" opacity="0.9" />
    <path d="M340 195 L360 160 L378 195 Z" fill="#fff" opacity="0.9" />

    {/* ground */}
    <rect x="0" y="258" width="480" height="16" fill="var(--border)" opacity="0.6" />

    {/* government building */}
    <g transform="translate(300,178)">
      <rect x="0" y="0" width="110" height="82" rx="4" fill="var(--card)" stroke="var(--border)" strokeWidth="2" />
      <polygon points="-8,0 118,0 55,-28" fill="var(--primary)" />
      <rect x="14" y="18" width="14" height="64" fill="var(--background)" />
      <rect x="40" y="18" width="14" height="64" fill="var(--background)" />
      <rect x="66" y="18" width="14" height="64" fill="var(--background)" />
      <rect x="92" y="30" width="14" height="52" fill="var(--background)" />
    </g>
    {/* citizen with phone */}
    <g transform="translate(70,190)">
      <circle cx="30" cy="8" r="16" fill="#f2c9a0" />
      <path d="M4 78c0-24 12-40 26-40s26 16 26 40Z" fill="var(--accent)" />
      <rect x="42" y="34" width="20" height="30" rx="4" fill="var(--text-primary)" transform="rotate(18 42 34)" />
    </g>

    {/* floating complaint card with checkmark, connecting citizen -> building */}
    <g transform="translate(168,90)">
      <rect x="0" y="0" width="92" height="66" rx="10" fill="var(--card)" stroke="var(--border)" strokeWidth="2" />
      <rect x="14" y="16" width="50" height="6" rx="3" fill="var(--border)" />
      <rect x="14" y="30" width="64" height="6" rx="3" fill="var(--border)" />
      <rect x="14" y="44" width="38" height="6" rx="3" fill="var(--border)" />
      <circle cx="76" cy="12" r="12" fill="var(--primary)" />
      <path d="M70 12l4 4 8-8" stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>

    {/* dashed route from card to building */}
    <path d="M258 118 C280 118 285 150 305 155" stroke="var(--accent)" strokeWidth="2.5" strokeDasharray="5 6" fill="none" />

    {/* small floating dots for motion */}
    <circle cx="150" cy="70" r="4" fill="var(--accent)" opacity="0.6" />
    <circle cx="410" cy="120" r="5" fill="var(--secondary)" opacity="0.5" />
    <circle cx="60" cy="120" r="4" fill="var(--primary)" opacity="0.5" />
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
  linkedin:    "M4.98 3.5a2.5 2.5 0 11-.02 5 2.5 2.5 0 01.02-5zM3 9h4v12H3zM10 9h3.8v1.71h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.6c0-1.34-.02-3.06-1.87-3.06-1.87 0-2.16 1.46-2.16 2.96V21h-4z",
  portfolio:   "M12 2l2.4 6.9L21 9.3l-5.3 4.6 1.7 7.1L12 17.3 6.6 21l1.7-7.1L3 9.3l6.6-.4L12 2z",
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

//  static (language-independent) metadata 
const deptIcons = ["water", "road", "electric", "garbage", "parks", "streetlight", "health", "other"];
const deptKeys  = ["water", "road", "electric", "garbage", "parks", "streetlight", "health", "other"];

const serviceIcons = ["doc", "brain", "pin", "bell", "chart", "users"];

const valueIcons = ["eye", "rocket", "shield", "access"];

const stepIcons = [icons.submit, icons.review, icons.resolved];

const channelMeta = [
  { key: "online",   icon: "globe",    href: "/register" },
  { key: "facebook",  icon: "facebook", href: "https://www.facebook.com/" },
  { key: "x",         icon: "twitter",  href: "https://x.com/" },
  { key: "phone",     icon: "phone",    href: "tel:1111" },
  { key: "sms",       icon: "sms",      href: "sms:+97798XXXXXXXX" },
  { key: "whatsapp",  icon: "chat",     href: "https://wa.me/" },
];
const channelValues = {
  online: "jansewa.gov.np", facebook: "@jansewa.np", x: "@jansewa_np",
  phone: "1111", sms: "+977-98XXXXXXXX", whatsapp: "+977-98XXXXXXXX",
};

const complaintStatKeys = ["total", "resolved", "rate", "departments"];
const complaintStatIcons = { total: "doc", resolved: "resolved", rate: "chart", departments: "building" };

const contactIcons = ["mail", "phone", "pin", "github"];

// team members — icons/colors/photos are language-independent
const team = [
  {
    initials: "AL", key: "anamika",
    bg: "rgba(0,128,128,0.12)", color: "#006666",
    github: "https://github.com/Anamikalimbu", linkedin: "https://www.linkedin.com/in/anamika-limbu-b01238340/",
    portfolio: "https://anamikalimbu-portfolio.netlify.app/",
  },
  {
    initials: "DB", key: "divya",
    bg: "rgba(255,193,7,0.15)", color: "#a07000",
    github: "https://github.com/Divya-Bhandari", linkedin: "https://www.linkedin.com/in/divya-bhandari-24a2323b9/",
    portfolio: null,
  },
];

//  translations 
const translations = {
  en: {
    dir: "ltr",
    topbar: { phone: "1111", email: "support@jansewa.gov.np" },
    nav: { home: "Home", services: "Services", about: "About Us", contact: "Contact", login: "Login", register: "Register" },
    hero: {
      badge: "AI-Powered Public Service Platform for Nepal",
      titleMain: "We're Here to",
      titleHighlight: "Solve Together",
      sub: "Report issues, track progress and help build a better community.",
      submit: "Submit Complaint",
      track: "Track Complaint",
    },
    trustedBy: "Built for the citizens & local government offices of Nepal",
    channels: {
      eyebrow: "Reach Us Anywhere",
      title: "Channels Available for Complaints",
      labels: { online: "Online", facebook: "Facebook", x: "X", phone: "Phone", sms: "SMS", whatsapp: "WhatsApp" },
    },
    stats: {
      eyebrow: "Transparency",
      title: "Latest Status of Complaints",
      sub: "Your complaints, our commitment stay updated on how issues are being addressed.",
    },
    complaintStats: {
      total:      { label: "Total Complaints", desc: "A complaint has been registered on the portal." },
      resolved:   { label: "Resolved",         desc: "Issues successfully solved." },
      rate:       { label: "Resolution Rate",  desc: "Percentage of solved issues." },
      departments:{ label: "Departments",      desc: "Available service departments." },
    },
    howItWorks: {
      eyebrow: "Process", title: "How It Works", stepLabel: "STEP",
      steps: [
        { title: "Submit Complaint",  desc: "Fill the form with issue details, photos, and your location." },
        { title: "Department Review", desc: "AI categorises and routes your complaint to the right department." },
        { title: "Get It Resolved",   desc: "Track progress and get notified when your issue is fixed." },
      ],
    },
    departments: {
      eyebrow: "Coverage", title: "Departments", sub: "Report issues across all public service departments",
      labels: { water: "Water Supply", road: "Roads", electric: "Electricity", garbage: "Garbage", parks: "Parks", streetlight: "Street Lights", health: "Health", other: "Others" },
    },
    offices: {
      eyebrow: "Accountability",
      title: "Offices with the Most Complaints Received",
      sub: "Monitoring the offices with the most complaints to improve service and transparency",
      names: [
        "Ward Office, Dharan-3",
        "Water Supply & Sanitation Office",
        "Roads Division Office, Sunsari",
        "Nepal Electricity Authority, Dharan",
        "District Health Office, Sunsari",
      ],
    },
    services: {
      eyebrow: "What We Offer", title: "Our Services", sub: "Everything you need to make your voice heard and track change",
      items: [
        { title: "Complaint Submission",      tag: "Core Feature", desc: "Submit detailed reports with photo evidence, GPS location, and category selection. Our form is fast and accessible on any device." },
        { title: "AI-Powered Categorisation", tag: "AI Feature",   desc: "Our AI model automatically classifies complaints, identifies urgency, and routes them to the correct department — no manual sorting delays." },
        { title: "Real-Time Tracking",        tag: "Transparency", desc: "Follow your complaint's journey from submission to resolution with a live status timeline. Know exactly where things stand at every step." },
        { title: "Smart Notifications",       tag: "Alerts",       desc: "Receive email and in app alerts whenever your complaint status changes, a department responds, or your issue is marked resolved." },
        { title: "Public Dashboard",          tag: "Open Data",    desc: "Explore city-wide complaint trends, department performance metrics, and resolution rates fully transparent and open to every citizen." },
        { title: "Department Portal",         tag: "Admin",        desc: "Staff and admins get a dedicated portal to manage and resolve assigned complaints with role-based access control and audit logs." },
      ],
    },
    about: {
      eyebrow: "Who We Are", title: "About JanSewa",
      heading: "Built for Nepal's Citizens",
      p1: <>JanSewa (जनसेवा) meaning "public service" is an AI-powered complaint management platform designed to bridge the gap between Nepal's citizens and local government departments.</>,
      p2: "We believe every person deserves to have their voice heard. Whether it's a broken streetlight, a pothole-ridden road, or a water supply failure, JanSewa ensures your complaint reaches the right hands, fast.",
      p3: <>Built as part of the <strong>Learning</strong> initiative, this is a civic tech project developed by students committed to making public services more accountable and transparent.</>,
      link: "Get in touch →",
      values: [
        { title: "Transparency",   desc: "All complaint data and resolution stats are publicly visible." },
        { title: "Speed",          desc: "AI routing eliminates delays in getting issues to the right team." },
        { title: "Accountability", desc: "Departments are tracked and rated on resolution performance." },
        { title: "Accessibility",  desc: "Designed for every citizen works on any device, any connection." },
      ],
      teamEyebrow: "The Team", teamTitle: "Meet the Builders",
      team: {
        anamika: { name: "Anamika Limbu", role: "Full-Stack Developer" },
        divya:   { name: "Divya Bhandari", role: "Full-Stack Developer" },
      },
      teamLinks: { github: "GitHub", linkedin: "LinkedIn", portfolio: "Portfolio" },
    },
    contact: {
      eyebrow: "Get In Touch", title: "Contact Us",
      sub: "Have questions, feedback, or want to collaborate? We'd love to hear from you.",
      talkTitle: "Let's Talk",
      talkDesc: "Whether you're a citizen, a government partner, or a fellow developer reach out and let's work together on making Nepal's public services better.",
      items: [
        { title: "Email",   lines: ["hello@jansewa.gov.np", "support@jansewa.gov.np"] },
        { title: "Phone",   lines: ["+977-1-4XXXXXX (Office)", "Mon-Fri, 10 am - 5 pm NST"] },
        { title: "Address", lines: ["Dharan, Sunsari District", "Koshi Province, Nepal"] },
        { title: "GitHub",  lines: ["https://github.com/Divya-Bhandari/JanSewa"] },
      ],
      form: {
        name: "Your name", namePh: "Divya Bhandari",
        email: "Email address", emailPh: "divya@gmail.com",
        subject: "Subject", subjectSelect: "Select a topic",
        subjectOptions: ["General Inquiry", "Partnership / Collaboration", "Report a Bug", "Feedback", "Press / Media"],
        message: "Message", messagePh: "Tell us how we can help...",
        send: "Send Message",
        success: "✓ Message sent! We'll get back to you soon.",
        error: "Please fill in your name, email, and message.",
      },
    },
    cta: {
      title: "Have an issue to report?",
      sub: "Join thousands of citizens making Nepal's public services better.",
      btn: "Get Started Free",
    },
    footer: {
      copyright: "© 2026JanSewa",
      links: "Privacy Policy · Terms of Service",
    },
  },

  ne: {
    dir: "ltr",
    topbar: { phone: "1111", email: "support@jansewa.gov.np" },
    nav: { home: "गृहपृष्ठ", services: "सेवाहरू", about: "हाम्रो बारे", contact: "सम्पर्क", login: "लगइन", register: "दर्ता गर्नुहोस्" },
    hero: {
      badge: "नेपालका लागि एआई-संचालित सार्वजनिक सेवा प्लेटफर्म",
      titleMain: "We're Here to",
      titleHighlight: "Solve Together",
      sub: "Report issues, track progress and help build a better community.",
      submit: "उजुरी दर्ता गर्नुहोस्",
      track: "उजुरी ट्र्याक गर्नुहोस्",
    },
    trustedBy: "नेपालका नागरिक र स्थानीय सरकारी कार्यालयहरूका लागि निर्मित",
    channels: {
      eyebrow: "हामीलाई जहाँबाट पनि सम्पर्क गर्नुहोस्",
      title: "उजुरीका लागि उपलब्ध माध्यमहरू",
      labels: { online: "अनलाइन", facebook: "फेसबुक", x: "एक्स", phone: "फोन", sms: "एसएमएस", whatsapp: "ह्वाट्सएप" },
    },
    stats: {
      eyebrow: "पारदर्शिता",
      title: "उजुरीहरूको हालको अवस्था",
      sub: "तपाईंको उजुरी, हाम्रो प्रतिबद्धता समस्या समाधानको अवस्थाबारे अद्यावधिक रहनुहोस्।",
    },
    complaintStats: {
      total:      { label: "कुल उजुरीहरू",  desc: "पोर्टलमा उजुरी दर्ता भएको छ।" },
      resolved:   { label: "समाधान भएको",   desc: "कार्यालयद्वारा उजुरी समाधान गरिएको छ।" },
      rate:       { label: "समाधान दर",     desc: "समस्या समाधानको प्रतिशत।" },
      departments:{ label: "विभागहरू",     desc: "उपलब्ध सेवा विभागहरू।" },
    },
    howItWorks: {
      eyebrow: "प्रक्रिया", title: "यसरी काम गर्छ", stepLabel: "चरण",
      steps: [
        { title: "उजुरी दर्ता गर्नुहोस्", desc: "समस्याको विवरण, फोटो र स्थान सहित फारम भर्नुहोस्।" },
        { title: "विभागीय समीक्षा",       desc: "एआईले तपाईंको उजुरीलाई वर्गीकरण गरी सही विभागमा पठाउँछ।" },
        { title: "समाधान प्राप्त गर्नुहोस्", desc: "प्रगति ट्र्याक गर्नुहोस् र समस्या समाधान भएपछि सूचना पाउनुहोस्।" },
      ],
    },
    departments: {
      eyebrow: "दायरा", title: "विभागहरू", sub: "सबै सार्वजनिक सेवा विभागहरूमा समस्या रिपोर्ट गर्नुहोस्",
      labels: { water: "खानेपानी आपूर्ति", road: "सडक", electric: "विद्युत", garbage: "फोहोरमैला", parks: "पार्क", streetlight: "सडक बत्ती", health: "स्वास्थ्य", other: "अन्य" },
    },
    offices: {
      eyebrow: "जवाफदेहिता",
      title: "सबैभन्दा बढी उजुरी प्राप्त गर्ने कार्यालयहरू",
      sub: "सेवा र पारदर्शिता सुधार गर्न सबैभन्दा बढी उजुरी भएका कार्यालयहरूको अनुगमन गरिन्छ",
      names: [
        "वडा कार्यालय, धरान-३",
        "खानेपानी तथा सरसफाइ कार्यालय",
        "सडक डिभिजन कार्यालय, सुनसरी",
        "नेपाल विद्युत प्राधिकरण, धरान",
        "जिल्ला स्वास्थ्य कार्यालय, सुनसरी",
      ],
    },
    services: {
      eyebrow: "हामीले प्रदान गर्ने सेवा", title: "हाम्रा सेवाहरू", sub: "तपाईंको आवाज सुनाउन र परिवर्तन ट्र्याक गर्न आवश्यक सबै कुरा",
      items: [
        { title: "उजुरी दर्ता",              tag: "मुख्य सुविधा", desc: "फोटो प्रमाण, जीपीएस स्थान र वर्ग छनोट सहित विस्तृत रिपोर्ट पेश गर्नुहोस्। हाम्रो फारम छिटो र जुनसुकै उपकरणमा पहुँचयोग्य छ।" },
        { title: "एआई-संचालित वर्गीकरण",     tag: "एआई सुविधा",   desc: "हाम्रो एआई मोडेलले उजुरीलाई स्वचालित रूपमा वर्गीकरण गरी अत्यावश्यकता पहिचान गर्छ र सही विभागमा पठाउँछ म्यानुअल छनोटको ढिलाइ हुँदैन।" },
        { title: "वास्तविक-समय ट्र्याकिङ",   tag: "पारदर्शिता",   desc: "लाइभ स्थिति टाइमलाइनसहित पेश गरेदेखि समाधानसम्मको यात्रा पछ्याउनुहोस्। हरेक चरणमा अवस्था ठ्याक्कै थाहा पाउनुहोस्।" },
        { title: "स्मार्ट सूचनाहरू",         tag: "अलर्टहरू",     desc: "तपाईंको उजुरीको स्थिति परिवर्तन हुँदा, विभागले जवाफ दिँदा, वा समस्या समाधान भएको चिन्ह लाग्दा इमेल र इन-एप अलर्ट प्राप्त गर्नुहोस्।" },
        { title: "सार्वजनिक ड्यासबोर्ड",     tag: "खुला डेटा",     desc: "सहरभरिको उजुरी प्रवृत्ति, विभागीय कार्यसम्पादन मापदण्ड र समाधान दर अन्वेषण गर्नुहोस् पूर्ण रूपमा पारदर्शी र हरेक नागरिकका लागि खुला।" },
        { title: "विभागीय पोर्टल",           tag: "प्रशासन",       desc: "कर्मचारी र प्रशासकहरूले भूमिका-आधारित पहुँच नियन्त्रण र लेखा-परीक्षण लगसहित तोकिएका उजुरीहरू व्यवस्थापन र समाधान गर्ने समर्पित पोर्टल पाउँछन्।" },
      ],
    },
    about: {
      eyebrow: "हामी को हौं", title: "जनसेवाको बारेमा",
      heading: "नेपालका नागरिकहरूका लागि निर्मित",
      p1: <>जनसेवा (JanSewa) जसको अर्थ "सार्वजनिक सेवा" हो नेपालका नागरिक र स्थानीय सरकारी विभागहरूबीचको खाडल पुर्न डिजाइन गरिएको एआई-संचालित उजुरी व्यवस्थापन प्लेटफर्म हो।</>,
      p2: "हामी विश्वास गर्छौं कि हरेक व्यक्तिको आवाज सुनिनुपर्छ। बिग्रिएको सडक बत्ती होस्, खाल्डाखुल्डी भएको सडक होस्, वा खानेपानी आपूर्तिको समस्या होस्, जनसेवाले तपाईंको उजुरी छिटो सही हातमा पुर्‍याउने सुनिश्चित गर्छ।",
      p3: <>लर्निङ पहलको भागका रूपमा निर्मित, यो विद्यार्थीहरूद्वारा विकसित नागरिकप्रविधि परियोजना हो जो सार्वजनिक सेवालाई थप जवाफदेही र पारदर्शी बनाउन प्रतिबद्ध छन्।</>,
      link: "सम्पर्कमा रहनुहोस् →",
      values: [
        { title: "पारदर्शिता",   desc: "सबै उजुरी डेटा र समाधान तथ्याङ्क सार्वजनिक रूपमा देखिन्छ।" },
        { title: "गति",           desc: "एआई रुटिङले समस्यालाई सही टोलीमा पुर्‍याउने ढिलाइ हटाउँछ।" },
        { title: "जवाफदेहिता",   desc: "विभागहरूलाई समाधान कार्यसम्पादनको आधारमा ट्र्याक र मूल्याङ्कन गरिन्छ।" },
        { title: "पहुँचयोग्यता", desc: "हरेक नागरिकका लागि डिजाइन गरिएको — जुनसुकै उपकरण, जुनसुकै इन्टरनेट जडानमा काम गर्छ।" },
      ],
      teamEyebrow: "टोली", teamTitle: "निर्माताहरूसँग भेट्नुहोस्",
      team: {
        anamika: { name: "अनामिका लिम्बू", role: "फुल-स्ट्याक डेभलपर" },
        divya:   { name: "दिव्या भण्डारी", role: "फुल-स्ट्याक डेभलपर" },
      },
      teamLinks: { github: "गिटहब", linkedin: "लिंक्डइन", portfolio: "पोर्टफोलियो" },
    },
    contact: {
      eyebrow: "सम्पर्कमा रहनुहोस्", title: "हामीलाई सम्पर्क गर्नुहोस्",
      sub: "प्रश्न, प्रतिक्रिया, वा सहकार्य गर्न चाहनुहुन्छ? हामी तपाईंबाट सुन्न चाहन्छौं।",
      talkTitle: "कुरा गरौं",
      talkDesc: "तपाईं नागरिक, सरकारी साझेदार, वा साथी डेभलपर जोसुकै हुनुहोस् सम्पर्क गर्नुहोस् र नेपालको सार्वजनिक सेवा सुधार गर्न सँगै काम गरौं।",
      items: [
        { title: "इमेल",   lines: ["hello@jansewa.gov.np", "support@jansewa.gov.np"] },
        { title: "फोन",   lines: ["+977-1-4XXXXXX (कार्यालय)", "सोम-शुक्र, बिहान १० - बेलुका ५ बजे (NST)"] },
        { title: "ठेगाना", lines: ["धरान, सुनसरी जिल्ला", "कोशी प्रदेश, नेपाल"] },
        { title: "गिटहब",  lines: ["https://github.com/Divya-Bhandari/JanSewa"] },
      ],
      form: {
        name: "तपाईंको नाम", namePh: "दिव्या भण्डारी",
        email: "इमेल ठेगाना", emailPh: "divya@gmail.com",
        subject: "विषय", subjectSelect: "विषय छान्नुहोस्",
        subjectOptions: ["सामान्य जिज्ञासा", "साझेदारी / सहकार्य", "त्रुटि रिपोर्ट गर्नुहोस्", "प्रतिक्रिया", "प्रेस / मिडिया"],
        message: "सन्देश", messagePh: "हामीले कसरी सहयोग गर्न सक्छौं भन्नुहोस्...",
        send: "सन्देश पठाउनुहोस्",
        success: "✓ सन्देश पठाइयो! हामी चाँडै तपाईंलाई सम्पर्क गर्नेछौं।",
        error: "कृपया आफ्नो नाम, इमेल, र सन्देश भर्नुहोस्।",
      },
    },
    cta: {
      title: "रिपोर्ट गर्ने कुनै समस्या छ?",
      sub: "नेपालको सार्वजनिक सेवा सुधार गर्ने हजारौं नागरिकसँग सामेल हुनुहोस्।",
      btn: "नि:शुल्क सुरु गर्नुहोस्",
    },
    footer: {
      copyright: "© २०२६ जनसेवा",
      links: "गोपनीयता नीति · सेवाका सर्तहरू",
    },
  },
};

export default function LandingPage() {
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem("jansewa_lang") || "en"; } catch { return "en"; }
  });
  const t = translations[lang];

  const switchLang = (l) => {
    setLang(l);
    try { localStorage.setItem("jansewa_lang", l); } catch {}
  };

  const [hoveredDept,  setHoveredDept] = useState(null);
  const [hoveredNav,   setHoveredNav]  = useState(null);
  const [hoveredSvc,   setHoveredSvc]  = useState(null);
  const [stats,        setStats]       = useState({
    total: 0, resolved: 0, rate: 0, departments: 5,
  });
  const [loading,      setLoading]     = useState(false);

  // contact form state
  const [form,       setForm]       = useState({ name: "", email: "", subject: "", message: "" });
  const [formStatus, setFormStatus] = useState(null); // null | "success" | "error"

  const navLinks = [
    { key: "home",     label: t.nav.home,     href: "#home" },
    { key: "services",  label: t.nav.services, href: "#services" },
    { key: "about",     label: t.nav.about,    href: "#about" },
    { key: "contact",   label: t.nav.contact,  href: "#contact" },
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
          <span
            onClick={() => switchLang("ne")}
            style={{ opacity: lang === "ne" ? 1 : 0.65, cursor: "pointer", textDecoration: lang === "ne" ? "underline" : "none" }}
          >नेपाली</span>
          <span style={{ opacity: 0.4 }}>|</span>
          <span
            onClick={() => switchLang("en")}
            style={{ opacity: lang === "en" ? 1 : 0.65, cursor: "pointer", textDecoration: lang === "en" ? "underline" : "none" }}
          >English</span>
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
          <img
            src="/images/emblem-of-nepal-sm.png"
            alt="JanSewa"
            style={{ width: 30, height: 30, objectFit: "contain" }}
          />
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--text-primary)", letterSpacing: -0.3 }}>
            JanSewa
          </span>
        </div>

        {/* Desktop nav */}
        <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
          {navLinks.map(({ key, label, href }) => (
            <a key={key} href={href}
              onClick={e => { e.preventDefault(); scrollTo(href); }}
              onMouseEnter={() => setHoveredNav(key)}
              onMouseLeave={() => setHoveredNav(null)}
              style={{
                fontSize: 14, fontWeight: 500, cursor: "pointer",
                color: hoveredNav === key ? "var(--primary)" : "var(--text-secondary)",
                transition: "color 0.15s",
              }}>{label}</a>
          ))}
          <a href="/login" style={{
            fontSize: 13, fontWeight: 600, padding: "7px 18px", borderRadius: 8,
            border: "1.5px solid var(--primary)", color: "var(--primary)", transition: "all 0.15s",
          }}>{t.nav.login}</a>
          <a href="/register" style={{
            fontSize: 13, fontWeight: 600, padding: "7px 18px", borderRadius: 8,
            background: "var(--primary)", color: "#fff",
            boxShadow: "0 1px 4px rgba(0,128,128,0.3)",
          }}>{t.nav.register}</a>
        </div>
      </nav>

      {/*  HERO  */}
      <section id="home" style={{
        width: "100%", boxSizing: "border-box",
        background: "linear-gradient(135deg, rgba(0,128,128,0.08) 0%, rgba(0,102,102,0.06) 50%, rgba(255,193,7,0.06) 100%)",
        padding: "72px 32px 56px", position: "relative", overflow: "hidden",
      }}>
        {/* decorative blobs */}
        <div style={{ position: "absolute", top: -60, right: -60, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(77,182,182,0.18), transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -40, left: -40, width: 240, height: 240, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,193,7,0.14), transparent 70%)", pointerEvents: "none" }} />

        <div style={{
          position: "relative", maxWidth: 1180, margin: "0 auto",
          display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 40, alignItems: "center",
        }}>
          {/* Left — copy */}
          <div style={{ textAlign: "left" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "rgba(0,128,128,0.08)", borderRadius: 20, padding: "4px 14px",
              fontSize: 12, fontWeight: 600, color: "var(--primary)", marginBottom: 20,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--primary-Light)", display: "inline-block" }} />
              {t.hero.badge}
            </div>

            <h1 style={{
              fontFamily: "var(--font-display)", fontSize: 38, fontWeight: 800,
              color: "var(--text-primary)", lineHeight: 1.25, letterSpacing: -0.8, marginBottom: 16,
              maxWidth: 560,
            }}>
              {t.hero.titleMain}{" "}
              <span style={{ color: "var(--primary)" }}>{t.hero.titleHighlight}</span>
            </h1>

            <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 32, maxWidth: 480 }}>
              {t.hero.sub}
            </p>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a href="/submit" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "var(--primary)", color: "#fff",
                padding: "13px 28px", borderRadius: 10, fontWeight: 600, fontSize: 15,
                boxShadow: "0 4px 14px rgba(0,128,128,0.4)", transition: "transform 0.15s",
              }}>
                {t.hero.submit} <Icon d={icons.arrow} size={18} />
              </a>
              <a href="/track" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "var(--card)", color: "var(--text-primary)",
                padding: "13px 28px", borderRadius: 10, fontWeight: 600, fontSize: 15,
                border: "1.5px solid var(--border)",
              }}>
                {t.hero.track}
              </a>
            </div>
          </div>

          {/* Right — illustration */}
          <div style={{ position: "relative" }}>
            <HeroIllustration />
          </div>
        </div>
      </section>
      {/*  STATS  */}
      <section style={{
        background: "var(--card)", borderBottom: "1px solid var(--border)",
        width: "100%", boxSizing: "border-box", padding: "36px 32px",
      }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "var(--primary)", textTransform: "uppercase" }}>
            {t.stats.eyebrow}
          </span>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--text-primary)", marginTop: 6 }}>
            {t.stats.title}
          </h2>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 6 }}>
            {t.stats.sub}
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
          {complaintStatKeys.map((key) => (
            <div key={key} style={{
              border: "1px solid var(--border)", borderRadius: 12, padding: "16px 12px",
              textAlign: "center", boxSizing: "border-box",
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10, margin: "0 auto 10px",
                background: "rgba(0,128,128,0.1)", display: "flex", alignItems: "center",
                justifyContent: "center", color: "var(--primary)",
              }}>
                <Icon d={icons[complaintStatIcons[key]]} size={18} />
              </div>
              {loading ? (
                <div className="skeleton" style={{ width: 44, height: 22, margin: "0 auto" }} />
              ) : (
                <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--text-primary)" }}>
                  {stats[key].toLocaleString()}{key === 'rate' ? '%' : ''}
                </div>
              )}
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", marginTop: 6 }}>{t.complaintStats[key].label}</div>
              <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 4, lineHeight: 1.4 }}>{t.complaintStats[key].desc}</div>
            </div>
          ))}
        </div>
      </section>

      <main style={{ width: "100%", boxSizing: "border-box", padding: "0 32px 48px" }}>

        {/*  HOW IT WORKS  */}
        <div style={{ marginTop: 52, marginBottom: 28 }}>
          <SectionHeading label={t.howItWorks.eyebrow} title={t.howItWorks.title} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 52 }}>
          {t.howItWorks.steps.map(({ title, desc }, i) => (
            <div key={title} style={{
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
                <Icon d={stepIcons[i]} size={24} />
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", letterSpacing: 1.5, marginBottom: 6 }}>
                {t.howItWorks.stepLabel} 0{i + 1}
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>{title}</div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>{desc}</div>
            </div>
          ))}
        </div>

        {/*  PHOTO BANNER  */}
        <div style={{
          position: "relative", borderRadius: 16, overflow: "hidden", marginBottom: 52,
          height: 200, boxSizing: "border-box",
        }}>
          <img
            src="https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=1600&q=80"
            alt="Clean water access — one of JanSewa's tracked service categories"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(90deg, rgba(0,51,51,0.78) 0%, rgba(0,51,51,0.35) 55%, rgba(0,51,51,0.05) 100%)",
            display: "flex", alignItems: "center",
          }}>
            <div style={{ padding: "0 36px", maxWidth: 420 }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 6 }}>
                {t.hero.titleHighlight}
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", lineHeight: 1.6 }}>
                {t.hero.sub}
              </div>
            </div>
          </div>
        </div>

        {/*  DEPARTMENTS  */}
        <SectionHeading label={t.departments.eyebrow} title={t.departments.title} sub={t.departments.sub} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 52 }}>
          {deptKeys.map((key, i) => (
            <div key={key}
              onMouseEnter={() => setHoveredDept(key)}
              onMouseLeave={() => setHoveredDept(null)}
              style={{
                background: hoveredDept === key ? "rgba(0,128,128,0.08)" : "var(--card)",
                border: hoveredDept === key ? "1.5px solid var(--primary-Light)" : "1.5px solid var(--border)",
                borderRadius: 12, padding: "16px 10px", textAlign: "center",
                cursor: "pointer", transition: "all 0.15s",
                color: hoveredDept === key ? "var(--primary)" : "var(--text-secondary)",
                boxSizing: "border-box",
              }}
            >
              <div style={{ marginBottom: 8, display: "flex", justifyContent: "center" }}>
                <Icon d={icons[deptIcons[i]]} size={22} />
              </div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{t.departments.labels[key]}</div>
            </div>
          ))}
        </div>


        {/*  SERVICES  */}
        <section id="services" style={{ paddingTop: 8 }}>
          <SectionHeading
            label={t.services.eyebrow}
            title={t.services.title}
            sub={t.services.sub}
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 52 }}>
            {t.services.items.map(({ title, tag, desc }, i) => (
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
                  <Icon d={icons[serviceIcons[i]]} size={22} />
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
          <SectionHeading label={t.about.eyebrow} title={t.about.title} />

          {/* mission + values */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 36, marginBottom: 44, alignItems: "start" }}>
            {/* left: narrative */}
            <div style={{ textAlign: "left" }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--text-primary)", marginBottom: 14, letterSpacing: -0.5 }}>
                {t.about.heading}
              </h3>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 12 }}>
                {t.about.p1}
              </p>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 12 }}>
                {t.about.p2}
              </p>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 16 }}>
                {t.about.p3}
              </p>
              <a href="#contact"
                onClick={e => { e.preventDefault(); scrollTo("#contact"); }}
                style={{ color: "var(--primary)", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
                {t.about.link}
              </a>
            </div>

            {/* right: real photo + values grid */}
            <div>
              <img
                src="https://images.unsplash.com/photo-1680471818128-b85e28f34edd?auto=format&fit=crop&w=900&q=80"
                alt="Kathmandu Valley, Nepal"
                style={{
                  width: "100%", height: 160, objectFit: "cover", borderRadius: 14,
                  border: "1px solid var(--border)", marginBottom: 12, display: "block",
                }}
              />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {t.about.values.map(({ title, desc }, i) => (
                  <div key={title} style={{
                    background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12,
                    padding: "16px", textAlign: "left", boxSizing: "border-box",
                  }}>
                    <div style={{ color: "var(--primary)", marginBottom: 8 }}>
                      <Icon d={icons[valueIcons[i]]} size={20} />
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>{title}</div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>{desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* team */}
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "var(--primary)", textTransform: "uppercase" }}>{t.about.teamEyebrow}</span>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--text-primary)", marginTop: 6, letterSpacing: -0.4 }}>
              {t.about.teamTitle}
            </h3>
          </div>
          <div style={{
            display: "flex", justifyContent: "center", flexWrap: "wrap",
            gap: 20, marginBottom: 52,
          }}>
            {team.map(({ initials, key, bg, color, github, linkedin, portfolio }) => {
              const member = t.about.team[key];
              return (
                <div key={key} style={{
                  background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14,
                  padding: "24px 22px", textAlign: "center", boxSizing: "border-box",
                  width: 220, flexShrink: 0,
                }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: "50%", background: bg,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 12px", fontSize: 17, fontWeight: 700, color,
                  }}>{initials}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>{member.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 14 }}>{member.role}</div>

                  {/* social links */}
                  <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
                    <a href={github} target="_blank" rel="noopener noreferrer" aria-label={t.about.teamLinks.github}
                      title={t.about.teamLinks.github}
                      style={{
                        width: 32, height: 32, borderRadius: "50%", background: "rgba(0,128,128,0.1)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "var(--primary)", transition: "background 0.15s",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,128,128,0.2)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "rgba(0,128,128,0.1)"; }}
                    >
                      <Icon d={icons.github} size={16} />
                    </a>
                    <a href={linkedin} target="_blank" rel="noopener noreferrer" aria-label={t.about.teamLinks.linkedin}
                      title={t.about.teamLinks.linkedin}
                      style={{
                        width: 32, height: 32, borderRadius: "50%", background: "rgba(0,128,128,0.1)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "var(--primary)", transition: "background 0.15s",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,128,128,0.2)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "rgba(0,128,128,0.1)"; }}
                    >
                      <Icon d={icons.linkedin} size={16} />
                    </a>
                    {portfolio && (
                      <a href={portfolio} target="_blank" rel="noopener noreferrer" aria-label={t.about.teamLinks.portfolio}
                        title={t.about.teamLinks.portfolio}
                        style={{
                          width: 32, height: 32, borderRadius: "50%", background: "rgba(255,193,7,0.18)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: "#a07000", transition: "background 0.15s",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,193,7,0.32)"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,193,7,0.18)"; }}
                      >
                        <Icon d={icons.portfolio} size={16} />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/*  CONTACT  */}
        <section id="contact" style={{ paddingTop: 8 }}>
          <SectionHeading
            label={t.contact.eyebrow}
            title={t.contact.title}
            sub={t.contact.sub}
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, marginBottom: 52 }}>
            {/* contact info */}
            <div style={{ textAlign: "left" }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "var(--text-primary)", marginBottom: 10 }}>{t.contact.talkTitle}</h3>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.65, marginBottom: 20 }}>
                {t.contact.talkDesc}
              </p>
              {t.contact.items.map(({ title, lines }, i) => (
                <div key={title} style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 16 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 9, background: "rgba(0,128,128,0.1)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "var(--primary)", flexShrink: 0,
                  }}>
                    <Icon d={icons[contactIcons[i]]} size={18} />
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
                    { name: "name",  label: t.contact.form.name,  type: "text",  placeholder: t.contact.form.namePh },
                    { name: "email", label: t.contact.form.email, type: "email", placeholder: t.contact.form.emailPh },
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
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>{t.contact.form.subject}</label>
                  <select name="subject" value={form.subject} onChange={handleFormChange}
                    style={{
                      width: "100%", padding: "9px 12px", border: "1px solid var(--border)",
                      borderRadius: 8, fontSize: 13, background: "var(--background)",
                      color: "var(--text-primary)", outline: "none", boxSizing: "border-box",
                      fontFamily: "var(--font-body)",
                    }}>
                    <option value="">{t.contact.form.subjectSelect}</option>
                    {t.contact.form.subjectOptions.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>

                {/* message */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>{t.contact.form.message}</label>
                  <textarea name="message" value={form.message} onChange={handleFormChange}
                    placeholder={t.contact.form.messagePh}
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
                  {t.contact.form.send} <Icon d={icons.send} size={16} />
                </button>

                {formStatus === "success" && (
                  <p style={{ textAlign: "center", fontSize: 12, color: "var(--primary)", marginTop: 10 }}>
                    {t.contact.form.success}
                  </p>
                )}
                {formStatus === "error" && (
                  <p style={{ textAlign: "center", fontSize: 12, color: "#dc2626", marginTop: 10 }}>
                    {t.contact.form.error}
                  </p>
                )}
              </form>
            </div>
          </div>
        </section>

         {/*  CTA BANNER  */}
        <div style={{
          backgroundImage: "linear-gradient(135deg, rgba(0,128,128,0.88), rgba(255,193,7,0.55)), url(https://images.unsplash.com/photo-1537511446984-935f663eb1f4?auto=format&fit=crop&w=1400&q=80)",
          backgroundSize: "cover", backgroundPosition: "center",
          borderRadius: 16, padding: "36px 40px", width: "100%", boxSizing: "border-box",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: 20,
          boxShadow: "0 8px 32px rgba(0,128,128,0.35)",
        }}>
          <div>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--card)", marginBottom: 6 }}>
              {t.cta.title}
            </h3>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.8)" }}>
              {t.cta.sub}
            </p>
          </div>
          <a href="/register" style={{
            background: "var(--card)", color: "var(--text-primary)",
            padding: "12px 28px", borderRadius: 10, fontWeight: 700, fontSize: 14,
            whiteSpace: "nowrap",
          }}>
            {t.cta.btn}
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
          <img src="/images/emblem-of-nepal-sm.png" alt="JanSewa" style={{ width: 26, height: 26, objectFit: "contain" }} />
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>JanSewa</span>
        </div>
        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
          {t.footer.copyright} &nbsp;·&nbsp; {t.footer.links}
        </div>
      </footer>
    </div>
  );
}