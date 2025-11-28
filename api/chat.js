// api/chat.js
// ✅ OpenAI 없이, 서버가 정상인지 테스트하는 버전

export default async function handler(req, res) {
  // CORS 설정
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "GET만 지원합니다." });
  }

  const message = (req.query.message || "").toString();
  const lang = (req.query.lang || "ko").toString();

  return res.status(200).json({
    ok: true,
    echoMessage: message,
    echoLang: lang,
  });
}
