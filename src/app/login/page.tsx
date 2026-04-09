"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const GOLD = "#C8A96E";
const BG = "#080808";
const WARM_WHITE = "#F0EDE6";
const MUTED = "#4A4540";
const BORDER = "rgba(200,169,110,0.15)";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (authError) {
      setError(authError.message);
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
      {/* Background orb */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: "-100px",
          left: "-80px",
          width: "480px",
          height: "480px",
          borderRadius: "50%",
          background: "#7B2D3E",
          opacity: 0.07,
          filter: "blur(110px)",
          pointerEvents: "none",
        }}
      />

      <div style={{ width: "100%", maxWidth: "440px", position: "relative" }}>
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
              fontSize: "36px",
              fontWeight: 400,
              color: WARM_WHITE,
              letterSpacing: "-0.02em",
              marginBottom: "8px",
            }}
          >
            Welcome back
          </h1>
          <p style={{ fontSize: "14px", color: MUTED, marginBottom: "36px" }}>
            Sign in to your Listora account.
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <Field
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="you@agency.com"
              required
            />
            <Field
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="Your password"
              required
            />

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
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        <p
          style={{
            textAlign: "center",
            fontSize: "14px",
            color: MUTED,
            marginTop: "24px",
          }}
        >
          Don&apos;t have an account?{" "}
          <Link href="/signup" style={{ color: GOLD, textDecoration: "none" }}>
            Sign up free
          </Link>
        </p>
      </div>
    </main>
  );
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
