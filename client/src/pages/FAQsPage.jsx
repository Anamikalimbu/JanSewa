import { useState } from "react";
import { Link } from "react-router-dom";
import PublicLayout from "../components/site/PublicLayout";
import { Icon, icons } from "../components/site/icons";

const faqGroups = [
  {
    group: "Getting Started",
    items: [
      { q: "Do I need to pay anything to use JanSewa?", a: "No. JanSewa is a free public service. Creating an account, filing complaints, and tracking them all costs nothing." },
      { q: "Who can file a complaint?", a: "Any registered citizen. Registration only requires your name, email, phone number, and a password." },
      { q: "Can I file a complaint on behalf of someone else?", a: "Yes, as long as you have accurate details about the issue, category, and location — the complaint will be filed under your account." },
    ],
  },
  {
    group: "Submitting Complaints",
    items: [
      { q: "What information do I need to submit a complaint?", a: "A title, category and sub-category, a description of the issue, and the location/address. Ward number, priority, and up to 5 photos are optional but recommended." },
      { q: "What image formats are supported?", a: "JPG, PNG, and WEBP, up to 5MB per image, with a maximum of 5 images per complaint." },
      { q: "Can I edit a complaint after submitting it?", a: "You can't edit the original details, but you can add comments to a complaint at any time to provide updates or extra context." },
    ],
  },
  {
    group: "Tracking & Status",
    items: [
      { q: "What do the different statuses mean?", a: "Pending: submitted, awaiting review. Assigned: routed to a department. In Progress: work has started. Resolved: the issue has been fixed. Closed: the case is finalized." },
      { q: "How will I know when my complaint's status changes?", a: "You'll get an in-app notification every time the status changes, plus a note from the department if one was added." },
      { q: "What if my complaint isn't being addressed?", a: "Open the complaint and use \"Report Issue\" to flag it for direct review by an administrator." },
    ],
  },
  {
    group: "Account & Privacy",
    items: [
      { q: "Is my personal information kept private?", a: "Your contact details are only visible to the department handling your complaint and platform administrators — never published publicly." },
      { q: "How do I reset my password?", a: "Use \"Forgot Password\" on the login page. You'll receive a secure, time-limited reset link." },
      { q: "Can I deactivate my account?", a: "Contact support and we'll deactivate your account. Your past complaints remain in the system for department record-keeping." },
    ],
  },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid var(--border)" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
          gap: 12, padding: "16px 4px", background: "none", border: "none", cursor: "pointer", textAlign: "left",
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{q}</span>
        <Icon d={icons.chevronDown} size={16} style={{ color: "var(--text-muted)", flexShrink: 0, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
      </button>
      {open && (
        <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.65, padding: "0 4px 16px", maxWidth: 680 }}>
          {a}
        </p>
      )}
    </div>
  );
}

export default function FAQsPage() {
  const [query, setQuery] = useState("");

  const filtered = faqGroups
    .map((g) => ({
      ...g,
      items: g.items.filter(
        (i) =>
          !query.trim() ||
          i.q.toLowerCase().includes(query.toLowerCase()) ||
          i.a.toLowerCase().includes(query.toLowerCase())
      ),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <PublicLayout>
      <section style={{ textAlign: "center", marginBottom: 36 }}>
        <div style={{
          display: "inline-block", fontSize: 12, fontWeight: 700, color: "var(--primary)",
          background: "rgba(0,128,128,0.1)", padding: "6px 14px", borderRadius: 20, marginBottom: 16,
        }}>
          FREQUENTLY ASKED QUESTIONS
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 700, marginBottom: 14 }}>
          Have a question? We've probably answered it.
        </h1>

        <div style={{ maxWidth: 420, margin: "0 auto", position: "relative" }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search FAQs…"
            style={{
              width: "100%", boxSizing: "border-box", padding: "11px 14px", borderRadius: 10,
              border: "1px solid var(--border)", fontSize: 13.5, background: "var(--card)", color: "var(--text-primary)",
              fontFamily: "var(--font-body)",
            }}
          />
        </div>
      </section>

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)", fontSize: 13.5 }}>
          No FAQs match "{query}". Try a different search, or reach out on the Contact page.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 32, maxWidth: 760, margin: "0 auto" }}>
          {filtered.map((g) => (
            <div key={g.group}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
                {g.group}
              </div>
              <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: "4px 20px" }}>
                {g.items.map((item) => (
                  <FAQItem key={item.q} q={item.q} a={item.a} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <section style={{ textAlign: "center", marginTop: 48 }}>
        <p style={{ fontSize: 13.5, color: "var(--text-secondary)", marginBottom: 14 }}>Still need help?</p>
        <Link to="/contact" style={{
          display: "inline-flex", alignItems: "center", gap: 8, background: "var(--primary)", color: "#fff",
          padding: "11px 26px", borderRadius: 10, fontWeight: 700, fontSize: 13.5,
        }}>
          Contact Support <Icon d={icons.arrow} size={15} />
        </Link>
      </section>
    </PublicLayout>
  );
}
