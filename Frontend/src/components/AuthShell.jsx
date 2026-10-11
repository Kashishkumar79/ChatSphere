import React from "react";
import { LuMessageCircle } from "react-icons/lu";

// Login / Signup ka common layout.
// Orbs ek clipped wrapper (overflow-hidden) ke andar hain, isliye page par scroll nahi banate.
export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="fixed inset-0 overflow-y-auto overflow-x-hidden bg-bg">
      {/* Background decoration (clipped) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-brand-600/20 blur-3xl" />
        <div className="absolute -bottom-24 -right-20 w-72 h-72 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="relative min-h-full w-full flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-[360px] animate-fade">
          <div className="flex flex-col items-center mb-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br from-brand-600 to-accent shadow-lg shadow-brand-600/30">
              <LuMessageCircle className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold gradient-text mt-3">ChatSphere</h1>
          </div>

          <div className="card !p-5 sm:!p-6 shadow-2xl shadow-black/40">
            <h2 className="text-lg font-semibold">{title}</h2>
            {subtitle && <p className="text-xs text-muted mt-0.5 mb-4">{subtitle}</p>}
            {!subtitle && <div className="mb-4" />}
            {children}
          </div>

          {footer && <div className="text-center text-xs text-muted mt-4">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
