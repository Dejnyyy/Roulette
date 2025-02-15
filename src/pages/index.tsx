"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Button from "./components/button";

const numbers = Array.from({ length: 37 }, (_, i) => i); // European roulette (0-36)

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

  // Determine color based on the roulette number
  const getColor = () => {
    if (result === null) return "bg-gray-700 border-gray-500"; // Default before spin
    if (result === 0) return "bg-green-500 border-green-400 shadow-green-500"; // Green for 0
    return result % 2 === 0
      ? "bg-black border-gray-700 shadow-gray-500"
      : "bg-red-500 border-red-400 shadow-red-500";
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4">
      <h1 className="text-5xl font-extrabold mb-6 text-gold drop-shadow-md">Casino Royale Roulette</h1>
      <motion.div
        className={`w-44 h-44 ${getColor()} rounded-full border-4 flex items-center justify-center text-3xl font-bold shadow-xl`}
        animate={{ rotate: spinning ? [0, 3600, 7200, 10800, 14400, 14600, 14700, 14750, 14775, 14800] : 0 }}
        transition={{ duration: 3, ease: "easeOut" }}
      >
        {spinning ? "🎡" : result !== null ? result : "🎰"}
      </motion.div>
      <Button
        onClick={spinWheel}
        className="mt-8 px-6 py-3 bg-gold text-black font-semibold rounded-xl shadow-lg hover:shadow-2xl transition duration-300 ease-in-out disabled:opacity-50"
        disabled={spinning}
      >
        {spinning ? "Spinning..." : "Spin the Wheel"}
      </Button>
    </div>
  );
}
