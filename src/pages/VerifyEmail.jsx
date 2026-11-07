import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { MailCheck } from "lucide-react";
import api, { getErrorMessage } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { AuthShell, FormMessage, SubmitButton } from "../components/auth/AuthShell";
import { OtpInput } from "../components/auth/OtpInput";

const RESEND_SECONDS = 60;

export default function VerifyEmail() {
  const [search] = useSearchParams();
  const email = (search.get("email") || "").trim().toLowerCase();
  const { login } = useAuth();

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(email ? `We sent a 6 digit code to ${email}.` : null);
  const [cooldown, setCooldown] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const verify = async (e, value = code) => {
    e?.preventDefault();
    if (value.length < 6 || loading) return;
    setError(null);
    setLoading(true);
    try {
      const res = await api.post("/auth/verify-email", { email, otp: value });
      login(res.data.data.accessToken, res.data.data.user); // GuestOnly redirects once the session exists
    } catch (err) {
      setError(getErrorMessage(err, "That code did not work."));
      setCode("");
      setLoading(false);
    }
  };

  // Submit as soon as the sixth digit is in
  const onCodeChange = (value) => {
    setCode(value);
    if (value.length === 6) verify(undefined, value);
  };

  const resend = async () => {
    setError(null);
    try {
      await api.post("/auth/resend-otp", { email });
      setNotice(`A new code was sent to ${email}.`);
      setCooldown(RESEND_SECONDS);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const back = (
    <Link to="/login" className="font-semibold text-brand underline underline-offset-4">
      Back to sign in
    </Link>
  );

  if (!email) {
    return (
      <AuthShell title="Verify your email" footer={back}>
        <p className="text-sm text-muted">Start from the sign up or sign in page so we know which address to verify.</p>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Check your email" subtitle="Enter the code to finish creating your account." footer={back}>
      <form onSubmit={verify} className="space-y-6">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-brand-soft text-brand">
          <MailCheck className="h-6 w-6" />
        </div>
        <FormMessage error={error} notice={error ? null : notice} />
        <OtpInput value={code} onChange={onCodeChange} disabled={loading} autoFocus />
        <SubmitButton loading={loading} loadingText="Verifying..." disabled={code.length < 6}>
          Verify email
        </SubmitButton>
        <button
          type="button"
          onClick={resend}
          disabled={cooldown > 0}
          className="block w-full text-center text-xs font-semibold text-muted transition-colors hover:text-brand disabled:cursor-default disabled:opacity-60"
        >
          {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
        </button>
      </form>
    </AuthShell>
  );
}
