import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2, Trash2, X } from "lucide-react";
import { PRIORITIES, STATUSES, toInputDate } from "./meta";

/** Create or edit a task. `task` is null for a new one (with `defaultStatus`). */
export default function TaskModal({ task, defaultStatus = "TODO", onClose, onSave, onDelete }) {
  const editing = Boolean(task);
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [status, setStatus] = useState(task?.status ?? defaultStatus);
  const [priority, setPriority] = useState(task?.priority ?? "MEDIUM");
  const [dueDate, setDueDate] = useState(toInputDate(task?.dueDate));
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState("");
  const titleRef = useRef(null);

  useEffect(() => {
    titleRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Give the task a title.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSave({ title: title.trim(), description: description.trim(), status, priority, dueDate: dueDate || null });
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || "Could not save the task.");
      setSaving(false);
    }
  };

  // Rendered on <body>: inside the animated page wrapper a fixed element would be positioned against the page, not the screen
  return createPortal(
    <div
      className="animate-fade fixed inset-0 z-50 grid place-items-end bg-ink/45 p-0 backdrop-blur-[2px] sm:place-items-center sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <form
        onSubmit={submit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-modal-title"
        className="animate-pop max-h-[92vh] w-full overflow-y-auto rounded-t-3xl border border-line bg-surface p-5 shadow-2xl sm:max-w-[480px] sm:rounded-3xl sm:p-7"
      >
        <div className="flex items-center justify-between">
          <h2 id="task-modal-title" className="text-xl font-bold tracking-tight">
            {editing ? "Edit task" : "New task"}
          </h2>
          <button type="button" onClick={onClose} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-line hover:text-ink">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="task-title" className="flex justify-between text-sm font-semibold">
              Title <span className="font-normal text-muted tabular-nums">{title.length}/80</span>
            </label>
            <input id="task-title" ref={titleRef} className="input" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} placeholder="What needs doing?" />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="task-desc" className="flex justify-between text-sm font-semibold">
              Notes <span className="font-normal text-muted tabular-nums">{description.length}/500</span>
            </label>
            <textarea id="task-desc" className="input min-h-[96px] resize-y" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={500} placeholder="Optional details" />
          </div>

          <fieldset className="space-y-1.5">
            <legend className="text-sm font-semibold">Column</legend>
            <div className="grid grid-cols-3 gap-1.5 rounded-xl bg-paper p-1 ring-1 ring-line">
              {STATUSES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  aria-pressed={status === s.id}
                  onClick={() => setStatus(s.id)}
                  className={`rounded-lg px-2 py-2 text-[13px] font-semibold transition-colors ${
                    status === s.id ? "bg-surface text-ink shadow-sm ring-1 ring-line" : "text-muted hover:text-ink"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="grid gap-5 sm:grid-cols-2">
            <fieldset className="space-y-1.5">
              <legend className="text-sm font-semibold">Priority</legend>
              <div className="grid grid-cols-3 gap-1.5 rounded-xl bg-paper p-1 ring-1 ring-line">
                {PRIORITIES.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    aria-pressed={priority === p.id}
                    onClick={() => setPriority(p.id)}
                    className={`rounded-lg px-1 py-2 text-[13px] font-semibold transition-colors ${
                      priority === p.id ? "bg-surface text-ink shadow-sm ring-1 ring-line" : "text-muted hover:text-ink"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </fieldset>
            <div className="space-y-1.5">
              <label htmlFor="task-due" className="text-sm font-semibold">
                Due date
              </label>
              <input id="task-due" type="date" className="input" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>

          {error && (
            <p role="alert" className="rounded-xl bg-[var(--danger-soft)] p-3 text-sm text-danger">
              {error}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            {editing ? (
              confirmDelete ? (
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => { onDelete(task); onClose(); }} className="btn btn-danger btn-sm">
                    Yes, delete
                  </button>
                  <button type="button" onClick={() => setConfirmDelete(false)} className="btn btn-ghost btn-sm">
                    Keep
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => setConfirmDelete(true)} className="flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-danger">
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              )
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="btn btn-ghost">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="btn btn-primary">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {editing ? "Save" : "Add task"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>,
    document.body
  );
}
