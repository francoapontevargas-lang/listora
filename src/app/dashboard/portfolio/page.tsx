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
  phone: string | null;
}

export default function PortfolioDashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [listingCount, setListingCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user }, error }) => {
      if (error || !user) { router.replace("/login"); return; }

      const [{ data: profileData }, { count }] = await Promise.all([
        supabase.from("profiles").select("full_name, brokerage, slug, phone").eq("id", user.id).maybeSingle(),
        supabase.from("listings").select("id", { count: "exact", head: true }).eq("user_id", user.id).or("status.eq.Active,status.is.null"),
      ]);

      setProfile(profileData ?? null);
      setListingCount(count ?? 0);
      setLoading(false);
    });
  }, [router]);

  const handleSignOut = async () => {
    await createClient().auth.signOut();
    router.push("/");
  };

  const portfolioUrl = profile?.slug ? `https://listora.studio/${profile.slug}` : null;

  const handleCopy = () => {
    if (!portfolioUrl) return;
    navigator.clipboard.writeText(portfolioUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
            const active = link.href === "/dashboard/portfolio";
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
      <main style={{ flex: 1, padding: "48px 52px", maxWidth: "800px" }}>

        {/* Header */}
        <div style={{ marginBottom: "48px" }}>
          <p style={{ fontSize: "12px", color: MUTED, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>Portfolio</p>
          <h1 style={{ fontFamily: "var(--font-cormorant)", fontSize: "42px", fontWeight: 400, letterSpacing: "-0.02em", color: WARM_WHITE, margin: 0 }}>
            Your public page.
          </h1>
        </div>

        {/* Portfolio URL card */}
        <div style={{ background: SURFACE, border: `1px solid ${GOLD_BORDER}`, borderRadius: "16px", padding: "36px", marginBottom: "24px", position: "relative", overflow: "hidden" }}>
          <div aria-hidden style={{ position: "absolute", top: "-40px", right: "-40px", width: "200px", height: "200px", borderRadius: "50%", background: GOLD, opacity: 0.04, filter: "blur(60px)", pointerEvents: "none" }} />

          <p style={{ fontSize: "12px", color: GOLD, letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 16px" }}>Your portfolio URL</p>

          {portfolioUrl ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
                <span style={{ fontFamily: "var(--font-cormorant)", fontSize: "26px", color: WARM_WHITE, letterSpacing: "-0.01em" }}>
                  listora.studio/{profile!.slug}
                </span>
              </div>

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button
                  onClick={handleCopy}
                  style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: GOLD, color: BG, fontSize: "13px", fontWeight: 600, padding: "11px 22px", borderRadius: "100px", border: "none", cursor: "pointer", fontFamily: "var(--font-dm-sans)", transition: "opacity 0.2s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  {copied ? "✓ Copied!" : "⊡ Copy link"}
                </button>

                <a
                  href={portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "11px 22px", borderRadius: "100px", border: `1px solid ${BORDER}`, color: MUTED, fontSize: "13px", textDecoration: "none", background: "transparent", transition: "color 0.15s, border-color 0.15s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = WARM_WHITE; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = MUTED; e.currentTarget.style.borderColor = BORDER; }}
                >
                  ↗ Preview
                </a>
              </div>
            </>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <p style={{ fontSize: "15px", color: MUTED, margin: 0 }}>You haven't set a portfolio URL yet.</p>
              <Link href="/dashboard/settings" style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: GOLD, color: BG, fontSize: "13px", fontWeight: 600, padding: "11px 22px", borderRadius: "100px", textDecoration: "none", width: "fit-content" }}>
                Set it up →
              </Link>
            </div>
          )}
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px", marginBottom: "24px" }}>
          <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: "16px", padding: "28px" }}>
            <p style={{ fontSize: "12px", color: MUTED, letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 12px" }}>Active listings</p>
            <p style={{ fontFamily: "var(--font-cormorant)", fontSize: "42px", fontWeight: 400, color: WARM_WHITE, margin: 0 }}>{listingCount}</p>
          </div>
          <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: "16px", padding: "28px" }}>
            <p style={{ fontSize: "12px", color: MUTED, letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 12px" }}>Showing on portfolio</p>
            <p style={{ fontFamily: "var(--font-cormorant)", fontSize: "42px", fontWeight: 400, color: WARM_WHITE, margin: 0 }}>{listingCount}</p>
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: "16px", padding: "28px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <p style={{ fontSize: "15px", color: WARM_WHITE, fontWeight: 500, margin: "0 0 4px" }}>Add a listing to your portfolio</p>
            <p style={{ fontSize: "13px", color: MUTED, margin: 0 }}>Active listings appear automatically on your public page.</p>
          </div>
          <Link
            href="/dashboard/listings/new"
            style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "transparent", border: `1px solid ${BORDER}`, color: MUTED, fontSize: "13px", padding: "11px 22px", borderRadius: "100px", textDecoration: "none", transition: "color 0.15s, border-color 0.15s", flexShrink: 0 }}
            onMouseEnter={(e) => { e.currentTarget.style.color = WARM_WHITE; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = MUTED; e.currentTarget.style.borderColor = BORDER; }}
          >
            + New listing
          </Link>
        </div>

      </main>
    </div>
  );
}
