import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { complaintService } from "../../services/complaintService";

const iconPaths = {
  plus:     "M12 5v14M5 12h14",
  search:   "M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.35-4.35",
  user:     "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z",
};

const Icon = ({ d, size = 16, className = "" }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const STATUS_STYLES = {
  Pending:     { bg: "bg-warning/15",  fg: "text-[#8a6d00]", key: "status_pending" },
  Assigned:    { bg: "bg-secondary/15",  fg: "text-secondary", key: "status_assigned" },
  InProgress:  { bg: "bg-secondary/15",  fg: "text-secondary", key: "status_inprogress" },
  Resolved:    { bg: "bg-success/15",  fg: "text-[#1e7a34]", key: "status_resolved" },
  Closed:      { bg: "bg-[#eef0f2]",               fg: "text-text-secondary", key: "status_closed" },
};

const StatusBadge = ({ status, t }) => {
  const s = STATUS_STYLES[status] || { bg: "bg-[#eef0f2]", fg: "text-text-secondary", key: "status_pending" };
  return (
    <span className={`inline-block px-2.5 py-[3px] rounded-full text-[11.5px] font-bold whitespace-nowrap ${s.bg} ${s.fg}`}>
      {t(s.key)}
    </span>
  );
};

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });

const StatCard = ({ label, value, loading }) => (
  <div className="bg-card border border-border rounded-xl p-4">
    {loading ? (
      <div className="skeleton w-10 h-7 mb-1.5" />
    ) : (
      <div className="font-display text-[26px] font-bold text-text-primary">
        {value}
      </div>
    )}
    <div className="text-[12.5px] text-text-secondary mt-1 font-medium">{label}</div>
  </div>
);

export default function CitizenDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;

    let mounted = true;
    setLoading(true);
    setError("");

    Promise.all([complaintService.getMyStats(), complaintService.getMine({ limit: 5 })])
      .then(([statsRes, recentRes]) => {
        if (!mounted) return;
        setStats(statsRes.data?.data || {});
        setRecent(recentRes.data?.data?.complaints || []);
      })
      .catch(() => {
        if (mounted) setError("Couldn't load your dashboard data. Please try refreshing.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [user]);

  if (authLoading || !user) return null;

  const firstName = user.name?.split(" ")[0] || user.name;

  return (
    <DashboardLayout>
      {/* WELCOME BANNER */}
      <div className="relative rounded-2xl overflow-hidden mb-6 h-28 md:h-[120px]">
        <img
          src="https://images.unsplash.com/photo-1680471818128-b85e28f34edd?auto=format&fit=crop&w=1200&q=80"
          alt="Kathmandu Valley, Nepal"
          className="w-full h-full object-cover block"
        />
        <div 
          className="absolute inset-0 flex flex-col justify-center px-6"
          style={{ background: "linear-gradient(90deg, rgba(0,51,51,0.82) 0%, rgba(0,51,51,0.35) 65%, rgba(0,51,51,0.05) 100%)" }}
        >
          <div className="font-display text-xl md:text-[22px] font-bold text-white">
            {t("dash_welcome")}, {firstName}!
          </div>
          <div className="text-[13px] text-white/85 mt-1">
            {t("dash_subtitle")}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-accent-light text-accent rounded-lg px-3.5 py-2.5 text-[13px] mb-4">
          {error}
        </div>
      )}

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-7">
        <StatCard label={t("dash_totalComplaints")} value={stats.total} loading={loading} />
        <StatCard label={t("dash_inProgress")}      value={stats.inProgress} loading={loading} />
        <StatCard label={t("dash_resolved")}         value={stats.resolved} loading={loading} />
        <StatCard label={t("dash_pending")}          value={stats.pending} loading={loading} />
      </div>

      {/* RECENT COMPLAINTS */}
      <div className="flex justify-between items-center mb-3">
        <div className="text-[15.5px] font-bold text-text-primary">{t("dash_recentComplaints")}</div>
        <Link to="/complaints" className="text-[12.5px] text-primary font-semibold hover:underline">
          {t("dash_viewAll")}
        </Link>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden mb-7 max-w-full">
        {/* Table Header */}
        <div className="hidden md:flex bg-background px-4 py-2.5 border-b border-border text-[11.5px] font-bold text-text-secondary uppercase tracking-wider gap-2">
          <span className="flex-[3]"> {t("dash_col_title")}</span>
          <span className="flex-[2]"> {t("dash_col_id")}</span>
          <span className="flex-[2]"> {t("dash_col_status")}</span>
          <span className="flex-[2]"> {t("dash_col_date")}</span>
        </div>

        {loading ? (
          [0, 1, 2].map((i) => (
            <div key={i} className="flex flex-col md:flex-row md:items-center p-4 gap-2 border-b border-border">
              <div className="skeleton h-3.5 w-3/4 md:flex-[3]" />
              <div className="skeleton h-3.5 w-1/4 md:flex-[2]" />
              <div className="skeleton h-3.5 w-1/3 md:flex-[2]" />
              <div className="skeleton h-3.5 w-1/4 md:flex-[2]" />
            </div>
          ))
        ) : recent.length === 0 ? (
          <div className="px-4 py-7 text-center text-[13px] text-text-secondary">
            {t("dash_noComplaints")}{" "}
            <Link to="/complaints/new" className="text-primary font-semibold hover:underline">
              {t("dash_submitFirst")}
            </Link>
          </div>
        ) : (
          recent.map((c) => (
            <div
              key={c.id}
              className="flex flex-col md:flex-row md:items-center p-4 gap-2 md:gap-2 border-b border-border text-[13px] text-text-primary"
            >
              <span className="font-medium md:flex-[3] break-words">{c.title}</span>
              
              <div className="flex justify-between md:contents">
                  <span className="text-[11.5px] text-text-muted md:flex-[2]">#{c.code}</span>
                  <span className="md:hidden text-[12px] text-text-secondary">{formatDate(c.createdAt)}</span>
              </div>
              
              <span className="mt-1 md:mt-0 md:flex-[2]">
                  <StatusBadge status={c.status} t={t} />
              </span>
              
              <span className="hidden md:block text-[12px] text-text-secondary md:flex-[2]">
                  {formatDate(c.createdAt)}
              </span>
            </div>
          ))
        )}
      </div>

      {/* QUICK ACTIONS */}
      <div className="text-[15.5px] font-bold text-text-primary mb-3">
        {t("dash_quickActions")}
      </div>
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <Link to="/complaints/new" className="flex items-center justify-center sm:justify-start gap-2 px-4.5 py-3 rounded-xl border border-border bg-card text-[13.5px] font-semibold text-primary hover:bg-gray-50 transition-colors w-full sm:w-auto">
          <Icon d={iconPaths.plus} /> {t("dash_submitNew")}
        </Link>
        <Link to="/complaints" className="flex items-center justify-center sm:justify-start gap-2 px-4.5 py-3 rounded-xl border border-border bg-card text-[13.5px] font-semibold text-text-primary hover:bg-gray-50 transition-colors w-full sm:w-auto">
          <Icon d={iconPaths.search} /> {t("dash_trackComplaint")}
        </Link>
        <Link to="/profile" className="flex items-center justify-center sm:justify-start gap-2 px-4.5 py-3 rounded-xl border border-border bg-card text-[13.5px] font-semibold text-text-primary hover:bg-gray-50 transition-colors w-full sm:w-auto">
          <Icon d={iconPaths.user} /> {t("dash_editProfile")}
        </Link>
      </div>
    </DashboardLayout>
  );
}
