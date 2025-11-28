// api/chat.js
import OpenAI from "openai";

// ✅ 환경변수에서 API 키 읽기
const apiKey = process.env.OPENAI_API_KEY;
const client = new OpenAI({ apiKey });

export default async function handler(req, res) {
  // CORS 설정 (eprise에서 호출할 때 필요)
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

  // ✅ API 키 체크
  if (!apiKey) {
    return res.status(500).json({
      error: "OPENAI_API_KEY 환경변수가 설정되어 있지 않습니다.",
    });
  }

  let systemPrompt =
    "당신은 미용실 고객을 도와주는 친절한 한국어 헤어 AI 디자이너입니다. 짧고 이해하기 쉽게 답변하세요.";
  if (lang === "en") {
    systemPrompt =
      "You are a friendly hair AI designer for a hair salon. Answer in natural, simple English.";
  } else if (lang === "zh") {
    systemPrompt =
      "你是一位为美发店顾客服务的友善发型 AI 设计师。请用自然且简洁的中文回答。";
  }

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
    });

    const replyText =
      completion.choices?.[0]?.message?.content ??
      "죄송합니다, 답변을 생성하지 못했습니다.";

    // ✅ 최종 응답 (eprise에서 reply만 쓰면 됨)
    return res.status(200).json({
      reply: replyText,
      // 디버깅용 정보 (원하면 나중에 지워도 됨)
      debug: { ok: true, message, lang },
    });
  } catch (error) {
    console.error("OpenAI 호출 오류:", error);
    return res.status(500).json({
      error: "OpenAI 호출 중 오류가 발생했습니다.",
      detail: error.message ?? String(error),
    });
  }
}
