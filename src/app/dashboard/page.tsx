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

interface Profile {
  full_name: string | null;
  brokerage: string | null;
  slug: string | null;
}

interface RecentListing {
  id: string;
  address: string;
  city: string;
  currency: string | null;
  price: string | number | null;
  status: string | null;
  property_type: string;
}

function formatPrice(currency: string | null, price: string | number | null): string {
  if (price == null || price === "") return "—";
  const num = typeof price === "number" ? price : parseFloat(String(price).replace(/,/g, ""));
  if (isNaN(num)) return String(price);
  return `${currency ?? ""} ${num.toLocaleString("en-US")}`.trim();
}

function statusColor(status: string | null) {
  if (status === "Sold") return "#6ABF6A";
  if (status === "Leased") return "#6EB3E0";
  return GOLD;
}

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [listingCount, setListingCount] = useState(0);
  const [contentCount, setContentCount] = useState(0);
  const [recentListings, setRecentListings] = useState<RecentListing[]>([]);
  const [copiedSlug, setCopiedSlug] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(async ({ data: { user }, error }) => {
      if (error || !user) { router.replace("/login"); return; }

      const [{ data: profileData }, { count: lCount }, { data: listingsData }] = await Promise.all([
        supabase.from("profiles").select("full_name, brokerage, slug").eq("id", user.id).maybeSingle(),
        supabase.from("listings").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("listings").select("id, address, city, currency, price, status, property_type").eq("user_id", user.id).order("created_at", { ascending: false }).limit(3),
      ]);

      setProfile(profileData ?? { full_name: null, brokerage: null, slug: null });
      setListingCount(lCount ?? 0);
      setRecentListings(listingsData ?? []);

      // Fetch content count using listing ids
      if (listingsData && listingsData.length > 0) {
        const ids = listingsData.map((l) => l.id);
        // Get all listings for content count (not just recent 3)
        const { data: allListings } = await supabase.from("listings").select("id").eq("user_id", user.id);
        if (allListings && allListings.length > 0) {
          const allIds = allListings.map((l) => l.id);
          const { count: cCount } = await supabase
            .from("listing_content")
            .select("id", { count: "exact", head: true })
            .in("listing_id", allIds);
          setContentCount(cCount ?? 0);
        }
        // suppress unused variable warning
        void ids;
      }

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

  const firstName = profile?.full_name?.split(" ")[0] ?? "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div style={{ minHeight: "100vh", background: BG, display: "flex", fontFamily: "var(--font-dm-sans)", color: WARM_WHITE }}>

      {/* Sidebar */}
      <aside style={{ width: "240px", flexShrink: 0, borderRight: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", padding: "28px 0", position: "sticky", top: 0, height: "100vh", overflow: "hidden" }}>
        <Link href="/" style={{ fontFamily: "var(--font-cormorant)", fontSize: "22px", fontWeight: 500, color: WARM_WHITE, textDecoration: "none", letterSpacing: "-0.01em", padding: "0 24px", marginBottom: "36px", display: "block" }}>
          Listora
        </Link>

        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2px", padding: "0 12px" }}>
          {NAV_LINKS.map((link) => {
            const active = link.href === "/dashboard";
            return (
              <Link key={link.href} href={link.href} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "10px", fontSize: "14px", fontWeight: active ? 500 : 400, color: active ? WARM_WHITE : MUTED, background: active ? "rgba(200,169,110,0.08)" : "transparent", textDecoration: "none", transition: "background 0.15s, color 0.15s" }}>
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
          <button onClick={handleSignOut} style={{ width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "10px", fontSize: "14px", color: MUTED, background: "transparent", border: "none", cursor: "pointer", fontFamily: "var(--font-dm-sans)", transition: "color 0.15s" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#E07070")} onMouseLeave={(e) => (e.currentTarget.style.color = MUTED)}>
            <span style={{ fontSize: "15px", opacity: 0.5 }}>⊗</span>
            Log out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: "48px 52px", maxWidth: "900px" }}>

        {/* Header */}
        <div style={{ marginBottom: "48px" }}>
          <p style={{ fontSize: "12px", color: MUTED, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>Dashboard</p>
          <h1 style={{ fontFamily: "var(--font-cormorant)", fontSize: "42px", fontWeight: 400, letterSpacing: "-0.02em", color: WARM_WHITE, margin: 0 }}>
            {greeting}, <em style={{ color: GOLD, fontStyle: "italic" }}>{firstName}.</em>
          </h1>
        </div>

        {/* Hero card */}
        {listingCount === 0 ? (
          /* Empty state — onboarding card */
          <div style={{ background: SURFACE, border: `1px solid ${GOLD_BORDER}`, borderRadius: "16px", padding: "48px 44px", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "20px", position: "relative", overflow: "hidden", marginBottom: "24px" }}>
            <div aria-hidden style={{ position: "absolute", top: "-80px", right: "-60px", width: "300px", height: "300px", borderRadius: "50%", background: GOLD, opacity: 0.05, filter: "blur(80px)", pointerEvents: "none" }} />
            <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(200,169,110,0.1)", border: "1px solid rgba(200,169,110,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>◈</div>
            <div>
              <h2 style={{ fontFamily: "var(--font-cormorant)", fontSize: "28px", fontWeight: 400, color: WARM_WHITE, margin: "0 0 8px", letterSpacing: "-0.01em" }}>
                Add your first listing
              </h2>
              <p style={{ fontSize: "15px", color: MUTED, lineHeight: 1.6, margin: 0, maxWidth: "460px" }}>
                Paste your property details and Listora will generate captions and a portfolio page — ready to share in minutes.
              </p>
            </div>
            <Link href="/dashboard/listings/new" style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: GOLD, color: BG, fontSize: "14px", fontWeight: 600, padding: "12px 28px", borderRadius: "100px", textDecoration: "none" }}>
              Create listing →
            </Link>
          </div>
        ) : (
          /* Has listings — new listing CTA */
          <div style={{ background: SURFACE, border: `1px solid ${GOLD_BORDER}`, borderRadius: "16px", padding: "48px 44px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "24px", position: "relative", overflow: "hidden", marginBottom: "24px", flexWrap: "wrap" }}>
            <div aria-hidden style={{ position: "absolute", top: "-80px", right: "-60px", width: "300px", height: "300px", borderRadius: "50%", background: GOLD, opacity: 0.04, filter: "blur(80px)", pointerEvents: "none" }} />
            <h2 style={{ fontFamily: "var(--font-cormorant)", fontSize: "32px", fontWeight: 400, color: WARM_WHITE, margin: 0, letterSpacing: "-0.01em" }}>
              Ready to list a new property?
            </h2>
            <Link href="/dashboard/listings/new" style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: GOLD, color: BG, fontSize: "14px", fontWeight: 600, padding: "12px 28px", borderRadius: "100px", textDecoration: "none", flexShrink: 0 }}>
              + New Listing
            </Link>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "40px" }}>
          <StatCard label="Listings" value={listingCount} />
          <StatCard label="Content pieces" value={contentCount} />
          <StatCard label="Portfolio views" value={0} />
        </div>

        {/* Recent listings */}
        {recentListings.length > 0 && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <p style={{ fontSize: "12px", color: MUTED, letterSpacing: "0.08em", textTransform: "uppercase", margin: 0 }}>Recent listings</p>
              <Link href="/dashboard/listings" style={{ fontSize: "13px", color: MUTED, textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.color = GOLD)} onMouseLeave={(e) => (e.currentTarget.style.color = MUTED)}>
                View all →
              </Link>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {recentListings.map((listing) => (
                <div key={listing.id} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: "12px", padding: "18px 22px", display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "14px", fontWeight: 500, color: WARM_WHITE, margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{listing.address}</p>
                    <p style={{ fontSize: "12px", color: MUTED, margin: 0 }}>{listing.city}</p>
                  </div>
                  <p style={{ fontFamily: "var(--font-cormorant)", fontSize: "20px", color: WARM_WHITE, margin: 0, whiteSpace: "nowrap" }}>
                    {formatPrice(listing.currency, listing.price)}
                  </p>
                  <span style={{ fontSize: "11px", fontWeight: 600, color: statusColor(listing.status), background: `${statusColor(listing.status)}15`, border: `1px solid ${statusColor(listing.status)}30`, borderRadius: "6px", padding: "3px 10px", whiteSpace: "nowrap" }}>
                    {listing.status ?? "Active"}
                  </span>
                  <Link href={`/dashboard/listings/${listing.id}/content`} style={{ fontSize: "13px", color: MUTED, textDecoration: "none", border: `1px solid ${BORDER}`, borderRadius: "100px", padding: "6px 16px", whiteSpace: "nowrap", transition: "color 0.15s, border-color 0.15s" }} onMouseEnter={(e) => { e.currentTarget.style.color = WARM_WHITE; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }} onMouseLeave={(e) => { e.currentTarget.style.color = MUTED; e.currentTarget.style.borderColor = BORDER; }}>
                    View
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Portfolio hint */}
        {profile?.slug && (
          <div style={{ marginTop: "32px", display: "flex", alignItems: "center", gap: "12px", background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: "12px", padding: "16px 20px" }}>
            <span style={{ fontSize: "13px", color: MUTED }}>Your portfolio:</span>
            <span style={{ fontSize: "13px", color: GOLD, fontWeight: 500 }}>listora.studio/{profile.slug}</span>
            <button onClick={() => { navigator.clipboard.writeText(`https://listora.studio/${profile!.slug}`); setCopiedSlug(true); setTimeout(() => setCopiedSlug(false), 2000); }} style={{ marginLeft: "auto", fontSize: "12px", color: copiedSlug ? "#6ABF6A" : MUTED, background: "none", border: `1px solid ${BORDER}`, borderRadius: "6px", padding: "4px 10px", cursor: "pointer", fontFamily: "var(--font-dm-sans)", transition: "color 0.2s" }}>
              {copiedSlug ? "✓ Copied" : "Copy"}
            </button>
          </div>
        )}

      </main>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: "12px", padding: "24px" }}>
      <p style={{ fontFamily: "var(--font-cormorant)", fontSize: "36px", fontWeight: 400, color: WARM_WHITE, margin: "0 0 4px" }}>
        {value}
      </p>
      <p style={{ fontSize: "13px", color: MUTED, margin: 0 }}>{label}</p>
    </div>
  );
}
