"use client";

import * as React from "react";
import Link from "next/link";
import { useRef } from "react";

type InfiniteTextMarqueeProps = {
  text?: string;
  link?: string;
  speed?: number;
  showTooltip?: boolean;
  tooltipText?: string;
  fontSize?: string;
  textColor?: string;
  hoverColor?: string;
};

export const InfiniteTextMarquee: React.FC<InfiniteTextMarqueeProps> = ({
  text = "Let’s get started",
  link = "/services",
  speed = 30,
  showTooltip = true,
  tooltipText = "Explore Kraftt",
  fontSize = "8rem",
  textColor = "",
  hoverColor = "",
}) => {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const maxRotation = 8;

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const tooltip = tooltipRef.current;
    if (!showTooltip || !tooltip) return;

    const midpoint = window.innerWidth / 2;
    const distanceFromMidpoint = Math.abs(event.clientX - midpoint);
    const nextRotation = (distanceFromMidpoint / midpoint) * maxRotation;
    const rotation = event.clientX > midpoint ? nextRotation : -nextRotation;
    tooltip.style.top = `${event.clientY}px`;
    tooltip.style.left = `${event.clientX}px`;
    tooltip.style.transform = `translate(-50%, -145%) rotate(${rotation}deg)`;
  };

  const repeatedText = Array(2).fill(text);
  const textStyle = {
    fontSize,
    color: textColor || undefined,
    "--marquee-hover": hoverColor || "var(--raw-umber)",
    "--marquee-font-size": fontSize,
    "--marquee-duration": `${speed}s`,
  } as React.CSSProperties;

  return (
    <>
      {showTooltip && (
        <div
          ref={tooltipRef}
          aria-hidden="true"
          className="following-tooltip"
        >
          {tooltipText}
        </div>
      )}

      <div className="infinite-text-marquee" onPointerMove={handlePointerMove}>
        <div
          className="infinite-text-marquee__track"
          onPointerEnter={() => tooltipRef.current?.classList.add("is-visible")}
          onPointerLeave={() => tooltipRef.current?.classList.remove("is-visible")}
        >
          {[0, 1].map((group) => (
            <Link
              className="infinite-text-marquee__group"
              href={link}
              aria-hidden={group === 1}
              tabIndex={group === 1 ? -1 : undefined}
              key={group}
              style={textStyle}
            >
              {repeatedText.map((item, index) => (
                <span key={`${group}-${index}`}>
                  {item}<b aria-hidden="true">✦</b>
                </span>
              ))}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};
