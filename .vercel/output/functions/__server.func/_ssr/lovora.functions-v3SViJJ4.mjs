import { i as TSS_SERVER_FUNCTION, r as createServerFn } from "./ssr.mjs";
import { L as string, P as object } from "../_libs/@better-auth/core+[...].mjs";
import { r as getSql } from "./db-rS95WMpq.mjs";
import { t as authMiddleware } from "./middleware-QdT_pWZJ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/lovora.functions-v3SViJJ4.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
function codeOf() {
	const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
	let out = "";
	const bytes = crypto.getRandomValues(/* @__PURE__ */ new Uint8Array(6));
	for (const b of bytes) out += alphabet[b % 32];
	return out;
}
async function pairFor(userId) {
	return (await (await getSql())`
    select id, code, created_by, partner_id
    from pairs
    where created_by = ${userId} or partner_id = ${userId}
    limit 1
  `)[0] ?? null;
}
async function latestNote(pairId, authorIs, userId) {
	const sql = await getSql();
	const row = (authorIs === "me" ? await sql`
          select id, image_data, created_at::text as created_at
          from notes
          where pair_id = ${pairId} and author_id = ${userId}
          order by created_at desc
          limit 1
        ` : await sql`
          select id, image_data, created_at::text as created_at
          from notes
          where pair_id = ${pairId} and author_id <> ${userId}
          order by created_at desc
          limit 1
        `)[0];
	if (!row) return null;
	return {
		id: row.id,
		image: row.image_data,
		createdAt: row.created_at
	};
}
var getState_createServerFn_handler = createServerRpc({
	id: "0f040aec6aed6d7dd17328f15261c95783a78e8f28de7c00ca6a6af1feda820c",
	name: "getState",
	filename: "src/lib/lovora.functions.ts"
}, (opts) => getState.__executeServer(opts));
var getState = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getState_createServerFn_handler, async ({ context }) => {
	const pair = await pairFor(context.userId);
	if (!pair) return {
		pair: null,
		incoming: null,
		outgoing: null
	};
	const [incoming, outgoing] = await Promise.all([latestNote(pair.id, "them", context.userId), latestNote(pair.id, "me", context.userId)]);
	return {
		pair: {
			id: pair.id,
			code: pair.code,
			hasPartner: Boolean(pair.partner_id),
			youCreated: pair.created_by === context.userId
		},
		incoming,
		outgoing
	};
});
var createPair_createServerFn_handler = createServerRpc({
	id: "437a350db82ad47cf5fc4b2a841cb1f4b2ca09d991399870ebdd06cde4029c30",
	name: "createPair",
	filename: "src/lib/lovora.functions.ts"
}, (opts) => createPair.__executeServer(opts));
var createPair = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createPair_createServerFn_handler, async ({ context }) => {
	const existing = await pairFor(context.userId);
	if (existing) return { code: existing.code };
	const sql = await getSql();
	const id = crypto.randomUUID();
	for (let i = 0; i < 5; i++) {
		const code = codeOf();
		try {
			await sql`
          insert into pairs (id, code, created_by)
          values (${id}, ${code}, ${context.userId})
        `;
			return { code };
		} catch {}
	}
	throw new Error("Could not make a link code. Try again.");
});
var joinPair_createServerFn_handler = createServerRpc({
	id: "603a2c202b49cf2087d69d52bf0d38ed67c1052e9a13481450cfb163218aae7a",
	name: "joinPair",
	filename: "src/lib/lovora.functions.ts"
}, (opts) => joinPair.__executeServer(opts));
var joinPair = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ code: string().trim().min(4).max(8) })).handler(joinPair_createServerFn_handler, async ({ context, data }) => {
	if (await pairFor(context.userId)) throw new Error("You are already linked. Leave first to join someone else.");
	const sql = await getSql();
	const pair = (await sql`
      select id, created_by, partner_id from pairs where code = ${data.code.toUpperCase()} limit 1
    `)[0];
	if (!pair) throw new Error("No link with that code.");
	if (pair.created_by === context.userId) throw new Error("That is your own code.");
	if (pair.partner_id) throw new Error("That link is already full.");
	await sql`
      update pairs set partner_id = ${context.userId}
      where id = ${pair.id} and partner_id is null
    `;
	return { ok: true };
});
var leavePair_createServerFn_handler = createServerRpc({
	id: "8c6e80e5d31df38f079211fd2a078bfa8dce9049883e4727a9774017c8064f39",
	name: "leavePair",
	filename: "src/lib/lovora.functions.ts"
}, (opts) => leavePair.__executeServer(opts));
var leavePair = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(leavePair_createServerFn_handler, async ({ context }) => {
	const pair = await pairFor(context.userId);
	if (!pair) return { ok: true };
	const sql = await getSql();
	if (pair.created_by === context.userId && pair.partner_id) {
		await sql`
        update pairs
        set created_by = ${pair.partner_id}, partner_id = null
        where id = ${pair.id}
      `;
		return { ok: true };
	}
	if (pair.partner_id === context.userId) {
		await sql`update pairs set partner_id = null where id = ${pair.id}`;
		return { ok: true };
	}
	await sql`delete from notes where pair_id = ${pair.id}`;
	await sql`delete from pairs where id = ${pair.id}`;
	return { ok: true };
});
var sendNote_createServerFn_handler = createServerRpc({
	id: "e89cd30ca75e17dd68f66b55f97b5e7aa44fa293ae5c1ce6e641c9ea66e96605",
	name: "sendNote",
	filename: "src/lib/lovora.functions.ts"
}, (opts) => sendNote.__executeServer(opts));
var sendNote = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ image: string().min(32).max(45e4).refine((v) => v.startsWith("data:image/jpeg") || v.startsWith("data:image/png"), "Drawing must be an image.") })).handler(sendNote_createServerFn_handler, async ({ context, data }) => {
	const pair = await pairFor(context.userId);
	if (!pair) throw new Error("Link with someone before you send.");
	const sql = await getSql();
	const id = crypto.randomUUID();
	await sql`
      insert into notes (id, pair_id, author_id, image_data)
      values (${id}, ${pair.id}, ${context.userId}, ${data.image})
    `;
	return { id };
});
//#endregion
export { createPair_createServerFn_handler, getState_createServerFn_handler, joinPair_createServerFn_handler, leavePair_createServerFn_handler, sendNote_createServerFn_handler };
