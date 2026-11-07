import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { KeyRound, Lock, Mail } from "lucide-react";
import api, { getErrorMessage } from "../lib/api";
import { AuthShell, FormMessage, SubmitButton } from "../components/auth/AuthShell";
import { Field } from "../components/auth/Field";
import { OtpInput } from "../components/auth/OtpInput";

const RESEND_SECONDS = 60;

/** Step 1: ask for a code. Step 2: enter the code and choose a new password. */
export default function ForgotPassword() {
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState((search.get("email") || "").trim());
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const clean = email.trim().toLowerCase();

  const sendCode = async (e) => {
    e?.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email: clean });
      setStep("reset");
      setNotice(`If ${clean} has an account, a 6 digit code is on its way.`);
      setCooldown(RESEND_SECONDS);
    } catch (err) {
      setError(getErrorMessage(err));
    }
    setLoading(false);
  };

  const reset = async (e) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("The passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { email: clean, otp: code, newPassword: password });
      navigate("/login?reset=1", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, "Could not reset the password."));
      setLoading(false);
    }
  };

  const back = (
    <Link to="/login" className="font-semibold text-brand underline underline-offset-4">
      Back to sign in
    </Link>
  );

  return (
    <AuthShell
      title="Reset password"
      subtitle={step === "email" ? "Enter your email and we will send you a code." : "Enter the code and choose a new password."}
      footer={back}
    >
      {step === "email" ? (
        <form onSubmit={sendCode} className="space-y-5">
          <FormMessage error={error} />
          <Field label="Email address" icon={Mail} type="email" value={email} onChange={setEmail} required autoComplete="email" placeholder="name@example.com" />
          <SubmitButton loading={loading} loadingText="Sending...">
            Send code
          </SubmitButton>
        </form>
      ) : (
        <form onSubmit={reset} className="space-y-5">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-brand-soft text-brand">
            <KeyRound className="h-6 w-6" />
          </div>
          <FormMessage error={error} notice={error ? null : notice} />
          <OtpInput value={code} onChange={setCode} disabled={loading} autoFocus />
          <Field label="New password" icon={Lock} type="password" value={password} onChange={setPassword} required minLength={8} autoComplete="new-password" placeholder="At least 8 characters" />
          <Field label="Confirm new password" icon={Lock} type="password" value={confirm} onChange={setConfirm} required autoComplete="new-password" />
          <SubmitButton loading={loading} loadingText="Saving..." disabled={code.length < 6}>
            Reset password
          </SubmitButton>
          <div className="flex justify-between text-xs font-semibold text-muted">
            <button type="button" onClick={sendCode} disabled={cooldown > 0 || loading} className="hover:text-brand disabled:opacity-60">
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
            </button>
            <button type="button" onClick={() => { setStep("email"); setCode(""); setError(null); }} className="hover:text-brand">
              Use a different email
            </button>
          </div>
        </form>
      )}
    </AuthShell>
  );
}
