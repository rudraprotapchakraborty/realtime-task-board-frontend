import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Ban, ChevronLeft, ChevronRight, Search, ShieldCheck, Trash2, UserCheck, Users } from "lucide-react";
import api, { getErrorMessage } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import Avatar from "../components/Avatar";

const Stat = ({ label, value, tone = "var(--brand)" }) => (
  <div className="card p-5">
    <dd className="text-3xl font-bold tracking-tight tabular-nums" style={{ color: tone }}>
      {value ?? "–"}
    </dd>
    <dt className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted">{label}</dt>
  </div>
);

export default function Admin() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  const loadStats = useCallback(() => {
    api.get("/admin/stats").then((res) => setStats(res.data.data)).catch(() => {});
  }, []);

  const loadUsers = useCallback(() => {
    api
      .get("/admin/users", { params: { page, q: search || undefined, limit: 10 } })
      .then((res) => {
        setData(res.data.data);
        setError(null);
      })
      .catch((err) => setError(getErrorMessage(err, "Could not load members.")));
  }, [page, search]);

  useEffect(loadStats, [loadStats]);
  useEffect(loadUsers, [loadUsers]);

  // Search as the admin types, without a request per keystroke
  useEffect(() => {
    const id = setTimeout(() => {
      setPage(1);
      setSearch(q.trim());
    }, 300);
    return () => clearTimeout(id);
  }, [q]);

  const update = async (target, patch, message) => {
    try {
      await api.patch(`/admin/users/${target.id}`, patch);
      toast.success(message);
      loadUsers();
      loadStats();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const remove = async (target) => {
    try {
      await api.delete(`/admin/users/${target.id}`);
      toast.success("Member deleted");
      setConfirmId(null);
      loadUsers();
      loadStats();
    } catch (err) {
      toast.error(getErrorMessage(err));
      setConfirmId(null);
    }
  };

  return (
    <div className="frame pb-20 pt-8">
      <span className="eyeline">Admin</span>
      <h1 className="display mt-3 text-[clamp(30px,4vw,46px)]">
        Members and <span className="accent">activity</span>
      </h1>
      {user.isDemo && (
        <p role="note" className="mt-5 rounded-2xl border border-brand/25 bg-brand-soft p-3.5 text-sm">
          <b>Test admin.</b> You only see and manage the test accounts, never real members.
        </p>
      )}

      <dl className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-6">
        <Stat label="Members" value={stats?.users} />
        <Stat label="Verified" value={stats?.verified} tone="var(--done)" />
        <Stat label="Blocked" value={stats?.blocked} tone="var(--danger)" />
        <Stat label="To-Do" value={stats?.tasks.TODO} tone="var(--todo)" />
        <Stat label="In progress" value={stats?.tasks.IN_PROGRESS} tone="var(--progress)" />
        <Stat label="Done" value={stats?.tasks.DONE} tone="var(--done)" />
      </dl>

      <div className="mt-9 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight">
          <Users className="h-5 w-5 text-brand" /> Members
        </h2>
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or email" aria-label="Search members" className="input !rounded-full !py-2.5 pl-10" />
        </div>
      </div>

      {error ? (
        <p role="alert" className="card mt-4 p-6 text-center text-danger">
          {error}
        </p>
      ) : !data ? (
        <div className="mt-4 space-y-3" role="status" aria-label="Loading members">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-[72px]" />
          ))}
        </div>
      ) : data.users.length === 0 ? (
        <p className="card mt-4 p-8 text-center text-muted">No members match your search.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {data.users.map((m) => {
            const self = m.id === user.id;
            return (
              <li key={m.id} className="card flex flex-wrap items-center gap-4 p-4">
                <Avatar name={m.fullName} url={m.profileImageUrl} size={44} />
                <div className="min-w-0 flex-1 basis-48">
                  <p className="flex flex-wrap items-center gap-2 font-semibold">
                    <span className="truncate">{m.fullName}</span>
                    {m.role === "ADMIN" && <span className="chip bg-brand-soft text-brand"><ShieldCheck className="h-3 w-3" /> Admin</span>}
                    {m.isBlocked && <span className="chip bg-[var(--danger-soft)] text-danger"><Ban className="h-3 w-3" /> Blocked</span>}
                    {m.isDemo && <span className="chip bg-line/60 text-muted">Test</span>}
                    {self && <span className="chip bg-[var(--done-soft)] text-done">You</span>}
                  </p>
                  <p className="truncate font-mono text-xs text-muted">{m.email}</p>
                </div>
                <p className="text-sm text-muted tabular-nums">
                  <b className="text-ink">{m.taskCount}</b> tasks
                </p>
                {m.locked && <p className="text-xs font-semibold text-muted">Shared login, locked</p>}
                {!self && !m.locked && (
                  <div className="flex flex-wrap items-center gap-2">
                    {confirmId === m.id ? (
                      <>
                        <button type="button" onClick={() => remove(m)} className="btn btn-danger btn-sm">
                          Delete for good
                        </button>
                        <button type="button" onClick={() => setConfirmId(null)} className="btn btn-ghost btn-sm">
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        {m.isBlocked ? (
                          <button type="button" onClick={() => update(m, { isBlocked: false }, "Member unblocked")} className="btn btn-ghost btn-sm">
                            <UserCheck className="h-3.5 w-3.5" /> Unblock
                          </button>
                        ) : (
                          <button type="button" onClick={() => update(m, { isBlocked: true }, "Member blocked")} className="btn btn-ghost btn-sm">
                            <Ban className="h-3.5 w-3.5" /> Block
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => update(m, { role: m.role === "ADMIN" ? "USER" : "ADMIN" }, m.role === "ADMIN" ? "Admin role removed" : "Made an admin")}
                          className="btn btn-ghost btn-sm"
                        >
                          <ShieldCheck className="h-3.5 w-3.5" /> {m.role === "ADMIN" ? "Make member" : "Make admin"}
                        </button>
                        <button type="button" onClick={() => setConfirmId(m.id)} aria-label={`Delete ${m.fullName}`} className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-[var(--danger-soft)] hover:text-danger">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {data && data.pages > 1 && (
        <nav aria-label="Pagination" className="mt-6 flex items-center justify-center gap-3">
          <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn btn-ghost btn-sm">
            <ChevronLeft className="h-4 w-4" /> Previous
          </button>
          <span className="text-sm text-muted tabular-nums">
            Page {data.page} of {data.pages}
          </span>
          <button type="button" disabled={page >= data.pages} onClick={() => setPage((p) => p + 1)} className="btn btn-ghost btn-sm">
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </nav>
      )}
    </div>
  );
}
