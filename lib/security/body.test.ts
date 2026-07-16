import { describe, it, expect } from 'vitest';
import { readJsonCapped } from './body';

const MAX = 1024;

function jsonReq(body: string, headers: Record<string, string> = {}): Request {
  return new Request('https://example.test/api', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body
  });
}

/** A body delivered without a Content-Length, the way a chunked sender would. */
function streamedReq(body: string): Request {
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const chunk = new TextEncoder().encode(body);
      // Deliberately split: the cap must trip mid-stream, not after the fact.
      for (let i = 0; i < chunk.length; i += 64) {
        controller.enqueue(chunk.slice(i, i + 64));
      }
      controller.close();
    }
  });
  return new Request('https://example.test/api', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: stream,
    // @ts-expect-error -- undici requires this for a stream body; not in the DOM types.
    duplex: 'half'
  });
}

describe('readJsonCapped', () => {
  it('parses a small valid body', async () => {
    const res = await readJsonCapped(jsonReq('{"a":1}'), MAX);
    expect(res).toEqual({ ok: true, value: { a: 1 } });
  });

  it('rejects malformed JSON', async () => {
    const res = await readJsonCapped(jsonReq('{nope'), MAX);
    expect(res).toEqual({ ok: false, reason: 'invalid-json' });
  });

  it('rejects a body over the cap declared by Content-Length', async () => {
    const res = await readJsonCapped(jsonReq(JSON.stringify({ a: 'x'.repeat(MAX) })), MAX);
    expect(res).toEqual({ ok: false, reason: 'too-large' });
  });

  // The header-only check this replaces: a sender that omits Content-Length
  // walked straight past it into an unbounded req.json().
  it('rejects an oversized body that declares no Content-Length', async () => {
    const res = await readJsonCapped(streamedReq(JSON.stringify({ a: 'x'.repeat(MAX * 4) })), MAX);
    expect(res).toEqual({ ok: false, reason: 'too-large' });
  });

  it('rejects a lying Content-Length smaller than the real body', async () => {
    const res = await readJsonCapped(
      jsonReq(JSON.stringify({ a: 'x'.repeat(MAX) }), { 'content-length': '10' }),
      MAX
    );
    expect(res).toEqual({ ok: false, reason: 'too-large' });
  });

  it('accepts a streamed body under the cap', async () => {
    const res = await readJsonCapped(streamedReq('{"a":"hello"}'), MAX);
    expect(res).toEqual({ ok: true, value: { a: 'hello' } });
  });

  it('treats an empty body as invalid JSON, not as a crash', async () => {
    const res = await readJsonCapped(jsonReq(''), MAX);
    expect(res).toEqual({ ok: false, reason: 'invalid-json' });
  });
});
