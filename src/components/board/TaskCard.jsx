import { forwardRef } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CalendarDays, Check, Flag, GripVertical } from "lucide-react";
import { dueInfo, priorityOf } from "./meta";

/** The visual card. Used both in the column and as the floating copy while dragging. */
export const CardBody = forwardRef(function CardBody(
  { task, onOpen, onToggle, handleProps, style, className = "", dragging, ...rest },
  ref
) {
  const priority = priorityOf(task.priority);
  const due = dueInfo(task.dueDate, task.status);
  const done = task.status === "DONE";

  return (
    <article
      ref={ref}
      style={style}
      className={`task-card group relative rounded-2xl border border-line bg-surface p-3.5 shadow-[var(--shadow)] transition-colors hover:border-brand/50 ${
        dragging ? "opacity-40" : ""
      } ${className}`}
      {...rest}
    >
      <div className="flex items-start gap-2.5">
        <button
          type="button"
          onClick={() => onToggle?.(task)}
          aria-label={done ? `Mark "${task.title}" as not done` : `Mark "${task.title}" as done`}
          aria-pressed={done}
          className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border transition-colors ${
            done ? "border-done bg-done text-on-brand" : "border-muted/50 text-transparent hover:border-done hover:text-done"
          }`}
        >
          <Check className="h-3 w-3" strokeWidth={3.5} />
        </button>

        <button type="button" onClick={() => onOpen?.(task)} className="min-w-0 flex-1 text-left" aria-label={`Edit task: ${task.title}`}>
          <h3 className={`break-words text-[14.5px] font-semibold leading-snug text-ink ${done ? "line-through opacity-60" : ""}`}>
            {task.title}
          </h3>
          {task.description && (
            <p className="mt-1 line-clamp-2 break-words text-[13px] leading-relaxed text-muted">{task.description}</p>
          )}
        </button>

        {handleProps && (
          <button
            type="button"
            aria-label={`Drag "${task.title}"`}
            className="-mr-1 grid h-7 w-6 shrink-0 cursor-grab touch-none place-items-center rounded-md text-muted/70 hover:bg-line hover:text-ink active:cursor-grabbing"
            {...handleProps}
          >
            <GripVertical className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5 pl-[30px]">
        <span className={`chip ${priority.chip}`}>
          <Flag className="h-3 w-3" /> {priority.label}
        </span>
        {due && (
          <span
            className={`chip ${
              due.overdue
                ? "bg-[var(--danger-soft)] text-danger"
                : due.soon
                  ? "bg-[var(--progress-soft)] text-progress"
                  : "bg-line/60 text-muted"
            }`}
          >
            <CalendarDays className="h-3 w-3" /> {due.label}
          </span>
        )}
      </div>
    </article>
  );
});

export default function SortableTask({ task, onOpen, onToggle }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging, setActivatorNodeRef } = useSortable({
    id: task.id,
    data: { type: "task", status: task.status },
  });

  return (
    <CardBody
      ref={setNodeRef}
      task={task}
      onOpen={onOpen}
      onToggle={onToggle}
      dragging={isDragging}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      handleProps={{ ref: setActivatorNodeRef, ...attributes, ...listeners }}
    />
  );
}
