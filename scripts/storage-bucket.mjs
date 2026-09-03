// Manage storage bucket: node scripts/storage-bucket.mjs <create|delete> <token>
// Also sets per-user folder policy via storage.objects RLS (done in SQL).
import https from 'node:https';

const [action, token] = process.argv.slice(2);
if (!action || !token) {
  console.error('Usage: node scripts/storage-bucket.mjs <create|delete> <token>');
  process.exit(1);
}

const body = JSON.stringify({
  id: 'documents',
  name: 'documents',
  public: false,
  file_size_limit: 52428800, // 50 MB
  allowed_mime_types: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/png',
    'image/jpeg',
  ],
});

const req = https.request(
  {
    hostname: 'api.supabase.com',
    path: `/v1/projects/nzamuxnrrqlqdtwdisrt/storage/buckets${action === 'delete' ? '/documents' : ''}`,
    method: action === 'create' ? 'POST' : 'DELETE',
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
      console.log(data.slice(0, 400) || '(empty = ok)');
    });
  },
);
req.on('error', (e) => console.error('ERR', e.message));
req.write(body);
req.end();
