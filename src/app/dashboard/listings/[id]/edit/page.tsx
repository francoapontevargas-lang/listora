"use client";

import { useState, useEffect, useRef, KeyboardEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  PROPERTY_TYPE_LIST,
  AMENITIES_BY_TYPE,
} from "@/app/dashboard/listings/new/page";
import type { ListingFormData } from "@/app/dashboard/listings/new/page";

const GOLD = "#C8A96E";
const BG = "#080808";
const WARM_WHITE = "#F0EDE6";
const MUTED = "#4A4540";
const SURFACE = "rgba(255,255,255,0.03)";
const BORDER = "rgba(255,255,255,0.07)";
const GOLD_BORDER = "rgba(200,169,110,0.15)";

const CURRENCIES = ["USD", "EUR", "MXN", "COP", "DOP"];
const LANGUAGES = ["English", "Spanish", "Portuguese", "French", "Both EN+ES", "All Languages"];
const TONES = ["Professional", "Friendly", "Luxury", "Casual", "Urgent"];
const CTAS = ["DM for info", "WhatsApp me", "Book a showing", "Link in bio", "Call me", "Email me"];

const isMultifamily = (t: string) => t.startsWith("Multifamily");

export default function EditListingPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState<ListingFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customInput, setCustomInput] = useState("");
  const customInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.replace("/login"); return; }

      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (error || !data) { router.replace("/dashboard/listings"); return; }

      // Split amenities into known (standard) vs custom
      const allKnownAmenities = Object.values(AMENITIES_BY_TYPE).flat();
      const dbAmenities: string[] = data.amenities ?? [];
      const knownAmenities = dbAmenities.filter((a) => allKnownAmenities.includes(a));
      const customAmenities = dbAmenities.filter((a) => !allKnownAmenities.includes(a));

      setForm({
        propertyType: data.property_type ?? PROPERTY_TYPE_LIST[0],
        address: data.address ?? "",
        city: data.city ?? "",
        neighborhood: data.neighborhood ?? "",
        currency: data.currency ?? "USD",
        price: data.price != null ? String(data.price) : "",
        bedrooms: data.bedrooms != null ? String(data.bedrooms) : "",
        bathrooms: data.bathrooms != null ? String(data.bathrooms) : "",
        areaUnit: (data.area_unit as "sqft" | "sqm") ?? "sqft",
        area: data.area != null ? String(data.area) : "",
        units: data.units != null ? String(data.units) : "",
        yearBuilt: data.year_built != null ? String(data.year_built) : "",
        parkingSpaces: data.parking_spaces != null ? String(data.parking_spaces) : "",
        amenities: knownAmenities,
        customAmenities,
        specialHighlights: data.special_highlights ?? "",
        neighborhoodDescription: data.neighborhood_description ?? "",
        idealBuyer: data.ideal_buyer ?? "",
        language: data.language ?? "English",
        tone: data.tone ?? "Luxury",
        cta: data.cta ?? "DM for info",
      });
      setLoading(false);
    });
  }, [id, router]);

  if (loading || !form) {
    return (
      <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: "32px", height: "32px", border: `2px solid ${GOLD}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const set = <K extends keyof ListingFormData>(key: K, value: ListingFormData[K]) =>
    setForm((f) => f ? { ...f, [key]: value } : f);

  const handleTypeChange = (newType: string) => {
    const newValidAmenities = AMENITIES_BY_TYPE[newType] ?? [];
    setForm((f) => f ? { ...f, propertyType: newType, amenities: f.amenities.filter((a) => newValidAmenities.includes(a)) } : f);
  };

  const toggleAmenity = (a: string) =>
    setForm((f) => f ? { ...f, amenities: f.amenities.includes(a) ? f.amenities.filter((x) => x !== a) : [...f.amenities, a] } : f);

  const addCustomAmenity = () => {
    const val = customInput.trim();
    if (!val || form.customAmenities.includes(val)) return;
    setForm((f) => f ? { ...f, customAmenities: [...f.customAmenities, val] } : f);
    setCustomInput("");
  };

  const removeCustomAmenity = (a: string) =>
    setForm((f) => f ? { ...f, customAmenities: f.customAmenities.filter((x) => x !== a) } : f);

  const handleCustomKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { e.preventDefault(); addCustomAmenity(); }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.address || !form.city || !form.price) {
      setError("Please fill in address, city, and price.");
      return;
    }
    setSaving(true);
    const supabase = createClient();
    const { error: dbError } = await supabase
      .from("listings")
      .update({
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
      })
      .eq("id", id);

    setSaving(false);
    if (dbError) { setError(dbError.message); return; }
    router.push(`/dashboard/listings/${id}/content`);
  };

  const currentAmenities = AMENITIES_BY_TYPE[form.propertyType] ?? [];

  return (
    <div className="dash-layout" style={{ minHeight: "100vh", background: BG, color: WARM_WHITE, fontFamily: "var(--font-dm-sans)", display: "flex" }}>
      {/* Mobile top bar */}
      <div className="dash-mobile-topbar" style={{ display: "none" }}>
        <Link href="/dashboard" style={{ fontFamily: "var(--font-cormorant)", fontSize: "22px", fontWeight: 500, color: WARM_WHITE, textDecoration: "none" }}>Listora</Link>
        <Link href={`/dashboard/listings/${id}/content`} style={{ fontSize: "13px", color: MUTED, textDecoration: "none" }}>← Back</Link>
      </div>

      {/* Sidebar */}
      <aside className="dash-sidebar" style={{ width: "220px", flexShrink: 0, borderRight: `1px solid ${BORDER}`, padding: "28px 0", display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh" }}>
        <Link href="/dashboard" style={{ fontFamily: "var(--font-cormorant)", fontSize: "22px", fontWeight: 500, color: WARM_WHITE, textDecoration: "none", padding: "0 24px", marginBottom: "40px", display: "block" }}>
          Listora
        </Link>
        <Link href={`/dashboard/listings/${id}/content`} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", margin: "0 12px", borderRadius: "10px", fontSize: "14px", color: MUTED, textDecoration: "none" }}>
          ← Back to listing
        </Link>
        <Link href="/dashboard/listings" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", margin: "0 12px", borderRadius: "10px", fontSize: "14px", color: MUTED, textDecoration: "none" }}>
          My Listings
        </Link>
      </aside>

      {/* Form */}
      <main className="form-main" style={{ flex: 1, padding: "48px 60px", maxWidth: "820px", overflowY: "auto" }}>
        <p style={{ fontSize: "12px", color: MUTED, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>Edit listing</p>
        <h1 style={{ fontFamily: "var(--font-cormorant)", fontSize: "42px", fontWeight: 400, letterSpacing: "-0.02em", color: WARM_WHITE, marginBottom: "52px" }}>
          Update the details.
        </h1>

        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "36px" }}>

          {/* ── 01 Property Basics ── */}
          <Card num="01" title="Property Basics">
            <Grid cols={1}>
              <SelectField label="Property type" value={form.propertyType} onChange={handleTypeChange} options={PROPERTY_TYPE_LIST as unknown as string[]} />
            </Grid>
            <Grid cols={1} style={{ marginTop: "20px" }}>
              <InputField label="Address" value={form.address} onChange={(v) => set("address", v)} placeholder="123 Ocean Drive" required />
            </Grid>
            <Grid cols={2} style={{ marginTop: "20px" }}>
              <InputField label="City" value={form.city} onChange={(v) => set("city", v)} placeholder="Miami, FL" required />
              <InputField label="Neighborhood" value={form.neighborhood} onChange={(v) => set("neighborhood", v)} placeholder="Brickell" />
            </Grid>
            <Grid cols={1} style={{ marginTop: "20px" }}>
              <label style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <FieldLabel>Price</FieldLabel>
                <div style={{ display: "flex" }}>
                  <select value={form.currency} onChange={(e) => set("currency", e.target.value)} style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${GOLD_BORDER}`, borderRight: "none", borderRadius: "10px 0 0 10px", padding: "11px 14px", fontSize: "13px", color: GOLD, fontFamily: "var(--font-dm-sans)", fontWeight: 600, outline: "none", cursor: "pointer", appearance: "none", WebkitAppearance: "none", flexShrink: 0, width: "80px" }}>
                    {CURRENCIES.map((c) => <option key={c} value={c} style={{ background: "#1a1a1a" }}>{c}</option>)}
                  </select>
                  <input type="text" value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="1,250,000" required style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: `1px solid ${GOLD_BORDER}`, borderRadius: "0 10px 10px 0", padding: "11px 14px", fontSize: "15px", color: WARM_WHITE, outline: "none", fontFamily: "var(--font-dm-sans)" }} onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(200,169,110,0.5)")} onBlur={(e) => (e.currentTarget.style.borderColor = GOLD_BORDER)} />
                </div>
              </label>
            </Grid>
            <Grid cols={2} style={{ marginTop: "20px" }}>
              <InputField label="Bedrooms" type="number" value={form.bedrooms} onChange={(v) => set("bedrooms", v)} placeholder="4" />
              <InputField label="Bathrooms" type="number" value={form.bathrooms} onChange={(v) => set("bathrooms", v)} placeholder="3" />
            </Grid>
            <Grid cols={1} style={{ marginTop: "20px" }}>
              <label style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <FieldLabel>Area</FieldLabel>
                  <div style={{ display: "flex", background: "rgba(255,255,255,0.04)", borderRadius: "100px", padding: "2px", gap: "2px" }}>
                    {(["sqft", "sqm"] as const).map((u) => (
                      <button key={u} type="button" onClick={() => set("areaUnit", u)} style={{ padding: "4px 12px", borderRadius: "100px", fontSize: "12px", fontWeight: form.areaUnit === u ? 600 : 400, color: form.areaUnit === u ? BG : MUTED, background: form.areaUnit === u ? GOLD : "transparent", border: "none", cursor: "pointer", fontFamily: "var(--font-dm-sans)", transition: "all 0.2s" }}>
                        {u === "sqft" ? "sq ft" : "m²"}
                      </button>
                    ))}
                  </div>
                </div>
                <input type="number" value={form.area} onChange={(e) => set("area", e.target.value)} placeholder={form.areaUnit === "sqft" ? "2,400" : "223"} style={inputStyle} onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(200,169,110,0.5)")} onBlur={(e) => (e.currentTarget.style.borderColor = GOLD_BORDER)} />
              </label>
            </Grid>
            {isMultifamily(form.propertyType) && (
              <Grid cols={1} style={{ marginTop: "20px" }}>
                <InputField label="Number of units" type="number" value={form.units} onChange={(v) => set("units", v)} placeholder="8" />
              </Grid>
            )}
            <Grid cols={2} style={{ marginTop: "20px" }}>
              <InputField label="Year built (optional)" type="number" value={form.yearBuilt} onChange={(v) => set("yearBuilt", v)} placeholder="2018" />
              <InputField label="Parking spaces" type="number" value={form.parkingSpaces} onChange={(v) => set("parkingSpaces", v)} placeholder="2" />
            </Grid>
          </Card>

          {/* ── 02 Property Highlights ── */}
          <Card num="02" title="Property Highlights">
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <TextAreaField label="What makes this property unique?" value={form.specialHighlights} onChange={(v) => set("specialHighlights", v)} placeholder="Brand new renovation, corner unit…" />
              <TextAreaField label="Neighborhood description" value={form.neighborhoodDescription} onChange={(v) => set("neighborhoodDescription", v)} placeholder="Walking distance to top restaurants…" />
              <TextAreaField label="Who is this property perfect for?" value={form.idealBuyer} onChange={(v) => set("idealBuyer", v)} placeholder="Investors, families, young professionals…" />
            </div>
          </Card>

          {/* ── 03 Amenities ── */}
          <Card num="03" title="Amenities">
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div>
                <FieldLabel style={{ marginBottom: "12px", display: "block" }}>Select all that apply</FieldLabel>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                  {currentAmenities.map((a) => (
                    <AmenityPill key={a} label={a} checked={form.amenities.includes(a)} onClick={() => toggleAmenity(a)} />
                  ))}
                </div>
              </div>
              <div>
                <FieldLabel style={{ marginBottom: "12px", display: "block" }}>Custom amenities</FieldLabel>
                <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                  <input ref={customInputRef} type="text" value={customInput} onChange={(e) => setCustomInput(e.target.value)} onKeyDown={handleCustomKeyDown} placeholder="Type amenity and press Enter…" style={{ ...inputStyle, flex: 1 }} onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(200,169,110,0.5)")} onBlur={(e) => (e.currentTarget.style.borderColor = GOLD_BORDER)} />
                  <button type="button" onClick={addCustomAmenity} style={{ padding: "11px 20px", borderRadius: "10px", background: "rgba(200,169,110,0.12)", border: `1px solid ${GOLD_BORDER}`, color: GOLD, fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-dm-sans)", flexShrink: 0 }}>Add</button>
                </div>
                {form.customAmenities.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {form.customAmenities.map((a) => (
                      <span key={a} style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 14px", borderRadius: "100px", background: "rgba(200,169,110,0.12)", border: "1px solid rgba(200,169,110,0.35)", fontSize: "13px", color: GOLD, fontWeight: 500 }}>
                        {a}
                        <button type="button" onClick={() => removeCustomAmenity(a)} style={{ background: "none", border: "none", color: GOLD, cursor: "pointer", fontSize: "14px", lineHeight: 1, padding: "0 0 0 2px", opacity: 0.6 }}>×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* ── 04 Content Preferences ── */}
          <Card num="04" title="Content Preferences">
            <Grid cols={2}>
              <SelectField label="Post language" value={form.language} onChange={(v) => set("language", v)} options={LANGUAGES} />
              <SelectField label="Tone" value={form.tone} onChange={(v) => set("tone", v)} options={TONES} />
              <div style={{ gridColumn: "1 / -1" }}>
                <SelectField label="Call to action" value={form.cta} onChange={(v) => set("cta", v)} options={CTAS} />
              </div>
            </Grid>
          </Card>

          {error && (
            <div style={{ fontSize: "13px", color: "#E07070", background: "rgba(224,112,112,0.08)", border: "1px solid rgba(224,112,112,0.2)", borderRadius: "10px", padding: "12px 16px" }}>
              {error}
            </div>
          )}

          <div style={{ paddingBottom: "60px" }}>
            <button type="submit" disabled={saving} style={{ display: "inline-flex", alignItems: "center", gap: "10px", background: saving ? "rgba(200,169,110,0.45)" : GOLD, color: BG, fontSize: "15px", fontWeight: 600, padding: "16px 44px", borderRadius: "100px", border: "none", cursor: saving ? "not-allowed" : "pointer", letterSpacing: "0.01em", boxShadow: saving ? "none" : "0 0 40px rgba(200,169,110,0.2)", transition: "all 0.25s", fontFamily: "var(--font-dm-sans)" }}>
              {saving ? (
                <><span style={{ width: "14px", height: "14px", border: `2px solid ${BG}`, borderTopColor: "transparent", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} /> Saving…</>
              ) : "Save changes →"}
            </button>
          </div>
        </form>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </main>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: `1px solid rgba(200,169,110,0.15)`,
  borderRadius: "10px",
  padding: "11px 14px",
  fontSize: "15px",
  color: "#F0EDE6",
  outline: "none",
  fontFamily: "var(--font-dm-sans)",
  width: "100%",
  boxSizing: "border-box",
  transition: "border-color 0.2s",
};

function FieldLabel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <span style={{ fontSize: "12px", color: "#9A9490", letterSpacing: "0.06em", textTransform: "uppercase", ...style }}>{children}</span>;
}

function Card({ num, title, children }: { num: string; title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: "16px", padding: "36px" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: "12px", marginBottom: "28px" }}>
        <span style={{ fontSize: "11px", color: GOLD, fontWeight: 600, letterSpacing: "0.08em" }}>{num}</span>
        <h2 style={{ fontFamily: "var(--font-cormorant)", fontSize: "22px", fontWeight: 400, color: "#F0EDE6", letterSpacing: "-0.01em", margin: 0 }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Grid({ cols, children, style }: { cols: number; children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: "16px", ...style }}>{children}</div>;
}

function InputField({ label, type = "text", value, onChange, placeholder, required }: { label: string; type?: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <FieldLabel>{label}</FieldLabel>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={required} style={inputStyle} onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(200,169,110,0.5)")} onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(200,169,110,0.15)")} />
    </label>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <FieldLabel>{label}</FieldLabel>
      <select value={value} onChange={(e) => onChange(e.target.value)} style={{ ...inputStyle, cursor: "pointer", appearance: "none", WebkitAppearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%234A4540' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center", paddingRight: "36px" }} onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(200,169,110,0.5)")} onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(200,169,110,0.15)")}>
        {options.map((o) => <option key={o} value={o} style={{ background: "#1A1A1A" }}>{o}</option>)}
      </select>
    </label>
  );
}

function TextAreaField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <FieldLabel>{label}</FieldLabel>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={3} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }} onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(200,169,110,0.5)")} onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(200,169,110,0.15)")} />
    </label>
  );
}

function AmenityPill({ label, checked, onClick }: { label: string; checked: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} style={{ padding: "8px 16px", borderRadius: "100px", fontSize: "13px", fontFamily: "var(--font-dm-sans)", fontWeight: checked ? 500 : 400, color: checked ? BG : MUTED, background: checked ? GOLD : "rgba(255,255,255,0.04)", border: `1px solid ${checked ? GOLD : "rgba(200,169,110,0.15)"}`, cursor: "pointer", transition: "all 0.18s", whiteSpace: "nowrap" }}>
      {label}
    </button>
  );
}
