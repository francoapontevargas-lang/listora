"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { ListingFormData } from "@/app/dashboard/listings/new/page";

const GOLD = "#C8A96E";
const BG = "#080808";
const WARM_WHITE = "#F0EDE6";
const MUTED = "#4A4540";
const SURFACE = "rgba(255,255,255,0.03)";
const BORDER = "rgba(255,255,255,0.07)";
const GOLD_BORDER = "rgba(200,169,110,0.15)";

type LangKey = "english" | "spanish" | "portuguese" | "french";

const LANG_LABELS: Record<LangKey, string> = {
  english: "English",
  spanish: "Spanish",
  portuguese: "Portuguese",
  french: "French",
};

interface GenerationResult {
  language: string; // "english" | "spanish" | "portuguese" | "french" | "both" | "all"
  caption?: string;
  english?: string;
  spanish?: string;
  portuguese?: string;
  french?: string;
}

export default function ResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [form, setForm] = useState<ListingFormData | null>(null);
  const [activeTab, setActiveTab] = useState<LangKey>("english");
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("listora_listing_result");
    const rawForm = sessionStorage.getItem("listora_listing_form");
    if (!raw) {
      router.replace("/dashboard/listings/new");
      return;
    }
    const parsed: GenerationResult = JSON.parse(raw);
    setResult(parsed);
    if (rawForm) setForm(JSON.parse(rawForm));

    // Set initial tab for multi-language results
    if (parsed.language === "both" || parsed.language === "all") {
      setActiveTab("english");
    }
  }, [router]);

  if (!result) return null;

  const isMultiLang = result.language === "both" || result.language === "all";

  // Which language tabs to show
  const tabs: LangKey[] = isMultiLang
    ? (["english", "spanish", "portuguese", "french"] as LangKey[]).filter(
        (l) => result[l] !== undefined
      )
    : [];

  const displayCaption: string = isMultiLang
    ? (result[activeTab] ?? "")
    : (result.caption ?? "");

  const handleCopy = async () => {
    await navigator.clipboard.writeText(displayCaption);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    setSaveError(null);

    try {
      const supabase = createClient();

      // Use getUser() — more reliable than getSession() for RLS auth context
      const { data: userData, error: userError } = await supabase.auth.getUser();
      console.log("[save listing] getUser:", { userData, userError });

      if (userError || !userData.user) {
        router.push("/login");
        return;
      }
      const userId = userData.user.id;

      // Insert listing
      const listingPayload = {
        user_id: userId,
        property_type: form.propertyType,
        address: form.address,
        city: form.city,
        neighborhood: form.neighborhood || null,
        currency: form.currency,
        price: form.price,
        bedrooms: form.bedrooms ? parseInt(form.bedrooms) : null,
        bathrooms: form.bathrooms ? parseFloat(form.bathrooms) : null,
        area: form.area ? parseFloat(form.area) : null,
        area_unit: form.areaUnit,
        units: form.units ? parseInt(form.units) : null,
        year_built: form.yearBuilt ? parseInt(form.yearBuilt) : null,
        parking_spaces: form.parkingSpaces ? parseInt(form.parkingSpaces) : null,
        amenities: [...form.amenities, ...form.customAmenities],
        special_highlights: form.specialHighlights || null,
        neighborhood_description: form.neighborhoodDescription || null,
        ideal_buyer: form.idealBuyer || null,
        language: form.language,
        tone: form.tone,
        cta: form.cta,
      };
      console.log("[save listing] inserting listing:", listingPayload);

      const { data: listing, error: listingError } = await supabase
        .from("listings")
        .insert(listingPayload)
        .select("id")
        .single();

      console.log("[save listing] listing result:", { listing, listingError });

      if (listingError) {
        setSaveError(`Listings insert failed: ${listingError.message} (code: ${listingError.code})`);
        return;
      }

      // Insert listing_content
      const contentRows = isMultiLang
        ? tabs.map((lang) => ({
            listing_id: listing.id,
            language: lang,
            caption: result[lang],
            content_type: "instagram_caption",
          }))
        : [
            {
              listing_id: listing.id,
              language: result.language,
              caption: result.caption,
              content_type: "instagram_caption",
            },
          ];

      console.log("[save listing] inserting content rows:", contentRows);

      const { error: contentError } = await supabase
        .from("listing_content")
        .insert(contentRows);

      console.log("[save listing] content result:", { contentError });

      if (contentError) {
        setSaveError(`Content insert failed: ${contentError.message} (code: ${contentError.code})`);
        return;
      }

      setSaved(true);
      sessionStorage.removeItem("listora_listing_result");
      sessionStorage.removeItem("listora_listing_form");
    } catch (err) {
      console.error("[save listing] unexpected error:", err);
      const msg = err instanceof Error ? err.message : String(err);
      setSaveError(`Unexpected error: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  const encodedCaption = encodeURIComponent(displayCaption);
  const whatsappUrl = `https://wa.me/?text=${encodedCaption}`;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: BG,
        color: WARM_WHITE,
        fontFamily: "var(--font-dm-sans)",
        display: "flex",
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: "220px",
          flexShrink: 0,
          borderRight: `1px solid ${BORDER}`,
          padding: "28px 0",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Link
          href="/dashboard"
          style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: "22px",
            fontWeight: 500,
            color: WARM_WHITE,
            textDecoration: "none",
            padding: "0 24px",
            marginBottom: "40px",
            display: "block",
          }}
        >
          Listora
        </Link>
        <Link
          href="/dashboard/listings/new"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 14px",
            margin: "0 12px",
            borderRadius: "10px",
            fontSize: "14px",
            color: MUTED,
            textDecoration: "none",
          }}
        >
          ← Edit listing
        </Link>
        <Link
          href="/dashboard"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 14px",
            margin: "0 12px",
            borderRadius: "10px",
            fontSize: "14px",
            color: MUTED,
            textDecoration: "none",
          }}
        >
          Dashboard
        </Link>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, padding: "48px 60px", maxWidth: "800px" }}>
        {/* Header */}
        <div style={{ marginBottom: "44px" }}>
          <p
            style={{
              fontSize: "12px",
              color: GOLD,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: "10px",
            }}
          >
            Content ready
          </p>
          <h1
            style={{
              fontFamily: "var(--font-cormorant)",
              fontSize: "42px",
              fontWeight: 400,
              letterSpacing: "-0.02em",
              color: WARM_WHITE,
              margin: 0,
            }}
          >
            Your caption is ready.
          </h1>
          {form && (
            <p style={{ fontSize: "14px", color: MUTED, marginTop: "8px" }}>
              {form.address}, {form.city} · {form.propertyType} · {form.tone} tone
            </p>
          )}
        </div>

        {/* Language tabs for multi-language results */}
        {isMultiLang && tabs.length > 1 && (
          <div
            style={{
              display: "flex",
              gap: "4px",
              background: "rgba(255,255,255,0.04)",
              border: `1px solid ${BORDER}`,
              borderRadius: "100px",
              padding: "4px",
              width: "fit-content",
              marginBottom: "24px",
            }}
          >
            {tabs.map((lang) => (
              <button
                key={lang}
                onClick={() => setActiveTab(lang)}
                style={{
                  padding: "8px 20px",
                  borderRadius: "100px",
                  fontSize: "13px",
                  fontWeight: activeTab === lang ? 600 : 400,
                  color: activeTab === lang ? BG : MUTED,
                  background: activeTab === lang ? GOLD : "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "var(--font-dm-sans)",
                  transition: "all 0.2s",
                }}
              >
                {LANG_LABELS[lang]}
              </button>
            ))}
          </div>
        )}

        {/* Caption box */}
        <div
          style={{
            background: SURFACE,
            border: `1px solid ${GOLD_BORDER}`,
            borderRadius: "16px",
            padding: "36px",
            marginBottom: "24px",
            position: "relative",
          }}
        >
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: "-40px",
              right: "-40px",
              width: "200px",
              height: "200px",
              borderRadius: "50%",
              background: GOLD,
              opacity: 0.04,
              filter: "blur(60px)",
              pointerEvents: "none",
            }}
          />

          <pre
            style={{
              fontFamily: "var(--font-dm-sans)",
              fontSize: "15px",
              lineHeight: 1.75,
              color: WARM_WHITE,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              margin: 0,
            }}
          >
            {displayCaption}
          </pre>
        </div>

        {/* Action row */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            marginBottom: "40px",
          }}
        >
          <ActionButton
            onClick={handleCopy}
            gold
            label={copied ? "Copied!" : "Copy caption"}
            icon={copied ? "✓" : "⊡"}
          />

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "11px 22px",
              borderRadius: "100px",
              border: `1px solid ${BORDER}`,
              fontSize: "14px",
              color: MUTED,
              textDecoration: "none",
              fontFamily: "var(--font-dm-sans)",
              background: "rgba(255,255,255,0.03)",
              transition: "border-color 0.2s, color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = WARM_WHITE;
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = MUTED;
              e.currentTarget.style.borderColor = BORDER;
            }}
          >
            <span>📱</span> WhatsApp
          </a>

          <ActionButton
            onClick={handleCopy}
            label="Copy for Instagram"
            icon="📸"
          />

          <ActionButton
            onClick={handleCopy}
            label="Copy for Facebook"
            icon="👍"
          />
        </div>

        {/* Save section */}
        <div
          style={{
            background: SURFACE,
            border: `1px solid ${BORDER}`,
            borderRadius: "16px",
            padding: "32px 36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <p
              style={{
                fontSize: "15px",
                color: WARM_WHITE,
                fontWeight: 500,
                margin: "0 0 4px",
              }}
            >
              Save this listing
            </p>
            <p style={{ fontSize: "13px", color: MUTED, margin: 0 }}>
              Store the listing and generated content in your account.
            </p>
            {saveError && (
              <p style={{ fontSize: "13px", color: "#E07070", marginTop: "8px" }}>
                {saveError}
              </p>
            )}
            {saved && (
              <p style={{ fontSize: "13px", color: "#6ABF6A", marginTop: "8px" }}>
                ✓ Saved to your listings
              </p>
            )}
          </div>

          <button
            onClick={handleSave}
            disabled={saving || saved}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 28px",
              borderRadius: "100px",
              background: saved
                ? "rgba(106,191,106,0.15)"
                : saving
                ? "rgba(200,169,110,0.4)"
                : GOLD,
              color: saved ? "#6ABF6A" : BG,
              fontSize: "14px",
              fontWeight: 600,
              border: saved ? "1px solid rgba(106,191,106,0.3)" : "none",
              cursor: saving || saved ? "not-allowed" : "pointer",
              fontFamily: "var(--font-dm-sans)",
              transition: "all 0.25s",
              flexShrink: 0,
            }}
          >
            {saving ? "Saving…" : saved ? "✓ Saved" : "Save listing"}
          </button>
        </div>

        {/* Generate another */}
        <div style={{ marginTop: "32px", textAlign: "center" }}>
          <Link
            href="/dashboard/listings/new"
            style={{
              fontSize: "14px",
              color: MUTED,
              textDecoration: "none",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = GOLD)}
            onMouseLeave={(e) => (e.currentTarget.style.color = MUTED)}
          >
            + Create another listing
          </Link>
        </div>
      </main>
    </div>
  );
}

function ActionButton({
  onClick,
  label,
  icon,
  gold,
}: {
  onClick: () => void;
  label: string;
  icon: string;
  gold?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: "11px 22px",
        borderRadius: "100px",
        border: gold ? "none" : `1px solid rgba(255,255,255,0.07)`,
        fontSize: "14px",
        fontWeight: gold ? 600 : 400,
        color: gold ? "#080808" : "#4A4540",
        background: gold ? "#C8A96E" : "rgba(255,255,255,0.03)",
        cursor: "pointer",
        fontFamily: "var(--font-dm-sans)",
        transition: "all 0.18s",
      }}
      onMouseEnter={(e) => {
        if (!gold) {
          e.currentTarget.style.color = "#F0EDE6";
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
        }
      }}
      onMouseLeave={(e) => {
        if (!gold) {
          e.currentTarget.style.color = "#4A4540";
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
        }
      }}
    >
      <span>{icon}</span>
      {label}
    </button>
  );
}
