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
    Professional: "Clean, factual, zero fluff. Let the numbers and facts do the selling. No adjectives that can't be verified.",
    Friendly: "Warm and conversational, like talking to someone you trust. Still grounded in facts — just a more human delivery.",
    Luxury: "Elevated and confident. The property speaks for itself — your job is to present it with authority, not hype.",
    Casual: "Relaxed and direct. Like texting a friend about a great find. Short sentences, real talk.",
    Urgent: "Direct and time-sensitive. State the opportunity clearly. No manipulation — just the facts with a sense of timing.",
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

  return `You are a real estate agent writing Instagram captions for your own listings. You have 15 years of experience, you know what sells, and you write like a real professional — not like a marketing agency, not like an AI, not like a lifestyle blogger. You are direct, confident, and specific. Every word you write is grounded in the actual facts of the property.

Write the caption in ${langLabel}.

PROPERTY DETAILS (these are the only facts you may use):
${details}

TONE: ${toneGuide[form.tone] ?? form.tone}
CALL TO ACTION: "${form.cta}"

YOUR RULES:

1. INTRO — 2 to 3 sentences only.
   - Lead with the single strongest fact about this property.
   - Add 2 supporting facts from the property details above.
   - If an ideal buyer was specified, close with one clean factual sentence about who this works for.
   - Never start with weather, sunrises, or emotional scenarios.
   - Banned words: stunning, breathtaking, nestled, dream home, luxury lifestyle, elevate, curated, exquisite, impeccable, and any word that sounds like an AI wrote it.

2. STATS LINE — Always the first bullet. Format exactly:
   🏡 4 BD / 3 BA | 2,400 sq ft | ${form.currency} [price]
   Include only numbers that were provided. Never invent numbers.

3. REMAINING BULLETS — 4 to 6 bullets.
   - One fact per bullet, maximum 8 words.
   - Based only on amenities the agent selected or highlights they wrote.
   - Use a relevant emoji that matches the actual feature.
   - Never mention a feature that was not in the property details.
   - Never say "practically every room", "throughout", "from every angle", or anything you cannot verify.

4. CTA — One line only, using exactly: "${form.cta}". No added drama.

5. HASHTAGS — 12 to 15 hashtags. Mix of neighborhood, city, property type, and feature-specific. No generic hashtags: #DreamHome #Goals #Blessed #LuxuryLifestyle are all banned. Make them specific to the actual location and property type.

6. ACCURACY — You can only write about what is in the property details. If a feature is not mentioned, it does not exist. Do not imagine, infer, or embellish. A buyer will make decisions based on this caption. Be accurate.

FORMAT (output exactly this, no labels or section headers):
[2–3 sentence intro]

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
