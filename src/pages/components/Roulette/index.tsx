"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Confetti from "react-confetti";
import Button from "../button";
import Betting from "../Betting";
import Sign from "@/pages/sign";
import { useSession } from "next-auth/react";
import Image from "next/image"


const wheelNumbers = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 
  20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

export default function RouletteWheel() {
    const { data: session } = useSession();
    const imageUrl = session?.user.image ?? "/defaultpfp.png";
    const [balance, setBalance] = useState(1000);
    const [betAmount, setBetAmount] = useState(0);
    const [betType, setBetType] = useState("number");
    const [betValue, setBetValue] = useState<number | "red" | "black" | "even" | "odd" | null>(null);  
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [history, setHistory] = useState<number[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState<number>(0);
  const [translateY, setTranslateY] = useState(220); // Default for large screens

  useEffect(() => {
    if(!session){
        setBetValue(null);
        return;
    }
    if (betType === "number") {
      setBetValue(0); // Default to first number on wheel
    } else if (betType === "color") {
      setBetValue("red"); // Default to "red" for color bets
    } else if (betType === "parity") {
      setBetValue("even"); // Default to "even" for parity bets
    }
  }, [betType,session]);

  const spinWheel = () => {
    if (spinning) return;
    
    setSpinning(true);
    setShowConfetti(false);
    
    setResult(null);
  
    const finalIndex = Math.floor(Math.random() * wheelNumbers.length);
    const newResult = wheelNumbers[finalIndex];
  
    let currentIndex = result !== null ? wheelNumbers.indexOf(result) : 0;
    const totalSpins = wheelNumbers.length * 3 + finalIndex + Math.floor(Math.random() * 10);
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
  

    const redNumbers = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);

    const calculateWinnings = (number: number) => {
      let winnings = 0;
    
      if (betType === "number" && betValue === number) {
        winnings = betAmount * 15;
      } else if (betType === "color") {
        const isRed = redNumbers.has(number);
        if ((betValue === "red" && isRed) || (betValue === "black" && !isRed && number !== 0)) {
          winnings = betAmount * 2;
        }
      }  else if (betType === "parity") {
        if (number !== 0) { // Ensures 0 does not count as even or odd
          if ((betValue === "even" && number % 2 === 0) || (betValue === "odd" && number % 2 !== 0)) {
            winnings = betAmount * 2;
          }
        }
      }
    
      setBalance((prev) => prev + winnings - betAmount);
    };
    
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setTranslateY(170); // Small screens
      } else if (window.innerWidth < 1024) {
        setTranslateY(170); // Medium screens
      } else {
        setTranslateY(220); // Large screens
      }
    };

    // Set initial value
    handleResize();

    // Listen for window resize
    window.addEventListener("resize", handleResize);
    
    return () => window.removeEventListener("resize", handleResize);
  }, []);
    

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
    <div className="flex flex-col items-center justify-center  text-white ">
      {showConfetti && <Confetti numberOfPieces={600} recycle={false} />}
      <div className="absolute top-4 left-4 flex flex-row ">
      <Sign />
      {session && (
          <Image
            src={imageUrl}
            alt="User's profile picture"
            width={25}
            height={25}
            className="rounded-full border-2 w-10 ml-4 border-white shadow-lg"
          />
        )}      </div>
      <h1 className="text-5xl font-extrabold mb-6 text-gold drop-shadow-md text-center absolute top-32 md:static md:top-auto">Dejny&apos;s Roulette</h1>
      <p className="absolute shadow-md hover:scale-110 transition-all duration-150 ease-in-out cursor-pointer top-16 left-4 px-4 py-2 bg-white text-black rounded-xl font-bold">
        Balance: <span className="font-mono">{balance}</span>
      </p>
      
      {/* ROULETTE WHEEL */}
      <div className="relative mt-20 md:mt-0 sm:w-[300px] sm:h-[300px] md:w-[400px] md:h-[400px] lg:w-[500px] lg:h-[500px] flex items-center justify-center">
  <div className="md:absolute mt-80 md:mt-0 w-full h-full border-8 border-dotted rounded-full flex items-center justify-center text-lg sm:text-sm md:text-base lg:text-lg font-bold">
    {wheelNumbers.map((num, index) => (
      <motion.div
      key={num}
      className={`absolute p-2 sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 flex items-center justify-center text-sm sm:text-[12px] md:text-md lg:text-base font-bold rounded-full border-2 ${getColor(num, index === highlightIndex)} ${getBorderColor(num)}`}
      style={{
        transform: `rotate(${(index / wheelNumbers.length) * 360}deg) translateY(-${translateY}px) rotate(-${(index / wheelNumbers.length) * 360}deg)`,
      }}
    >
      {num}
    </motion.div>
    ))}
         <div className="relative w-full h-full flex items-center justify-center">
  {/* CENTER RESULT NUMBER */}
  <div
    className={`w-20 h-20 flex items-center justify-center text-white rounded-full font-bold text-2xl 
      ${getColor(spinning ? null : result)} ${getBorderColor(spinning ? null : result)} border-4`}
  >
    {spinning ? "" : result !== null ? result : ""}
  </div>
</div>

        </div>
      </div>

        {/* Betting Component */}
        <div className="relative mt-40 sm:mt-64 md:absolute md:left-0 md:ml-4">
            
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
      <div className="relative flex flex-col items-center group">
  <Button
    onClick={spinWheel}
    className="mt-8 px-6 mb-8 py-3 bg-gold text-black font-semibold rounded-xl shadow-lg hover:shadow-2xl transition duration-300 ease-in-out disabled:opacity-50 relative"
    disabled={!session || spinning || betAmount <= 0 || betValue === null || betAmount > balance}
    >
      {!session ? "Sign in to Play" : spinning ? "Spinning..." : "Spin the Wheel"}
    </Button>

  {/* Render Tooltip ONLY if button is disabled */}
  {(spinning || betAmount <= 0 || betValue === null || betAmount > balance) && (
    <div className="absolute bottom-[35px] bg-black text-white text-xs p-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
      {spinning
        ? "Wait! The wheel is already spinning..."
        : betAmount <= 0
        ? "You must place a bet before spinning!"
        : betValue === null
        ? "Select a bet type before spinning!"
        : betAmount > balance
        ? "Not enough balance for this bet!"
        : ""}
    </div>
  )}
</div>
{/* HISTORY BAR */}
<div className="absolute top-4 right-4 flex gap-1 sm:gap-2 flex-wrap sm:flex-nowrap">
  {history.map((num, index) => (
    <div
      key={index}
      className={`flex items-center justify-center text-sm sm:text-lg font-bold rounded-full border-2 
                  w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10
                  ${getColor(num)} ${getBorderColor(num)}`}
    >
      {num}
    </div>
  ))}
</div>

    </div>
  );
}
