export type Inputs = {
  businessName: string;
  description: string;
  platform: string;
  tone: "Fun & casual" | "Professional & formal" | "Luxury & elegant" | "Energetic & youthful";
  languages: ("Kiswahili" | "English")[];
  offers: string;
  includeTrending: boolean;
  count: number;
  niche?: string;
};

export function buildPrompt(i: Inputs) {
  const langs = i.languages.join(" & ");
  const trending = i.includeTrending ? "Include 1–2 trending, relevant hashtags per item." : "Use only evergreen, brand-safe hashtags.";
  const location = "Dar es Salaam, Tanzania";
  const bilingualRule = i.languages.length === 2
    ? "Alternate languages per item (one in Kiswahili, next in English)."
    : `Write all captions in ${langs}.`;

  return `
You are a social media marketing expert for small businesses in ${location}.

TASK:
Create ${i.count} unique, catchy, sales-driven social media captions for the following business.

BUSINESS:
- Name: ${i.businessName}
- Description: ${i.description}
- Platform: ${i.platform}
- Niche: ${i.niche ?? "General SME"}
- Tone: ${i.tone}
- Location: ${location}
- Special offers/keywords to include: ${i.offers || "None"}

LANGUAGE & STYLE:
- ${bilingualRule}
- Natural, authentic phrasing for local audiences.
- Keep each caption 1–2 sentences.
- Vary style: some funny, some urgent (limited time), some informative, some aspirational.

HASHTAGS:
- Add 3–5 relevant hashtags per caption.
- Mix local and global tags (e.g., #DarEsSalaam, #Tanzania when relevant).
- ${trending}

STRICT OUTPUT FORMAT:
Return a numbered list (1..${i.count}). For each item, include two lines:
Caption: <text>
Hashtags: <space-separated-hashtags>

Avoid quotes around texts. Do not add extra commentary.
`;
}
