import React from "react";
import { LuX } from "react-icons/lu";

export default function Modal({ open, title, onClose, children, width = "max-w-md" }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade"
      onClick={onClose}
    >
      <div
        className={`card w-full ${width} max-h-[90vh] overflow-y-auto animate-pop shadow-2xl shadow-black/40`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="icon-btn" aria-label="Close">
            <LuX className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
