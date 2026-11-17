import { createFileRoute } from "@tanstack/react-router";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  return (
    <main className="grid min-h-screen place-items-center bg-bg px-6 py-12">
      <div className="w-full max-w-sm">
        <p className="font-hand text-4xl text-rose">Lovora</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Sign in to link</h1>
        <p className="mt-2 text-muted">Each of you signs in, then one code connects the two screens.</p>
        <div className="mt-8 space-y-3">
          {authEnabled ? (
            GROK_PROVIDERS.map((p) => (
              <button
                key={p.providerId}
                type="button"
                onClick={() => signIn(p.providerId, { callbackURL: "/" })}
                className="h-12 w-full rounded-full bg-ink text-sm font-semibold text-surface"
              >
                Continue with {p.label}
              </button>
            ))
          ) : (
            <p className="text-sm text-muted">Sign-in is disabled.</p>
          )}
        </div>
      </div>
    </main>
  );
}
