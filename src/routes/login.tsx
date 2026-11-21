import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("up");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const result =
      mode === "up"
        ? await authClient.signUp.email({ email, password, name: name || email.split("@")[0] || "You" })
        : await authClient.signIn.email({ email, password });
    setBusy(false);
    if (result.error) {
      setError(result.error.message || "Could not sign in.");
      return;
    }
    await navigate({ to: "/" });
  }

  return (
    <main className="grid min-h-screen place-items-center bg-bg px-6 py-12">
      <div className="w-full max-w-sm">
        <p className="font-hand text-4xl text-rose">Lovora</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          {mode === "up" ? "Create your side" : "Welcome back"}
        </h1>
        <p className="mt-2 text-muted">Use email here. Do not open the black Google page — it rejects this app.</p>
        {authEnabled ? (
          <form className="mt-8 space-y-3" onSubmit={submit}>
            {mode === "up" ? (
              <input
                value={name}
                onChange={(ev) => setName(ev.target.value)}
                placeholder="Your name"
                autoComplete="name"
                className="h-12 w-full rounded-full border border-line bg-surface px-4 outline-none"
              />
            ) : null}
            <input
              type="email"
              required
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
              placeholder="Email"
              autoComplete="email"
              className="h-12 w-full rounded-full border border-line bg-surface px-4 outline-none"
            />
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
              placeholder="Password (8+ characters)"
              autoComplete={mode === "up" ? "new-password" : "current-password"}
              className="h-12 w-full rounded-full border border-line bg-surface px-4 outline-none"
            />
            {error ? <p className="text-sm text-rose-deep">{error}</p> : null}
            <button
              type="submit"
              disabled={busy}
              className="h-12 w-full rounded-full bg-rose text-sm font-semibold text-surface disabled:opacity-60"
            >
              {busy ? "Please wait…" : mode === "up" ? "Create account" : "Sign in"}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode(mode === "up" ? "in" : "up");
                setError(null);
              }}
              className="h-12 w-full text-sm font-medium text-muted"
            >
              {mode === "up" ? "I already have an account" : "Need an account?"}
            </button>
            <div className="space-y-2 pt-2">
              {GROK_PROVIDERS.map((p) => (
                <button
                  key={p.providerId}
                  type="button"
                  onClick={() => signIn(p.providerId, { callbackURL: "/" })}
                  className="h-11 w-full rounded-full border border-line bg-surface text-sm font-medium text-ink"
                >
                  Continue with {p.label}
                </button>
              ))}
            </div>
          </form>
        ) : (
          <p className="mt-8 text-sm text-muted">Sign-in is disabled.</p>
        )}
      </div>
    </main>
  );
}
