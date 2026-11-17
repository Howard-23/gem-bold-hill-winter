import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Composer } from "@/components/Composer";
import { PhoneHome } from "@/components/PhoneHome";
import { createPair, getState, joinPair, leavePair, sendNote } from "@/lib/lovora.functions";
import { Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { LiveNote } from "@/components/LiveNote";
import { useP2PRoom } from "@/lib/multiplayer";
import { isStrokeMsg, type StrokeMsg } from "@/lib/strokes";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const { isPending, user } = useCurrentUserState();
  return (
    <main className="min-h-screen bg-bg">
      {isPending ? (
        <p className="px-6 pt-10 text-sm text-muted">Opening Lovora…</p>
      ) : user ? (
        <Studio />
      ) : (
        <Landing />
      )}
    </main>
  );
}

function Landing() {
  const { isPending } = useCurrentUserState();
  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-8">
      <header className="flex items-center justify-between">
        <span className="font-hand text-4xl text-rose">Lovora</span>
      </header>
      <div className="grid flex-1 items-center gap-10 py-10 md:grid-cols-2">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-leaf">Even when you are apart</p>
          <h1 className="mt-3 text-5xl font-semibold leading-[1.05] tracking-tight">
            Send drawings straight to their home screen.
          </h1>
          <p className="mt-4 max-w-md text-lg text-muted">
            Write it, doodle it, send it. They open Lovora and the note is already sitting on their screen.
          </p>
          {isPending ? (
            <p className="mt-8 text-sm text-muted">Checking your session…</p>
          ) : (
            <Link
              to="/login"
              className="mt-8 inline-flex h-12 items-center rounded-full bg-rose px-6 font-semibold text-surface"
            >
              Start a link
            </Link>
          )}
        </div>
        <PhoneHome
          note={null}
          caption="Their screen"
          empty="I love you"
        />
      </div>
    </div>
  );
}

function Studio() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<"yours" | "theirs" | "write">("yours");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const state = useQuery({
    queryKey: ["lovora"],
    queryFn: () => getState(),
    refetchInterval: 4000,
  });

  const refresh = useCallback(() => {
    void qc.invalidateQueries({ queryKey: ["lovora"] });
  }, [qc]);

  const make = useMutation({
    mutationFn: () => createPair(),
    onSuccess: refresh,
    onError: (e: Error) => setError(e.message),
  });
  const join = useMutation({
    mutationFn: () => joinPair({ data: { code } }),
    onSuccess: () => {
      setCode("");
      refresh();
    },
    onError: (e: Error) => setError(e.message),
  });
  const leave = useMutation({
    mutationFn: () => leavePair(),
    onSuccess: refresh,
    onError: (e: Error) => setError(e.message),
  });
  const send = useMutation({
    mutationFn: (image: string) => sendNote({ data: { image } }),
    onSuccess: () => {
      setError(null);
      setTab("theirs");
      refresh();
    },
    onError: (e: Error) => setError(e.message),
  });

  const pair = state.data?.pair ?? null;

  if (!pair) {
    return (
      <Shell error={error}>
        <section className="mt-8 space-y-4">
          <button
            type="button"
            onClick={() => {
              setError(null);
              make.mutate();
            }}
            disabled={make.isPending}
            className="h-12 w-full rounded-full bg-rose font-semibold text-surface"
          >
            {make.isPending ? "Making a code…" : "Create a link code"}
          </button>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              setError(null);
              join.mutate();
            }}
          >
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Their code"
              maxLength={8}
              className="h-12 flex-1 rounded-full border border-line bg-surface px-4 tracking-[0.2em] uppercase outline-none"
            />
            <button
              type="submit"
              disabled={join.isPending || code.trim().length < 4}
              className="h-12 rounded-full bg-ink px-5 font-semibold text-surface disabled:opacity-50"
            >
              Join
            </button>
          </form>
        </section>
      </Shell>
    );
  }

  return (
    <LinkedDesk
      pair={pair}
      tab={tab}
      setTab={setTab}
      error={error}
      incoming={state.data?.incoming ?? null}
      outgoing={state.data?.outgoing ?? null}
      loading={state.isPending}
      sending={send.isPending}
      onSend={(image) => send.mutate(image)}
      onLeave={() => leave.mutate()}
      onCommit={refresh}
    />
  );
}

