"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// ─── Design tokens ────────────────────────────────────────────
const GOLD = "#C8A96E";
const BG = "#080808";
const WARM_WHITE = "#F0EDE6";
const MUTED = "#4A4540";
const SURFACE = "rgba(255,255,255,0.03)";
const BORDER = "rgba(255,255,255,0.07)";
const GOLD_BORDER = "rgba(200,169,110,0.15)";

// ─── Property types ───────────────────────────────────────────
export const PROPERTY_TYPE_LIST = [
  "Residential — Single Family Home",
  "Residential — Condo/Apartment",
  "Residential — Townhouse",
  "Multifamily — Duplex",
  "Multifamily — Triplex",
  "Multifamily — 4+ Units",
  "Commercial — Office Space",
  "Commercial — Retail",
  "Commercial — Warehouse/Industrial",
  "Vacation Rental",
  "Land/Lot",
  "Mixed Use",
] as const;

// ─── Dynamic amenity sets ─────────────────────────────────────
const AMENITIES_BY_TYPE: Record<string, string[]> = {
  "Residential — Single Family Home": [
    "Pool", "Garage", "Garden/Backyard", "Terrace/Balcony", "Ocean View",
    "Mountain View", "City View", "Modern Kitchen", "Walk-in Closet", "Master Suite",
    "Home Office", "Gym/Fitness Room", "Smart Home", "Solar Panels", "Laundry Room",
    "Basement", "Fireplace", "Gated Community", "HOA",
  ],
  "Residential — Condo/Apartment": [
    "Ocean View", "City View", "Terrace/Balcony", "Modern Kitchen", "Walk-in Closet",
    "Gym/Fitness Center", "Pool", "Concierge/Doorman", "Rooftop Access", "Parking",
    "Storage Unit", "Pet Friendly", "Elevator", "Security System", "Laundry In Unit",
    "Short Term Rental Allowed",
  ],
  "Residential — Townhouse": [
    "Pool", "Garage", "Garden/Backyard", "Terrace/Balcony", "Ocean View",
    "Mountain View", "City View", "Modern Kitchen", "Walk-in Closet", "Master Suite",
    "Home Office", "Gym/Fitness Room", "Smart Home", "Solar Panels", "Laundry Room",
    "Basement", "Fireplace", "Gated Community", "HOA",
  ],
  "Multifamily — Duplex": [
    "Separate Entrances", "Individual Meters", "Parking Per Unit", "Laundry On Site",
    "Pool", "Garden", "Storage", "Roof Access", "Security System", "Elevator",
    "On Site Management", "Recently Renovated",
  ],
  "Multifamily — Triplex": [
    "Separate Entrances", "Individual Meters", "Parking Per Unit", "Laundry On Site",
    "Pool", "Garden", "Storage", "Roof Access", "Security System", "Elevator",
    "On Site Management", "Recently Renovated",
  ],
  "Multifamily — 4+ Units": [
    "Separate Entrances", "Individual Meters", "Parking Per Unit", "Laundry On Site",
    "Pool", "Garden", "Storage", "Roof Access", "Security System", "Elevator",
    "On Site Management", "Recently Renovated",
  ],
  "Commercial — Office Space": [
    "Reception Area", "Conference Rooms", "Open Floor Plan", "Private Offices",
    "Kitchen/Break Room", "Parking", "24/7 Access", "Security System", "High Speed Internet",
    "HVAC", "Generator Backup", "Loading Dock", "Handicap Accessible", "Signage Rights",
  ],
  "Commercial — Retail": [
    "Street Level", "High Foot Traffic", "Display Windows", "Storage Room", "Loading Area",
    "Parking", "Corner Unit", "Recently Renovated", "HVAC", "Security System", "Signage Rights",
  ],
  "Commercial — Warehouse/Industrial": [
    "Loading Dock", "High Ceilings", "Drive-In Doors", "Three Phase Power", "Parking",
    "Office Space", "Security System", "HVAC", "Sprinkler System", "Rail Access",
  ],
  "Vacation Rental": [
    "Ocean View", "Pool", "Beach Access", "Fully Furnished", "Air Conditioning",
    "Full Kitchen", "BBQ Area", "Outdoor Shower", "Parking", "WiFi",
    "Smart TV", "Washer/Dryer", "Game Room", "Fire Pit", "Kayaks/Beach Equipment",
  ],
  "Land/Lot": [
    "Ocean View", "Mountain View", "City View", "Utilities Connected", "Road Access",
    "Flat Terrain", "Corner Lot", "Buildable", "Zoned Residential", "Zoned Commercial",
    "Subdivision Possible", "HOA",
  ],
  "Mixed Use": [
    "Street Level Retail", "Residential Units", "Parking", "Elevator", "High Foot Traffic",
    "Loading Area", "Security System", "HVAC", "Recently Renovated", "Signage Rights",
  ],
};

