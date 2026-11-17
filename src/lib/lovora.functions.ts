import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";

export type NoteCard = {
  id: string;
  image: string;
  createdAt: string;
};

export type LovoraState = {
  pair: { id: string; code: string; hasPartner: boolean; youCreated: boolean } | null;
  incoming: NoteCard | null;
  outgoing: NoteCard | null;
};

function codeOf() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  for (const b of bytes) out += alphabet[b % alphabet.length];
  return out;
}

async function pairFor(userId: string) {
  const sql = await getSql();
  const rows = await sql<{
    id: string;
    code: string;
    created_by: string;
    partner_id: string | null;
  }>`
    select id, code, created_by, partner_id
    from pairs
    where created_by = ${userId} or partner_id = ${userId}
    limit 1
  `;
  return rows[0] ?? null;
}

async function latestNote(pairId: string, authorIs: "me" | "them", userId: string) {
  const sql = await getSql();
  const rows =
    authorIs === "me"
      ? await sql<{ id: string; image_data: string; created_at: string }>`
          select id, image_data, created_at::text as created_at
          from notes
          where pair_id = ${pairId} and author_id = ${userId}
          order by created_at desc
          limit 1
        `
      : await sql<{ id: string; image_data: string; created_at: string }>`
          select id, image_data, created_at::text as created_at
          from notes
          where pair_id = ${pairId} and author_id <> ${userId}
          order by created_at desc
          limit 1
        `;
  const row = rows[0];
  if (!row) return null;
  return { id: row.id, image: row.image_data, createdAt: row.created_at };
}

export const getState = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<LovoraState> => {
    const pair = await pairFor(context.userId);
    if (!pair) return { pair: null, incoming: null, outgoing: null };
    const [incoming, outgoing] = await Promise.all([
      latestNote(pair.id, "them", context.userId),
      latestNote(pair.id, "me", context.userId),
    ]);
    return {
      pair: {
        id: pair.id,
        code: pair.code,
        hasPartner: Boolean(pair.partner_id),
        youCreated: pair.created_by === context.userId,
      },
      incoming,
      outgoing,
    };
  });

export const createPair = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
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
      } catch {
        // code collision — retry
      }
    }
    throw new Error("Could not make a link code. Try again.");
  });

export const joinPair = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ code: z.string().trim().min(4).max(8) }))
  .handler(async ({ context, data }) => {
    const mine = await pairFor(context.userId);
    if (mine) throw new Error("You are already linked. Leave first to join someone else.");
    const sql = await getSql();
    const code = data.code.toUpperCase();
    const rows = await sql<{ id: string; created_by: string; partner_id: string | null }>`
      select id, created_by, partner_id from pairs where code = ${code} limit 1
    `;
    const pair = rows[0];
    if (!pair) throw new Error("No link with that code.");
    if (pair.created_by === context.userId) throw new Error("That is your own code.");
    if (pair.partner_id) throw new Error("That link is already full.");
    await sql`
      update pairs set partner_id = ${context.userId}
      where id = ${pair.id} and partner_id is null
    `;
    return { ok: true };
  });

export const leavePair = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
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

export const sendNote = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      image: z
        .string()
        .min(32)
        .max(450_000)
        .refine((v) => v.startsWith("data:image/jpeg") || v.startsWith("data:image/png"), "Drawing must be an image."),
    }),
  )
  .handler(async ({ context, data }) => {
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
