import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Lock, Mail, User } from "lucide-react";
import api, { getErrorMessage } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { AuthShell, FormMessage, SubmitButton } from "../components/auth/AuthShell";
import { Field } from "../components/auth/Field";
import { GoogleButton } from "../components/auth/GoogleButton";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("The passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const clean = email.trim().toLowerCase();
      await api.post("/auth/register", { fullName: fullName.trim(), email: clean, password });
      navigate(`/verify-email?email=${encodeURIComponent(clean)}`);
    } catch (err) {
      setError(getErrorMessage(err, "Could not create the account."));
      setLoading(false);
    }
  };

  const handleGoogle = async (idToken) => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.post("/auth/google", { idToken });
      login(res.data.data.accessToken, res.data.data.user);
    } catch (err) {
      setError(getErrorMessage(err, "Google sign-in failed."));
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="A free board for your tasks. We will email you a code to confirm your address."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-brand underline underline-offset-4">
            Sign in
          </Link>
        </>
      }
    >
      <div className="space-y-5">
        <GoogleButton onCredential={handleGoogle} />
        <form onSubmit={handleSubmit} className="space-y-5">
          <FormMessage error={error} />
          <Field label="Full name" icon={User} value={fullName} onChange={setFullName} required minLength={2} maxLength={80} autoComplete="name" placeholder="Your name" />
          <Field label="Email address" icon={Mail} type="email" value={email} onChange={setEmail} required autoComplete="email" placeholder="name@example.com" />
          <Field label="Password" icon={Lock} type="password" value={password} onChange={setPassword} required minLength={8} autoComplete="new-password" placeholder="At least 8 characters" />
          <Field label="Confirm password" icon={Lock} type="password" value={confirm} onChange={setConfirm} required autoComplete="new-password" placeholder="Repeat the password" />
          <SubmitButton loading={loading} loadingText="Creating account...">
            <span>Create account</span>
            <ArrowRight className="h-4 w-4" />
          </SubmitButton>
          <p className="text-center text-xs leading-relaxed text-muted">
            By continuing you agree to the{" "}
            <Link to="/terms" className="underline underline-offset-2">Terms</Link> and{" "}
            <Link to="/privacy" className="underline underline-offset-2">Privacy Policy</Link>.
          </p>
        </form>
      </div>
    </AuthShell>
  );
}
