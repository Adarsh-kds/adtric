"use client";

import { useEffect, useState } from "react";

// Sticky bottom bar on phones. It steps aside when the enquiry form or footer is on screen.
export default function MobileEnquireBar({ price, name }) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const targets = [document.getElementById("enquiry"), document.querySelector("footer")].filter(Boolean);
    if (targets.length === 0 || !("IntersectionObserver" in window)) return;
    const visible = new Set();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) visible.add(entry.target);
        else visible.delete(entry.target);
      });
      setHidden(visible.size > 0);
    });
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#1f1f21]/70 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] pt-3 backdrop-blur-xl transition-transform duration-300 md:hidden ${
        hidden ? "translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-[11px] uppercase tracking-[0.18em] text-muted">{name}</p>
          <p className="heading mt-0.5 text-[24px]">{price}</p>
        </div>
        <a href="#enquiry" className="btn btn-white shrink-0">
          Enquire now
        </a>
      </div>
    </div>
  );
}
