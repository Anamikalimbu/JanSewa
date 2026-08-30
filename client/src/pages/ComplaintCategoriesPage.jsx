import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PublicLayout from "../components/site/PublicLayout";
import { Icon, icons } from "../components/site/icons";
import { complaintService } from "../services/complaintService";

const CATEGORY_ICON = {
  Water: icons.water,
  Road: icons.road,
  Electricity: icons.electric,
  Garbage: icons.garbage,
  Drainage: icons.drainage,
  StreetLight: icons.streetlight,
  Other: icons.other,
};

export default function ComplaintCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openCat, setOpenCat] = useState(null);

  useEffect(() => {
    complaintService
      .getCategories()
      .then(({ data }) => setCategories(data?.data?.categories || []))
      .catch(() => setError("Couldn't load complaint categories right now. Please try again shortly."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PublicLayout>
      <section style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{
          display: "inline-block", fontSize: 12, fontWeight: 700, color: "var(--primary)",
          background: "rgba(0,128,128,0.1)", padding: "6px 14px", borderRadius: 20, marginBottom: 16,
        }}>
          COMPLAINT CATEGORIES
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 700, marginBottom: 14 }}>
          What can you report on JanSewa?
        </h1>
        <p style={{ fontSize: 14.5, color: "var(--text-secondary)", maxWidth: 620, margin: "0 auto", lineHeight: 1.7 }}>
          Every complaint is filed under a category and sub-category so it reaches the right department
          immediately. Browse the list below, or jump straight in and file yours.
        </p>
      </section>

      {loading && (
        <div className="ls-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 140, borderRadius: 14 }} />
          ))}
        </div>
      )}

      {!loading && error && (
        <div style={{ background: "var(--accent-light)", color: "var(--accent)", borderRadius: 10, padding: "14px 18px", fontSize: 13.5, textAlign: "center" }}>
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="ls-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
          {categories.map((cat) => {
            const isOpen = openCat === cat.value;
            return (
              <div
                key={cat.value}
                style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 22, cursor: "pointer" }}
                onClick={() => setOpenCat(isOpen ? null : cat.value)}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: isOpen ? 14 : 0 }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 11, background: "rgba(0,128,128,0.1)", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)",
                  }}>
                    <Icon d={CATEGORY_ICON[cat.value] || icons.other} size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--text-primary)" }}>{cat.label_en}</div>
                    <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{cat.label_ne}</div>
                  </div>
                  <Icon d={icons.chevronDown} size={16} style={{ color: "var(--text-muted)", transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
                </div>

                {isOpen && (
                  <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                    {cat.subCategories?.map((sub) => (
                      <div key={sub.value} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--text-secondary)" }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--primary)", flexShrink: 0 }} />
                        {sub.label_en}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <section style={{
        marginTop: 48, background: "linear-gradient(135deg, var(--accent), var(--accent-light))", borderRadius: 16,
        padding: "32px 36px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 18,
      }}>
        <div>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 700, color: "#fff", marginBottom: 4 }}>
            Don't see your issue listed?
          </h3>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.85)" }}>File it under "Other" — every complaint still gets reviewed and routed.</p>
        </div>
        <Link to="/register" style={{ background: "#fff", color: "var(--text-primary)", padding: "11px 24px", borderRadius: 10, fontWeight: 700, fontSize: 13, whiteSpace: "nowrap" }}>
          Submit a Complaint
        </Link>
      </section>
    </PublicLayout>
  );
}
