"use client";

import { useEffect, useRef, useState, forwardRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { motion } from "framer-motion";

// ─── Design tokens ───────────────────────────────────────────
const GOLD = "#C8A96E";
const BG = "#0A0A0A";
const WARM_WHITE = "#F0EDE6";
const MUTED = "#4A4540";

// ─── Data ────────────────────────────────────────────────────
const features = [
  {
    num: "01",
    title: "Cinematic Reels",
    desc: "Upload photos and clips. Get a pro-edited reel with motion, music, and your branding — in minutes.",
    detail: "Auto-paced cuts, licensed music library, and your logo watermark. Export at 9:16 for Reels or 16:9 for YouTube.",
  },
  {
    num: "02",
    title: "Voice Clone Narration",
    desc: "Record once. Listora clones your voice and narrates every video automatically.",
    detail: "Powered by ElevenLabs voice synthesis — sounds exactly like you — in any language, any market.",
  },
  {
    num: "03",
    title: "Shoot Guide",
    desc: "Before you film, Listora tells you exactly how to shoot each room for the best results.",
    detail: "Room-by-room angle recommendations, lighting tips, and shot checklists. Better input, better output.",
  },
  {
    num: "04",
    title: "AI Caption Engine",
    desc: "Paste listing details and get scroll-stopping captions in any language — written in your brand voice.",
    detail: "Platform-optimized for Instagram, Facebook, and WhatsApp. One click to regenerate.",
  },
  {
    num: "05",
    title: "Agent Portfolio",
    desc: "Every listing lives on your personal Listora page. Share one link for your entire portfolio.",
    detail: "Custom slug, branded design, mobile-optimized. Ready to drop in your bio link.",
  },
  {
    num: "06",
    title: "Branding Studio",
    desc: "Upload your logo, set your colors and tone. Every content piece reflects your brand automatically.",
    detail: "Persistent brand kit applied to all captions, reels, and portfolio pages without lifting a finger.",
  },
  {
    num: "07",
    title: "Auto Publishing",
    desc: "Connect Instagram, Facebook, and WhatsApp. Schedule your calendar and let Listora post for you.",
    detail: "Visual content calendar, best-time-to-post recommendations, and direct API publishing.",
  },
  {
    num: "08",
    title: "Lead Inbox",
    desc: "Every inquiry from your portfolio lands in one place — organized, tagged, and ready to act on.",
    detail: "Contact capture on every listing. CRM-ready export. Never lose a lead again.",
  },
];

const tickerItems = [
  "AI Caption Engine",
  "Cinematic Reels",
  "Agent Portfolio",
  "Shoot Guide",
  "Voice Clone",
  "Auto Publishing",
  "Multi-language",
  "Brand Voice",
  "Instagram & Facebook",
  "WhatsApp",
  "Portfolio Page",
  "Content Calendar",
  "AI Narration",
  "Market Analytics",
  "Lead Generation",
];

const allTickerItems = [...tickerItems, ...tickerItems];

// ─── Headline split helper ────────────────────────────────────
function SplitChars({
  text,
  gold = false,
  italic = false,
}: {
  text: string;
  gold?: boolean;
  italic?: boolean;
}) {
  return (
    <>
      {text.split("").map((char, i) => (
        <span
          key={i}
          className="hero-char"
          style={{
            display: "inline-block",
            color: gold ? GOLD : "inherit",
            fontStyle: italic ? "italic" : "normal",
          }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </>
  );
}

// ─── Feature card ────────────────────────────────────────────
const FeatureCard = forwardRef<
  HTMLDivElement,
  { num: string; title: string; desc: string; detail: string }
>(function FeatureCard({ num, title, desc, detail }, ref) {
  const [hovered, setHovered] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    setTilt({ x: dy * -5, y: dx * 5 });
  };

  const handleMouseLeave = () => {
    setHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  // merge forwarded ref + local ref
  const setRefs = (el: HTMLDivElement | null) => {
    (cardRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
    if (typeof ref === "function") ref(el);
    else if (ref) ref.current = el;
  };

  return (
    <div
      ref={setRefs}
      onMouseEnter={() => setHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        position: "relative",
        padding: "44px 40px",
        overflow: "hidden",
        cursor: "default",
        background: hovered ? "#181410" : "#111111",
        transform: hovered
          ? `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(-2px)`
          : "perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0px)",
        transition: "background 0.3s, transform 0.15s ease-out, box-shadow 0.3s",
        boxShadow: hovered ? "0 16px 48px rgba(0,0,0,0.4)" : "none",
        willChange: "transform",
      }}
    >
      {/* Gold number */}
      <div
        style={{
          fontSize: "11px",
          letterSpacing: "0.1em",
          color: GOLD,
          fontWeight: 600,
          marginBottom: "22px",
          opacity: 0.75,
        }}
      >
        {num}
      </div>

      {/* Title */}
      <h3
        style={{
          fontFamily: "var(--font-cormorant)",
          fontSize: "28px",
          fontWeight: 500,
          color: WARM_WHITE,
          marginBottom: "12px",
          letterSpacing: "-0.01em",
          lineHeight: 1.2,
        }}
      >
        {title}
      </h3>

      {/* Primary desc */}
      <p
        style={{
          fontSize: "15px",
          lineHeight: 1.65,
          color: MUTED,
          margin: 0,
        }}
      >
        {desc}
      </p>

      {/* Detail — slides up on hover */}
      <div
        style={{
          overflow: "hidden",
          maxHeight: hovered ? "80px" : "0px",
          opacity: hovered ? 1 : 0,
          marginTop: hovered ? "14px" : "0px",
          transition: "max-height 0.4s cubic-bezier(0.23,1,0.32,1), opacity 0.35s ease, margin-top 0.35s ease",
        }}
      >
        <p
          style={{
            fontSize: "13px",
            lineHeight: 1.6,
            color: "rgba(200,169,110,0.65)",
            margin: 0,
          }}
        >
          {detail}
        </p>
      </div>

      {/* Gold left border — scales in on hover */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: "2px",
          background: GOLD,
          transform: hovered ? "scaleY(1)" : "scaleY(0)",
          transformOrigin: "bottom",
          transition: "transform 0.45s cubic-bezier(0.23,1,0.32,1)",
        }}
      />
    </div>
  );
});

// ─── Page ────────────────────────────────────────────────────
export default function Home() {
  const heroRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subtextRef = useRef<HTMLParagraphElement>(null);
  const ctaGroupRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLSpanElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const featureCardsRef = useRef<(HTMLDivElement | null)[]>([]);

  console.log("gradients loaded");

  // Magnetic CTA state
  const magnetRef = useRef<HTMLDivElement>(null);
  const [magnetXY, setMagnetXY] = useState({ x: 0, y: 0 });

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

    // ── Initial states ──
    gsap.set(navRef.current, { opacity: 0, y: -16 });
    gsap.set(logoRef.current, { opacity: 0 });
    gsap.set(".hero-char", { opacity: 0, y: 48, rotateX: -35 });
    gsap.set(subtextRef.current, { opacity: 0, y: 24 });
    gsap.set(ctaGroupRef.current, { opacity: 0, y: 16, scale: 0.96 });

    // ── Intro choreography ──
    const tl = gsap.timeline({ delay: 0.15 });

    tl.to(navRef.current, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" })
      .to(logoRef.current, { opacity: 1, duration: 0.5, ease: "power3.out" }, "-=0.3")
      .to(".hero-char", {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: 0.65,
        stagger: 0.022,
        ease: "power3.out",
      }, "-=0.25")
      .to(subtextRef.current, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, "-=0.35")
      .to(ctaGroupRef.current, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.55,
        ease: "back.out(1.4)",
      }, "-=0.35");

    // ── Parallax on headline ──
    gsap.to(headlineRef.current, {
      y: -90,
      ease: "none",
      scrollTrigger: {
        trigger: heroRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });

    // ── Feature cards — scrubbed row reveal ──
    // Cards start with pointer-events disabled so moving cards can't
    // accidentally trigger onMouseEnter as they animate through the cursor.
    const cards = featureCardsRef.current.filter((c): c is HTMLDivElement => Boolean(c));
    gsap.set(cards, { opacity: 0, y: 60, pointerEvents: "none" });

    const rowConfig = [
      { start: "top 90%", end: "top 50%" },
      { start: "top 80%", end: "top 40%" },
      { start: "top 70%", end: "top 30%" },
      { start: "top 95%", end: "top 55%" },
    ];

    for (let i = 0; i < 4; i++) {
      const row = cards.slice(i * 2, i * 2 + 2);
      if (!row.length) continue;
      gsap.fromTo(
        row,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          ease: "none",
          scrollTrigger: {
            trigger: row[0],
            start: rowConfig[i].start,
            end: rowConfig[i].end,
            scrub: 1,
            // Re-enable pointer events only once the card is fully settled;
            // disable again immediately when scrolling back.
            onUpdate(self) {
              const interactive = self.progress >= 0.5;
              row.forEach(card => {
                card.style.pointerEvents = interactive ? "auto" : "none";
              });
            },
            onLeaveBack() {
              row.forEach(card => { card.style.pointerEvents = "none"; });
            },
          },
        }
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  // ── Smooth scroll to section ──
  const smoothScrollTo = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    gsap.to(window, { duration: 1.2, scrollTo: id, ease: "power2.inOut" });
  };

  // ── Magnetic button ──
  const handleMagnetMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = magnetRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    setMagnetXY({ x: (e.clientX - cx) * 0.28, y: (e.clientY - cy) * 0.28 });
  };

  const handleMagnetLeave = () => setMagnetXY({ x: 0, y: 0 });

  return (
    <main
      style={{
        background: BG,
        color: WARM_WHITE,
        overflowX: "hidden",
        fontFamily: "var(--font-dm-sans)",
      }}
    >
      {/* ══════════════════════════════════════════
          NAV
      ══════════════════════════════════════════ */}
      <nav
        ref={navRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          background: "rgba(10,10,10,0.75)",
          borderBottom: "1px solid rgba(200,169,110,0.08)",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "18px 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            ref={logoRef}
            style={{
              fontFamily: "var(--font-cormorant)",
              fontSize: "24px",
              fontWeight: 500,
              letterSpacing: "-0.01em",
              color: WARM_WHITE,
            }}
          >
            Listora
          </span>

          <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
            {["Features", "Pricing", "About"].map((link) => (
              <Link
                key={link}
                href={`#${link.toLowerCase()}`}
                className="nav-link"
                onClick={link === "Features" ? smoothScrollTo("#features") : undefined}
                style={{
                  fontSize: "14px",
                  color: MUTED,
                  textDecoration: "none",
                  transition: "color 0.2s",
                }}
              >
                {link}
              </Link>
            ))}
            <Link
              href="/login"
              className="nav-link"
              style={{
                fontSize: "14px",
                color: MUTED,
                textDecoration: "none",
                transition: "color 0.2s",
              }}
            >
              Log in
            </Link>
            <Link
              href="/signup"
              style={{
                fontSize: "14px",
                fontWeight: 500,
                color: BG,
                background: GOLD,
                padding: "9px 22px",
                borderRadius: "100px",
                textDecoration: "none",
                letterSpacing: "0.01em",
                transition: "opacity 0.2s",
              }}
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section
        ref={heroRef}
        style={{
          position: "relative",
          zIndex: 1,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "140px 32px 100px",
        }}
      >
        {/* ── Silk mesh background ── */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 0,
            pointerEvents: "none",
            overflow: "hidden",
            background: "#080808",
          }}
        >
          <div className="silk-1" />
          <div className="silk-2" />
          <div className="silk-3" />
          <div className="silk-4" />
          <div className="silk-5" />
          <div className="silk-6" />
          {/* Radial vignette overlay */}
          <div className="silk-vignette" />
        </div>

        {/* Hero content */}
        <div style={{ position: "relative", zIndex: 10, maxWidth: "920px", margin: "0 auto" }}>

          {/* Headline */}
          <h1
            ref={headlineRef}
            className="hero-headline"
            style={{
              fontFamily: "var(--font-cormorant)",
              fontSize: "clamp(54px, 8.5vw, 100px)",
              fontWeight: 400,
              lineHeight: 1.04,
              letterSpacing: "-0.025em",
              color: WARM_WHITE,
              marginBottom: "28px",
            }}
          >
            <span style={{ display: "block" }}>
              <SplitChars text="Your listings." />
            </span>
            <span style={{ display: "block" }}>
              <SplitChars text="Marketed" gold italic />
              <SplitChars text=" like a pro." />
            </span>
          </h1>

          {/* Subtext */}
          <p
            ref={subtextRef}
            style={{
              fontSize: "18px",
              lineHeight: 1.65,
              color: MUTED,
              maxWidth: "500px",
              margin: "0 auto 52px",
            }}
          >
            Listora turns your property info into stunning posts, cinematic
            reels, and a beautiful portfolio — in minutes, in any language.
          </p>

          {/* CTA group */}
          <div
            ref={ctaGroupRef}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "24px",
            }}
          >
            {/* Magnetic wrapper */}
            <div
              ref={magnetRef}
              onMouseMove={handleMagnetMove}
              onMouseLeave={handleMagnetLeave}
              style={{
                display: "inline-block",
                transform: `translate(${magnetXY.x}px, ${magnetXY.y}px)`,
                transition:
                  "transform 0.35s cubic-bezier(0.23, 1, 0.32, 1)",
              }}
            >
              <Link
                href="/signup"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: GOLD,
                  color: BG,
                  fontSize: "15px",
                  fontWeight: 600,
                  padding: "15px 34px",
                  borderRadius: "100px",
                  textDecoration: "none",
                  letterSpacing: "0.01em",
                  boxShadow: `0 0 40px rgba(200,169,110,0.25)`,
                  transition: "box-shadow 0.3s, opacity 0.2s",
                }}
              >
                Start for free
                <span style={{ fontSize: "16px", marginLeft: "2px" }}>→</span>
              </Link>
            </div>

            <Link
              href="#features"
              onClick={smoothScrollTo("#features")}
              className="nav-link"
              style={{
                fontSize: "14px",
                color: MUTED,
                textDecoration: "none",
                transition: "color 0.2s",
              }}
            >
              See how it works ↓
            </Link>
          </div>
        </div>

        {/* Scroll line */}
        <motion.div
          animate={{ scaleY: [1, 0.6, 1], opacity: [0.4, 0.2, 0.4] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
          style={{
            position: "absolute",
            bottom: "44px",
            left: "50%",
            translateX: "-50%",
            width: "1px",
            height: "52px",
            background: `linear-gradient(to bottom, ${GOLD}, transparent)`,
            transformOrigin: "top",
            zIndex: 10,
          }}
        />
      </section>

      {/* ══════════════════════════════════════════
          TICKER
      ══════════════════════════════════════════ */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          borderTop: "1px solid rgba(200,169,110,0.1)",
          borderBottom: "1px solid rgba(200,169,110,0.1)",
          padding: "14px 0",
          overflow: "hidden",
          background: "rgba(200,169,110,0.025)",
        }}
      >
        <div className="ticker-track">
          {allTickerItems.map((item, i) => (
            <span
              key={i}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "20px",
                marginRight: "20px",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontSize: "12px",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: MUTED,
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                }}
              >
                {item}
              </span>
              <span style={{ color: GOLD, opacity: 0.45, fontSize: "7px" }}>
                ◆
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          FEATURES
      ══════════════════════════════════════════ */}
      <section
        id="features"
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "120px 32px",
        }}
      >
        {/* Section header */}
        <div style={{ marginBottom: "72px", textAlign: "center" }}>
          <p
            style={{
              fontSize: "11px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: GOLD,
              marginBottom: "16px",
            }}
          >
            Everything you need
          </p>
          <h2
            style={{
              fontFamily: "var(--font-cormorant)",
              fontSize: "clamp(36px, 5vw, 62px)",
              fontWeight: 400,
              color: WARM_WHITE,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            Every tool a modern agent needs.
          </h2>
        </div>

        {/* 2×4 grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "1px",
            background: "rgba(255,255,255,0.05)",
          }}
        >
          {features.map((f, i) => (
            <FeatureCard
              key={i}
              ref={(el: HTMLDivElement | null) => { featureCardsRef.current[i] = el; }}
              num={f.num}
              title={f.title}
              desc={f.desc}
              detail={f.detail}
            />
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CTA
      ══════════════════════════════════════════ */}
      <section
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 32px 120px",
        }}
      >
        <div
          style={{
            background: "rgba(200,169,110,0.04)",
            border: "1px solid rgba(200,169,110,0.14)",
            borderRadius: "20px",
            padding: "100px 60px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Background glow */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: "-120px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "500px",
              height: "360px",
              background:
                "radial-gradient(ellipse, rgba(200,169,110,0.12) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          <p
            style={{
              fontSize: "11px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: GOLD,
              marginBottom: "24px",
            }}
          >
            Ready to begin
          </p>

          <h2
            style={{
              fontFamily: "var(--font-cormorant)",
              fontSize: "clamp(40px, 6vw, 76px)",
              fontWeight: 400,
              color: WARM_WHITE,
              lineHeight: 1.08,
              marginBottom: "20px",
              letterSpacing: "-0.025em",
              position: "relative",
            }}
          >
            Market smarter.
            <br />
            <em style={{ color: GOLD }}>Win more listings.</em>
          </h2>

          <p
            style={{
              fontSize: "16px",
              color: MUTED,
              maxWidth: "420px",
              margin: "0 auto 44px",
              lineHeight: 1.6,
              position: "relative",
            }}
          >
            Join agents already using Listora to stand out in every market.
          </p>

          <Link
            href="/signup"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: GOLD,
              color: BG,
              fontSize: "15px",
              fontWeight: 600,
              padding: "15px 38px",
              borderRadius: "100px",
              textDecoration: "none",
              letterSpacing: "0.01em",
              position: "relative",
              boxShadow: "0 0 40px rgba(200,169,110,0.2)",
              transition: "opacity 0.2s",
            }}
          >
            Get started free →
          </Link>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════ */}
      <footer
        style={{
          position: "relative",
          zIndex: 1,
          borderTop: "1px solid rgba(255,255,255,0.05)",
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "28px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: "20px",
            color: WARM_WHITE,
            fontWeight: 400,
          }}
        >
          Listora
        </span>

        <span style={{ fontSize: "13px", color: MUTED }}>
          © 2026 Listora · Built for real estate agents worldwide
        </span>

        <div style={{ display: "flex", gap: "24px" }}>
          {["Privacy", "Terms"].map((l) => (
            <Link
              key={l}
              href={`/${l.toLowerCase()}`}
              className="nav-link"
              style={{ fontSize: "13px", color: MUTED, textDecoration: "none", transition: "color 0.2s" }}
            >
              {l}
            </Link>
          ))}
        </div>
      </footer>
    </main>
  );
}
