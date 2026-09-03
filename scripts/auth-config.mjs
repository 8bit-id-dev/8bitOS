// Toggle auth config: node scripts/auth-config.mjs <token>
import https from 'node:https';

const token = process.argv[2];
const body = JSON.stringify({ mailer_autoconfirm: true });
const req = https.request(
  {
    hostname: 'api.supabase.com',
    path: '/v1/projects/nzamuxnrrqlqdtwdisrt/config/auth',
    method: 'PATCH',
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
      try {
        const j = JSON.parse(data);
        console.log('mailer_autoconfirm:', j.mailer_autoconfirm);
      } catch {
        console.log(data.slice(0, 300));
      }
    });
  },
);
req.on('error', (e) => console.error('ERR', e.message));
req.write(body);
req.end();
