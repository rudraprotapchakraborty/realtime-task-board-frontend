import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <section className="frame grid min-h-[60vh] place-items-center py-20 text-center">
      <div>
        <p className="font-serif text-8xl italic text-brand">404</p>
        <h1 className="display mt-2 text-4xl">This card is not on the board</h1>
        <p className="mx-auto mt-3 max-w-[420px] text-muted">The page you are looking for moved, or never existed.</p>
        <Link to="/" className="btn btn-primary mt-8">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
      </div>
    </section>
  );
}
