import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import type { ListingFormData } from "@/app/dashboard/listings/new/page";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

function buildPrompt(form: ListingFormData, language: string): string {
  const langLabel =
    language === "spanish" ? "Spanish" :
    language === "portuguese" ? "Portuguese" :
    language === "french" ? "French" :
    "English";

  const toneGuide: Record<string, string> = {
    Professional: "authoritative and polished — written for discerning buyers who appreciate data and expertise",
    Friendly: "warm and approachable — conversational tone that builds trust and connection",
    Luxury: "aspirational and evocative — paint a picture of the lifestyle this property unlocks",
    Casual: "relaxed and natural — feels like a friend sharing an exciting find",
    Urgent: "time-sensitive and energetic — creates FOMO and motivates immediate action",
  };

  const allAmenities = [...form.amenities, ...form.customAmenities];
  const amenityList = allAmenities.length > 0 ? allAmenities.join(", ") : "not specified";

  const areaLabel = form.areaUnit === "sqm" ? "sq m" : "sq ft";

  const details = [
    `Property type: ${form.propertyType}`,
    `Location: ${form.address}${form.neighborhood ? `, ${form.neighborhood}` : ""}, ${form.city}`,
    `Price: ${form.currency} ${form.price}`,
    form.bedrooms ? `Bedrooms: ${form.bedrooms}` : null,
    form.bathrooms ? `Bathrooms: ${form.bathrooms}` : null,
    form.area ? `Area: ${form.area} ${areaLabel}` : null,
    form.units && form.propertyType.startsWith("Multifamily") ? `Units: ${form.units}` : null,
    form.yearBuilt ? `Year built: ${form.yearBuilt}` : null,
    form.parkingSpaces ? `Parking spaces: ${form.parkingSpaces}` : null,
    `Amenities: ${amenityList}`,
    form.specialHighlights ? `Special highlights: ${form.specialHighlights}` : null,
    form.neighborhoodDescription ? `About the neighborhood: ${form.neighborhoodDescription}` : null,
    form.idealBuyer ? `Ideal buyer/renter: ${form.idealBuyer}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  return `You are a top real estate agent writing an Instagram caption for one of your own listings. You write like a real person — confident, knowledgeable, direct. Not poetic. Not over the top. Not like an AI trying to sound inspiring.

Write the caption in ${langLabel}.

PROPERTY DETAILS:
${details}

TONE: ${toneGuide[form.tone] ?? form.tone}
CALL TO ACTION: "${form.cta}"

ANTI-HALLUCINATION RULES (non-negotiable):
- Only state facts that appear directly in the property details above — do not invent or infer anything
- Never describe specific rooms or spaces unless the agent explicitly mentioned them in the highlights
- Never say "practically every room", "throughout the home", "from every angle", or any claim about views from specific rooms unless stated
- Never invent lifestyle scenarios (travel, weekend markets, morning routines) unless the agent wrote them in the highlights
- Never make assumptions about the buyer's life, relationship status, or lifestyle
- Never write from a first-person agent opinion ("I would buy this myself", "this one is special to me")
- If a feature was not mentioned in the form data, do not mention it

WRITING RULES:
- Never start with dramatic weather, sunrise, or sensory scene-setting
- Never use: "nestled", "stunning", "breathtaking", "dream home", "luxury lifestyle", "the life you've been chasing", "changes the way you move through the world", or similar AI-sounding phrases
- No casual or salesy phrases like "you know what the numbers look like" or "trust me on this one"
- Start with a direct statement about the property or a simple, specific question
- Write like a seasoned professional agent — confident and factual, not personal or salesy
- Keep the intro to 3–4 sentences max, every sentence grounded in the form data provided
- End with a simple, direct CTA using "${form.cta}" — no dramatic closing line
- Hashtags: 15 max, mix of local and property-specific tags only — no generic ones like #DreamHome or #DreamHomeGoals

BULLET POINT RULES (strict):
- First bullet is ALWAYS a stats line combining all key numbers in one line, like this:
  🏡 4 BD / 3 BA | 2,400 sq ft | Built 2018 | $1,250,000
  Only include stats that were provided. Use the correct currency and area unit.
- Then 4–6 additional bullets that are SHORT (8 words max each), factual, and specific
- Good bullet examples: "🌊 Corner unit with ocean and city views" / "🏊 Private pool and terrace" / "📍 Steps from Brickell City Centre"
- Bad bullet examples: "✨ Your personal resort awaits" / "🛋️ Say yes to the wardrobe you deserve"
- Only bullet features that were explicitly provided in the form — no invented amenities
- Bullets read like a checklist — not a poem

FORMAT (output exactly this, no section labels):
[opening line + body paragraph]

[stats bullet + 4–6 fact bullets]

[CTA line]

[hashtags on one line]`;
}

// Languages that require parallel generation
const PARALLEL_LANGUAGES: Record<string, string[]> = {
  "Both EN+ES": ["english", "spanish"],
  "All Languages": ["english", "spanish", "portuguese", "french"],
};

export async function POST(request: NextRequest) {
  try {
    const form: ListingFormData = await request.json();

    if (!form.address || !form.city || !form.price) {
      return NextResponse.json(
        { error: "Address, city, and price are required." },
        { status: 400 }
      );
    }

    const parallelLangs = PARALLEL_LANGUAGES[form.language];

    if (parallelLangs) {
      // Generate multiple languages in parallel
      const messages = await Promise.all(
        parallelLangs.map((lang) =>
          client.messages.create({
            model: "claude-opus-4-6",
            max_tokens: 1200,
            messages: [{ role: "user", content: buildPrompt(form, lang) }],
          })
        )
      );

      const captions = messages.map((msg) =>
        msg.content
          .filter((b) => b.type === "text")
          .map((b) => (b as Anthropic.TextBlock).text)
          .join("")
      );

      const result: Record<string, string> & { language: string } = {
        language: form.language === "All Languages" ? "all" : "both",
      };
      parallelLangs.forEach((lang, i) => {
        result[lang] = captions[i];
      });

      return NextResponse.json(result);
    } else {
      // Single language
      const langKey =
        form.language === "Spanish" ? "spanish" :
        form.language === "Portuguese" ? "portuguese" :
        form.language === "French" ? "french" :
        "english";

      const message = await client.messages.create({
        model: "claude-opus-4-6",
        max_tokens: 1200,
        messages: [{ role: "user", content: buildPrompt(form, langKey) }],
      });

      const caption = message.content
        .filter((b) => b.type === "text")
        .map((b) => (b as Anthropic.TextBlock).text)
        .join("");

      return NextResponse.json({ language: langKey, caption });
    }
  } catch (err) {
    console.error("[generate-caption]", err);

    if (err instanceof Anthropic.AuthenticationError) {
      return NextResponse.json(
        { error: "API key invalid. Check ANTHROPIC_API_KEY." },
        { status: 401 }
      );
    }
    if (err instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { error: "Rate limited. Please try again in a moment." },
        { status: 429 }
      );
    }
    if (err instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: `AI service error: ${err.message}` },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { error: "Unexpected error. Please try again." },
      { status: 500 }
    );
  }
}