function Shell({ error, children }: { error: string | null; children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col px-5 pb-10 pt-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="font-hand text-4xl leading-none text-rose">Lovora</p>
          <p className="mt-1 text-sm text-muted">Not linked yet</p>
        </div>
        <UserButton />
      </header>
      {error ? <p className="mt-4 rounded-card bg-rose/10 px-4 py-3 text-sm text-rose-deep">{error}</p> : null}
      {children}
    </div>
  );
}

function LinkedDesk({
  pair,
  tab,
  setTab,
  error,
  incoming,
  outgoing,
  loading,
  sending,
  onSend,
  onLeave,
  onCommit,
}: {
  pair: { id: string; code: string; hasPartner: boolean };
  tab: "yours" | "theirs" | "write";
  setTab: (tab: "yours" | "theirs" | "write") => void;
  error: string | null;
  incoming: { id: string; image: string; createdAt: string } | null;
  outgoing: { id: string; image: string; createdAt: string } | null;
  loading: boolean;
  sending: boolean;
  onSend: (image: string) => void;
  onLeave: () => void;
  onCommit: () => void;
}) {
  const p2p = useP2PRoom({ room: pair.id, name: "note" });
  const [tick, setTick] = useState<StrokeMsg | null>(null);
  const [live, setLive] = useState(false);
  const seq = useRef(0);

  useEffect(
    () =>
      p2p.onMessage((_from, data, channel) => {
        if (channel !== "reliable" || !isStrokeMsg(data)) return;
        seq.current += 1;
        if (data.t === "commit") {
          setLive(false);
          onCommit();
          return;
        }
        if (data.t === "clear") setLive(false);
        else setLive(true);
        setTick({ ...data });
      }),
    [p2p.onMessage, onCommit],
  );

  const connected = p2p.peers.some((peer) => peer.connectionState === "connected");

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col px-5 pb-28 pt-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="font-hand text-4xl leading-none text-rose">Lovora</p>
          <p className="mt-1 text-sm text-muted">
            {pair.hasPartner ? (connected ? "Live — strokes sync as you draw" : "Linked · opening a live line") : `Waiting · code ${pair.code}`}
          </p>
        </div>
        <UserButton />
      </header>
      {error ? <p className="mt-4 rounded-card bg-rose/10 px-4 py-3 text-sm text-rose-deep">{error}</p> : null}
      <div className="mt-4 flex items-center justify-between rounded-card bg-leaf-soft px-4 py-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-leaf">Share this code</p>
          <p className="font-hand text-4xl leading-none tracking-wide">{pair.code}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard?.writeText(pair.code);
          }}
          className="h-11 rounded-full bg-surface px-4 text-sm font-semibold text-ink"
        >
          Copy
        </button>
      </div>
      <div className="mt-6 flex-1">
        {loading ? (
          <p className="text-sm text-muted">Loading your screen…</p>
        ) : tab === "write" ? (
          <Composer
            busy={sending}
            onPoint={(point) => p2p.send({ t: "pt", ...point })}
            onClear={() => p2p.send({ t: "clear" })}
            onSend={(image) => {
              p2p.send({ t: "commit" });
              onSend(image);
            }}
          />
        ) : tab === "yours" ? (
          live ? (
            <div className="mx-auto w-full max-w-[320px]">
              <p className="mb-3 text-center text-sm font-medium text-muted">Your screen</p>
              <div className="rounded-[2.4rem] bg-phone p-2.5 shadow-[0_24px_50px_rgb(26_46_42/0.22)]">
                <div className="wallpaper relative aspect-[9/17] overflow-hidden rounded-[1.9rem]">
                  <div className="absolute inset-x-4 top-12">
                    <LiveNote active stream={tick} />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <PhoneHome
              note={incoming}
              caption="Your screen"
              empty={pair.hasPartner ? "Nothing yet. They will write." : "Waiting for them"}
            />
          )
        ) : (
          <PhoneHome note={outgoing} caption="How it looks on their screen" empty="Draw something and send it" />
        )}
      </div>
      <button type="button" onClick={onLeave} className="mt-6 text-sm text-muted underline-offset-2 hover:underline">
        Leave this link
      </button>
      <nav className="fixed inset-x-0 bottom-0 border-t border-line bg-surface/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto grid max-w-lg grid-cols-3 gap-2">
          {(
            [
              ["yours", "Your screen"],
              ["write", "Write"],
              ["theirs", "Their screen"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`h-12 rounded-full text-sm font-semibold ${tab === id ? "bg-ink text-surface" : "bg-bg-deep text-ink"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
