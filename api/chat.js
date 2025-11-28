// api/chat.js
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  // CORS (eprise에서 호출할 때 에러 안 나게)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "GET만 지원합니다." });
  }

  const { message = "", lang = "ko" } = req.query;

  // 버튼마다 다른 언어 지원
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
    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
    });

    // Responses API 결과에서 텍스트 꺼내기 (양쪽 케이스 방어)
    const first = response.output[0]?.content[0];
    let replyText = "";
    if (typeof first?.text === "string") {
      replyText = first.text;
    } else if (first?.text?.value) {
      replyText = first.text.value;
    } else {
      replyText = "죄송합니다. 답변을 생성하지 못했습니다.";
    }

    return res.status(200).json({ reply: replyText });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "OpenAI 호출 오류" });
  }
}
