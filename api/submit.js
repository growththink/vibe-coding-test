import { put } from '@vercel/blob';

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

function isPlainObject(v) {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ ok: false, error: 'method_not_allowed' });
    return;
  }

  let body;
  try {
    const raw = typeof req.body === 'string' || req.body === undefined
      ? await readBody(req)
      : null;
    body = raw !== null ? JSON.parse(raw || '{}') : req.body;
  } catch (e) {
    res.status(400).json({ ok: false, error: 'invalid_json' });
    return;
  }

  if (!isPlainObject(body)) {
    res.status(400).json({ ok: false, error: 'invalid_body' });
    return;
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const intro = typeof body.intro === 'string' ? body.intro.trim() : '';
  const score = Number(body.score);
  const total = Number(body.total);
  const type = typeof body.type === 'string' ? body.type.trim() : '';
  const weekly = Array.isArray(body.weekly) ? body.weekly : null;

  if (!name || name.length > 20) {
    res.status(400).json({ ok: false, error: 'invalid_name' });
    return;
  }
  if (intro.length > 60) {
    res.status(400).json({ ok: false, error: 'invalid_intro' });
    return;
  }
  if (!Number.isFinite(score) || score < 0 || score > 1000) {
    res.status(400).json({ ok: false, error: 'invalid_score' });
    return;
  }
  if (!Number.isFinite(total) || total < 0 || total > 1000) {
    res.status(400).json({ ok: false, error: 'invalid_total' });
    return;
  }
  if (!type || type.length > 40) {
    res.status(400).json({ ok: false, error: 'invalid_type' });
    return;
  }

  let weeklyClean = null;
  if (weekly) {
    if (weekly.length > 20) {
      res.status(400).json({ ok: false, error: 'invalid_weekly' });
      return;
    }
    weeklyClean = weekly.map(w => ({
      w: Number(w && w.w),
      c: Number(w && w.c),
      n: Number(w && w.n),
    })).filter(w => Number.isFinite(w.w) && Number.isFinite(w.c) && Number.isFinite(w.n));
  }

  const createdAt = new Date().toISOString();
  const record = {
    name: name.slice(0, 20),
    intro: intro.slice(0, 60),
    score,
    total,
    type: type.slice(0, 40),
    weekly: weeklyClean,
    createdAt,
  };

  const random = Math.random().toString(36).slice(2, 10);
  const pathname = `results/${createdAt}-${random}.json`;

  try {
    await put(pathname, JSON.stringify(record), {
      access: 'private',
      contentType: 'application/json',
      addRandomSuffix: false,
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'storage_failed' });
    return;
  }

  res.status(200).json({ ok: true });
}
