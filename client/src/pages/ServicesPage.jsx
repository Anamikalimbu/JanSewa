import { Link } from "react-router-dom";
import PublicLayout from "../components/site/PublicLayout";
import { Icon, icons } from "../components/site/icons";

const services = [
  {
    icon: icons.submit,
    title: "Submit a Complaint",
    text: "File a complaint about any public service issue in minutes — add a category, location, description, and up to 5 photos.",
    to: "/register",
    cta: "Get Started",
  },
  {
    icon: icons.review,
    title: "Real-Time Tracking",
    text: "Follow your complaint's full lifecycle — Submitted, Assigned, In Progress, Resolved — with a clear status timeline.",
    to: "/login",
    cta: "Track a Complaint",
  },
  {
    icon: icons.users,
    title: "Direct Communication",
    text: "Comment directly on your complaint and get updates from the assigned department officer without phone calls or office visits.",
    to: "/login",
    cta: "View My Complaints",
  },
  {
    icon: icons.check,
    title: "Share Feedback",
    text: "Rate how your complaint was handled once it's resolved, helping departments improve their response times.",
    to: "/login",
    cta: "Leave Feedback",
  },
  {
    icon: icons.megaphone,
    title: "Stay Informed",
    text: "Read official announcements about maintenance windows, new policies, and service alerts affecting your area.",
    to: "/announcements",
    cta: "View Announcements",
  },
  {
    icon: icons.shield,
    title: "Department Accountability",
    text: "Every department's resolution rate and average response time is tracked, encouraging faster, better service.",
    to: "/about",
    cta: "Learn More",
  },
];

const categories = [
  { icon: icons.water, label: "Water Supply" },
  { icon: icons.road, label: "Roads" },
  { icon: icons.electric, label: "Electricity" },
  { icon: icons.garbage, label: "Sanitation" },
  { icon: icons.drainage, label: "Drainage" },
  { icon: icons.streetlight, label: "Street Light" },
  { icon: icons.other, label: "Other" },
];

export default function ServicesPage() {
  return (
    <PublicLayout>
      <section style={{ textAlign: "center", marginBottom: 48 }}>
        <div style={{
          display: "inline-block", fontSize: 12, fontWeight: 700, color: "var(--primary)",
          background: "rgba(0,128,128,0.1)", padding: "6px 14px", borderRadius: 20, marginBottom: 16,
        }}>
          OUR SERVICES
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 34, fontWeight: 700, marginBottom: 14, lineHeight: 1.25 }}>
          Everything you need to get public issues resolved
        </h1>
        <p style={{ fontSize: 15, color: "var(--text-secondary)", maxWidth: 640, margin: "0 auto", lineHeight: 1.7 }}>
          From filing your first complaint to tracking it through resolution, JanSewa gives you and your
          local government departments a shared, transparent workflow.
        </p>
      </section>

      <section className="ls-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 56 }}>
        {services.map((s) => (
          <div key={s.title} style={{
            background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 24,
            display: "flex", flexDirection: "column",
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12, background: "rgba(0,128,128,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)", marginBottom: 16,
            }}>
              <Icon d={s.icon} size={22} />
            </div>
            <div style={{ fontSize: 15.5, fontWeight: 700, marginBottom: 8 }}>{s.title}</div>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 18, flex: 1 }}>{s.text}</p>
            <Link to={s.to} style={{ fontSize: 13, fontWeight: 700, color: "var(--primary)", display: "inline-flex", alignItems: "center", gap: 6 }}>
              {s.cta} <Icon d={icons.chevronRight} size={14} />
            </Link>
          </div>
        ))}
      </section>

      {/* Categories we handle */}
      <section style={{
        background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 32,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700 }}>Complaint Categories We Cover</h2>
          <Link to="/categories" style={{ fontSize: 13, fontWeight: 700, color: "var(--primary)", display: "inline-flex", alignItems: "center", gap: 6 }}>
            View all categories <Icon d={icons.chevronRight} size={14} />
          </Link>
        </div>
        <div className="ls-grid-6" style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 14 }}>
          {categories.map((c) => (
            <div key={c.label} style={{
              border: "1px solid var(--border)", borderRadius: 12, padding: "16px 10px", textAlign: "center",
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, background: "var(--background)", margin: "0 auto 8px",
                display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)",
              }}>
                <Icon d={c.icon} size={18} />
              </div>
              <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--text-primary)" }}>{c.label}</div>
            </div>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
