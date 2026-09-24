import crypto from 'crypto';
import { list, get } from '@vercel/blob';

function timingSafeEqualStr(a, b) {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) {
    // Compare against a same-length buffer to keep timing constant,
    // then still return false since lengths differ.
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ ok: false, error: 'method_not_allowed' });
    return;
  }

  const adminPassword = process.env.ADMIN_PASSWORD || '';
  const provided = req.headers['x-admin-password'] || '';

  if (!adminPassword || !provided || !timingSafeEqualStr(String(provided), adminPassword)) {
    res.status(401).json({ ok: false, error: 'unauthorized' });
    return;
  }

  res.setHeader('Cache-Control', 'no-store');

  try {
    const blobs = [];
    let cursor;
    do {
      const page = await list({ prefix: 'results/', cursor, limit: 1000 });
      blobs.push(...page.blobs);
      cursor = page.hasMore ? page.cursor : undefined;
    } while (cursor);

    const results = await Promise.all(blobs.map(async (b) => {
      try {
        const r = await get(b.pathname, { access: 'private' });
        if (!r || !r.stream) return null;
        const text = await new Response(r.stream).text();
        const data = JSON.parse(text);
        return data;
      } catch (e) {
        return null;
      }
    }));

    const clean = results.filter(Boolean).sort((a, b) => {
      const ta = a.createdAt ? Date.parse(a.createdAt) : 0;
      const tb = b.createdAt ? Date.parse(b.createdAt) : 0;
      return tb - ta;
    });

    res.status(200).json({ ok: true, results: clean });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'fetch_failed' });
  }
}
