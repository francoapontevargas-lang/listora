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

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState("/dashboard");

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        router.replace("/login");
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, brokerage, slug")
        .eq("id", data.session.user.id)
        .single();

      setProfile(
        profileData ?? {
          full_name: data.session.user.user_metadata?.full_name ?? null,
          brokerage: null,
          slug: null,
        }
      );
      setLoading(false);
    });
  }, [router]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: BG,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--font-dm-sans)",
        }}
      >
        <div style={{ width: "32px", height: "32px", border: `2px solid ${GOLD}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const firstName = profile?.full_name?.split(" ")[0] ?? "Agent";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: BG,
        display: "flex",
        fontFamily: "var(--font-dm-sans)",
        color: WARM_WHITE,
      }}
    >
      {/* ── Sidebar ── */}
      <aside
        style={{
          width: "240px",
          flexShrink: 0,
          borderRight: `1px solid ${BORDER}`,
          display: "flex",
          flexDirection: "column",
          padding: "28px 0",
          position: "sticky",
          top: 0,
          height: "100vh",
          overflow: "hidden",
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: "22px",
            fontWeight: 500,
            color: WARM_WHITE,
            textDecoration: "none",
            letterSpacing: "-0.01em",
            padding: "0 24px",
            marginBottom: "36px",
            display: "block",
          }}
        >
          Listora
        </Link>

        {/* Nav links */}
        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2px", padding: "0 12px" }}>
          {NAV_LINKS.map((link) => {
            const active = activeNav === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setActiveNav(link.href)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: active ? 500 : 400,
                  color: active ? WARM_WHITE : MUTED,
                  background: active ? "rgba(200,169,110,0.08)" : "transparent",
                  textDecoration: "none",
                  transition: "background 0.15s, color 0.15s",
                }}
              >
                <span style={{ fontSize: "15px", opacity: active ? 1 : 0.5 }}>{link.icon}</span>
                {link.label}
                {active && (
                  <span
                    style={{
                      marginLeft: "auto",
                      width: "4px",
                      height: "4px",
                      borderRadius: "50%",
                      background: GOLD,
                    }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Profile + sign out */}
        <div style={{ padding: "16px 12px 0", borderTop: `1px solid ${BORDER}` }}>
          {profile?.full_name && (
            <div
              style={{
                padding: "10px 14px",
                marginBottom: "4px",
              }}
            >
              <p style={{ fontSize: "13px", fontWeight: 500, color: WARM_WHITE, margin: 0 }}>
                {profile.full_name}
              </p>
              {profile.brokerage && (
                <p style={{ fontSize: "12px", color: MUTED, margin: "2px 0 0" }}>{profile.brokerage}</p>
              )}
            </div>
          )}
          <button
            onClick={handleSignOut}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 14px",
              borderRadius: "10px",
              fontSize: "14px",
              color: MUTED,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              textAlign: "left",
              transition: "color 0.15s",
              fontFamily: "var(--font-dm-sans)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#E07070")}
            onMouseLeave={(e) => (e.currentTarget.style.color = MUTED)}
          >
            <span style={{ fontSize: "15px", opacity: 0.5 }}>⊗</span>
            Log out
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main style={{ flex: 1, padding: "48px 52px", maxWidth: "900px" }}>

        {/* Header */}
        <div style={{ marginBottom: "52px" }}>
          <p style={{ fontSize: "12px", color: MUTED, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>
            Dashboard
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
            Good morning, <em style={{ color: GOLD, fontStyle: "italic" }}>{firstName}.</em>
          </h1>
        </div>

        {/* First listing prompt card */}
        <div
          style={{
            background: SURFACE,
            border: `1px solid rgba(200,169,110,0.12)`,
            borderRadius: "16px",
            padding: "48px 44px",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: "20px",
            position: "relative",
            overflow: "hidden",
            marginBottom: "32px",
          }}
        >
          {/* Subtle glow */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: "-80px",
              right: "-60px",
              width: "300px",
              height: "300px",
              borderRadius: "50%",
              background: GOLD,
              opacity: 0.05,
              filter: "blur(80px)",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "rgba(200,169,110,0.1)",
              border: "1px solid rgba(200,169,110,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "22px",
            }}
          >
            ◈
          </div>

          <div>
            <h2
              style={{
                fontFamily: "var(--font-cormorant)",
                fontSize: "28px",
                fontWeight: 400,
                color: WARM_WHITE,
                margin: "0 0 8px",
                letterSpacing: "-0.01em",
              }}
            >
              Add your first listing
            </h2>
            <p style={{ fontSize: "15px", color: MUTED, lineHeight: 1.6, margin: 0, maxWidth: "460px" }}>
              Paste your property details and Listora will generate captions,
              reels, and a portfolio page — ready to share in minutes.
            </p>
          </div>

          <Link
            href="/dashboard/listings/new"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: GOLD,
              color: BG,
              fontSize: "14px",
              fontWeight: 600,
              padding: "12px 28px",
              borderRadius: "100px",
              textDecoration: "none",
              letterSpacing: "0.01em",
              position: "relative",
            }}
          >
            Create listing →
          </Link>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
          {[
            { label: "Listings", value: "0" },
            { label: "Portfolio views", value: "0" },
            { label: "Content pieces", value: "0" },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: SURFACE,
                border: `1px solid ${BORDER}`,
                borderRadius: "12px",
                padding: "24px",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-cormorant)",
                  fontSize: "36px",
                  fontWeight: 400,
                  color: WARM_WHITE,
                  margin: "0 0 4px",
                }}
              >
                {stat.value}
              </p>
              <p style={{ fontSize: "13px", color: MUTED, margin: 0 }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Portfolio link hint */}
        {profile?.slug && (
          <div
            style={{
              marginTop: "32px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              background: SURFACE,
              border: `1px solid ${BORDER}`,
              borderRadius: "12px",
              padding: "16px 20px",
            }}
          >
            <span style={{ fontSize: "13px", color: MUTED }}>Your portfolio:</span>
            <span
              style={{
                fontSize: "13px",
                color: GOLD,
                fontWeight: 500,
              }}
            >
              listora.studio/{profile.slug}
            </span>
            <span
              style={{
                marginLeft: "auto",
                fontSize: "12px",
                color: MUTED,
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${BORDER}`,
                borderRadius: "6px",
                padding: "4px 10px",
                cursor: "pointer",
              }}
              onClick={() => navigator.clipboard.writeText(`https://listora.studio/${profile?.slug}`)}
            >
              Copy
            </span>
          </div>
        )}
      </main>
    </div>
  );
}
