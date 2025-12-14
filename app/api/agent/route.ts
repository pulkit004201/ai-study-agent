import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const { topic } = await req.json();

  const response = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      {
  role: "system",
  content: `
You are an AI Study Agent.

Return the response STRICTLY in this format:

## Concept Overview
<text>

## Simple Explanation
<text>

## Real-world Example
<text>

## Diagram Explanation
<text>

## Quiz
1. Question one?
2. Question two?
3. Question three?
  `,
}
,
      {
        role: "user",
        content: `Explain ${topic}`,
      },
    ],
  });

  return Response.json({
    result: response.choices[0].message.content,
  });
}
