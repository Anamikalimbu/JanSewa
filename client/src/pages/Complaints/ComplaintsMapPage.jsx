import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useLanguage } from "../../context/LanguageContext";
import { mapService } from "../../services/mapService";
import { complaintService } from "../../services/complaintService";

// Default center: Dharan, Sunsari, Koshi Province, Nepal (matches
// the platform's primary service area). Falls back gracefully if no points are found there.
const DEFAULT_CENTER = [26.8129, 87.2836];
const DEFAULT_ZOOM = 13;

const STATUS_COLORS = {
  Pending: "#FFC107",
  Assigned: "#008080",
  InProgress: "#008080",
  Resolved: "#28A745",
  Closed: "#94a3b8",
};

const STATUS_KEY = {
  Pending: "status_pending",
  Assigned: "status_assigned",
  InProgress: "status_inprogress",
  Resolved: "status_resolved",
  Closed: "status_closed",
};

const iconPaths = {
  sparkles: "M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3zM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15zM5 14l.6 1.7L7.3 16l-1.7.6L5 18.3l-.6-1.7L2.7 16l1.7-.6L5 14z",
  refresh: "M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15",
};
const Icon = ({ d, size = 15, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...rest}>
    <path d={d} />
  </svg>
);

export default function ComplaintsMapPage() {
  const { t, lang } = useLanguage();

  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [categories, setCategories] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [insights, setInsights] = useState("");
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState("");

  useEffect(() => {
    complaintService
      .getCategories()
      .then(({ data }) => setCategories(data?.data?.categories || []))
      .catch(() => {
        // category filter is a nice-to-have — fail silently
      });
  }, []);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");

    const params = {};
    if (categoryFilter) params.category = categoryFilter;
    if (statusFilter) params.status = statusFilter;

    mapService
      .getPoints(params)
      .then(({ data }) => {
        if (mounted) setPoints(data?.data?.points || []);
      })
      .catch(() => {
        if (mounted) setError(t("map_noPoints"));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter, statusFilter]);

  const center = useMemo(() => {
    if (points.length === 0) return DEFAULT_CENTER;
    const avgLat = points.reduce((sum, p) => sum + p.lat, 0) / points.length;
    const avgLng = points.reduce((sum, p) => sum + p.lng, 0) / points.length;
    return [avgLat, avgLng];
  }, [points]);

  const handleGenerateInsights = async () => {
    setInsightsLoading(true);
    setInsightsError("");
    try {
      const { data } = await mapService.getInsights();
      setInsights(data?.data?.summary || "");
    } catch (err) {
      setInsightsError(err?.response?.data?.message || t("map_insightsError"));
    } finally {
      setInsightsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
          {t("map_title")}
        </h1>
        <p style={{ fontSize: 13.5, color: "var(--text-secondary)", marginTop: 4 }}>{t("map_subtitle")}</p>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16, alignItems: "center" }}>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={selectStyle}
        >
          <option value="">{t("map_allCategories")}</option>
          {categories.map((c) => (
            <option key={c.value} value={c.value}>
              {lang === "ne" ? c.label_ne : c.label_en}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={selectStyle}
        >
          <option value="">{t("map_allStatuses")}</option>
          {Object.keys(STATUS_KEY).map((s) => (
            <option key={s} value={s}>
              {t(STATUS_KEY[s])}
            </option>
          ))}
        </select>

        <span style={{ fontSize: 12.5, color: "var(--text-muted)", marginLeft: "auto" }}>
          {points.length} {t("map_pointsShown")}
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 300px", gap: 18, alignItems: "start" }}>
        {/* Map */}
        <div style={{
          borderRadius: 14, overflow: "hidden", border: "1px solid var(--border)",
          height: 520, background: "var(--card)", position: "relative",
        }}>
          <MapContainer center={center} zoom={DEFAULT_ZOOM} style={{ height: "100%", width: "100%" }} scrollWheelZoom>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {points.map((p) => (
                <CircleMarker
                  key={p.id}
                  center={[p.lat, p.lng]}
                  radius={9}
                  pathOptions={{
                    color: STATUS_COLORS[p.status] || "#008080",
                    fillColor: STATUS_COLORS[p.status] || "#008080",
                    fillOpacity: 0.85,
                    weight: 2,
                  }}
                >
                  <Popup>
                    <div style={{ fontFamily: "var(--font-body)", minWidth: 160 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{p.title}</div>
                      <div style={{ fontSize: 11.5, color: "#555", marginBottom: 4 }}>{p.code}</div>
                      <div style={{ fontSize: 12, marginBottom: 2 }}>
                        <strong>{t("map_filterCategory")}:</strong> {p.category}
                      </div>
                      <div style={{ fontSize: 12 }}>
                        <strong>{t("map_filterStatus")}:</strong>{" "}
                        <span style={{ color: STATUS_COLORS[p.status] || "#008080", fontWeight: 700 }}>
                          {t(STATUS_KEY[p.status] || "status_pending")}
                        </span>
                      </div>
                      {p.wardNumber && (
                        <div style={{ fontSize: 12 }}>
                          <strong>Ward:</strong> {p.wardNumber}
                        </div>
                      )}
                    </div>
                  </Popup>
                </CircleMarker>
            ))}
          </MapContainer>
          {!loading && points.length === 0 && (
            <div style={{
              position: "absolute", left: 16, right: 16, bottom: 16, zIndex: 1000,
              color: "var(--text-muted)", fontSize: 13, textAlign: "center", padding: "10px 14px",
              background: "rgba(255,255,255,0.92)", border: "1px solid var(--border)", borderRadius: 8,
            }}>
              {error || t("map_noPoints")}
            </div>
          )}
        </div>

        {/* AI Insights panel */}
        <div style={{
          border: "1px solid var(--border)", borderRadius: 14, background: "var(--card)",
          padding: 16, display: "flex", flexDirection: "column", gap: 12,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: "linear-gradient(135deg, var(--primary), var(--secondary))",
              display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0,
            }}>
              <Icon d={iconPaths.sparkles} size={15} />
            </div>
            <h2 style={{ fontSize: 14.5, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
              {t("map_aiInsights")}
            </h2>
          </div>

          {!insights && !insightsLoading && !insightsError && (
            <p style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
              {t("map_insightsHint")}
            </p>
          )}

          {insightsLoading && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-secondary)", fontSize: 12.5 }}>
              <span className="skeleton" style={{ width: 14, height: 14, borderRadius: "50%" }} />
              {t("map_generating")}
            </div>
          )}

          {insightsError && !insightsLoading && (
            <p style={{ fontSize: 12.5, color: "var(--accent)", lineHeight: 1.6, margin: 0 }}>{insightsError}</p>
          )}

          {insights && !insightsLoading && (
            <p style={{
              fontSize: 12.8, color: "var(--text-primary)", lineHeight: 1.7, margin: 0,
              whiteSpace: "pre-line",
            }}>
              {insights}
            </p>
          )}

          <button
            onClick={handleGenerateInsights}
            disabled={insightsLoading}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              padding: "9px 12px", borderRadius: 9, border: "none",
              background: "var(--primary)", color: "#fff", fontSize: 12.5, fontWeight: 700,
              cursor: insightsLoading ? "not-allowed" : "pointer", opacity: insightsLoading ? 0.7 : 1,
              marginTop: "auto",
            }}
          >
            <Icon d={iconPaths.refresh} size={13} />
            {t("map_generateInsights")}
          </button>

          {/* Legend */}
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
            {Object.entries(STATUS_COLORS).map(([status, color]) => (
              <div key={status} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11.5, color: "var(--text-secondary)" }}>
                <span style={{ width: 9, height: 9, borderRadius: "50%", background: color, display: "inline-block" }} />
                {t(STATUS_KEY[status])}
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

const selectStyle = {
  height: 36, padding: "0 10px", borderRadius: 8, border: "1px solid var(--border)",
  background: "var(--card)", fontSize: 12.5, color: "var(--text-primary)", fontFamily: "var(--font-body)",
};
