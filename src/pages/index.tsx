"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Button from "./components/button";
import Confetti from "react-confetti";

const numbers = Array.from({ length: 37 }, (_, i) => i); // European roulette (0-36)
const wheelNumbers = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
]; // Actual European roulette order

export default function Roulette() {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [history, setHistory] = useState<number[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState<number>(0);

  const spinWheel = () => {
    if (spinning) return;
    setSpinning(true);
    setShowConfetti(false);
    
    const finalIndex = Math.floor(Math.random() * wheelNumbers.length);
    const newResult = wheelNumbers[finalIndex];
    
    let currentIndex = result !== null ? wheelNumbers.indexOf(result) : 0; // Start from last chosen number
    const spinInterval = setInterval(() => {
      setHighlightIndex(currentIndex % wheelNumbers.length);
      if (currentIndex % wheelNumbers.length === finalIndex) {
        clearInterval(spinInterval);
        setResult(newResult);
        setHistory((prev) => [newResult, ...prev.slice(0, 4)]);
        setSpinning(false);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3300);
      }
      currentIndex++;
    }, 100);
  };

  // Determine color based on the roulette number
  const getColor = (num: number | null, isHighlighted: boolean = false) => {
    if (num === null) return "bg-gray-700 border-gray-500";
    if (num === 0) return "bg-green-500 border-green-400 shadow-green-500";
    const baseColor = wheelNumbers.indexOf(num) % 2 === 0 ? "bg-black border-gray-700" : "bg-red-500 border-red-400";
    return isHighlighted ? "bg-yellow-400 border-yellow-300" : baseColor;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4 relative">
      {showConfetti && <Confetti numberOfPieces={300} recycle={false} colors={["#FFD700", "#FF0000", "#00FF00", "#0000FF"]} />} 
      <h1 className="text-5xl font-extrabold mb-6 text-gold drop-shadow-md">Dejny's Roulette</h1>
      <div className="relative w-80 h-80 flex items-center justify-center">
        <div className="absolute w-full h-full bg-black rounded-full border-4 flex items-center justify-center text-3xl font-bold shadow-xl">
          {/* Display all numbers around the wheel with a highlight effect */}
          {wheelNumbers.map((num, index) => (
            <motion.div
              key={num}
              className={`absolute w-8 h-8 flex items-center justify-center text-sm font-bold rounded-full border-2 shadow-md ${getColor(num, index === highlightIndex)}`}
              style={{
                transform: `rotate(${(index / wheelNumbers.length) * 360}deg) translateY(-140px) rotate(-${(index / wheelNumbers.length) * 360}deg)`,
              }}
            >
              {num}
            </motion.div>
          ))}
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="absolute top-2 w-4 h-6" />
            <div className={`w-16 h-16 flex items-center justify-center text-white rounded-full font-bold text-2xl border-4 ${getColor(result)}`}> 
              {spinning ? "" : result !== null ? result : "🎰"}
            </div>
          </div>
        </div>
      </div>
      <Button
        onClick={spinWheel}
        className="mt-8 px-6 py-3 bg-gold text-black font-semibold rounded-xl shadow-lg hover:shadow-2xl transition duration-300 ease-in-out disabled:opacity-50"
        disabled={spinning}
      >
        {spinning ? "Spinning..." : "Spin the Wheel"}
      </Button>
      
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
