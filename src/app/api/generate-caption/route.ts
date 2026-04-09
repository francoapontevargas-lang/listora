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
    Professional: "Clean and factual. Short sentences. No adjectives unless they come directly from the form. Let the numbers speak.",
    Friendly: "Warm but grounded. Write like you're telling a friend about a great property. Conversational, never salesy.",
    Luxury: "Confident and elevated. The facts are strong enough — present them with authority. No hype, no fake drama.",
    Casual: "Fast and direct. Short sentences. Real talk. Like a text, not a press release.",
    Urgent: "State the opportunity plainly. No manipulation. Just the facts, with a clear sense of timing.",
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

  return `You are a real estate agent with years of experience selling properties in your market. You write Instagram captions for your own listings. You write fast, confident, and factual — like you're texting a colleague about a great property. You don't try to inspire people. You don't write poetry. You describe what's there.

Here is a real example of the style you write in:
"The largest townhouse at Calusa Point. 2,292 sf. Corner unit, 3 beds, 3 baths. One bed and bath downstairs. Patio, 2 parking spaces. Hurricane shutters throughout. Gated community with pool, clubhouse, tennis court, playground and 24/7 security. Excellent opportunity."

That's the voice. No drama. No lifestyle fantasy. Just the facts, written like a real person who knows their product.

Write the caption in ${langLabel}.

PROPERTY DETAILS (the only facts you may use):
${details}

TONE: ${toneGuide[form.tone] ?? form.tone}
CALL TO ACTION: "${form.cta}"

CAPTION STRUCTURE:

LINE 1 — One punchy opening line. Lead with the strongest fact.
Good examples: "Just listed in Brickell." / "4-bed corner unit, fully renovated." / "New to market in [neighborhood]."
Never start with weather, emotions, sunrise, or dramatic imagery.

LINES 2–3 — 2 to 3 sentences of the most important facts from the form, written naturally. Short sentences. Connect them simply. Sound like you're talking, not presenting. If an ideal buyer was specified, include one plain factual sentence about who this is right for.

STATS BULLET — always first:
🏡 [beds] BD / [baths] BA | [area] ${form.areaUnit} | ${form.currency} [price]
Only include numbers that were provided. Never invent or approximate.

FEATURE BULLETS — 4 to 6 max:
One fact per line. Max 8 words. Only from the amenities and highlights in the form above.
Use an emoji that matches the actual feature — not a generic sparkle or star.
Never bullet a feature that wasn't in the form.

CTA — One line. Exactly: "${form.cta}". Nothing added before or after.

HASHTAGS — 12 to 15. Specific to the actual location, property type, and features listed.
Banned: #DreamHome #Goals #Blessed #LuxuryLifestyle #HomeGoals or any hashtag that could apply to any property anywhere.

CRITICAL RULES:
— Only write facts from the form. Never invent, assume, or infer.
— Never use: stunning, breathtaking, nestled, dream home, luxury lifestyle, elevate, curated, chasing, imagine yourself, the life you deserve, exquisite, impeccable
— Never say "practically every room", "throughout the home", "from every angle"
— Short sentences. Punchy rhythm. Real voice.
— If language is Spanish, write like a native Latin American agent — not a translation from English. Natural phrasing, local market feel.
— If language is Portuguese or French, same rule: native voice, not a translation.

FORMAT — output exactly this, no section labels, no headers:
[opening line]
[2–3 supporting sentences]

[stats bullet]
[4–6 feature bullets]

[CTA line]

[hashtags]`;
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
