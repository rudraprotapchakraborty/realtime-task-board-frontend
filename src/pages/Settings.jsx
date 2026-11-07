import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Avatar from "../components/Avatar";
import { useAuth } from "../context/AuthContext";
import api, { getErrorMessage } from "../lib/api";
import { Field } from "../components/auth/Field";
import { FormMessage, SubmitButton } from "../components/auth/AuthShell";
import { OtpInput } from "../components/auth/OtpInput";

const AVATAR_MAX_SIDE = 512;
const RESEND_SECONDS = 60;

/** Shrinks a picked image in the browser and returns a JPEG data URL. */
function shrinkImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, AVATAR_MAX_SIDE / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      URL.revokeObjectURL(url);
      if (!ctx) return reject(new Error("no canvas"));
      ctx.fillStyle = "#fff"; // JPEG has no transparency
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.88));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("unreadable image"));
    };
    img.src = url;
  });
}

function Section({ id, title, hint, children, danger }) {
  return (
    <section aria-labelledby={`${id}-title`} id={id} className="grid gap-y-4 border-t border-line py-8 lg:grid-cols-12 lg:gap-x-8">
      <div className="lg:col-span-4">
        <h2 id={`${id}-title`} className={`text-lg font-bold tracking-tight ${danger ? "text-danger" : "text-ink"}`}>
          {title}
        </h2>
        <p className="mt-1 max-w-sm text-sm leading-relaxed text-muted">{hint}</p>
      </div>
      <div className="max-w-md lg:col-span-7 lg:col-start-6">{children}</div>
    </section>
  );
}

const idle = { busy: false, error: null, notice: null };

