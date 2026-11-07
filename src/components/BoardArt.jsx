import { CalendarDays, Check, Flag } from "lucide-react";

// On phones the three columns are narrow, so cards drop the date chip and tighten up
const Mini = ({ title, tag, tone, className = "", done }) => (
  <div className={`min-w-0 rounded-xl border border-line bg-surface p-2 shadow-sm sm:p-3 ${className}`}>
    <div className="flex items-start gap-1.5 sm:gap-2">
      <span
        className={`mt-0.5 hidden h-4 w-4 shrink-0 place-items-center rounded-full border min-[420px]:grid ${
          done ? "border-done bg-done text-on-brand" : "border-line"
        }`}
      >
        {done && <Check className="h-2.5 w-2.5" strokeWidth={3.5} />}
      </span>
      <p className={`min-w-0 break-words text-[12px] font-semibold leading-snug text-ink sm:text-[13px] ${done ? "line-through opacity-60" : ""}`}>
        {title}
      </p>
    </div>
    <div className="mt-2 flex flex-wrap items-center gap-1 sm:mt-2.5 sm:gap-1.5">
      <span className={`chip !px-2 sm:!px-[9px] ${tone}`}>
        <Flag className="hidden h-3 w-3 min-[420px]:block" /> {tag}
      </span>
      <span className="chip hidden bg-line/60 text-muted sm:inline-flex">
        <CalendarDays className="h-3 w-3" /> Fri
      </span>
    </div>
  </div>
);

const Column = ({ label, dot, children, className = "" }) => (
  <div className={`min-w-0 rounded-2xl bg-paper/70 p-2 ring-1 ring-line sm:p-3 ${className}`}>
    <div className="mb-2 flex items-center gap-1.5 px-1 text-[11px] font-bold text-ink sm:mb-3 sm:gap-2 sm:text-xs">
      <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: dot }} />
      <span className="truncate">{label}</span>
    </div>
    <div className="space-y-2 sm:space-y-2.5">{children}</div>
  </div>
);

/** A small, static picture of the board for the landing page and sign-in screens. */
export default function BoardArt({ className = "" }) {
  return (
    <div className={`grid-panel relative overflow-hidden rounded-[28px] border border-line p-3 sm:p-7 ${className}`} aria-hidden="true">
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
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
