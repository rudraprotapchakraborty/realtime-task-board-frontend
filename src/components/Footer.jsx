import { ArrowUpRight, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import Brand from "./Brand";

export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="frame flex flex-col items-start justify-between gap-5 py-9 sm:flex-row sm:items-center">
        <Brand />
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-muted">
          <Link to="/privacy" className="hover:text-ink">Privacy</Link>
          <Link to="/terms" className="hover:text-ink">Terms</Link>
          <a href="https://github.com/rudraprotapchakraborty/realtime-task-board-frontend" className="hover:text-ink">GitHub</a>
        </nav>
        <small className="text-muted">© {new Date().getFullYear()} Task Board</small>
      </div>
      <div className="border-t border-line">
        <div className="frame flex flex-col items-center justify-between gap-3 py-5 sm:flex-row">
          <p className="text-xs text-muted">Built with React, Vite and Tailwind CSS</p>
          <a
            href="https://rudraprotapchakraborty.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Made by Rudra Protap Chakraborty (opens his portfolio)"
            className="group inline-flex items-center gap-2 rounded-full border border-line bg-surface py-1.5 pl-3 pr-3.5 text-xs font-medium text-muted shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand hover:text-ink"
          >
            <Heart aria-hidden className="h-3.5 w-3.5 fill-brand text-brand transition-transform duration-200 group-hover:scale-125" />
            <span>
              Made by <span className="font-semibold text-ink">Rudra Protap Chakraborty</span>
            </span>
            <ArrowUpRight aria-hidden className="h-3.5 w-3.5 opacity-60 transition-opacity group-hover:opacity-100" />
          </a>
        </div>
      </div>
    </footer>
  );
}
