import { o as __toESM } from "../_runtime.mjs";
import { a as require_react, i as require_jsx_runtime, n as useQuery, r as useQueryClient, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as getServerFnById, i as TSS_SERVER_FUNCTION, r as createServerFn } from "./ssr.mjs";
import { L as string, P as object } from "../_libs/@better-auth/core+[...].mjs";
import { i as signOut, t as authClient } from "./client-1vAx-gM_.mjs";
import { a as hasGateSessionMarker } from "./server-CSbA0n-b.mjs";
import { t as authMiddleware } from "./middleware-QdT_pWZJ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BI_HIcVb.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Current user + loading state. Same behavior in live preview and when deployed:
*   - Auth enabled -> the real signed-in user; `user` is `null` while
*                            the session resolves (`isPending: true`) and when
*                            signed out (`isPending: false`). Session comes from
*                            Better Auth `useSession()` → `/api/auth/get-session`
*                            (cookie when deployed; bearer in live preview).
*   - Auth disabled (`VITE_AUTH_ENABLED=false`) -> `DEV_USER`, never pending.
*
* Protect a route by waiting out `isPending` before acting on `user` —
* redirecting on `user: null` alone bounces signed-in visitors to sign-in on
* every hard reload:
*
*   import { RedirectToSignIn } from "@/lib/auth/gates";
*   const { user, isPending } = useCurrentUserState();
*   if (isPending) return null;              // still resolving — don't redirect yet
*   if (!user) return <RedirectToSignIn />;  // definitely signed out
*
* `authEnabled` is a module-level constant fixed at load, so the guarded hook
* call keeps a stable hook order across every render of a given component.
*/
function useCurrentUserState() {
	return useSessionUserState();
}
function useSessionUserState() {
	const { data, isPending } = authClient.useSession();
	const id = data?.user.id;
	const displayName = data?.user.name ?? null;
	const primaryEmail = data?.user.email ?? null;
	const profileImageUrl = data?.user.image ?? null;
	const user = (0, import_react.useMemo)(() => id ? {
		id,
		displayName,
		primaryEmail,
		profileImageUrl,
		isDevFallback: false
	} : null, [
		id,
		displayName,
		primaryEmail,
		profileImageUrl
	]);
	return (0, import_react.useMemo)(() => ({
		user,
		isPending
	}), [user, isPending]);
}
/**
* Convenience view of `useCurrentUserState().user` for display (e.g.
* `user?.displayName ?? "Guest"`). NOTE: `null` means *loading OR signed out* —
* for redirects/guards use `useCurrentUserState()` and check `isPending`.
*/
function useCurrentUser() {
	return useCurrentUserState().user;
}
var subscribeToNothing = () => () => {};
var noGateSessionOnServer = () => false;
/** Render children only when a user is present (real session, or the disabled-auth dev user). */
function SignedIn({ children }) {
	const { user } = useCurrentUserState();
	return user ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children }) : null;
}
/**
* Render children only once we KNOW the visitor is signed out (`isPending` has
* cleared and there is no user). Hidden while the session is still loading.
*/
function SignedOut({ children }) {
	const { user, isPending } = useCurrentUserState();
	if (isPending || user) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
/**
* Minimal signed-in identity chip + sign-out. Restyle freely (see the
* `design-ui` skill). Sign-out is only shown when auth is enabled (the
* disabled-auth dev user has nothing to sign out of) and the session is not
* gate-materialized — behind the gate the next request signs the viewer
* straight back in, so a sign-out control there is a broken loop.
*/
function UserButton() {
	const user = useCurrentUser();
	const [signingOut, setSigningOut] = (0, import_react.useState)(false);
	const gateSession = (0, import_react.useSyncExternalStore)(subscribeToNothing, hasGateSessionMarker, noGateSessionOnServer);
	if (!user) return null;
	const label = user.displayName ?? user.primaryEmail ?? "Account";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2",
		children: [
			user.profileImageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: user.profileImageUrl,
				alt: "",
				className: "h-8 w-8 rounded-full object-cover"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "grid h-8 w-8 place-items-center rounded-full bg-black/10 text-sm font-medium dark:bg-white/20",
				children: label.charAt(0).toUpperCase()
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-sm font-medium",
				children: label
			}),
			!gateSession && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				disabled: signingOut,
				onClick: () => {
					setSigningOut(true);
					signOut().catch(() => setSigningOut(false));
				},
				className: "cursor-pointer text-sm underline-offset-4 opacity-70 hover:underline disabled:cursor-wait disabled:no-underline",
				children: signingOut ? "Signing out…" : "Sign out"
			})
		]
	});
}
var COLORS = [
	{
		id: "ink",
		value: "#1a2e2a"
	},
	{
		id: "rose",
		value: "#e25b6a"
	},
	{
		id: "leaf",
		value: "#2f8a74"
	}
];
function Composer({ busy, onSend }) {
	const canvasRef = (0, import_react.useRef)(null);
	const drawing = (0, import_react.useRef)(false);
	const [color, setColor] = (0, import_react.useState)(COLORS[0].value);
	const [size, setSize] = (0, import_react.useState)(4);
	(0, import_react.useEffect)(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		ctx.fillStyle = "#fffdf6";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
	}, []);
	function pos(e) {
		const canvas = canvasRef.current;
		const rect = canvas.getBoundingClientRect();
		return {
			x: (e.clientX - rect.left) / rect.width * canvas.width,
			y: (e.clientY - rect.top) / rect.height * canvas.height
		};
	}
	function down(e) {
		const canvas = canvasRef.current;
		const ctx = canvas?.getContext("2d");
		if (!canvas || !ctx) return;
		canvas.setPointerCapture(e.pointerId);
		drawing.current = true;
		const p = pos(e);
		ctx.beginPath();
		ctx.moveTo(p.x, p.y);
	}
	function move(e) {
		if (!drawing.current) return;
		const ctx = canvasRef.current?.getContext("2d");
		if (!ctx) return;
		const p = pos(e);
		ctx.strokeStyle = color;
		ctx.lineWidth = size;
		ctx.lineCap = "round";
		ctx.lineJoin = "round";
		ctx.lineTo(p.x, p.y);
		ctx.stroke();
	}
	function up() {
		drawing.current = false;
	}
	function clear() {
		const canvas = canvasRef.current;
		const ctx = canvas?.getContext("2d");
		if (!canvas || !ctx) return;
		ctx.fillStyle = "#fffdf6";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
	}
	function send() {
		const canvas = canvasRef.current;
		if (!canvas) return;
		onSend(canvas.toDataURL("image/jpeg", .72));
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto w-full max-w-md",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-hidden rounded-card border border-line bg-surface shadow-sm",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
					ref: canvasRef,
					width: 640,
					height: 720,
					className: "aspect-[8/9] w-full touch-none bg-surface",
					onPointerDown: down,
					onPointerMove: move,
					onPointerUp: up,
					onPointerCancel: up
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex flex-wrap items-center gap-3",
				children: [COLORS.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-label": `${c.id} ink`,
					onClick: () => setColor(c.value),
					className: `h-11 w-11 rounded-full border-2 ${color === c.value ? "border-ink" : "border-transparent"}`,
					style: { background: c.value }
				}, c.id)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "ml-auto flex items-center gap-2 text-sm text-muted",
					children: ["Tip", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "range",
						min: 2,
						max: 14,
						value: size,
						onChange: (e) => setSize(Number(e.target.value)),
						className: "w-24 accent-leaf"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 grid grid-cols-2 gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: clear,
					className: "h-12 rounded-full border border-line bg-surface font-medium text-ink",
					children: "Clear"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					disabled: busy,
					onClick: send,
					className: "h-12 rounded-full bg-rose font-semibold text-surface disabled:opacity-60",
					children: busy ? "Sending…" : "Send to them"
				})]
			})
		]
	});
}
function PhoneHome({ note, caption, empty }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto w-full max-w-[320px]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mb-3 text-center text-sm font-medium text-muted",
			children: caption
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "rounded-[2.4rem] bg-phone p-2.5 shadow-[0_24px_50px_rgb(26_46_42/0.22)]",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "wallpaper relative aspect-[9/17] overflow-hidden rounded-[1.9rem]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute inset-x-0 top-2 flex justify-center",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-5 w-24 rounded-full bg-phone/80" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute inset-x-4 top-12",
						children: note ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "note-paper rotate-[-2deg] rounded-sm px-4 pb-5 pt-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: note.image,
								alt: "A note they sent you",
								className: "h-auto w-full"
							})
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "note-paper rotate-[-2deg] rounded-sm px-5 py-8 text-center",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-hand text-3xl leading-tight text-ink/80",
								children: empty
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute inset-x-4 bottom-5 grid grid-cols-4 gap-3",
						children: [
							"Photos",
							"Camera",
							"Mail",
							"Maps"
						].map((label) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col items-center gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-11 w-11 rounded-2xl bg-surface/85 shadow-sm" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[10px] font-medium text-ink/70",
								children: label
							})]
						}, label))
					})
				]
			})
		})]
	});
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var getState = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("0f040aec6aed6d7dd17328f15261c95783a78e8f28de7c00ca6a6af1feda820c"));
var createPair = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("437a350db82ad47cf5fc4b2a841cb1f4b2ca09d991399870ebdd06cde4029c30"));
var joinPair = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ code: string().trim().min(4).max(8) })).handler(createSsrRpc("603a2c202b49cf2087d69d52bf0d38ed67c1052e9a13481450cfb163218aae7a"));
var leavePair = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("8c6e80e5d31df38f079211fd2a078bfa8dce9049883e4727a9774017c8064f39"));
var sendNote = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ image: string().min(32).max(45e4).refine((v) => v.startsWith("data:image/jpeg") || v.startsWith("data:image/png"), "Drawing must be an image.") })).handler(createSsrRpc("e89cd30ca75e17dd68f66b55f97b5e7aa44fa293ae5c1ce6e641c9ea66e96605"));
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "min-h-screen bg-bg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignedOut, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Landing, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignedIn, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Studio, {}) })]
	});
}
function Landing() {
	const { isPending } = useCurrentUserState();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
			className: "flex items-center justify-between",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-hand text-4xl text-rose",
				children: "Lovora"
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid flex-1 items-center gap-10 py-10 md:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-semibold uppercase tracking-[0.18em] text-leaf",
					children: "Even when you are apart"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-3 text-5xl font-semibold leading-[1.05] tracking-tight",
					children: "Send drawings straight to their home screen."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 max-w-md text-lg text-muted",
					children: "Write it, doodle it, send it. They open Lovora and the note is already sitting on their screen."
				}),
				isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-8 text-sm text-muted",
					children: "Checking your session…"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/login",
					className: "mt-8 inline-flex h-12 items-center rounded-full bg-rose px-6 font-semibold text-surface",
					children: "Start a link"
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhoneHome, {
				note: null,
				caption: "Their screen",
				empty: "I love you"
			})]
		})]
	});
}
function Studio() {
	const qc = useQueryClient();
	const [tab, setTab] = (0, import_react.useState)("yours");
	const [code, setCode] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)(null);
	const state = useQuery({
		queryKey: ["lovora"],
		queryFn: () => getState(),
		refetchInterval: 4e3
	});
	const refresh = () => qc.invalidateQueries({ queryKey: ["lovora"] });
	const make = useMutation({
		mutationFn: () => createPair(),
		onSuccess: refresh,
		onError: (e) => setError(e.message)
	});
	const join = useMutation({
		mutationFn: () => joinPair({ data: { code } }),
		onSuccess: () => {
			setCode("");
			refresh();
		},
		onError: (e) => setError(e.message)
	});
	const leave = useMutation({
		mutationFn: () => leavePair(),
		onSuccess: refresh,
		onError: (e) => setError(e.message)
	});
	const send = useMutation({
		mutationFn: (image) => sendNote({ data: { image } }),
		onSuccess: () => {
			setError(null);
			setTab("theirs");
			refresh();
		},
		onError: (e) => setError(e.message)
	});
	const pair = state.data?.pair ?? null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex min-h-screen max-w-lg flex-col px-5 pb-28 pt-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-hand text-4xl leading-none text-rose",
					children: "Lovora"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: pair ? pair.hasPartner ? "You are linked" : `Waiting · code ${pair.code}` : "Not linked yet"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {})]
			}),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 rounded-card bg-rose/10 px-4 py-3 text-sm text-rose-deep",
				children: error
			}) : null,
			!pair ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-8 space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => {
						setError(null);
						make.mutate();
					},
					disabled: make.isPending,
					className: "h-12 w-full rounded-full bg-rose font-semibold text-surface",
					children: make.isPending ? "Making a code…" : "Create a link code"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "flex gap-2",
					onSubmit: (e) => {
						e.preventDefault();
						setError(null);
						join.mutate();
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: code,
						onChange: (e) => setCode(e.target.value.toUpperCase()),
						placeholder: "Their code",
						maxLength: 8,
						className: "h-12 flex-1 rounded-full border border-line bg-surface px-4 tracking-[0.2em] uppercase outline-none"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "submit",
						disabled: join.isPending || code.trim().length < 4,
						className: "h-12 rounded-full bg-ink px-5 font-semibold text-surface disabled:opacity-50",
						children: "Join"
					})]
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex items-center justify-between rounded-card bg-leaf-soft px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-semibold uppercase tracking-wider text-leaf",
						children: "Share this code"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-hand text-4xl leading-none tracking-wide",
						children: pair.code
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => {
							navigator.clipboard?.writeText(pair.code);
						},
						className: "h-11 rounded-full bg-surface px-4 text-sm font-semibold text-ink",
						children: "Copy"
					})]
				}),
				!pair.hasPartner ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-muted",
					children: "They sign in, tap Join, and type this code. Notes you send now will be waiting."
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6 flex-1",
					children: state.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "Loading your screen…"
					}) : tab === "write" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Composer, {
						busy: send.isPending,
						onSend: (image) => send.mutate(image)
					}) : tab === "yours" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhoneHome, {
						note: state.data?.incoming ?? null,
						caption: "Your screen",
						empty: pair.hasPartner ? "Nothing yet. They will write." : "Waiting for them"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhoneHome, {
						note: state.data?.outgoing ?? null,
						caption: "How it looks on their screen",
						empty: "Draw something and send it"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => leave.mutate(),
					className: "mt-6 text-sm text-muted underline-offset-2 hover:underline",
					children: "Leave this link"
				})
			] }),
			pair ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "fixed inset-x-0 bottom-0 border-t border-line bg-surface/95 px-4 py-3 backdrop-blur",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto grid max-w-lg grid-cols-3 gap-2",
					children: [
						["yours", "Your screen"],
						["write", "Write"],
						["theirs", "Their screen"]
					].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setTab(id),
						className: `h-12 rounded-full text-sm font-semibold ${tab === id ? "bg-ink text-surface" : "bg-bg-deep text-ink"}`,
						children: label
					}, id))
				})
			}) : null
		]
	});
}
//#endregion
export { Home as component };
