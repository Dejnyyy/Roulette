// components/ui/Button.tsx
"use client";

import { ReactNode } from "react";

interface ButtonProps {
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
}

export default function Button({ onClick, disabled, children, className }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded text-white font-bold transition-all duration-200 ${
        disabled ? "bg-gray-500 cursor-not-allowed" : "bg-gradient-to-tr from-yellow-500 to-purple-500 hover:from-yellow-600 hover:to-purple-600"
      } ${className}`}
    >
      {children}
    </button>
  );
}
