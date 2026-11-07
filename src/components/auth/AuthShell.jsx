import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import Brand from "../Brand";
import ThemeToggle from "../ThemeToggle";
import BoardArt from "../BoardArt";

/** Two column auth layout: the form on the left, an illustration (or the test accounts) on the right. */
export function AuthShell({ title, subtitle, children, footer, aside }) {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="frame flex min-h-[72px] items-center justify-between">
        <Brand />
        <ThemeToggle />
      </header>

      <div className="frame grid items-center gap-12 pb-16 pt-4 lg:min-h-[calc(100vh-150px)] lg:grid-cols-2 lg:gap-24">
        <div className="mx-auto w-full max-w-[420px]">
          <h1 className="display text-[clamp(38px,4.4vw,56px)]">
            {title}
            <span className="accent">.</span>
          </h1>
          {subtitle && <p className="mt-3 text-[15px] leading-relaxed text-muted">{subtitle}</p>}
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-8 text-center text-sm text-muted">{footer}</div>}
        </div>

        {/* A custom panel (the test accounts) shows on every screen size; the art is desktop-only */}
        <aside className={`mx-auto w-full ${aside ? "max-w-[420px] lg:max-w-[560px]" : "hidden max-w-[560px] lg:block"}`}>
          {aside ?? <BoardArt />}
        </aside>
      </div>
    </div>
  );
}

export function FormMessage({ error, notice }) {
  if (!error && !notice) return null;
  const isError = Boolean(error);
  return (
    <div
      role={isError ? "alert" : "status"}
      className={`animate-pop flex items-start gap-3 rounded-xl border p-3.5 text-sm ${
        isError
          ? "border-danger/30 bg-[var(--danger-soft)] text-danger"
          : "border-done/30 bg-[var(--done-soft)] text-done"
      }`}
    >
      {isError ? <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />}
      <p className="leading-relaxed">{error || notice}</p>
    </div>
  );
}

export function SubmitButton({ loading, children, loadingText, disabled, variant = "primary" }) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className={`btn w-full py-3.5 ${variant === "danger" ? "btn-danger" : "btn-primary"}`}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{loadingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
