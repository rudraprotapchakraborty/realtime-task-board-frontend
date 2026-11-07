import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

/** Labelled input. Password inputs get a show/hide toggle. */
export function Field({ label, icon: Icon, value, onChange, hint, labelAside, type = "text", className = "", ...rest }) {
  const id = useId();
  const [shown, setShown] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-semibold text-ink">
          {label}
        </label>
        {labelAside}
      </div>
      <div className="group relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted transition-colors group-focus-within:text-brand" />
        )}
        <input
          id={id}
          type={isPassword && shown ? "text" : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`input ${Icon ? "pl-11" : ""} ${isPassword ? "pr-11" : ""} ${className}`}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShown((s) => !s)}
            aria-label={shown ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted transition-colors hover:text-ink"
          >
            {shown ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
          </button>
        )}
      </div>
      {hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
  );
}
