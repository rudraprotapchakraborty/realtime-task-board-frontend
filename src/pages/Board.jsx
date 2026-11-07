import { useCallback, useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import toast from "react-hot-toast";
import { AlertTriangle, CheckCircle2, ListTodo, Plus, RefreshCw, Search, Timer, Wifi, WifiOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useBoard } from "../hooks/useBoard";
import Column from "../components/board/Column";
import { CardBody } from "../components/board/TaskCard";
import TaskModal from "../components/board/TaskModal";
import { PRIORITIES, STATUSES, dueInfo } from "../components/board/meta";

const group = (tasks) => {
  const columns = { TODO: [], IN_PROGRESS: [], DONE: [] };
  for (const t of [...tasks].sort((a, b) => a.position - b.position)) columns[t.status]?.push(t);
  return columns;
};

const positionBetween = (prev, next) => {
  if (prev === undefined && next === undefined) return 1000;
  if (prev === undefined) return next - 1000;
  if (next === undefined) return prev + 1000;
  return (prev + next) / 2;
};

const MODES = {
  live: { label: "Live", icon: Wifi, tone: "text-done", dot: true },
  polling: { label: "Auto-sync", icon: Wifi, tone: "text-done", dot: true },
  connecting: { label: "Connecting", icon: RefreshCw, tone: "text-muted" },
  offline: { label: "Offline", icon: WifiOff, tone: "text-danger" },
};

export default function Board() {
  const { user, token } = useAuth();
  const { tasks, error, mode, addTask, updateTask, removeTask, clearDone, pauseSync, reload } = useBoard(token);

  const [query, setQuery] = useState("");
  const [priority, setPriority] = useState("ALL");
  const [modal, setModal] = useState(null); // { task } | { status }
  const [activeId, setActiveId] = useState(null);
  const [dragColumns, setDragColumns] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const filtered = Boolean(query.trim()) || priority !== "ALL";
  const visible = useMemo(() => {
    if (!tasks) return [];
    const q = query.trim().toLowerCase();
    return tasks.filter(
      (t) =>
        (priority === "ALL" || t.priority === priority) &&
        (!q || t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))
    );
  }, [tasks, query, priority]);

  const columns = dragColumns ?? group(visible);
  const stats = useMemo(() => {
    const all = tasks ?? [];
    const done = all.filter((t) => t.status === "DONE").length;
    return {
      total: all.length,
      progress: all.filter((t) => t.status === "IN_PROGRESS").length,
      done,
      percent: all.length ? Math.round((done / all.length) * 100) : 0,
      overdue: all.filter((t) => dueInfo(t.dueDate, t.status)?.overdue).length,
    };
  }, [tasks]);

  const findContainer = useCallback(
    (id, cols) => (id in cols ? id : Object.keys(cols).find((key) => cols[key].some((t) => t.id === id))),
    []
  );

  const activeTask = activeId ? tasks?.find((t) => t.id === activeId) : null;

  const onDragStart = ({ active }) => {
    pauseSync(true);
    setActiveId(active.id);
    setDragColumns(group(visible));
  };

  // Moving over another column: the card joins it straight away so the drop feels natural
  const onDragOver = ({ active, over }) => {
    if (!over) return;
    setDragColumns((prev) => {
      if (!prev) return prev;
      const from = findContainer(active.id, prev);
      const to = findContainer(over.id, prev);
      if (!from || !to || from === to) return prev;

      const moved = prev[from].find((t) => t.id === active.id);
      const target = prev[to];
      const overIndex = over.id in prev ? target.length : target.findIndex((t) => t.id === over.id);
      const below =
        active.rect.current.translated && over.rect && active.rect.current.translated.top > over.rect.top + over.rect.height / 2;
      const index = overIndex >= 0 ? overIndex + (over.id in prev ? 0 : below ? 1 : 0) : target.length;

      return {
        ...prev,
        [from]: prev[from].filter((t) => t.id !== active.id),
        [to]: [...target.slice(0, index), { ...moved, status: to }, ...target.slice(index)],
      };
    });
  };

  const finishDrag = () => {
    setActiveId(null);
    setDragColumns(null);
    pauseSync(false);
  };

  const onDragEnd = ({ active, over }) => {
    const cols = dragColumns;
    if (!over || !cols) return finishDrag();

    const from = findContainer(active.id, cols);
    const to = findContainer(over.id, cols);
    if (!from || !to) return finishDrag();

    let next = cols;
    if (from === to && over.id !== active.id && !(over.id in cols)) {
      const oldIndex = cols[from].findIndex((t) => t.id === active.id);
      const newIndex = cols[to].findIndex((t) => t.id === over.id);
      next = { ...cols, [to]: arrayMove(cols[to], oldIndex, newIndex) };
    }

    const column = next[to];
    const index = column.findIndex((t) => t.id === active.id);
    const original = tasks.find((t) => t.id === active.id);
    const originalIndex = group(visible)[original.status].findIndex((t) => t.id === active.id);
    if (original.status !== to || originalIndex !== index) {
      updateTask(active.id, {
        status: to,
        position: positionBetween(column[index - 1]?.position, column[index + 1]?.position),
      });
    }
    finishDrag();
  };

  const toggle = (task) => {
    const target = task.status === "DONE" ? "TODO" : "DONE";
    const last = (tasks ?? []).filter((t) => t.status === target).reduce((m, t) => Math.max(m, t.position), 0);
    updateTask(task.id, { status: target, position: last + 1000 });
  };

  const save = async (values) => {
    if (modal?.task) {
      const { task } = modal;
      const patch = { ...values };
      if (values.status === task.status) delete patch.status;
      else {
        const last = (tasks ?? []).filter((t) => t.status === values.status).reduce((m, t) => Math.max(m, t.position), 0);
        patch.position = last + 1000;
      }
      await updateTask(task.id, patch);
      toast.success("Task saved");
    } else {
      await addTask(values);
      toast.success("Task added");
    }
  };

  const mode$ = MODES[mode] ?? MODES.polling;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="frame pb-16 pt-8">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <span className="eyeline">Your board</span>
          <h1 className="display mt-3 text-[clamp(30px,4vw,46px)]">
            {greeting}, <span className="accent">{user.fullName.split(" ")[0]}</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`hidden items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-2 text-xs font-bold sm:inline-flex ${mode$.tone}`}
            title={mode === "live" ? "Connected: changes from other tabs appear instantly" : "Changes from other tabs appear within a few seconds"}
          >
            {mode$.dot ? <span className="live-dot h-2 w-2 rounded-full bg-done" /> : <mode$.icon className="h-3.5 w-3.5" />}
            {mode$.label}
          </span>
          <button type="button" onClick={() => setModal({ status: "TODO" })} className="btn btn-primary">
            <Plus className="h-4 w-4" /> New task
          </button>
        </div>
      </header>

      {user.isDemo && (
        <p role="note" className="mt-5 rounded-2xl border border-brand/25 bg-brand-soft p-3.5 text-sm text-ink">
          <b>You are using a shared test account.</b> Anyone can sign in with it, so the board may change while you look. Create your own account for a private one.
        </p>
      )}

      <dl className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["Total tasks", stats.total, ListTodo, "var(--todo)", "var(--todo-soft)"],
          ["In progress", stats.progress, Timer, "var(--progress)", "var(--progress-soft)"],
          ["Completed", `${stats.percent}%`, CheckCircle2, "var(--done)", "var(--done-soft)"],
          ["Overdue", stats.overdue, AlertTriangle, "var(--danger)", "var(--danger-soft)"],
        ].map(([label, value, Icon, color, soft]) => (
          <div key={label} className="card flex items-center gap-3.5 p-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ background: soft, color }}>
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <dd className="text-2xl font-bold leading-none tracking-tight tabular-nums">{tasks ? value : "–"}</dd>
              <dt className="mt-1 text-xs font-semibold text-muted">{label}</dt>
            </div>
          </div>
        ))}
      </dl>

      <div className="mt-7 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1 sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks"
            aria-label="Search tasks"
            className="input !rounded-full !py-2.5 pl-10"
          />
        </div>
        <label className="sr-only" htmlFor="priority-filter">
          Filter by priority
        </label>
        <select id="priority-filter" value={priority} onChange={(e) => setPriority(e.target.value)} className="input !w-auto !rounded-full !py-2.5 pr-8 text-sm font-semibold">
          <option value="ALL">All priorities</option>
          {PRIORITIES.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label} priority
            </option>
          ))}
        </select>
        {filtered && (
          <button type="button" onClick={() => { setQuery(""); setPriority("ALL"); }} className="text-sm font-semibold text-brand hover:underline">
            Clear filters
          </button>
        )}
      </div>

      {error && !tasks ? (
        <div role="alert" className="card mt-8 grid place-items-center gap-4 p-10 text-center">
          <p className="text-muted">{error}</p>
          <button type="button" onClick={reload} className="btn btn-primary btn-sm">
            <RefreshCw className="h-3.5 w-3.5" /> Try again
          </button>
        </div>
      ) : !tasks ? (
        <div className="mt-8 grid gap-4 lg:grid-cols-3" role="status" aria-label="Loading tasks">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-[360px] !rounded-3xl" />
          ))}
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragEnd={onDragEnd}
          onDragCancel={finishDrag}
        >
          <div className="board-scroll -mx-4 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 lg:mx-0 lg:grid lg:grid-cols-3 lg:overflow-visible lg:px-0">
            {STATUSES.map((status) => (
              <Column
                key={status.id}
                status={status}
                tasks={columns[status.id]}
                filtered={filtered}
                onAdd={(id) => setModal({ status: id })}
                onOpen={(task) => setModal({ task })}
                onToggle={toggle}
                onClearDone={() => {
                  clearDone();
                  toast.success("Finished tasks cleared");
                }}
              />
            ))}
          </div>
          <DragOverlay dropAnimation={{ duration: 180 }}>
            {activeTask ? <CardBody task={{ ...activeTask, status: findContainer(activeTask.id, columns) ?? activeTask.status }} className="drag-overlay cursor-grabbing" /> : null}
          </DragOverlay>
        </DndContext>
      )}

      {modal && (
        <TaskModal
          task={modal.task ?? null}
          defaultStatus={modal.status}
          onClose={() => setModal(null)}
          onSave={save}
          onDelete={(task) => {
            removeTask(task.id);
            toast.success("Task deleted");
          }}
        />
      )}
    </div>
  );
}
