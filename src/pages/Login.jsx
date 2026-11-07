import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Lock, Mail } from "lucide-react";
import api, { getErrorMessage } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { AuthShell, FormMessage, SubmitButton } from "../components/auth/AuthShell";
import { Field } from "../components/auth/Field";
import { GoogleButton } from "../components/auth/GoogleButton";
import DemoAccounts from "../components/auth/DemoAccounts";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const { login } = useAuth();

  const notice = search.get("reset") ? "Password updated. You can sign in now." : null;

  // GuestOnly sends the user on (to ?from= or the board) once logged in
  const finish = (data) => login(data.accessToken, data.user);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      finish(res.data.data);
    } catch (err) {
      // Correct password but the email was never verified: continue with the code
      if (err?.response?.data?.details?.code === "EMAIL_NOT_VERIFIED") {
        navigate(`/verify-email?email=${encodeURIComponent(email.trim().toLowerCase())}`);
        return;
      }
      setError(getErrorMessage(err, "Invalid email or password."));
      setLoading(false);
    }
  };

  const handleGoogle = async (idToken) => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.post("/auth/google", { idToken });
      finish(res.data.data);
    } catch (err) {
      setError(getErrorMessage(err, "Google sign-in failed."));
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to pick up where you left off."
      aside={
        <DemoAccounts
          onChoose={(a) => {
            setEmail(a.email);
            setPassword(a.password);
            setError(null);
          }}
        />
      }
      footer={
        <>
          New to Task Board?{" "}
          <Link to="/register" className="font-semibold text-brand underline underline-offset-4">
            Create an account
          </Link>
        </>
      }
    >
      <div className="space-y-5">
        <GoogleButton onCredential={handleGoogle} />

        <form onSubmit={handleSubmit} className="space-y-5">
          <FormMessage error={error} notice={notice} />
          <Field
            label="Email address"
            icon={Mail}
            type="email"
            value={email}
            onChange={setEmail}
            required
            autoComplete="email"
            placeholder="name@example.com"
          />
          <Field
            label="Password"
            icon={Lock}
            type="password"
            value={password}
            onChange={setPassword}
            required
            autoComplete="current-password"
            placeholder="••••••••"
            labelAside={
              <Link
                to={`/forgot-password${email ? `?email=${encodeURIComponent(email)}` : ""}`}
                className="text-sm font-semibold text-brand hover:underline hover:underline-offset-4"
              >
                Forgot password?
              </Link>
            }
          />
          <SubmitButton loading={loading} loadingText="Signing in...">
            <span>Sign in</span>
            <ArrowRight className="h-4 w-4" />
          </SubmitButton>
        </form>
      </div>
    </AuthShell>
  );
}
