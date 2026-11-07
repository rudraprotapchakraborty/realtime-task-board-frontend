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
    </footer>
  );
}