export default function Settings() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [methods, setMethods] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api
      .get("/users/me/methods")
      .then((res) => !cancelled && setMethods(res.data.data))
      .catch(() => {
        /* shown as unknown; the forms still work */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const hasPassword = methods?.hasPassword ?? true;

  /* Profile: name + photo */
  const [name, setName] = useState(user?.fullName ?? "");
  const [nameState, setNameState] = useState(idle);
  const [photoState, setPhotoState] = useState({ busy: "", error: null });

  const saveName = async (e) => {
    e.preventDefault();
    setNameState({ busy: true, error: null, notice: null });
    try {
      const res = await api.patch("/users/me/self", { fullName: name.trim() });
      updateUser({ fullName: res.data.data.fullName });
      setNameState({ busy: false, error: null, notice: "Name saved." });
    } catch (err) {
      setNameState({ busy: false, error: getErrorMessage(err), notice: null });
    }
  };

  const uploadPhoto = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setPhotoState({ busy: "", error: "Choose a PNG, JPG, WebP or GIF image." });
      return;
    }
    setPhotoState({ busy: "upload", error: null });
    try {
      const image = await shrinkImage(file);
      const up = await api.post("/uploads/image", { image });
      const url = up.data.data.url;
      await api.patch("/users/me/self", { profileImageUrl: url });
      updateUser({ profileImageUrl: url });
      setPhotoState({ busy: "", error: null });
    } catch (err) {
      setPhotoState({ busy: "", error: getErrorMessage(err, "Could not upload your photo.") });
    }
  };

  const removePhoto = async () => {
    setPhotoState({ busy: "remove", error: null });
    try {
      await api.patch("/users/me/self", { profileImageUrl: "" });
      updateUser({ profileImageUrl: undefined });
      setPhotoState({ busy: "", error: null });
    } catch (err) {
      setPhotoState({ busy: "", error: getErrorMessage(err) });
    }
  };

  /* Email: request a code, then confirm */
  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [emailStep, setEmailStep] = useState("request");
  const [code, setCode] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [emailState, setEmailState] = useState(idle);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const requestEmailCode = async (e) => {
    e?.preventDefault();
    setEmailState({ busy: true, error: null, notice: null });
    try {
      await api.post("/users/me/email", { email: newEmail, currentPassword: emailPassword });
      setEmailStep("confirm");
      setCode("");
      setCooldown(RESEND_SECONDS);
      setEmailState({ busy: false, error: null, notice: `We sent a code to ${newEmail.trim()}.` });
    } catch (err) {
      setEmailState({ busy: false, error: getErrorMessage(err), notice: null });
    }
  };

  const confirmEmail = async (e) => {
    e?.preventDefault();
    if (code.length < 6) return;
    setEmailState((s) => ({ ...s, busy: true, error: null }));
    try {
      const res = await api.put("/users/me/email", { email: newEmail, code });
      updateUser({ email: res.data.data.email });
      setMethods((m) => (m ? { ...m, google: false } : m));
      setEmailStep("request");
      setNewEmail("");
      setEmailPassword("");
      setCode("");
      setEmailState({ busy: false, error: null, notice: `Your email is now ${res.data.data.email}.` });
    } catch (err) {
      setCode("");
      setEmailState({ busy: false, error: getErrorMessage(err), notice: null });
    }
  };

  /* Password */
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordState, setPasswordState] = useState(idle);

  const savePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordState({ busy: false, error: "The new passwords do not match.", notice: null });
      return;
    }
    setPasswordState({ busy: true, error: null, notice: null });
    try {
      await api.post("/users/me/password", { ...(hasPassword ? { currentPassword } : {}), newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMethods((m) => (m ? { ...m, hasPassword: true } : m));
      setPasswordState({ busy: false, error: null, notice: "Password updated." });
    } catch (err) {
      setPasswordState({ busy: false, error: getErrorMessage(err), notice: null });
    }
  };

  /* Delete */
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteProof, setDeleteProof] = useState("");
  const [deleteState, setDeleteState] = useState(idle);

  const deleteAccount = async (e) => {
    e.preventDefault();
    setDeleteState({ busy: true, error: null, notice: null });
    try {
      await api.delete("/users/me", { data: { confirmEmail: deleteProof } });
      logout();
      navigate("/", { replace: true });
    } catch (err) {
      setDeleteState({ busy: false, error: getErrorMessage(err), notice: null });
    }
  };

  if (!user) return null;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-20 pt-10 sm:px-6">
      <header className="pb-6">
        <h1 className="display text-4xl">
          Account <span className="accent">settings</span>
        </h1>
        <p className="mt-2 text-sm text-muted">Your name, photo, sign-in email and password.</p>
      </header>

      {user.isDemo && (
        <div role="note" className="mb-2 rounded-2xl border border-brand/25 bg-brand-soft p-4 text-sm text-ink">
          <b>This is a shared test account, so settings are read-only.</b> Create your own account to change your name, photo, email or password, or to delete it.
        </div>
      )}

      <fieldset disabled={Boolean(user.isDemo)} className="m-0 min-w-0 border-0 p-0 disabled:opacity-60">
      <Section id="settings-profile" title="Profile" hint="Shown next to your name around the app.">
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <Avatar name={user.fullName} url={user.profileImageUrl} size={64} />
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-4">
              <label
                className={`btn btn-ghost btn-sm has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brand ${
                  photoState.busy ? "pointer-events-none opacity-60" : "cursor-pointer"
                }`}
              >
                {photoState.busy === "upload" && <Loader2 className="h-4 w-4 animate-spin" />}
                {photoState.busy === "upload" ? "Uploading..." : user.profileImageUrl ? "Change photo" : "Upload photo"}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="sr-only"
                  disabled={Boolean(photoState.busy)}
                  onChange={(e) => {
                    uploadPhoto(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
              </label>
              {user.profileImageUrl && (
                <button type="button" onClick={removePhoto} disabled={Boolean(photoState.busy)} className="text-sm font-semibold text-muted transition hover:text-danger disabled:opacity-60">
                  {photoState.busy === "remove" ? "Removing..." : "Remove"}
                </button>
              )}
            </div>
            <p className="text-xs text-muted">PNG, JPG, WebP or GIF. It is resized automatically.</p>
          </div>
        </div>
        <div className="mb-4">
          <FormMessage error={photoState.error} />
        </div>

        <form onSubmit={saveName} className="space-y-5">
          <Field label="Full name" value={name} onChange={setName} autoComplete="name" required minLength={2} maxLength={80} />
          <FormMessage error={nameState.error} notice={nameState.notice} />
          <SubmitButton loading={nameState.busy} loadingText="Saving..." disabled={!name.trim() || name.trim() === user.fullName}>
            Save name
          </SubmitButton>
        </form>
      </Section>

      <Section id="settings-email" title="Email" hint="Changing it needs your password and a code sent to the new address.">
        <dl className="mb-6 border-y border-line py-3">
          <dt className="text-xs uppercase tracking-wider text-muted">Current email</dt>
          <dd className="mt-1 break-all text-sm font-medium">{user.email}</dd>
        </dl>

        {!hasPassword ? (
          <div className="space-y-3 text-sm text-muted">
            <p>Changing your email disconnects Google, so set a password first.</p>
            <a href="#settings-password" className="font-semibold text-brand hover:underline">
              Set a password
            </a>
          </div>
        ) : emailStep === "request" ? (
          <form onSubmit={requestEmailCode} className="space-y-5">
            <Field label="New email" type="email" value={newEmail} onChange={setNewEmail} autoComplete="email" required />
            <Field label="Current password" type="password" value={emailPassword} onChange={setEmailPassword} autoComplete="current-password" required />
            {methods?.google && <p className="text-xs text-muted">Your Google sign-in is tied to the current address and will be disconnected.</p>}
            <FormMessage error={emailState.error} notice={emailState.notice} />
            <SubmitButton loading={emailState.busy} loadingText="Sending..." disabled={!newEmail.trim() || !emailPassword}>
              Send code
            </SubmitButton>
          </form>
        ) : (
          <form onSubmit={confirmEmail} className="space-y-5">
            <FormMessage error={emailState.error} notice={emailState.error ? null : emailState.notice} />
            <OtpInput value={code} onChange={setCode} disabled={emailState.busy} autoFocus />
            <SubmitButton loading={emailState.busy} loadingText="Verifying..." disabled={code.length < 6}>
              Confirm new email
            </SubmitButton>
            <div className="flex justify-between text-xs font-semibold">
              <button type="button" onClick={() => requestEmailCode()} disabled={cooldown > 0 || emailState.busy} className="text-muted transition hover:text-brand disabled:opacity-60">
                {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
              </button>
              <button type="button" onClick={() => { setEmailStep("request"); setCode(""); setEmailState(idle); }} className="text-muted transition hover:text-brand">
                Use a different email
              </button>
            </div>
          </form>
        )}
      </Section>

      <Section
        id="settings-password"
        title="Password"
        hint={hasPassword ? "Use at least 8 characters." : "Your account signs in with Google. Add a password to also sign in with email."}
      >
        <form onSubmit={savePassword} className="space-y-5">
          <input type="email" name="username" autoComplete="username" value={user.email} readOnly hidden />
          {hasPassword && (
            <Field
              label="Current password"
              type="password"
              value={currentPassword}
              onChange={setCurrentPassword}
              autoComplete="current-password"
              required
              labelAside={
                <Link to={`/forgot-password?email=${encodeURIComponent(user.email)}`} className="text-xs font-semibold text-brand hover:underline">
                  Forgot it?
                </Link>
              }
            />
          )}
          <Field label="New password" type="password" value={newPassword} onChange={setNewPassword} autoComplete="new-password" required minLength={8} />
          <Field label="Confirm new password" type="password" value={confirmPassword} onChange={setConfirmPassword} autoComplete="new-password" required />
          <FormMessage error={passwordState.error} notice={passwordState.notice} />
          <SubmitButton loading={passwordState.busy} loadingText="Saving..." disabled={!newPassword || !confirmPassword || (hasPassword && !currentPassword)}>
            {hasPassword ? "Change password" : "Set password"}
          </SubmitButton>
        </form>
      </Section>

      <Section id="settings-signin" title="Sign-in methods" hint="The ways you can get into this account.">
        <ul className="divide-y divide-line border-y border-line text-sm">
          {[
            ["Email and password", hasPassword, "On", "Not set"],
            ["Google", Boolean(methods?.google), "Connected", "Not connected"],
          ].map(([label, on, onLabel, offLabel]) => (
            <li key={label} className="flex items-center justify-between py-3">
              <span className="font-medium">{label}</span>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${on ? "bg-[var(--done-soft)] text-done" : "bg-line/60 text-muted"}`}>
                {on ? onLabel : offLabel}
              </span>
            </li>
          ))}
        </ul>
        {!methods?.google && <p className="mt-4 text-xs text-muted">Sign in with Google using {user.email} and it connects automatically.</p>}
      </Section>

      <Section id="settings-delete" danger title="Delete account" hint="Permanently removes your account and all of your tasks. This cannot be undone.">
        {!deleteOpen ? (
          <button type="button" onClick={() => setDeleteOpen(true)} className="btn btn-ghost !text-danger hover:!bg-[var(--danger-soft)]">
            Delete my account
          </button>
        ) : (
          <form onSubmit={deleteAccount} className="space-y-5 rounded-2xl bg-[var(--danger-soft)] p-5">
            <div>
              <p className="font-semibold">Are you sure?</p>
              <p className="mt-1 text-sm text-muted">Type your email address to confirm.</p>
            </div>
            <Field label={`Type ${user.email}`} type="email" value={deleteProof} onChange={setDeleteProof} autoComplete="off" />
            <FormMessage error={deleteState.error} />
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <SubmitButton variant="danger" loading={deleteState.busy} loadingText="Deleting..." disabled={deleteProof.trim().toLowerCase() !== user.email.toLowerCase()}>
                  Permanently delete
                </SubmitButton>
              </div>
              <button type="button" onClick={() => { setDeleteOpen(false); setDeleteProof(""); setDeleteState(idle); }} className="text-sm font-semibold text-muted hover:text-ink">
                Cancel
              </button>
            </div>
          </form>
        )}
      </Section>
      </fieldset>
    </div>
  );
}
