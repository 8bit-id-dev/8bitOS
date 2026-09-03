// List deployed edge functions.
// Usage: node scripts/list-functions.mjs <token>
import https from 'node:https';

const token = process.argv[2];
const req = https.request(
  {
    hostname: 'api.supabase.com',
    path: '/v1/projects/nzamuxnrrqlqdtwdisrt/functions',
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  },
  (res) => {
    let data = '';
    res.on('data', (c) => (data += c));
    res.on('end', () => {
      console.log('STATUS', res.statusCode);
      console.log(data.slice(0, 600));
    });
  },
);
req.on('error', (e) => console.error('ERR', e.message));
req.end();
