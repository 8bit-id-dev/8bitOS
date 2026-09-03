// Deploy edge function via Management API.
// Usage: node scripts/deploy-function.mjs <name> <token>
import fs from 'node:fs';
import https from 'node:https';

const [name, token] = process.argv.slice(2);
if (!name || !token) {
  console.error('Usage: node scripts/deploy-function.mjs <name> <token>');
  process.exit(1);
}

const body = JSON.stringify({
  slug: name,
  name,
  verify_jwt: false,
  entrypoint_path: 'index.ts',
  files: [
    {
      name: 'index.ts',
      content: fs.readFileSync(`supabase/functions/${name}/index.ts`, 'utf8'),
    },
  ],
});

const req = https.request(
  {
    hostname: 'api.supabase.com',
    path: `/v1/projects/nzamuxnrrqlqdtwdisrt/functions`,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
    },
  },
  (res) => {
    let data = '';
    res.on('data', (c) => (data += c));
    res.on('end', () => {
      console.log('STATUS', res.statusCode);
      console.log(data.slice(0, 500));
    });
  },
);
req.on('error', (e) => console.error('ERR', e.message));
req.write(body);
req.end();
