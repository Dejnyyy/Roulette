"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Button from "./components/button";
import Confetti from "react-confetti";

const numbers = Array.from({ length: 37 }, (_, i) => i); // European roulette (0-36)

export default function Roulette() {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [history, setHistory] = useState<number[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);

  const spinWheel = () => {
    if (spinning) return;
    setSpinning(true);
    setShowConfetti(false);
    const randomIndex = Math.floor(Math.random() * numbers.length);
    setTimeout(() => {
      const newResult = numbers[randomIndex];
      setResult(newResult);
      setHistory((prev) => [newResult, ...prev.slice(0, 4)]); // Keep last 5 numbers
      setSpinning(false);
      setTimeout(() => setShowConfetti(true), 300); // Delay confetti after animation completes
      setTimeout(() => setShowConfetti(false), 3300);
    }, 3000);
  };

  // Determine color based on the roulette number
  const getColor = (num: number | null) => {
    if (num === null) return "bg-gray-700 border-gray-500"; // Default before spin
    if (num === 0) return "bg-green-500 border-green-400 shadow-green-500"; // Green for 0
    return num % 2 === 0
      ? "bg-black border-gray-700"
      : "bg-red-500 border-red-400";
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4 relative">
      {showConfetti && <Confetti numberOfPieces={300} recycle={false} colors={["#FFFFFF", "#111111", "#A020F0", "#D4AF37"]} />} 
      <h1 className="text-5xl font-extrabold mb-6 text-gold drop-shadow-md">Dejny's Roulette</h1>
      <motion.div
        className={`w-44 h-44 ${getColor(result)} rounded-full border-4 flex items-center justify-center text-3xl font-bold shadow-xl overflow-hidden relative`}
        animate={{ rotate: spinning ? [0, 3600, 7200, 10800, 14400, 14600, 14700, 14750, 14775, 14800] : 0 }}
        transition={{ duration: 3, ease: "easeOut" }}
      >
        {spinning ? (
          <motion.div
            className="w-10 h-10 border-4 border-t-transparent border-white rounded-full animate-spin"
          />
        ) : (
          result !== null ? result : "🎰"
        )}
      </motion.div>
      <Button
        onClick={spinWheel}
        className="mt-8 px-6 py-3 bg-gold text-black font-semibold rounded-xl shadow-lg hover:shadow-2xl transition duration-300 ease-in-out disabled:opacity-50"
        disabled={spinning}
      >
        {spinning ? "Spinning..." : "Spin the Wheel"}
      </Button>
      
      {/* Last 5 numbers history */}
      <div className="absolute bottom-4 right-4 flex gap-2">
        {history.map((num, index) => (
          <div key={index} className={`w-10 h-10 flex items-center justify-center text-lg font-bold rounded-full border-2 shadow-md ${getColor(num)}`}>
            {num}
          </div>
        ))}
      </div>
    </div>
  );
}
