"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Confetti from "react-confetti";
import Button from "../button";
import Betting from "../Betting";

const wheelNumbers = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 
  20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

interface RouletteProps {
  onResult?: (result: number) => void; // Optional callback when result is determined
}

export default function RouletteWheel({ onResult }: RouletteProps) {
    const [balance, setBalance] = useState(1000);
    const [betAmount, setBetAmount] = useState(0);
    const [betType, setBetType] = useState("number");
    const [betValue, setBetValue] = useState<number | "red" | "black" | "even" | "odd" | null>(null);  
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [history, setHistory] = useState<number[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState<number>(0);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const spinWheel = () => {
    if (spinning) return;
    setSpinning(true);
    setShowConfetti(false);
    setLoadingHistory(true);

    const finalIndex = Math.floor(Math.random() * wheelNumbers.length);
    const newResult = wheelNumbers[finalIndex];

    let currentIndex = result !== null ? wheelNumbers.indexOf(result) : 0;
    let totalSpins = wheelNumbers.length * 3 + finalIndex + Math.floor(Math.random() * 10);
    let spinsCompleted = 0;
    let intervalTime = 20;

    const spin = () => {
        setHighlightIndex(currentIndex % wheelNumbers.length);
        spinsCompleted++;
  
        if (spinsCompleted >= totalSpins && currentIndex % wheelNumbers.length === finalIndex) {
          setTimeout(() => {
            setResult(newResult);
            setHistory((prev) => [newResult, ...prev.slice(0, 4)]);
            calculateWinnings(newResult);
          }, 300);
          setSpinning(false);
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3300);
          return;
        }
        intervalTime = Math.min(25, intervalTime * 10);
        setTimeout(spin, intervalTime);
        currentIndex++;
      };
      spin();
    };
    const redNumbers = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]); // Actual red numbers

    const calculateWinnings = (number: number) => {
      let winnings = 0;
    
      if (betType === "number" && betValue === number) {
        winnings = betAmount * 35;
      } else if (betType === "color") {
        const isRed = redNumbers.has(number);
        if ((betValue === "red" && isRed) || (betValue === "black" && !isRed && number !== 0)) {
          winnings = betAmount * 2;
        }
      } else if (betType === "parity") {
        if ((betValue === "even" && number % 2 === 0 && number !== 0) || (betValue === "odd" && number % 2 !== 0)) {
          winnings = betAmount * 2;
        }
      }
    
      setBalance((prev) => prev + winnings - betAmount);
    };
    
    

  const getColor = (num: number | null, isHighlighted: boolean = false) => {
    if (num === null) return "bg-gray-700";
    if (num === 0) return "bg-green-500";
    const baseColor = wheelNumbers.indexOf(num) % 2 === 0 ? "bg-black" : "bg-red-500";
    return isHighlighted ? "bg-yellow-400 border-yellow-400" : baseColor;
  };

  const getBorderColor = (num: number | null) => {
    if (num === 0) return "border-green-400";
    return wheelNumbers.indexOf(num ?? -1) % 2 !== 0 ? "border-red-400" : "border-gray-400";
  };

  return (
    <div className="flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-black text-white ">
      {showConfetti && <Confetti numberOfPieces={600} recycle={false} />}
      <h1 className="text-5xl font-extrabold mb-6 text-gold drop-shadow-md">Dejny's Roulette</h1>

      {/* ROULETTE WHEEL */}
      <div className="relative w-[500px] h-[500px] flex items-center justify-center">
        <div className="absolute w-full h-full border-8 border-dotted rounded-full flex items-center justify-center text-3xl font-bold">
          {wheelNumbers.map((num, index) => (
            <motion.div
              key={num}
              className={`absolute w-10 h-10 flex items-center justify-center text-sm font-bold rounded-full border-2 ${getColor(num, index === highlightIndex)} ${getBorderColor(num)}`}
              style={{
                transform: `rotate(${(index / wheelNumbers.length) * 360}deg) translateY(-220px) rotate(-${(index / wheelNumbers.length) * 360}deg)`,
              }}
            >
              {num}
            </motion.div>
          ))}
          <div className="relative w-full h-full flex items-center justify-center">
            {/* CENTER RESULT NUMBER */}
            <div className={`w-20 h-20 flex items-center justify-center text-white rounded-full font-bold text-2xl ${getColor(result)} ${getBorderColor(result)} border-4`}>
              {spinning ? "" : result !== null ? result : "🎰"}
            </div>
          </div>
        </div>
      </div>

        {/* Betting Component */}
        <div className="absolute left-0 ml-4">
        <Betting 
                balance={balance} 
                betAmount={betAmount} 
                setBetAmount={setBetAmount} 
                betType={betType} 
                setBetType={setBetType} 
                betValue={betValue} 
                setBetValue={setBetValue} 
                numberCount={wheelNumbers.length}
                spinning={spinning}
            />
        </div>
      {/* SPIN BUTTON */}
      <Button
        onClick={spinWheel}
        className="mt-8 px-6 py-3 bg-gold text-black font-semibold rounded-xl shadow-lg hover:shadow-2xl transition duration-300 ease-in-out disabled:opacity-50"
        disabled={spinning || betAmount <= 0 || betValue === null}
      >
        {spinning ? "Spinning..." : "Spin the Wheel"}
      </Button>

      {/* HISTORY BAR */}
      <div className="absolute bottom-4 right-4 flex gap-2">
        {history.map((num, index) => (
          <div key={index} className={`w-10 h-10 flex items-center justify-center text-lg font-bold rounded-full border-2 ${getColor(num)} ${getBorderColor(num)}`}>
            {num}
          </div>
        ))}
        {loadingHistory && (
          <motion.div className="w-10 h-10 border-4 border-t-transparent border-white rounded-full animate-spin" />
        )}
      </div>
    </div>
  );
}
