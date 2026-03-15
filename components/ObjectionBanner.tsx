"use client";

import { useEffect, useState } from "react";

export type BannerWord = "OBJECTION!" | "HOLD IT!" | "TAKE THAT!";
export type BannerSide = "prosecution" | "defense" | "evidence";

interface ObjectionBannerProps {
  word: BannerWord;
  side: BannerSide;
  visible: boolean;
}

const SIDE_STYLE: Record<BannerSide, {
  text: string;
  glow: string;
  flash: string;
  sub: string;
}> = {
  prosecution: {
    text:  "text-[#ff3b2f]",
    glow:  "drop-shadow-[0_0_32px_rgba(255,59,47,0.9)]",
    flash: "aa-flash-red",
    sub:   "text-red-300/70",
  },
  defense: {
    text:  "text-[#3b9eff]",
    glow:  "drop-shadow-[0_0_32px_rgba(59,158,255,0.9)]",
    flash: "aa-flash-blue",
    sub:   "text-blue-300/70",
  },
  evidence: {
    text:  "text-[#f5c518]",
    glow:  "drop-shadow-[0_0_32px_rgba(245,197,24,0.9)]",
    flash: "aa-flash-yellow",
    sub:   "text-yellow-300/70",
  },
};

function getSpeaker(side: BannerSide): string {
  if (side === "prosecution") return "PROSECUTION";
  if (side === "defense")     return "DEFENSE";
  return "COURT";
}

function getSubtitle(word: BannerWord, side: BannerSide): string {
  if (word === "TAKE THAT!") return side === "evidence" ? "— Evidence presented —" : `— ${getSpeaker(side)} presents evidence —`;
  if (word === "OBJECTION!") return `— ${getSpeaker(side)} objects —`;
  if (word === "HOLD IT!")   return `— ${getSpeaker(side)} raises a point —`;
  return "";
}

export default function ObjectionBanner({ word, side, visible }: ObjectionBannerProps) {
  const [mounted, setMounted] = useState(false);
  const [flashKey, setFlashKey] = useState(0);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      setFlashKey((k) => k + 1);
    } else {
      // Delay unmount to let exit animation play if desired
      const t = setTimeout(() => setMounted(false), 100);
      return () => clearTimeout(t);
    }
  }, [visible]);

  if (!mounted && !visible) return null;

  const style = SIDE_STYLE[side];

  return (
    <>
      {/* Full-screen colour wash */}
      <div
        key={`flash-${flashKey}`}
        className={`fixed inset-0 z-40 pointer-events-none ${
          side === "prosecution" ? "bg-red-600" :
          side === "defense" ? "bg-blue-600" : "bg-yellow-500"
        } ${style.flash}`}
      />

      {/* Banner overlay */}
      <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
        <div
          key={`banner-${flashKey}`}
          className={`aa-objection-banner flex flex-col items-center gap-2 select-none`}
        >
          {/* Speaker badge */}
          {side !== "evidence" && (
            <span
              className={`text-[11px] font-black tracking-[0.35em] px-3 py-0.5 rounded border ${
                side === "prosecution"
                  ? "text-red-300 border-red-500/50 bg-red-950/60"
                  : "text-blue-300 border-blue-500/50 bg-blue-950/60"
              }`}
              style={{ textShadow: "0 1px 4px rgba(0,0,0,0.9)" }}
            >
              {getSpeaker(side)}
            </span>
          )}

          {/* Main word */}
          <span
            className={`font-black tracking-tight leading-none ${style.text} ${style.glow}`}
            style={{
              fontSize: "clamp(64px, 10vw, 120px)",
              fontFamily: "'Impact', 'Arial Black', sans-serif",
              WebkitTextStroke: "2px rgba(0,0,0,0.5)",
              textShadow: `
                0 0 60px currentColor,
                0 0 20px currentColor,
                4px 4px 0 rgba(0,0,0,0.8)
              `,
              letterSpacing: "-0.02em",
            }}
          >
            {word}
          </span>

          {/* Subtitle */}
          <span
            className={`text-xs font-mono tracking-widest ${style.sub}`}
            style={{ textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}
          >
            {getSubtitle(word, side)}
          </span>
        </div>
      </div>
    </>
  );
}
