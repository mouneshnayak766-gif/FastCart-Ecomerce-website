import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

const SLIDES = [
  {
    image:    "/images/banner1.jpg",
    titleKey: "bannerLine1",
    subtitleKey: "bannerLine2",
    navTo:    "/category/electronics",
  },
  {
    image:    "/images/banner2.jpg",
    titleKey: "bannerLine1",
    subtitleKey: "bannerLine2",
    navTo:    "/category/fashion",
  },
  {
    image:    "/images/banner3.jpg",
    titleKey: "bannerLine1",
    subtitleKey: "bannerLine2",
    navTo:    "/category/mobile",
  },
  {
    image:    "/images/banner4.jpg",
    titleKey: "bannerLine1",
    subtitleKey: "bannerLine2",
    navTo:    "/",
  },
  {
    image:    "/images/banner5.jpg",
    titleKey: "bannerLine1",
    subtitleKey: "bannerLine2",
    navTo:    "/",
  },
];

export default function Banner() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [fading, setFading] = useState(false);
  const intervalRef = useRef(null);

  const startTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 3500);
  };

  useEffect(() => {
    startTimer();
    return () => clearInterval(intervalRef.current);
  }, []);

  const go = (idx) => {
    if (idx === current) return;
    setFading(true);
    setTimeout(() => {
      setCurrent(idx);
      setFading(false);
      startTimer();
    }, 400);
  };

  const slide = SLIDES[current];

  return (
    <div
      className="relative w-full mt-4 rounded-xl shadow-lg bg-black"
      style={{
        height: "clamp(180px, 30vw, 360px)",
        overflow: "hidden",   /* clips all children — the real fix */
        isolation: "isolate", /* new stacking context, nothing bleeds out */
      }}
    >

      {/* ── Background images ─────────────────────────────────────────────
           Every image sits at position:absolute inset-0 so it fills
           exactly the container — NOT the viewport or the page.
           Only the active one is visible; others have opacity:0 and
           pointer-events:none so they don't intercept clicks.
      ──────────────────────────────────────────────────────────────────── */}
      {SLIDES.map((s, i) => (
        <img
          key={i}
          src={s.image}
          alt=""
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center center",
            opacity: i === current ? 1 : 0,
            transition: "opacity 600ms ease",
            pointerEvents: "none",
            display: "block",
          }}
        />
      ))}

      {/* ── Dark gradient left→right so text is always readable ──────────
           Written as inline style so it never gets purged by Tailwind JIT.
      ──────────────────────────────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to right, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.52) 45%, rgba(0,0,0,0.08) 100%)",
          opacity: fading ? 0 : 1,
          transition: "opacity 400ms ease",
        }}
      />

      {/* ── Text + CTA ───────────────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 clamp(20px, 5vw, 56px)",
          opacity: fading ? 0 : 1,
          transition: "opacity 400ms ease",
        }}
      >
        {/* Eyebrow badge */}
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            background: "#FACC15",
            color: "#000",
            fontSize: "clamp(9px, 1.1vw, 12px)",
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            padding: "3px 12px",
            borderRadius: 999,
            width: "fit-content",
            marginBottom: "clamp(6px, 1.2vw, 14px)",
          }}
        >
          🔥 Limited Offer
        </span>

        {/* Headline — max 52% width so product image stays visible */}
        <h2
          style={{
            fontSize: "clamp(18px, 3.2vw, 46px)",
            fontWeight: 900,
            color: "#fff",
            lineHeight: 1.15,
            maxWidth: "52%",
            textShadow: "0 2px 8px rgba(0,0,0,0.4)",
            margin: 0,
          }}
        >
          {t.bannerLine1}
          <br />
          <span style={{ color: "#FACC15" }}>{t.bannerLine2}</span>
        </h2>

        {/* Subtitle */}
        <p
          style={{
            color: "rgba(255,255,255,0.78)",
            fontSize: "clamp(10px, 1.2vw, 14px)",
            marginTop: "clamp(4px, 0.8vw, 10px)",
            maxWidth: "46%",
            lineHeight: 1.4,
          }}
        >
          {t.bannerSub}
        </p>

        {/* CTA button */}
        <button
          onClick={() => navigate(slide.navTo)}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#FACC15";
            e.currentTarget.style.color = "#000";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#fff";
            e.currentTarget.style.color = "#1e3a8a";
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.96)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
          style={{
            marginTop: "clamp(10px, 1.8vw, 22px)",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "#fff",
            color: "#1e3a8a",
            fontWeight: 700,
            fontSize: "clamp(11px, 1.1vw, 14px)",
            padding: "clamp(7px, 1vw, 10px) clamp(14px, 2vw, 24px)",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
            width: "fit-content",
            transition: "background 200ms, color 200ms, transform 100ms",
          }}
        >
          {t.shopNow}
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2.5 7H11.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M7.5 3L11.5 7L7.5 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* ── Dot indicators ───────────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          bottom: 12,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 6,
          zIndex: 10,
        }}
      >
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            aria-label={`Go to slide ${i + 1}`}
            style={{
              height: 6,
              width: i === current ? 24 : 6,
              borderRadius: 999,
              background: i === current ? "#fff" : "rgba(255,255,255,0.4)",
              border: "none",
              padding: 0,
              cursor: "pointer",
              transition: "width 300ms ease, background 300ms ease",
            }}
          />
        ))}
      </div>
    </div>
  );
}
