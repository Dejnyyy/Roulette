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
    if (result === null) return "bg-gray-700"; // Default before spin
    if (result === 0) return "bg-green-500"; // Green for 0
    return result % 2 === 0 ? "bg-black" : "bg-red-500"; // Black for even, Red for odd
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-4">Roulette</h1>
      <motion.div
        className={`w-40 h-40 ${getColor()} rounded-full flex items-center justify-center text-2xl font-bold`}
        animate={{ rotate: spinning ? 1440 : 0 }}
        transition={{ duration: 3, ease: "easeOut" }}
      >
        {spinning ? "🎡" : result !== null ? result : "🎰"}
      </motion.div>
      <Button onClick={spinWheel} className="mt-6" disabled={spinning}>
        {spinning ? "Spinning..." : "Spin"}
      </Button>
    </div>
  );
}
