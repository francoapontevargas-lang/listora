"use client";

import Link from "next/link";

const GOLD = "#C8A96E";
const BG = "#080808";
const WARM_WHITE = "#F0EDE6";
const MUTED = "#4A4540";
const GOLD_BORDER = "rgba(200,169,110,0.15)";

export default function ConfirmedPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: BG,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-dm-sans)",
        color: WARM_WHITE,
        padding: "24px",
      }}
    >
      {/* Glow */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          top: "30%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: GOLD,
          opacity: 0.06,
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "32px",
          maxWidth: "420px",
          width: "100%",
          textAlign: "center",
          position: "relative",
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "50%",
            border: `1px solid ${GOLD_BORDER}`,
            background: "rgba(200,169,110,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "28px",
          }}
        >
          ✓
        </div>

        {/* Text */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <h1
            style={{
              fontFamily: "var(--font-cormorant)",
              fontSize: "40px",
              fontWeight: 400,
              letterSpacing: "-0.02em",
              color: WARM_WHITE,
              margin: 0,
            }}
          >
            Email confirmed.
          </h1>
          <p style={{ fontSize: "15px", color: MUTED, margin: 0, lineHeight: 1.6 }}>
            Your account is ready. Head to your dashboard to start creating listings.
          </p>
        </div>

        {/* CTA */}
        <Link
          href="/dashboard"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: GOLD,
            color: BG,
            fontSize: "14px",
            fontWeight: 600,
            padding: "14px 32px",
            borderRadius: "100px",
            textDecoration: "none",
          }}
        >
          Continue to dashboard →
        </Link>

        {/* Back to home */}
        <Link
          href="/"
          style={{ fontSize: "13px", color: MUTED, textDecoration: "none" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = WARM_WHITE)}
          onMouseLeave={(e) => (e.currentTarget.style.color = MUTED)}
        >
          Back to Listora
        </Link>
      </div>
    </div>
  );
}
