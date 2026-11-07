import { Link } from "react-router-dom";

/** Three columns with one card on the move. */
export function LogoMark({ size = 34, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden="true" focusable="false">
      <rect width="48" height="48" rx="13" fill="#5b47e0" />
      <rect x="9" y="11" width="8" height="15" rx="2.6" fill="#fff" />
      <rect x="20" y="11" width="8" height="24" rx="2.6" fill="#fff" fillOpacity=".92" />
      <rect x="31" y="11" width="8" height="9" rx="2.6" fill="#fff" />
      <circle cx="35" cy="32" r="4.8" fill="#fbbf24" stroke="#5b47e0" strokeWidth="2.2" />
    </svg>
  );
}

export default function Brand({ className = "" }) {
  return (
    <Link to="/" aria-label="Task Board home" className={`inline-flex w-fit items-center gap-2.5 ${className}`}>
      <LogoMark />
      <span className="whitespace-nowrap text-[20px] font-bold leading-none tracking-[-0.045em] text-ink sm:text-[22px]">
        Task <span className="accent text-[26px]">Board</span>
      </span>
    </Link>
  );
}
