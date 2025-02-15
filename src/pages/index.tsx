"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const numbers = Array.from({ length: 37 }, (_, i) => i); // 0-36 roulette numbers

export default function Roulette() {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);

  const spinWheel = () => {
    if (spinning) return;
    setSpinning(true);
    const randomIndex = Math.floor(Math.random() * numbers.length);
    setTimeout(() => {
      setResult(numbers[randomIndex]);
      setSpinning(false);
    }, 3000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-4">Roulette</h1>
      <motion.div
        className="w-40 h-40 bg-red-500 rounded-full flex items-center justify-center text-2xl font-bold"
        animate={{ rotate: spinning ? 1440 : 0 }}
        transition={{ duration: 3, ease: "easeOut" }}
      >
        {spinning ? "🎡" : result !== null ? result : "🎰"}
      </motion.div>
      <button
        onClick={spinWheel}
        className="mt-6 px-4 py-2 bg-green-500 rounded text-white font-bold disabled:opacity-50"
        disabled={spinning}
      >
        {spinning ? "Spinning..." : "Spin"}
      </button>
    </div>
  );
}