const CURRENCIES = ["USD", "EUR", "MXN", "COP", "DOP"];
const LANGUAGES = ["English", "Spanish", "Portuguese", "French", "Both EN+ES", "All Languages"];
const TONES = ["Professional", "Friendly", "Luxury", "Casual", "Urgent"];
const CTAS = ["DM for info", "WhatsApp me", "Book a showing", "Link in bio", "Call me", "Email me"];

const isMultifamily = (t: string) => t.startsWith("Multifamily");

// ─── Form data type ───────────────────────────────────────────
export interface ListingFormData {
  propertyType: string;
  address: string;
  city: string;
  neighborhood: string;
  currency: string;
  price: string;
  bedrooms: string;
  bathrooms: string;
  areaUnit: "sqft" | "sqm";
  area: string;
  units: string;
  yearBuilt: string;
  parkingSpaces: string;
  amenities: string[];
  customAmenities: string[];
  specialHighlights: string;
  neighborhoodDescription: string;
  idealBuyer: string;
  language: string;
  tone: string;
  cta: string;
  images: string[];
}

const EMPTY_FORM: ListingFormData = {
  propertyType: PROPERTY_TYPE_LIST[0],
  address: "",
  city: "",
  neighborhood: "",
  currency: "USD",
  price: "",
  bedrooms: "",
  bathrooms: "",
  areaUnit: "sqft",
  area: "",
  units: "",
  yearBuilt: "",
  parkingSpaces: "",
  amenities: [],
  customAmenities: [],
  specialHighlights: "",
  neighborhoodDescription: "",
  idealBuyer: "",
  language: "English",
  tone: "Luxury",
  cta: "DM for info",
  images: [],
};

