"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const GOLD = "#C8A96E";
const BG = "#080808";
const WARM_WHITE = "#F0EDE6";
const MUTED = "#4A4540";
const SURFACE = "rgba(255,255,255,0.03)";
const BORDER = "rgba(255,255,255,0.06)";
const GOLD_BORDER = "rgba(200,169,110,0.15)";

const NAV_LINKS = [
  { label: "Dashboard", href: "/dashboard", icon: "⊞" },
  { label: "My Listings", href: "/dashboard/listings", icon: "◈" },
  { label: "Brand Studio", href: "/dashboard/brand", icon: "◇" },
  { label: "Portfolio", href: "/dashboard/portfolio", icon: "⊡" },
  { label: "Settings", href: "/dashboard/settings", icon: "⊙" },
];

type ListingStatus = "Active" | "Sold" | "Leased";

interface Listing {
  id: string;
  property_type: string;
  address: string;
  city: string;
  neighborhood: string | null;
  currency: string | null;
  price: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  area: number | null;
  area_unit: string | null;
  status: ListingStatus | null;
  created_at: string;
}

function formatPrice(currency: string | null, price: string | null): string {
  if (!price) return "—";
  const num = parseFloat(price.replace(/,/g, ""));
  if (isNaN(num)) return price;
  return `${currency ?? ""} ${num.toLocaleString("en-US")}`.trim();
}

function statusStyle(status: ListingStatus | null) {
  if (status === "Sold") return { color: "#6ABF6A", bg: "rgba(106,191,106,0.08)", border: "rgba(106,191,106,0.2)" };
  if (status === "Leased") return { color: "#6EB3E0", bg: "rgba(110,179,224,0.08)", border: "rgba(110,179,224,0.2)" };
  return { color: GOLD, bg: "rgba(200,169,110,0.08)", border: GOLD_BORDER };
}

function propertyTypeShort(type: string): string {
  return type
    .replace("Residential — ", "")
    .replace("Commercial — ", "")
    .replace("Multifamily — ", "");
}

