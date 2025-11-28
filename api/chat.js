// api/chat.js
// fetch로 OpenAI Chat Completions 호출하는 버전 (env는 함수 안에서 읽기)

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

  // ✅ 함수 안에서 env 읽기
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res
      .status(500)
      .json({ error: "OPENAI_API_KEY 환경변수가 설정되어 있지 않습니다." });
  }

  const message = (req.query.message || "").toString();
  const lang = (req.query.lang || "ko").toString();

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
    const apiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
        ],
      }),
    });

    if (!apiResponse.ok) {
      const errText = await apiResponse.text();
      console.error("OpenAI API error:", errText);
      return res.status(500).json({
        error: "OpenAI API 응답이 실패했습니다.",
        detail: errText,
      });
    }

    const data = await apiResponse.json();
    const replyText =
      data.choices?.[0]?.message?.content ??
      "죄송합니다, 답변을 생성하지 못했습니다.";

    return res.status(200).json({ reply: replyText });
  } catch (error) {
    console.error("OpenAI 호출 오류:", error);
    return res.status(500).json({
      error: "OpenAI 호출 중 오류가 발생했습니다.",
      detail: error.message ?? String(error),
    });
  }
}
