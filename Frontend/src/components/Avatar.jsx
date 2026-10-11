import React from "react";

const palette = ["#2563eb", "#0891b2", "#7c3aed", "#059669", "#d97706", "#e11d48"];

export const initialsOf = (name = "") =>
  name.trim().split(/\s+/).filter(Boolean).map((p) => p[0]).join("").slice(0, 2).toUpperCase() || "?";

export default function Avatar({ name = "", id = "", size = 40, online = false, square = false }) {
  const color = palette[String(id || name).charCodeAt(0) % palette.length] || palette[0];
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div
        className={`w-full h-full flex items-center justify-center font-semibold text-white ${
          square ? "rounded-xl" : "rounded-full"
        }`}
        style={{ background: `linear-gradient(135deg, ${color}, #0f172a)`, fontSize: size * 0.36 }}
      >
        {initialsOf(name)}
      </div>
      {online && (
        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-surface" />
      )}
    </div>
  );
}
