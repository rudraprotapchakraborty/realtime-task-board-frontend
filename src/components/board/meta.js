export const STATUSES = [
  { id: "TODO", label: "To-Do", color: "var(--todo)", soft: "var(--todo-soft)", hint: "Nothing here yet. Add a task to get started." },
  { id: "IN_PROGRESS", label: "In Progress", color: "var(--progress)", soft: "var(--progress-soft)", hint: "Drag a task here when you start it." },
  { id: "DONE", label: "Done", color: "var(--done)", soft: "var(--done-soft)", hint: "Finished tasks land here." },
];

export const PRIORITIES = [
  { id: "LOW", label: "Low", chip: "bg-brand-soft text-brand" },
  { id: "MEDIUM", label: "Medium", chip: "bg-[var(--progress-soft)] text-progress" },
  { id: "HIGH", label: "High", chip: "bg-[var(--danger-soft)] text-danger" },
];

export const priorityOf = (id) => PRIORITIES.find((p) => p.id === id) ?? PRIORITIES[1];

const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

/** "Today", "Tomorrow", "Overdue 2d" or a short date, plus whether it is overdue. */
export function dueInfo(dueDate, status) {
  if (!dueDate) return null;
  const date = new Date(dueDate);
  // Dates are stored at midnight UTC; show the calendar day the user picked
  const local = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  const diff = Math.round((local - startOfDay(new Date())) / 86_400_000);
  const overdue = diff < 0 && status !== "DONE";
  let label;
  if (diff === 0) label = "Today";
  else if (diff === 1) label = "Tomorrow";
  else if (diff === -1) label = "Yesterday";
  else if (diff < 0 && overdue) label = `${-diff}d overdue`;
  else label = local.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  return { label, overdue, soon: diff >= 0 && diff <= 1 && status !== "DONE" };
}

/** yyyy-mm-dd for a date input */
export const toInputDate = (dueDate) => (dueDate ? new Date(dueDate).toISOString().slice(0, 10) : "");
