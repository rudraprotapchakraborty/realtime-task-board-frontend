import { useEffect, useRef, useState } from "react";

const CLIENT_ID = import.meta.env.GOOGLE_CLIENT_ID;
const SCRIPT_SRC = "https://accounts.google.com/gsi/client";

/**
 * "Continue with Google". Renders nothing until GOOGLE_CLIENT_ID is
 * configured, so the page never shows a button that cannot work.
 */
export function GoogleButton({ onCredential }) {
  const holder = useRef(null);
  const [ready, setReady] = useState(false);
  const callback = useRef(onCredential);
  useEffect(() => {
    callback.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    if (!CLIENT_ID) return;

    const init = () => {
      if (!window.google || !holder.current) return;
      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: (r) => callback.current(r.credential),
      });
      window.google.accounts.id.renderButton(holder.current, {
        theme: "outline",
        size: "large",
        shape: "pill",
        text: "continue_with",
        width: 380,
      });
      setReady(true);
    };

    if (window.google) {
      init();
      return;
    }
    let script = document.querySelector(`script[src="${SCRIPT_SRC}"]`);
    if (!script) {
      script = document.createElement("script");
      script.src = SCRIPT_SRC;
      script.async = true;
      document.head.appendChild(script);
    }
    script.addEventListener("load", init);
    return () => script?.removeEventListener("load", init);
  }, []);

  if (!CLIENT_ID) return null;

  return (
    <div className="space-y-4">
      <div ref={holder} className="flex min-h-[44px] justify-center" aria-busy={!ready} />
      <div className="flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-line" />
        or
        <span className="h-px flex-1 bg-line" />
      </div>
    </div>
  );
}
