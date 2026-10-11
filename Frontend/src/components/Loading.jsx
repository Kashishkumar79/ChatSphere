import React from "react";
import { LuLoader } from "react-icons/lu";

export default function Loading({ text = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted">
      <LuLoader className="w-5 h-5 animate-spin text-brand-400" />
      <p className="text-xs">{text}</p>
    </div>
  );
}
