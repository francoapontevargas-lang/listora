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

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
      },
    });
    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    router.push("/onboarding");
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
          top: "-120px",
          right: "-80px",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: GOLD,
          opacity: 0.06,
          filter: "blur(120px)",
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
            Join Listora
          </h1>
          <p style={{ fontSize: "14px", color: MUTED, marginBottom: "36px" }}>
            Create your agent account in seconds.
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
              placeholder="8+ characters"
              required
            />
            <Field
              label="Confirm password"
              type="password"
              value={confirm}
              onChange={setConfirm}
              placeholder="Repeat password"
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
              {loading ? "Creating account…" : "Create account"}
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
          Already have an account?{" "}
          <Link href="/login" style={{ color: GOLD, textDecoration: "none" }}>
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}

// ─── Shared field component ───────────────────────────────────
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
