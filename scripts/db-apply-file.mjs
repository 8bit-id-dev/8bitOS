// Apply a .sql file: node scripts/db-apply-file.mjs <file> <token>
import fs from 'node:fs';
import https from 'node:https';

const [file, token] = process.argv.slice(2);
if (!file || !token) {
  console.error('Usage: node scripts/db-apply-file.mjs <file.sql> <token>');
  process.exit(1);
}

const sql = fs.readFileSync(file, 'utf8');
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
      console.log((body || '(empty = success)').slice(0, 600));
    });
  },
);
req.on('error', (e) => console.error('ERR', e.message));
req.write(data);
req.end();
