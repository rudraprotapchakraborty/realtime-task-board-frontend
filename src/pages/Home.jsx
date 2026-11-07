import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, CalendarClock, GripVertical, KeyRound, Moon, Radio, ShieldCheck } from "lucide-react";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import BoardArt from "../components/BoardArt";

const features = [
  { icon: GripVertical, title: "Drag and drop", text: "Move cards between To-Do, In Progress and Done, or reorder them inside a column. Works with a mouse, a finger and the keyboard." },
  { icon: Radio, title: "Realtime sync", text: "Change a task on your phone and your laptop updates by itself. No refreshing, no stale boards." },
  { icon: CalendarClock, title: "Priorities and due dates", text: "Mark what is urgent, set a day and see what is overdue at a glance." },
  { icon: ShieldCheck, title: "Private by default", text: "Every board belongs to its owner. Sign in with Google or email, confirmed with a one-time code." },
  { icon: KeyRound, title: "Account you control", text: "Change your name, photo, email or password, reset a forgotten password, or delete everything in one place." },
  { icon: Moon, title: "Light and dark", text: "Easy on the eyes at any hour, and it remembers your choice." },
];

const steps = [
  ["Create a free account", "Use Google or your email. A six digit code confirms the address."],
  ["Add your tasks", "Give each one a title, a priority and, if it matters, a due date."],
  ["Move them to done", "Drag cards across the board. Every open tab shows the change straight away."],
];

export default function Home() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/public/stats").then((res) => setStats(res.data.data)).catch(() => {});
  }, []);

  return (
    <>
      <section className="frame grid items-center gap-12 pb-20 pt-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pt-20">
        <div className="hero-stagger">
          <span className="eyeline">Realtime task board</span>
          <h1 className="display mt-5 text-[clamp(42px,6.4vw,84px)]">
            Plan the day. Move it to <span className="accent">done</span>.
          </h1>
          <p className="mt-6 max-w-[520px] text-[17px] leading-relaxed text-muted">
            A calm kanban board that stays in sync everywhere. Drag tasks from To-Do to Done and watch every open tab and device update the moment you let go.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {user ? (
              <Link to="/board" className="btn btn-primary">
                Open your board <ArrowUpRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary">
                  Create your board <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/login" className="btn btn-ghost">
                  Try a test account
                </Link>
              </>
            )}
          </div>
          {stats && stats.members > 0 && (
            <dl className="mt-10 flex flex-wrap gap-x-9 gap-y-4">
              {[
                ["Members", stats.members],
                ["Tasks created", stats.created],
                ["Tasks finished", stats.completed],
              ].map(([label, value]) => (
                <div key={label}>
                  <dd className="text-3xl font-bold tracking-tight tabular-nums">{value.toLocaleString()}</dd>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</dt>
                </div>
              ))}
            </dl>
          )}
        </div>
        <BoardArt className="hero-stagger" />
      </section>

      <section id="features" className="border-t border-line bg-surface/40 py-20" data-reveal>
        <div className="frame">
          <span className="eyeline">Features</span>
          <h2 className="display mt-4 max-w-[640px] text-[clamp(32px,4.4vw,52px)]">
            Everything a simple board needs, <span className="accent">nothing it does not</span>.
          </h2>
          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, text }) => (
              <li key={title} className="card p-6 transition-all hover:-translate-y-1 hover:border-brand hover:shadow-[var(--shadow)]">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-soft text-brand">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-lg font-bold tracking-tight">{title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="how" className="py-20" data-reveal>
        <div className="frame">
          <span className="eyeline">How it works</span>
          <h2 className="display mt-4 text-[clamp(32px,4.4vw,52px)]">
            Three steps to a <span className="accent">clear head</span>.
          </h2>
          <ol className="mt-12 grid gap-5 md:grid-cols-3">
            {steps.map(([title, text], i) => (
              <li key={title} className="relative rounded-3xl border border-line p-7">
                <span className="font-serif text-6xl italic leading-none text-brand">{i + 1}</span>
                <h3 className="mt-4 text-lg font-bold tracking-tight">{title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="frame pb-24" data-reveal>
        <div className="grid-panel rounded-[32px] border border-line px-6 py-14 text-center sm:px-12">
          <h2 className="display mx-auto max-w-[640px] text-[clamp(30px,4vw,48px)]">
            Ready to get things <span className="accent">moving</span>?
          </h2>
          <p className="mx-auto mt-4 max-w-[480px] text-muted">It is free, takes under a minute and your board is private from the first card.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to={user ? "/board" : "/register"} className="btn btn-primary">
              {user ? "Open your board" : "Create your board"} <ArrowRight className="h-4 w-4" />
            </Link>
            {!user && (
              <Link to="/login" className="btn btn-ghost">
                Explore with a test account
              </Link>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