export default function ListingsPage() {
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ full_name: string | null; brokerage: string | null } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user }, error }) => {
      if (error || !user) { router.replace("/login"); return; }

      const [{ data: profileData }, { data: listingsData }] = await Promise.all([
        supabase.from("profiles").select("full_name, brokerage").eq("id", user.id).maybeSingle(),
        supabase
          .from("listings")
          .select("id, property_type, address, city, neighborhood, currency, price, bedrooms, bathrooms, area, area_unit, status, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
      ]);

      setProfile(profileData ?? null);
      setListings(listingsData ?? []);
      setLoading(false);
    });
  }, [router]);

  const handleSignOut = async () => {
    await createClient().auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: "32px", height: "32px", border: `2px solid ${GOLD}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: BG, display: "flex", fontFamily: "var(--font-dm-sans)", color: WARM_WHITE }}>

      {/* Sidebar */}
      <aside style={{ width: "240px", flexShrink: 0, borderRight: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", padding: "28px 0", position: "sticky", top: 0, height: "100vh", overflow: "hidden" }}>
        <Link href="/" style={{ fontFamily: "var(--font-cormorant)", fontSize: "22px", fontWeight: 500, color: WARM_WHITE, textDecoration: "none", letterSpacing: "-0.01em", padding: "0 24px", marginBottom: "36px", display: "block" }}>
          Listora
        </Link>

        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2px", padding: "0 12px" }}>
          {NAV_LINKS.map((link) => {
            const active = link.href === "/dashboard/listings";
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  padding: "10px 14px", borderRadius: "10px",
                  fontSize: "14px", fontWeight: active ? 500 : 400,
                  color: active ? WARM_WHITE : MUTED,
                  background: active ? "rgba(200,169,110,0.08)" : "transparent",
                  textDecoration: "none", transition: "background 0.15s, color 0.15s",
                }}
              >
                <span style={{ fontSize: "15px", opacity: active ? 1 : 0.5 }}>{link.icon}</span>
                {link.label}
                {active && <span style={{ marginLeft: "auto", width: "4px", height: "4px", borderRadius: "50%", background: GOLD }} />}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: "16px 12px 0", borderTop: `1px solid ${BORDER}` }}>
          {profile?.full_name && (
            <div style={{ padding: "10px 14px", marginBottom: "4px" }}>
              <p style={{ fontSize: "13px", fontWeight: 500, color: WARM_WHITE, margin: 0 }}>{profile.full_name}</p>
              {profile.brokerage && <p style={{ fontSize: "12px", color: MUTED, margin: "2px 0 0" }}>{profile.brokerage}</p>}
            </div>
          )}
          <button
            onClick={handleSignOut}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "10px", fontSize: "14px", color: MUTED, background: "transparent", border: "none", cursor: "pointer", fontFamily: "var(--font-dm-sans)", transition: "color 0.15s" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#E07070")}
            onMouseLeave={(e) => (e.currentTarget.style.color = MUTED)}
          >
            <span style={{ fontSize: "15px", opacity: 0.5 }}>⊗</span>
            Log out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: "48px 52px", maxWidth: "1000px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "48px" }}>
          <div>
            <p style={{ fontSize: "12px", color: MUTED, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>My Listings</p>
            <h1 style={{ fontFamily: "var(--font-cormorant)", fontSize: "42px", fontWeight: 400, letterSpacing: "-0.02em", color: WARM_WHITE, margin: 0 }}>
              {listings.length > 0 ? `${listings.length} listing${listings.length === 1 ? "" : "s"}` : "Your listings"}
            </h1>
          </div>
          <Link
            href="/dashboard/listings/new"
            style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: GOLD, color: BG, fontSize: "14px", fontWeight: 600, padding: "12px 24px", borderRadius: "100px", textDecoration: "none", flexShrink: 0, marginTop: "8px" }}
          >
            + New Listing
          </Link>
        </div>

        {/* Empty state */}
        {listings.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "360px", gap: "20px", textAlign: "center" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "16px", background: "rgba(200,169,110,0.06)", border: `1px solid ${GOLD_BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px" }}>
              ◈
            </div>
            <div>
              <p style={{ fontSize: "18px", color: WARM_WHITE, fontWeight: 500, margin: "0 0 8px" }}>No listings yet</p>
              <p style={{ fontSize: "14px", color: MUTED, margin: 0 }}>Create your first listing and Listora will generate the caption.</p>
            </div>
            <Link
              href="/dashboard/listings/new"
              style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: GOLD, color: BG, fontSize: "14px", fontWeight: 600, padding: "12px 28px", borderRadius: "100px", textDecoration: "none" }}
            >
              Create first listing →
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px" }}>
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function ListingCard({ listing }: { listing: Listing }) {
  const [hovered, setHovered] = useState(false);
  const status = listing.status ?? "Active";
  const sc = statusStyle(status);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: SURFACE,
        border: `1px solid ${hovered ? GOLD_BORDER : BORDER}`,
        borderRadius: "16px",
        padding: "28px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        transition: "border-color 0.2s",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {hovered && (
        <div aria-hidden style={{ position: "absolute", top: "-60px", right: "-60px", width: "180px", height: "180px", borderRadius: "50%", background: GOLD, opacity: 0.04, filter: "blur(50px)", pointerEvents: "none" }} />
      )}

      {/* Type badge + status */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "11px", fontWeight: 600, color: GOLD, background: "rgba(200,169,110,0.1)", border: `1px solid ${GOLD_BORDER}`, borderRadius: "6px", padding: "3px 10px", letterSpacing: "0.06em", textTransform: "uppercase" }}>
          {propertyTypeShort(listing.property_type)}
        </span>
        <span style={{ fontSize: "11px", fontWeight: 600, color: sc.color, background: sc.bg, border: `1px solid ${sc.border}`, borderRadius: "6px", padding: "3px 10px", letterSpacing: "0.04em" }}>
          {status}
        </span>
      </div>

      {/* Address */}
      <div>
        <p style={{ fontSize: "16px", fontWeight: 500, color: WARM_WHITE, margin: "0 0 4px", lineHeight: 1.3 }}>
          {listing.address}
        </p>
        <p style={{ fontSize: "13px", color: MUTED, margin: 0 }}>
          {listing.neighborhood ? `${listing.neighborhood}, ` : ""}{listing.city}
        </p>
      </div>

      {/* Price */}
      <p style={{ fontFamily: "var(--font-cormorant)", fontSize: "26px", fontWeight: 400, color: WARM_WHITE, margin: 0, letterSpacing: "-0.01em" }}>
        {formatPrice(listing.currency, listing.price)}
      </p>

      {/* Stats */}
      <div style={{ display: "flex", gap: "20px" }}>
        {listing.bedrooms != null && (
          <span style={{ fontSize: "13px", color: MUTED, display: "flex", alignItems: "center", gap: "5px" }}>
            🛏 {listing.bedrooms} bd
          </span>
        )}
        {listing.bathrooms != null && (
          <span style={{ fontSize: "13px", color: MUTED, display: "flex", alignItems: "center", gap: "5px" }}>
            🚿 {listing.bathrooms} ba
          </span>
        )}
        {listing.area != null && (
          <span style={{ fontSize: "13px", color: MUTED, display: "flex", alignItems: "center", gap: "5px" }}>
            ⊡ {listing.area.toLocaleString()} {listing.area_unit ?? "sqft"}
          </span>
        )}
      </div>

      <div style={{ height: "1px", background: BORDER }} />

      {/* Actions */}
      <div style={{ display: "flex", gap: "8px" }}>
        <Link
          href={`/dashboard/listings/${listing.id}/content`}
          style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "10px 16px", borderRadius: "100px", background: GOLD, color: BG, fontSize: "13px", fontWeight: 600, textDecoration: "none", transition: "opacity 0.15s" }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          View Content
        </Link>
        <Link
          href={`/dashboard/listings/${listing.id}/edit`}
          style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "10px 16px", borderRadius: "100px", border: `1px solid ${BORDER}`, color: MUTED, fontSize: "13px", textDecoration: "none", background: "transparent", transition: "color 0.15s, border-color 0.15s" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = WARM_WHITE; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = MUTED; e.currentTarget.style.borderColor = BORDER; }}
        >
          Edit
        </Link>
      </div>
    </div>
  );
}
