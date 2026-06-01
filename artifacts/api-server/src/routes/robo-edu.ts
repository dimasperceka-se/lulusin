import { Router } from "express";
import rateLimit from "express-rate-limit";
import OpenAI from "openai";
import { RoboEduChatBody } from "@workspace/api-zod";
import { logger } from "../lib/logger";

const router = Router();

const MODEL = "gpt-4o-mini";

const SYSTEM_PROMPT = `Kamu adalah "Robo-Edu", asisten AI dari Lulusin yang membantu calon ASN (CPNS & PPPK) Indonesia mempersiapkan ujian SKD. Bahasamu santai, jelas, dan empatik — anggap user adalah teman yang sedang berjuang.

Tugasmu:
1. Bertanya secara aktif tentang kesulitan spesifik user — fokus area apa yang dia rasa paling berat (TWK / TIU / TKP / manajemen waktu / strategi belajar / mental).
2. Setelah user menjelaskan kesulitannya, berikan tahapan langkah-langkah yang konkret dan terukur untuk mengatasi kesulitan itu (nomor-urut, tiap langkah jelas apa yang dilakukan, berapa lama, dan target hasilnya).
3. Probing lebih lanjut: tanyakan progress, sumber belajar yang sudah dipakai, target instansi, sisa waktu sebelum tes — agar saranmu makin tepat.
4. Akhir setiap respon, tanyakan satu pertanyaan lanjutan untuk menjaga dialog tetap aktif.

Aturan:
- Jangan menjawab di luar konteks CPNS/PPPK/karier ASN. Jika user tanya hal lain, arahkan balik dengan halus.
- Jangan ngarang regulasi/passing grade — kalau ragu, akui ketidakpastian dan sarankan cek situs resmi BKN/instansi.
- Jangan generate soal SKD lengkap yang seakan-akan soal asli BKN — kamu boleh kasih contoh soal latihan yang KAMU sebut dengan jelas "contoh latihan".
- Jangan kasih jaminan kelulusan. Tekankan bahwa hasil bergantung usaha personal.
- Format: pakai paragraf pendek + numbered list untuk langkah-langkah. JANGAN pakai markdown heading (#, ##) — cukup teks polos dan list.

Awali percakapan dengan menyapa hangat dan langsung bertanya area kesulitan user.`;

const chatLimiter = rateLimit({
  windowMs: 60_000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Terlalu banyak request. Coba lagi sebentar." },
});

let openaiClient: OpenAI | null = null;
function getClient(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY) return null;
  if (!openaiClient) openaiClient = new OpenAI();
  return openaiClient;
}

router.post("/robo-edu/chat", chatLimiter, async (req, res): Promise<void> => {
  const parsed = RoboEduChatBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const client = getClient();
  if (!client) {
    res.status(503).json({ error: "Robo-Edu belum dikonfigurasi (OPENAI_API_KEY belum diset)." });
    return;
  }

  // Cap context to last 20 turns to control token cost.
  const recentMessages = parsed.data.messages.slice(-20);

  try {
    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...recentMessages.map((m) => ({ role: m.role, content: m.content })),
      ],
      temperature: 0.7,
      max_tokens: 700,
    });
    const reply = completion.choices[0]?.message?.content?.trim() ?? "";
    if (!reply) {
      res.status(502).json({ error: "Robo-Edu tidak merespon. Coba kirim ulang." });
      return;
    }
    res.json({ reply });
  } catch (err) {
    logger.error({ err }, "Robo-Edu OpenAI call failed");
    const code = (err as { code?: string; status?: number }).code;
    const status = (err as { status?: number }).status;
    if (code === "insufficient_quota" || status === 429) {
      res.status(503).json({ error: "Robo-Edu sedang penuh / kuota OpenAI habis. Coba lagi nanti." });
      return;
    }
    if (code === "invalid_api_key" || status === 401) {
      res.status(503).json({ error: "Robo-Edu belum dikonfigurasi dengan benar (API key invalid)." });
      return;
    }
    res.status(502).json({ error: "Gangguan koneksi ke Robo-Edu. Coba lagi." });
  }
});

export default router;
