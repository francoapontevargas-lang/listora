"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const GOLD = "#C8A96E";
const BG = "#080808";
const WARM_WHITE = "#F0EDE6";
const MUTED = "#4A4540";
const BORDER = "rgba(200,169,110,0.15)";

export default function OnboardingPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [brokerage, setBrokerage] = useState("");
  const [slug, setSlug] = useState("");
  const [language, setLanguage] = useState("english");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Guard: redirect to login if no session
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.replace("/login");
      } else {
        setUserId(data.session.user.id);
        const name = data.session.user.user_metadata?.full_name ?? "";
        if (name) setFullName(name);
      }
    });
  }, [router]);

  // Auto-generate slug from full name
  const handleNameChange = (v: string) => {
    setFullName(v);
    if (!slug || slug === toSlug(fullName)) {
      setSlug(toSlug(v));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!userId) return;
    if (!slug.match(/^[a-z0-9-]+$/)) {
      setError("Portfolio URL can only contain lowercase letters, numbers, and hyphens.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: dbError } = await supabase.from("profiles").upsert({
      id: userId,
      full_name: fullName,
      phone,
      brokerage,
      slug,
      language,
      updated_at: new Date().toISOString(),
    });
    setLoading(false);

    if (dbError) {
      setError(dbError.message);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: BG,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 24px",
        fontFamily: "var(--font-dm-sans)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Orbs */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "-80px",
          right: "-60px",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: GOLD,
          opacity: 0.06,
          filter: "blur(120px)",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: "-80px",
          left: "-60px",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "#1A3A4A",
          opacity: 0.08,
          filter: "blur(100px)",
          pointerEvents: "none",
        }}
      />

      <div style={{ width: "100%", maxWidth: "520px", position: "relative" }}>
        {/* Logo */}
        <Link
          href="/"
          style={{
            display: "block",
            textAlign: "center",
            marginBottom: "48px",
            fontFamily: "var(--font-cormorant)",
            fontSize: "26px",
            fontWeight: 500,
            color: WARM_WHITE,
            textDecoration: "none",
            letterSpacing: "-0.01em",
          }}
        >
          Listora
        </Link>

        {/* Progress indicator */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            marginBottom: "32px",
          }}
        >
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              style={{
                width: n === 2 ? "24px" : "6px",
                height: "6px",
                borderRadius: "100px",
                background: n === 2 ? GOLD : "rgba(200,169,110,0.25)",
                transition: "all 0.3s",
              }}
            />
          ))}
        </div>

        {/* Card */}
        <div
          style={{
            background: "rgba(255,255,255,0.025)",
            border: `1px solid ${BORDER}`,
            borderRadius: "16px",
            padding: "44px 40px",
          }}
        >
          <h1
            style={{
              fontFamily: "var(--font-cormorant)",
              fontSize: "34px",
              fontWeight: 400,
              color: WARM_WHITE,
              letterSpacing: "-0.02em",
              marginBottom: "8px",
            }}
          >
            Set up your profile
          </h1>
          <p style={{ fontSize: "14px", color: MUTED, marginBottom: "36px" }}>
            This takes 60 seconds. You can always edit later.
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <Field
              label="Full name"
              type="text"
              value={fullName}
              onChange={handleNameChange}
              placeholder="Maria Garcia"
              required
            />
            <Field
              label="Phone number"
              type="tel"
              value={phone}
              onChange={setPhone}
              placeholder="+1 (555) 000-0000"
            />
            <Field
              label="Brokerage name"
              type="text"
              value={brokerage}
              onChange={setBrokerage}
              placeholder="Keller Williams Miami"
            />

            {/* Slug field with preview */}
            <label style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <span style={{ fontSize: "12px", color: "#9A9490", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Portfolio URL
              </span>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(200,169,110,0.15)",
                  borderRadius: "10px",
                  overflow: "hidden",
                }}
              >
                <span
                  style={{
                    padding: "12px 14px",
                    fontSize: "13px",
                    color: MUTED,
                    borderRight: "1px solid rgba(200,169,110,0.1)",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  listora.studio/
                </span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  placeholder="maria-realty"
                  required
                  style={{
                    flex: 1,
                    background: "transparent",
                    border: "none",
                    padding: "12px 14px",
                    fontSize: "15px",
                    color: WARM_WHITE,
                    outline: "none",
                    fontFamily: "var(--font-dm-sans)",
                    minWidth: 0,
                  }}
                />
              </div>
              <span style={{ fontSize: "12px", color: MUTED }}>
                Your public portfolio will live at this URL.
              </span>
            </label>

            {/* Language dropdown */}
            <label style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <span style={{ fontSize: "12px", color: "#9A9490", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Language preference
              </span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(200,169,110,0.15)",
                  borderRadius: "10px",
                  padding: "12px 16px",
                  fontSize: "15px",
                  color: WARM_WHITE,
                  outline: "none",
                  fontFamily: "var(--font-dm-sans)",
                  cursor: "pointer",
                  appearance: "none",
                  WebkitAppearance: "none",
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%234A4540' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 16px center",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(200,169,110,0.5)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(200,169,110,0.15)")}
              >
                <option value="english" style={{ background: "#1A1A1A" }}>English</option>
                <option value="spanish" style={{ background: "#1A1A1A" }}>Spanish</option>
                <option value="both" style={{ background: "#1A1A1A" }}>Both (English & Spanish)</option>
              </select>
            </label>

            {error && (
              <p
                style={{
                  fontSize: "13px",
                  color: "#E07070",
                  background: "rgba(224,112,112,0.08)",
                  border: "1px solid rgba(224,112,112,0.2)",
                  borderRadius: "8px",
                  padding: "10px 14px",
                }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                background: loading ? "rgba(200,169,110,0.5)" : GOLD,
                color: BG,
                fontSize: "15px",
                fontWeight: 600,
                padding: "14px",
                borderRadius: "100px",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                letterSpacing: "0.01em",
                transition: "opacity 0.2s",
                marginTop: "4px",
              }}
            >
              {loading ? "Saving…" : "Go to dashboard →"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

function toSlug(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function Field({
  label,
  type,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <span style={{ fontSize: "12px", color: "#9A9490", letterSpacing: "0.06em", textTransform: "uppercase" }}>
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(200,169,110,0.15)",
          borderRadius: "10px",
          padding: "12px 16px",
          fontSize: "15px",
          color: "#F0EDE6",
          outline: "none",
          transition: "border-color 0.2s",
          fontFamily: "var(--font-dm-sans)",
          width: "100%",
          boxSizing: "border-box",
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(200,169,110,0.5)")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(200,169,110,0.15)")}
      />
    </label>
  );
}
