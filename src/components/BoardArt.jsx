import { CalendarDays, Check, Flag } from "lucide-react";

const Mini = ({ title, tag, tone, className = "", done }) => (
  <div className={`rounded-xl border border-line bg-surface p-3 shadow-sm ${className}`}>
    <div className="flex items-start gap-2">
      <span
        className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border ${
          done ? "border-done bg-done text-on-brand" : "border-line"
        }`}
      >
        {done && <Check className="h-2.5 w-2.5" strokeWidth={3.5} />}
      </span>
      <p className={`text-[13px] font-semibold leading-snug text-ink ${done ? "line-through opacity-60" : ""}`}>{title}</p>
    </div>
    <div className="mt-2.5 flex items-center gap-2">
      <span className={`chip ${tone}`}>
        <Flag className="h-3 w-3" /> {tag}
      </span>
      <span className="chip bg-line/60 text-muted">
        <CalendarDays className="h-3 w-3" /> Fri
      </span>
    </div>
  </div>
);

const Column = ({ label, dot, children, className = "" }) => (
  <div className={`rounded-2xl bg-paper/70 p-3 ring-1 ring-line ${className}`}>
    <div className="mb-3 flex items-center gap-2 px-1 text-xs font-bold text-ink">
      <span className="h-2 w-2 rounded-full" style={{ background: dot }} />
      {label}
    </div>
    <div className="space-y-2.5">{children}</div>
  </div>
);

/** A small, static picture of the board for the landing page and sign-in screens. */
export default function BoardArt({ className = "" }) {
  return (
    <div className={`grid-panel relative overflow-hidden rounded-[28px] border border-line p-5 sm:p-7 ${className}`} aria-hidden="true">
      <div className="grid grid-cols-3 gap-3">
        <Column label="To-Do" dot="var(--todo)">
          <Mini title="Plan the launch" tag="High" tone="bg-[var(--danger-soft)] text-danger" />
          <Mini title="Write release notes" tag="Medium" tone="bg-[var(--progress-soft)] text-progress" />
        </Column>
        <Column label="In Progress" dot="var(--progress)">
          <Mini title="Fix checkout bug" tag="High" tone="bg-[var(--danger-soft)] text-danger" className="float-a" />
          <Mini title="Design emails" tag="Low" tone="bg-brand-soft text-brand" />
        </Column>
        <Column label="Done" dot="var(--done)">
          <Mini title="Pricing page" tag="Medium" tone="bg-[var(--progress-soft)] text-progress" done />
          <Mini title="Error alerts" tag="High" tone="bg-[var(--danger-soft)] text-danger" done className="float-c" />
        </Column>
      </div>
      <div className="float-b absolute bottom-5 right-5 hidden items-center gap-2 rounded-full bg-surface px-4 py-2 text-xs font-bold text-ink shadow-lg ring-1 ring-line sm:flex">
        <span className="live-dot h-2 w-2 rounded-full bg-done" /> Synced just now
      </div>
    </div>
  );
}
