// Supabase Edge Function: ai-generate
// POST { prompt: string } -> { response: string }
// Gemini 3.6 Flash via Google Generative Language API.
// GEMINI_API_KEY is set as a function secret.

const SYSTEM_PROMPT = `Anda adalah "8bit AI", asisten guru Indonesia dalam aplikasi 8bitOS — sistem kerja digital guru.
Tugas: membantu guru menyusun perangkat pembelajaran.
Aturan:
- Jawab dalam Bahasa Indonesia, kecuali permintaan meminta bahasa lain.
- Gunakan format markdown ringkas, poin-poin, mudah dipindai.
- Untuk modul ajar: sertakan tujuan, kegiatan (pendahuluan-inti-penutup), asesmen, media.
- Untuk soal: sertakan kunci jawaban dan pembahasan singkat.
- Jangan gunakan data pribadi siswa; konteks hanya nama kelas/mata pelajaran.
- Maksimal ~600 kata kecuali diminta lebih.`;

const GEMINI_MODEL = 'gemini-3.6-flash';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'GEMINI_API_KEY not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let prompt = '';
  try {
    const body = await req.json();
    prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
  } catch {
    return new Response(JSON.stringify({ error: 'invalid JSON body' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (!prompt) {
    return new Response(JSON.stringify({ error: 'prompt required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const geminiBody = JSON.stringify({
    system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
    },
  });

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: geminiBody,
      },
    );

    if (!res.ok) {
      const errText = await res.text();
      return new Response(
        JSON.stringify({ error: `gemini ${res.status}: ${errText.slice(0, 200)}` }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const data = await res.json();
    const text: string =
      data?.candidates?.[0]?.content?.parts
        ?.map((p: { text?: string }) => p.text ?? '')
        .join('') ?? '';

    if (!text) {
      return new Response(JSON.stringify({ error: 'empty response from gemini' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ response: text }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: `network: ${String(e)}` }), {
      status: 502,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
