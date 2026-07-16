export type ReadResult =
  | { ok: true; value: unknown }
  | { ok: false; reason: 'too-large' | 'invalid-json' };

/**
 * Read and JSON-parse a request body, refusing to buffer more than `maxBytes`.
 *
 * Next.js applies no body limit to route handlers, and `req.json()` buffers whatever
 * arrives. Checking `Content-Length` alone is not a guard: the header is optional and
 * client-supplied, so a chunked sender or a forged small value walks straight past it.
 * This counts the bytes it has actually read and bails mid-stream, so an oversized body
 * is dropped on the floor rather than held in memory.
 */
export async function readJsonCapped(req: Request, maxBytes: number): Promise<ReadResult> {
  // Fast path only: an honest oversized upload is rejected before we read a byte.
  const declared = Number(req.headers.get('content-length') ?? 0);
  if (Number.isFinite(declared) && declared > maxBytes) return { ok: false, reason: 'too-large' };

  const body = req.body;
  if (!body) return { ok: false, reason: 'invalid-json' };

  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel().catch(() => {});
        return { ok: false, reason: 'too-large' };
      }
      chunks.push(value);
    }
  } catch {
    return { ok: false, reason: 'invalid-json' };
  }

  const buf = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    buf.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    return { ok: true, value: JSON.parse(new TextDecoder().decode(buf)) };
  } catch {
    return { ok: false, reason: 'invalid-json' };
  }
}
