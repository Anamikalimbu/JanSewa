import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import { useAuth } from "../../context/AuthContext";
import { userService } from "../../services/userService";
import { departmentService } from "../../services/departmentService";

const PAGE_SIZE = 10;

const ROLE_OPTIONS = [
  { value: "citizen", label: "Citizen" },
  { value: "department", label: "Department Staff" },
  { value: "admin", label: "Administrator" },
];

const ROLE_BADGE = {
  citizen:    { bg: "rgba(0,102,102,0.1)",   fg: "var(--secondary)" },
  department: { bg: "rgba(255,193,7,0.15)",  fg: "#8a6d00" },
  admin:      { bg: "rgba(255,107,107,0.14)", fg: "var(--accent)" },
};

const roleLabel = (role) => ROLE_OPTIONS.find((r) => r.value === role)?.label || role;

const selectStyle = {
  fontSize: 12, padding: "5px 8px", borderRadius: 6, border: "1px solid var(--border)",
  background: "var(--card)", color: "var(--text-primary)", cursor: "pointer",
};

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });

export default function AdminUsersPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);

  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [savingId, setSavingId] = useState(null);
  const [pendingDeptFor, setPendingDeptFor] = useState(null); // userId awaiting a department pick

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) navigate("/home");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (user?.role !== "admin") return;
    departmentService
      .getAll()
      .then(({ data }) => setDepartments(data?.data?.departments || []))
      .catch(() => {});
  }, [user]);

  const load = () => {
    setLoading(true);
    setError("");
    const params = { page, limit: PAGE_SIZE };
    if (search.trim()) params.search = search.trim();
    if (roleFilter) params.role = roleFilter;

    userService
      .getAll(params)
      .then(({ data }) => {
        setUsers(data?.data || []);
        setTotal(data?.pagination?.total ?? data?.total ?? 0);
      })
      .catch(() => setError("Couldn't load users. Please try again."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (user?.role === "admin") load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, search, roleFilter, page]);

  if (authLoading || !user || user.role !== "admin") return null;

  const toggleActive = async (target) => {
    if (target._id === user._id) {
      setError("You can't deactivate your own account.");
      return;
    }
    if (target.isActive) {
      const ok = window.confirm(
        `Deactivate ${target.name}'s account? They won't be able to log in until reactivated.`
      );
      if (!ok) return;
    }
    setSavingId(target._id);
    setNotice("");
    setError("");
    try {
      await userService.update(target._id, { isActive: !target.isActive });
      setNotice(`${target.name} is now ${target.isActive ? "deactivated" : "active"}.`);
      load();
    } catch (err) {
      setError(err?.response?.data?.message || "Couldn't update that account.");
    } finally {
      setSavingId(null);
    }
  };

  const handleRoleChange = async (target, role) => {
    if (role === target.role) return;
    if (target._id === user._id) {
      setError("You can't change your own role.");
      return;
    }
    if (role === "department") {
      // Need a department picked before we can save — show the inline picker.
      setPendingDeptFor(target._id);
      return;
    }
    await saveRole(target, role, null);
  };

  const saveRole = async (target, role, departmentId) => {
    setSavingId(target._id);
    setNotice("");
    setError("");
    try {
      await userService.updateRole(target._id, role, departmentId);
      setNotice(`${target.name}'s role is now ${roleLabel(role)}.`);
      setPendingDeptFor(null);
      load();
    } catch (err) {
      setError(err?.response?.data?.message || "Couldn't update that account's role.");
    } finally {
      setSavingId(null);
    }
  };

  const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1);
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  return (
    <AdminLayout>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
        Users
      </div>
      <div style={{ fontSize: 13.5, color: "var(--text-secondary)", marginBottom: 20 }}>
        Search any account, change roles, or deactivate access.
      </div>

      {error && (
        <div style={{ background: "var(--accent-light)", color: "var(--accent)", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 16 }}>
          {error}
        </div>
      )}
      {notice && (
        <div style={{ background: "rgba(40,167,69,0.12)", color: "#1e7a34", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 16 }}>
          {notice}
        </div>
      )}

      {/* Search + role filter */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by name or email"
          style={{
            flex: "1 1 260px", maxWidth: 340, boxSizing: "border-box", padding: "10px 12px", borderRadius: 8,
            border: "1px solid var(--border)", fontSize: 13.5, background: "var(--card)", color: "var(--text-primary)",
          }}
        />
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          style={{ ...selectStyle, padding: "10px 12px", fontSize: 13.5 }}
        >
          <option value="">All roles</option>
          {ROLE_OPTIONS.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
        <div style={{
          display: "flex", background: "var(--background)", padding: "10px 16px",
          borderBottom: "1px solid var(--border)", fontSize: 11, fontWeight: 700,
          color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: 0.5, gap: 8,
        }}>
          <span style={{ flex: 3 }}>Name / Email</span>
          <span style={{ flex: 2 }}>Role</span>
          <span style={{ flex: 1.6 }}>Status</span>
          <span style={{ flex: 1.4 }}>Joined</span>
          <span style={{ width: 90, textAlign: "right" }}>Action</span>
        </div>

        {loading ? (
          [0, 1, 2, 3, 4].map((i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", padding: "14px 16px", gap: 8, borderBottom: "1px solid var(--border)" }}>
              <div className="skeleton" style={{ flex: 3, height: 14 }} />
              <div className="skeleton" style={{ flex: 2, height: 14 }} />
              <div className="skeleton" style={{ flex: 1.6, height: 14 }} />
            </div>
          ))
        ) : users.length === 0 ? (
          <div style={{ padding: "32px 16px", textAlign: "center", fontSize: 13.5, color: "var(--text-secondary)" }}>
            No users match this search.
          </div>
        ) : (
          users.map((u) => (
            <div key={u._id} style={{ padding: "10px 16px", borderBottom: "1px solid var(--border)", fontSize: 13, opacity: savingId === u._id ? 0.6 : 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ flex: 3 }}>
                  <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                    {u.name} {u._id === user._id && <span style={{ fontSize: 10.5, color: "var(--text-muted)" }}>(you)</span>}
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--text-secondary)" }}>{u.email}</div>
                </span>
                <span style={{ flex: 2 }}>
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u, e.target.value)}
                    disabled={savingId === u._id || u._id === user._id}
                    style={{ ...selectStyle, width: "100%" }}
                  >
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                  {u.role === "department" && u.departmentId?.departmentName && (
                    <div style={{ fontSize: 10.5, color: "var(--text-secondary)", marginTop: 3 }}>{u.departmentId.departmentName}</div>
                  )}
                </span>
                <span style={{ flex: 1.6 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 999,
                    background: u.isActive ? "rgba(40,167,69,0.14)" : "rgba(148,163,184,0.18)",
                    color: u.isActive ? "#1e7a34" : "#64748b",
                  }}>
                    {u.isActive ? "Active" : "Deactivated"}
                  </span>
                </span>
                <span style={{ flex: 1.4, fontSize: 12, color: "var(--text-secondary)" }}>{formatDate(u.createdAt)}</span>
                <span style={{ width: 90, textAlign: "right" }}>
                  <button
                    onClick={() => toggleActive(u)}
                    disabled={savingId === u._id || u._id === user._id}
                    style={{
                      fontSize: 11.5, fontWeight: 700, color: u.isActive ? "var(--accent)" : "#1e7a34",
                      border: `1px solid ${u.isActive ? "var(--accent)" : "#1e7a34"}`,
                      borderRadius: 6, padding: "4px 9px", background: "var(--card)",
                      cursor: (savingId === u._id || u._id === user._id) ? "not-allowed" : "pointer",
                    }}
                  >
                    {u.isActive ? "Deactivate" : "Activate"}
                  </button>
                </span>
              </div>

              {/* Inline department picker — shown when switching someone to Department Staff */}
              {pendingDeptFor === u._id && (
                <div style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "center", background: "var(--background)", borderRadius: 8, padding: "10px 12px" }}>
                  <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>Assign to department:</span>
                  <select
                    defaultValue=""
                    onChange={(e) => e.target.value && saveRole(u, "department", e.target.value)}
                    style={{ ...selectStyle, flex: 1 }}
                  >
                    <option value="" disabled>Choose a department…</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.departmentName}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => setPendingDeptFor(null)}
                    style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", background: "none", border: "none", cursor: "pointer" }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {total > 0 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14, fontSize: 12.5, color: "var(--text-secondary)" }}>
          <div>Showing {rangeStart}-{rangeEnd} of {total}</div>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--card)", fontSize: 12.5, opacity: page === 1 ? 0.5 : 1 }}
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 5).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                style={{
                  padding: "6px 12px", borderRadius: 6, fontSize: 12.5,
                  border: `1px solid ${p === page ? "var(--primary)" : "var(--border)"}`,
                  background: p === page ? "var(--primary)" : "var(--card)",
                  color: p === page ? "#fff" : "var(--text-primary)", fontWeight: p === page ? 700 : 500,
                }}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--card)", fontSize: 12.5, opacity: page === totalPages ? 0.5 : 1 }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