// ─── Page ─────────────────────────────────────────────────────
export default function NewListingPage() {
  const router = useRouter();
  const [form, setForm] = useState<ListingFormData>(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("listora_listing_form");
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...EMPTY_FORM, ...parsed, images: parsed.images ?? [] };
      }
    }
    return EMPTY_FORM;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customInput, setCustomInput] = useState("");
  const customInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadImages = async (files: FileList) => {
    setUploading(true);
    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload-image", { method: "POST", body: fd });
      if (res.ok) {
        const { url } = await res.json();
        uploaded.push(url);
      }
    }
    setForm((f) => ({ ...f, images: [...f.images, ...uploaded] }));
    setUploading(false);
  };

  const removeImage = (url: string) =>
    setForm((f) => ({ ...f, images: f.images.filter((u) => u !== url) }));

  const set = <K extends keyof ListingFormData>(key: K, value: ListingFormData[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  // When property type changes: keep only amenities valid in new type + all custom ones
  const handleTypeChange = (newType: string) => {
    const newValidAmenities = AMENITIES_BY_TYPE[newType] ?? [];
    setForm((f) => ({
      ...f,
      propertyType: newType,
      amenities: f.amenities.filter((a) => newValidAmenities.includes(a)),
    }));
  };

  const toggleAmenity = (a: string) =>
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(a)
        ? f.amenities.filter((x) => x !== a)
        : [...f.amenities, a],
    }));

  const addCustomAmenity = () => {
    const val = customInput.trim();
    if (!val || form.customAmenities.includes(val)) return;
    setForm((f) => ({ ...f, customAmenities: [...f.customAmenities, val] }));
    setCustomInput("");
  };

  const removeCustomAmenity = (a: string) =>
    setForm((f) => ({ ...f, customAmenities: f.customAmenities.filter((x) => x !== a) }));

  const handleCustomKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { e.preventDefault(); addCustomAmenity(); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.address || !form.city || !form.price) {
      setError("Please fill in address, city, and price.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/generate-caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to generate content."); return; }
      sessionStorage.setItem("listora_listing_form", JSON.stringify(form));
      sessionStorage.setItem("listora_listing_result", JSON.stringify(data));
      router.push("/dashboard/listings/new/result");
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const currentAmenities = AMENITIES_BY_TYPE[form.propertyType] ?? [];

  return (
    <div style={{ minHeight: "100vh", background: BG, color: WARM_WHITE, fontFamily: "var(--font-dm-sans)", display: "flex" }}>
      {/* Sidebar */}
      <aside style={{ width: "220px", flexShrink: 0, borderRight: `1px solid ${BORDER}`, padding: "28px 0", display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh" }}>
        <Link href="/dashboard" style={{ fontFamily: "var(--font-cormorant)", fontSize: "22px", fontWeight: 500, color: WARM_WHITE, textDecoration: "none", padding: "0 24px", marginBottom: "40px", display: "block" }}>
          Listora
        </Link>
        <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", margin: "0 12px", borderRadius: "10px", fontSize: "14px", color: MUTED, textDecoration: "none" }}>
          ← Dashboard
        </Link>
      </aside>

      {/* Form */}
      <main style={{ flex: 1, padding: "48px 60px", maxWidth: "820px", overflowY: "auto" }}>
        <p style={{ fontSize: "12px", color: MUTED, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>New listing</p>
        <h1 style={{ fontFamily: "var(--font-cormorant)", fontSize: "42px", fontWeight: 400, letterSpacing: "-0.02em", color: WARM_WHITE, marginBottom: "52px" }}>
          Tell us about the property.
        </h1>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "36px" }}>

          {/* ── 01 Property Basics ── */}
          <Card num="01" title="Property Basics">
            <Grid cols={1}>
              {/* Property type */}
              <SelectField
                label="Property type"
                value={form.propertyType}
                onChange={handleTypeChange}
                options={PROPERTY_TYPE_LIST as unknown as string[]}
              />
            </Grid>

            <Grid cols={1} style={{ marginTop: "20px" }}>
              <InputField label="Address" value={form.address} onChange={(v) => set("address", v)} placeholder="123 Ocean Drive" required />
            </Grid>

            <Grid cols={2} style={{ marginTop: "20px" }}>
              <InputField label="City" value={form.city} onChange={(v) => set("city", v)} placeholder="Miami, FL" required />
              <InputField label="Neighborhood" value={form.neighborhood} onChange={(v) => set("neighborhood", v)} placeholder="Brickell" />
            </Grid>

            {/* Price with currency */}
            <Grid cols={1} style={{ marginTop: "20px" }}>
              <label style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <FieldLabel>Price</FieldLabel>
                <div style={{ display: "flex", gap: "0" }}>
                  <select
                    value={form.currency}
                    onChange={(e) => set("currency", e.target.value)}
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: `1px solid ${GOLD_BORDER}`,
                      borderRight: "none",
                      borderRadius: "10px 0 0 10px",
                      padding: "11px 14px",
                      fontSize: "13px",
                      color: GOLD,
                      fontFamily: "var(--font-dm-sans)",
                      fontWeight: 600,
                      outline: "none",
                      cursor: "pointer",
                      appearance: "none",
                      WebkitAppearance: "none",
                      flexShrink: 0,
                      width: "80px",
                    }}
                  >
                    {CURRENCIES.map((c) => <option key={c} value={c} style={{ background: "#1a1a1a" }}>{c}</option>)}
                  </select>
                  <input
                    type="text"
                    value={form.price}
                    onChange={(e) => set("price", e.target.value)}
                    placeholder="1,250,000"
                    required
                    style={{
                      flex: 1,
                      background: "rgba(255,255,255,0.04)",
                      border: `1px solid ${GOLD_BORDER}`,
                      borderRadius: "0 10px 10px 0",
                      padding: "11px 14px",
                      fontSize: "15px",
                      color: WARM_WHITE,
                      outline: "none",
                      fontFamily: "var(--font-dm-sans)",
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(200,169,110,0.5)")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = GOLD_BORDER)}
                  />
                </div>
              </label>
            </Grid>

            <Grid cols={2} style={{ marginTop: "20px" }}>
              <InputField label="Bedrooms" type="number" value={form.bedrooms} onChange={(v) => set("bedrooms", v)} placeholder="4" />
              <InputField label="Bathrooms" type="number" value={form.bathrooms} onChange={(v) => set("bathrooms", v)} placeholder="3" />
            </Grid>

            {/* Area with unit toggle */}
            <Grid cols={1} style={{ marginTop: "20px" }}>
              <label style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <FieldLabel>Area</FieldLabel>
                  <div style={{ display: "flex", background: "rgba(255,255,255,0.04)", borderRadius: "100px", padding: "2px", gap: "2px" }}>
                    {(["sqft", "sqm"] as const).map((u) => (
                      <button
                        key={u}
                        type="button"
                        onClick={() => set("areaUnit", u)}
                        style={{
                          padding: "4px 12px",
                          borderRadius: "100px",
                          fontSize: "12px",
                          fontWeight: form.areaUnit === u ? 600 : 400,
                          color: form.areaUnit === u ? BG : MUTED,
                          background: form.areaUnit === u ? GOLD : "transparent",
                          border: "none",
                          cursor: "pointer",
                          fontFamily: "var(--font-dm-sans)",
                          transition: "all 0.2s",
                        }}
                      >
                        {u === "sqft" ? "sq ft" : "m²"}
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="number"
                  value={form.area}
                  onChange={(e) => set("area", e.target.value)}
                  placeholder={form.areaUnit === "sqft" ? "2,400" : "223"}
                  style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(200,169,110,0.5)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = GOLD_BORDER)}
                />
              </label>
            </Grid>

            {/* Conditional: Units for Multifamily */}
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
              <TextAreaField
                label="What makes this property unique?"
                value={form.specialHighlights}
                onChange={(v) => set("specialHighlights", v)}
                placeholder="Brand new renovation, corner unit with panoramic views, steps from Brickell City Centre, rare split floor plan…"
              />
              <TextAreaField
                label="Neighborhood description"
                value={form.neighborhoodDescription}
                onChange={(v) => set("neighborhoodDescription", v)}
                placeholder="Walking distance to top restaurants, minutes from the beach, vibrant arts district with weekend markets…"
              />
              <TextAreaField
                label="Who is this property perfect for?"
                value={form.idealBuyer}
                onChange={(v) => set("idealBuyer", v)}
                placeholder="Young professionals looking for a lock-and-leave lifestyle, families wanting space to grow, investors targeting short-term rentals…"
              />
            </div>
          </Card>

          {/* ── 03 Amenities ── */}
          <Card num="03" title="Amenities">
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {/* Dynamic checklist */}
              <div>
                <FieldLabel style={{ marginBottom: "12px", display: "block" }}>Select all that apply</FieldLabel>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                  {currentAmenities.map((a) => {
                    const checked = form.amenities.includes(a);
                    return (
                      <AmenityPill key={a} label={a} checked={checked} onClick={() => toggleAmenity(a)} />
                    );
                  })}
                </div>
              </div>

              {/* Custom amenities */}
              <div>
                <FieldLabel style={{ marginBottom: "12px", display: "block" }}>Add custom amenities</FieldLabel>
                <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                  <input
                    ref={customInputRef}
                    type="text"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    onKeyDown={handleCustomKeyDown}
                    placeholder="Type amenity and press Enter…"
                    style={{
                      ...inputStyle,
                      flex: 1,
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(200,169,110,0.5)")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = GOLD_BORDER)}
                  />
                  <button
                    type="button"
                    onClick={addCustomAmenity}
                    style={{
                      padding: "11px 20px",
                      borderRadius: "10px",
                      background: "rgba(200,169,110,0.12)",
                      border: `1px solid ${GOLD_BORDER}`,
                      color: GOLD,
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "var(--font-dm-sans)",
                      flexShrink: 0,
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(200,169,110,0.2)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(200,169,110,0.12)")}
                  >
                    Add
                  </button>
                </div>

                {/* Custom tags */}
                {form.customAmenities.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {form.customAmenities.map((a) => (
                      <span
                        key={a}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "6px 14px",
                          borderRadius: "100px",
                          background: "rgba(200,169,110,0.12)",
                          border: `1px solid rgba(200,169,110,0.35)`,
                          fontSize: "13px",
                          color: GOLD,
                          fontWeight: 500,
                        }}
                      >
                        {a}
                        <button
                          type="button"
                          onClick={() => removeCustomAmenity(a)}
                          aria-label={`Remove ${a}`}
                          style={{
                            background: "none",
                            border: "none",
                            color: GOLD,
                            cursor: "pointer",
                            fontSize: "14px",
                            lineHeight: 1,
                            padding: "0 0 0 2px",
                            opacity: 0.6,
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* ── 04 Property Photos ── */}
          <Card num="04" title="Property Photos">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: "none" }}
              onChange={(e) => e.target.files && uploadImages(e.target.files)}
            />

            {/* Upload zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); uploadImages(e.dataTransfer.files); }}
              style={{
                border: `1.5px dashed ${dragOver ? GOLD : GOLD_BORDER}`,
                borderRadius: "12px",
                padding: "36px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                cursor: "pointer",
                background: dragOver ? "rgba(200,169,110,0.04)" : "transparent",
                transition: "all 0.2s",
                marginBottom: form.images.length > 0 ? "20px" : 0,
              }}
            >
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(200,169,110,0.08)", border: `1px solid ${GOLD_BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>
                ◈
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: "14px", color: WARM_WHITE, margin: "0 0 4px", fontWeight: 500 }}>
                  {uploading ? "Uploading…" : "Click or drag photos here"}
                </p>
                <p style={{ fontSize: "12px", color: MUTED, margin: 0 }}>JPG, PNG, WEBP — up to 10 photos</p>
              </div>
            </div>

            {/* Previews */}
            {form.images.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
                {form.images.map((url, i) => (
                  <div key={url} style={{ position: "relative", aspectRatio: "4/3", borderRadius: "8px", overflow: "hidden", border: `1px solid ${BORDER}` }}>
                    {i === 0 && (
                      <div style={{ position: "absolute", top: "6px", left: "6px", background: GOLD, color: BG, fontSize: "10px", fontWeight: 700, padding: "2px 7px", borderRadius: "4px", zIndex: 1, letterSpacing: "0.04em" }}>
                        COVER
                      </div>
                    )}
                    <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeImage(url); }}
                      style={{ position: "absolute", top: "6px", right: "6px", width: "22px", height: "22px", borderRadius: "50%", background: "rgba(0,0,0,0.7)", border: "none", color: WARM_WHITE, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1, zIndex: 1 }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* ── 05 Content Preferences ── */}
          <Card num="05" title="Content Preferences">
            <Grid cols={2}>
              <SelectField label="Post language" value={form.language} onChange={(v) => set("language", v)} options={LANGUAGES} />
              <SelectField label="Tone" value={form.tone} onChange={(v) => set("tone", v)} options={TONES} />
              <div style={{ gridColumn: "1 / -1" }}>
                <SelectField label="Call to action" value={form.cta} onChange={(v) => set("cta", v)} options={CTAS} />
              </div>
            </Grid>
          </Card>

          {/* Error */}
          {error && (
            <div style={{ fontSize: "13px", color: "#E07070", background: "rgba(224,112,112,0.08)", border: "1px solid rgba(224,112,112,0.2)", borderRadius: "10px", padding: "12px 16px" }}>
              {error}
            </div>
          )}

          {/* Submit */}
          <div style={{ paddingBottom: "60px" }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                background: loading ? "rgba(200,169,110,0.45)" : GOLD,
                color: BG,
                fontSize: "15px",
                fontWeight: 600,
                padding: "16px 44px",
                borderRadius: "100px",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                letterSpacing: "0.01em",
                boxShadow: loading ? "none" : "0 0 40px rgba(200,169,110,0.2)",
                transition: "all 0.25s",
                fontFamily: "var(--font-dm-sans)",
              }}
            >
              {loading ? (
                <>
                  <span style={{ width: "14px", height: "14px", border: `2px solid ${BG}`, borderTopColor: "transparent", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
                  Generating content…
                </>
              ) : "Generate Content →"}
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
  return (
    <span style={{ fontSize: "12px", color: "#9A9490", letterSpacing: "0.06em", textTransform: "uppercase", ...style }}>
      {children}
    </span>
  );
}

function Card({ num, title, children }: { num: string; title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: "16px", padding: "36px" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: "12px", marginBottom: "28px" }}>
        <span style={{ fontSize: "11px", color: GOLD, fontWeight: 600, letterSpacing: "0.08em" }}>{num}</span>
        <h2 style={{ fontFamily: "var(--font-cormorant)", fontSize: "22px", fontWeight: 400, color: "#F0EDE6", letterSpacing: "-0.01em", margin: 0 }}>
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

function Grid({ cols, children, style }: { cols: number; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: "16px", ...style }}>
      {children}
    </div>
  );
}

function InputField({ label, type = "text", value, onChange, placeholder, required }: {
  label: string; type?: string; value: string; onChange: (v: string) => void;
  placeholder?: string; required?: boolean;
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <FieldLabel>{label}</FieldLabel>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        style={inputStyle}
        onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(200,169,110,0.5)")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(200,169,110,0.15)")}
      />
    </label>
  );
}

function SelectField({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <FieldLabel>{label}</FieldLabel>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          ...inputStyle,
          cursor: "pointer",
          appearance: "none",
          WebkitAppearance: "none",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%234A4540' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 14px center",
          paddingRight: "36px",
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(200,169,110,0.5)")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(200,169,110,0.15)")}
      >
        {options.map((o) => <option key={o} value={o} style={{ background: "#1A1A1A" }}>{o}</option>)}
      </select>
    </label>
  );
}

function TextAreaField({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <FieldLabel>{label}</FieldLabel>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        style={{
          ...inputStyle,
          resize: "vertical",
          lineHeight: 1.6,
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(200,169,110,0.5)")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(200,169,110,0.15)")}
      />
    </label>
  );
}

function AmenityPill({ label, checked, onClick }: { label: string; checked: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "8px 16px",
        borderRadius: "100px",
        fontSize: "13px",
        fontFamily: "var(--font-dm-sans)",
        fontWeight: checked ? 500 : 400,
        color: checked ? BG : MUTED,
        background: checked ? GOLD : "rgba(255,255,255,0.04)",
        border: `1px solid ${checked ? GOLD : "rgba(200,169,110,0.15)"}`,
        cursor: "pointer",
        transition: "all 0.18s",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );
}
