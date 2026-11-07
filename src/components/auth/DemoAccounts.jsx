import { useEffect, useState } from "react";
import { ArrowUpLeft, ShieldCheck, Users } from "lucide-react";
import api from "../../lib/api";

const icons = { Admin: ShieldCheck, User: Users };
const blurbs = {
  Admin: "See every member, block accounts and check board stats",
  User: "A busy board: drag cards, add tasks, set priorities",
};

/** "Try a test account": lists the demo logins and fills the sign-in form with the chosen one. */
export default function DemoAccounts({ onChoose }) {
  const [accounts, setAccounts] = useState(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [chosen, setChosen] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    api
      .get("/auth/demo-accounts", { signal: controller.signal })
      .then((res) => {
        setFailed(false);
        setAccounts(res.data.data);
      })
      .catch(() => {
        if (!controller.signal.aborted) setFailed(true);
      });
    return () => controller.abort();
  }, [attempt]);

  return (
    <section aria-label="Test accounts" className="grid-panel rounded-[28px] border border-line p-5 sm:p-9">
      <span className="eyeline">Test accounts</span>
      <h2 className="display mt-4 text-3xl">
        Try a <span className="accent">test account</span>
      </h2>
      <p className="mt-2 text-sm text-muted">Pick a role to fill in the sign-in form. No sign-up needed.</p>

      <div className="mt-6">
        {failed ? (
          <button type="button" onClick={() => setAttempt((n) => n + 1)} className="text-sm font-semibold text-brand underline underline-offset-4">
            Retry loading accounts
          </button>
        ) : accounts === null ? (
          <div className="space-y-3" role="status" aria-label="Loading accounts">
            {[1, 2].map((i) => (
              <div key={i} className="skeleton h-[78px]" />
            ))}
          </div>
        ) : accounts.length === 0 ? (
          <p className="text-sm text-muted">Test accounts are not available right now.</p>
        ) : (
          <ul className="space-y-3">
            {accounts.map((a) => {
              const Icon = icons[a.label] ?? Users;
              return (
                <li key={a.email} className="card flex items-center gap-4 p-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink">{a.label}</p>
                    <p className="truncate font-mono text-xs text-muted">{a.email}</p>
                    <p className="text-xs text-muted">{blurbs[a.label]}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onChoose(a);
                      setChosen(a.email);
                      document.querySelector('input[type="email"]')?.focus();
                    }}
                    aria-label={`Use the ${a.label} test account`}
                    className="btn btn-ghost btn-sm shrink-0"
                  >
                    {chosen === a.email ? "Filled in" : "Use login"}
                    <ArrowUpLeft className="h-3.5 w-3.5" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {accounts && accounts.length > 0 && (
        <p className="mt-5 font-mono text-xs text-muted">
          Password for all: <span className="font-semibold text-ink">{accounts[0].password}</span>
        </p>
      )}
    </section>
  );
}
