// Usage: node scripts/db-query.mjs "<SQL>"  — reads token from SUPABASE_ACCESS_TOKEN or arg 2
import https from 'node:https';

const [sql, tokenArg] = process.argv.slice(2);
const token = tokenArg || process.env.SUPABASE_ACCESS_TOKEN;
if (!sql || !token) {
  console.error('Usage: node scripts/db-query.mjs "<SQL>" [token]');
  process.exit(1);
}

const data = JSON.stringify({ query: sql });
const req = https.request(
  {
    hostname: 'api.supabase.com',
    path: '/v1/projects/nzamuxnrrqlqdtwdisrt/database/query',
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data),
    },
  },
  (res) => {
    let body = '';
    res.on('data', (c) => (body += c));
    res.on('end', () => {
      console.log('STATUS', res.statusCode);
      console.log(body || '(empty)');
    });
  },
);
req.on('error', (e) => console.error('ERR', e.message));
req.write(data);
req.end();
