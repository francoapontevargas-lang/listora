"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const GOLD = "#C8A96E";
const BG = "#080808";
const WARM_WHITE = "#F0EDE6";
const MUTED = "#4A4540";
const BORDER = "rgba(255,255,255,0.06)";
const GOLD_BORDER = "rgba(200,169,110,0.15)";
const SURFACE = "rgba(255,255,255,0.03)";

interface Profile {
  id: string;
  full_name: string | null;
  brokerage: string | null;
  phone: string | null;
  city: string | null;
  slug: string;
}

interface ListingImage {
  url: string;
  order_index: number;
}

interface Listing {
  id: string;
  property_type: string;
  address: string;
  city: string;
  neighborhood: string | null;
  currency: string | null;
  price: string | number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  area: number | null;
  area_unit: string | null;
  status: string | null;
  listing_images?: ListingImage[];
}

function getInitials(name: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  return parts.length === 1
    ? parts[0][0].toUpperCase()
    : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatPrice(currency: string | null, price: string | number | null): string {
  if (price == null || price === "") return "—";
  const num = typeof price === "number" ? price : parseFloat(String(price).replace(/,/g, ""));
  if (isNaN(num)) return String(price);
  return `${currency ?? ""} ${num.toLocaleString("en-US")}`.trim();
}

function formatPhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

function propertyTypeShort(type: string): string {
  return type.replace("Residential — ", "").replace("Commercial — ", "").replace("Multifamily — ", "");
}

export default function AgentPortfolioPage() {
  const { slug } = useParams<{ slug: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("profiles")
      .select("id, full_name, brokerage, phone, city, slug")
      .eq("slug", slug)
      .maybeSingle()
      .then(async ({ data: profileData }) => {
        if (!profileData) { setNotFound(true); setLoading(false); return; }
        setProfile(profileData);

        const { data: listingsData } = await supabase
          .from("listings")
          .select("id, property_type, address, city, neighborhood, currency, price, bedrooms, bathrooms, area, area_unit, status")
          .eq("user_id", profileData.id)
          .or("status.eq.Active,status.eq.active,status.is.null")
          .order("created_at", { ascending: false });

        setListings(listingsData ?? []);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: "32px", height: "32px", border: `2px solid ${GOLD}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (notFound) {
    return (
      <div style={{ minHeight: "100vh", background: BG, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-dm-sans)", gap: "16px" }}>
        <p style={{ fontSize: "12px", color: GOLD, letterSpacing: "0.1em", textTransform: "uppercase" }}>404</p>
        <h1 style={{ fontFamily: "var(--font-cormorant)", fontSize: "42px", fontWeight: 400, color: WARM_WHITE, margin: 0 }}>Agent not found.</h1>
        <Link href="/" style={{ fontSize: "14px", color: MUTED, textDecoration: "none", marginTop: "8px" }}>← Back to Listora</Link>
      </div>
    );
  }

  const initials = getInitials(profile!.full_name);
  const phone = profile!.phone ? formatPhone(profile!.phone) : null;

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "var(--font-dm-sans)", color: WARM_WHITE }}>

      {/* Top bar */}
      <div className="public-topbar" style={{ borderBottom: `1px solid ${BORDER}`, padding: "16px 40px", display: "flex", justifyContent: "flex-end" }}>
        <Link href="/" style={{ fontFamily: "var(--font-cormorant)", fontSize: "18px", fontWeight: 500, color: MUTED, textDecoration: "none", letterSpacing: "-0.01em" }}>
          Listora
        </Link>
      </div>

      {/* Agent Header */}
      <div className="public-header" style={{ maxWidth: "900px", margin: "0 auto", padding: "72px 40px 56px" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "20px" }}>

          {/* Avatar */}
          <div style={{
            width: "96px", height: "96px", borderRadius: "50%",
            background: "rgba(200,169,110,0.1)", border: `1.5px solid ${GOLD_BORDER}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "var(--font-cormorant)", fontSize: "32px", fontWeight: 500, color: GOLD,
            letterSpacing: "0.02em",
          }}>
            {initials}
          </div>

          {/* Name + info */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <h1 style={{ fontFamily: "var(--font-cormorant)", fontSize: "48px", fontWeight: 400, letterSpacing: "-0.02em", color: WARM_WHITE, margin: 0, lineHeight: 1.1 }}>
              {profile!.full_name}
            </h1>
            {profile!.brokerage && (
              <p style={{ fontSize: "15px", color: MUTED, margin: 0 }}>{profile!.brokerage}</p>
            )}
            {profile!.city && (
              <p style={{ fontSize: "13px", color: "#3A3530", margin: 0, letterSpacing: "0.04em" }}>{profile!.city}</p>
            )}
          </div>

          {/* Contact buttons */}
          {phone && (
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center", marginTop: "4px" }}>
              <a
                href={`https://wa.me/${phone}`}
                target="_blank"
                rel="noopener noreferrer"
                style={contactButtonStyle}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(200,169,110,0.15)"; e.currentTarget.style.borderColor = "rgba(200,169,110,0.4)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(200,169,110,0.06)"; e.currentTarget.style.borderColor = GOLD_BORDER; }}
              >
                <span style={{ fontSize: "15px" }}>📱</span> WhatsApp
              </a>
              <a
                href={`tel:${phone}`}
                style={contactButtonStyle}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(200,169,110,0.15)"; e.currentTarget.style.borderColor = "rgba(200,169,110,0.4)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(200,169,110,0.06)"; e.currentTarget.style.borderColor = GOLD_BORDER; }}
              >
                <span style={{ fontSize: "15px" }}>📞</span> Call
              </a>
            </div>
          )}

          {/* Powered by badge */}
          <div style={{ marginTop: "4px" }}>
            <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#2A2520", textDecoration: "none", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Powered by Listora
            </Link>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 40px" }}>
        <div style={{ height: "1px", background: BORDER }} />
      </div>

      {/* Listings section */}
      <div className="public-listings" style={{ maxWidth: "900px", margin: "0 auto", padding: "56px 40px 80px" }}>
        <div style={{ marginBottom: "36px" }}>
          <p style={{ fontSize: "11px", color: GOLD, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 10px" }}>Portfolio</p>
          <h2 style={{ fontFamily: "var(--font-cormorant)", fontSize: "36px", fontWeight: 400, letterSpacing: "-0.02em", color: WARM_WHITE, margin: 0 }}>
            Active Listings
          </h2>
        </div>

        {listings.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "240px", gap: "12px", textAlign: "center" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(200,169,110,0.06)", border: `1px solid ${GOLD_BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>◈</div>
            <p style={{ fontSize: "15px", color: MUTED, margin: 0 }}>No active listings at the moment.</p>
          </div>
        ) : (
          <div className="public-portfolio-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
            {listings.map((listing) => (
              <PublicListingCard key={listing.id} listing={listing} agentSlug={slug} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const contactButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  padding: "12px 24px",
  borderRadius: "100px",
  border: `1px solid ${GOLD_BORDER}`,
  background: "rgba(200,169,110,0.06)",
  color: GOLD,
  fontSize: "14px",
  fontWeight: 500,
  textDecoration: "none",
  fontFamily: "var(--font-dm-sans)",
  transition: "background 0.2s, border-color 0.2s",
  cursor: "pointer",
};

function PublicListingCard({ listing, agentSlug }: { listing: Listing; agentSlug: string }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={`/${agentSlug}/${listing.id}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        background: SURFACE,
        border: `1px solid ${hovered ? "rgba(200,169,110,0.2)" : BORDER}`,
        borderRadius: "16px",
        padding: "28px",
        textDecoration: "none",
        color: WARM_WHITE,
        transition: "border-color 0.2s",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {hovered && (
        <div aria-hidden style={{ position: "absolute", top: "-60px", right: "-60px", width: "180px", height: "180px", borderRadius: "50%", background: GOLD, opacity: 0.04, filter: "blur(50px)", pointerEvents: "none" }} />
      )}

      {/* Type + status */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "11px", fontWeight: 600, color: GOLD, background: "rgba(200,169,110,0.1)", border: `1px solid ${GOLD_BORDER}`, borderRadius: "6px", padding: "3px 10px", letterSpacing: "0.06em", textTransform: "uppercase" }}>
          {propertyTypeShort(listing.property_type)}
        </span>
        <span style={{ fontSize: "11px", fontWeight: 600, color: GOLD, background: "rgba(200,169,110,0.08)", border: `1px solid ${GOLD_BORDER}`, borderRadius: "6px", padding: "3px 10px", letterSpacing: "0.04em" }}>
          Active
        </span>
      </div>

      {/* Address */}
      <div>
        <p style={{ fontSize: "16px", fontWeight: 500, color: WARM_WHITE, margin: "0 0 4px", lineHeight: 1.3 }}>{listing.address}</p>
        <p style={{ fontSize: "13px", color: MUTED, margin: 0 }}>
          {listing.neighborhood ? `${listing.neighborhood}, ` : ""}{listing.city}
        </p>
      </div>

      {/* Price */}
      <p style={{ fontFamily: "var(--font-cormorant)", fontSize: "28px", fontWeight: 400, color: WARM_WHITE, margin: 0, letterSpacing: "-0.01em" }}>
        {formatPrice(listing.currency, listing.price)}
      </p>

      {/* Stats */}
      <div style={{ display: "flex", gap: "20px" }}>
        {listing.bedrooms != null && (
          <span style={{ fontSize: "13px", color: MUTED }}>{listing.bedrooms} bd</span>
        )}
        {listing.bathrooms != null && (
          <span style={{ fontSize: "13px", color: MUTED }}>{listing.bathrooms} ba</span>
        )}
        {listing.area != null && (
          <span style={{ fontSize: "13px", color: MUTED }}>{listing.area.toLocaleString()} {listing.area_unit ?? "sqft"}</span>
        )}
      </div>
    </Link>
  );
}
