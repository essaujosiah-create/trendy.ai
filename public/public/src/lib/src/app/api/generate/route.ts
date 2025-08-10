import { NextRequest, NextResponse } from "next/server";
import { buildPrompt, Inputs } from "../../../lib/prompt";

type Provider = "openrouter" | "groq";

function getProvider(): Provider {
  const p = (process.env.LLM_PROVIDER || "openrouter").toLowerCase();
  return p === "groq" ? "groq" : "openrouter";
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<Inputs>;
    if (!body.businessName || !body.description || !body.tone || !body.languages || !body.count) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const inputs: Inputs = {
      businessName: body.businessName!,
      description: body.description!,
      platform: body.platform || "Instagram",
      tone: body.tone as Inputs["tone"],
      languages: body.languages as Inputs["languages"],
      offers: body.offers || "",
      includeTrending: Boolean(body.includeTrending),
      count: Math.max(5, Math.min(60, Number(body.count) || 30)),
      niche: body.niche || ""
    };

    const prompt = buildPrompt(inputs);
    const provider = getProvider();

    const system = "You are a sharp, culturally aware social media marketer. You produce concise, on-brand, high-converting captions for Tanzanian audiences.";
    const modelOpenRouter = process.env.OPENROUTER_MODEL || "meta-llama/llama-3.1-8b-instruct:free";
    const modelGroq = process.env.GROQ_MODEL || "llama3-8b-8192";

    let text = "";

    if (provider === "openrouter") {
      const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": process.env.SITE_URL || "http://localhost:3000",
          "X-Title": "trendy.ai"
        },
        body: JSON.stringify({
          model: modelOpenRouter,
          messages: [
            { role: "system", content: system },
            { role: "user", content: prompt }
          ],
          temperature: 0.8
        })
      });

      if (!resp.ok) {
        const err = await safeRead(resp);
        return NextResponse.json({ error: `OpenRouter error`, detail: err }, { status: 500 });
      }
      const data = await resp.json();
      text = data.choices?.[0]?.message?.content || "";
    } else {
      const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: modelGroq,
          messages: [
            { role: "system", content: system },
            { role: "user", content: prompt }
          ],
          temperature: 0.8
        })
      });

      if (!resp.ok) {
        const err = await safeRead(resp);
        return NextResponse.json({ error: `Groq error`, detail: err }, { status: 500 });
      }
      const data = await resp.json();
      text = data.choices?.[0]?.message?.content || "";
    }

    const items = parseCaptions(text);
    if (!items.length) {
      return NextResponse.json({ error: "Empty response from model.", raw: text }, { status: 502 });
    }

    return NextResponse.json({ items, raw: text });
  } catch (e: any) {
    return NextResponse.json({ error: "Server error", detail: String(e?.message || e) }, { status: 500 });
  }
}

async function safeRead(resp: Response) {
  try { return await resp.text(); } catch { return "unknown"; }
}

type Item = { number: number; caption: string; hashtags: string; };

function parseCaptions(output: string): Item[] {
  const lines = output.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const blocks: Item[] = [];
  let current: Partial<Item> = {};
  let number = 0;

  for (const line of lines) {
    const numMatch = line.match(/^(\d+)[\).]\s*/);
    if (numMatch) {
      if (current.caption || current.hashtags) {
        if (!current.number) current.number = number + 1;
        blocks.push(current as Item);
      }
      number = parseInt(numMatch[1], 10);
      current = { number };
      continue;
    }
    if (/^caption:/i.test(line)) {
      current.caption = line.replace(/^caption:\s*/i, "").trim();
      continue;
    }
    if (/^hashtags:/i.test(line)) {
      current.hashtags = line.replace(/^hashtags:\s*/i, "").trim();
      continue;
    }
    if (!current.caption) current.caption = line;
    else if (!current.hashtags && line.includes("#")) current.hashtags = line;
  }

  if (current.caption || current.hashtags) {
    if (!current.number) current.number = number + 1;
    blocks.push(current as Item);
  }

  return blocks
    .filter(x => x.caption)
    .map(x => ({
      number: x.number!,
      caption: x.caption!.replace(/^["“]|["”]$/g, "").trim(),
      hashtags: (x.hashtags || "").trim()
    }));
}
