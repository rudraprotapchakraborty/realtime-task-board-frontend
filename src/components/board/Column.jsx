import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus, Trash2 } from "lucide-react";
import SortableTask from "./TaskCard";

export default function Column({ status, tasks, onAdd, onOpen, onToggle, onClearDone, filtered }) {
  const { setNodeRef, isOver } = useDroppable({ id: status.id, data: { type: "column", status: status.id } });

  return (
    <section
      aria-label={`${status.label}, ${tasks.length} tasks`}
      className="flex min-h-[220px] w-[min(86vw,360px)] shrink-0 snap-center flex-col rounded-3xl border border-line bg-surface/50 p-3 lg:w-auto lg:shrink"
    >
      <header className="flex items-center justify-between gap-2 px-2 pb-3 pt-1">
        <div className="flex items-center gap-2.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: status.color }} />
          <h2 className="text-[15px] font-bold tracking-tight text-ink">{status.label}</h2>
          <span className="rounded-full px-2 py-0.5 text-xs font-bold tabular-nums" style={{ background: status.soft, color: status.color }}>
            {tasks.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {status.id === "DONE" && tasks.length > 0 && (
            <button
              type="button"
              onClick={onClearDone}
              className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold text-muted transition-colors hover:bg-[var(--danger-soft)] hover:text-danger"
            >
              <Trash2 className="h-3.5 w-3.5" /> Clear
            </button>
          )}
          <button
            type="button"
            onClick={() => onAdd(status.id)}
            aria-label={`Add a task to ${status.label}`}
            className="grid h-8 w-8 place-items-center rounded-full text-muted transition-colors hover:bg-brand-soft hover:text-brand"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div
        ref={setNodeRef}
        className={`flex flex-1 flex-col gap-2.5 rounded-2xl p-1 transition-colors ${isOver ? "bg-brand-soft/70" : ""}`}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableTask key={task.id} task={task} onOpen={onOpen} onToggle={onToggle} />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <button
            type="button"
            onClick={() => onAdd(status.id)}
            className="grid flex-1 place-items-center rounded-2xl border border-dashed border-line px-4 py-8 text-center text-[13px] leading-relaxed text-muted transition-colors hover:border-brand hover:text-brand"
          >
            {filtered ? "No tasks match your filters." : status.hint}
          </button>
        )}
      </div>
    </section>
  );
}
