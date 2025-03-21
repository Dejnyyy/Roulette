"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Confetti from "react-confetti";
import Button from "../button";
import Betting from "../Betting";
import Sign from "@/pages/sign";
import { useSession } from "next-auth/react";
import Image from "next/image";

const wheelNumbers = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24,
  16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

// ⭐ Choose your secret phrase here
const SECRET_PHRASE = "gimmiemoneydejny";

export default function RouletteWheel() {
  const { data: session } = useSession();
  const imageUrl = session?.user?.image ?? "/defaultpfp.png";

  // 💰 Balance & Betting
  const [balance, setBalance] = useState<number>(0);
  const [betAmount, setBetAmount] = useState(0);
  const [betType, setBetType] = useState("number");
  const [betValue, setBetValue] = useState<number | "red" | "black" | "even" | "odd" | null>(null);

  // 🔄 Spinning and Result
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [history, setHistory] = useState<number[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState<number>(0);
  const [translateY, setTranslateY] = useState(220);

  // 🏷️ Secret Modal
  const [showModal, setShowModal] = useState(false);
  const [secretInput, setSecretInput] = useState("");
  const [secretError, setSecretError] = useState("");

  const isSpinningRef = useRef(false);

  // 🎯 Fetch Balance
  useEffect(() => {
    if (!session) return;

    const fetchBalance = async () => {
      try {
        const response = await fetch("/api/balance");
        const data = await response.json();

        if (response.ok) {
          setBalance(data.balance);
        } else {
          console.error("🚨 Failed to fetch balance:", data.message);
        }
      } catch (error) {
        console.error("🚨 Error fetching balance:", error);
      }
    };

    fetchBalance();
  }, [session]);

  // 🚦 If session changes or bet type changes, reset betValue accordingly
  useEffect(() => {
    if (!session) {
      setBetValue(null);
      return;
    }
    setBetValue((prev) => {
      if (prev !== null) return prev; 
      if (betType === "number") return 0; 
      if (betType === "color") return "red";
      if (betType === "parity") return "even";
      return null;
    });
  }, [betType, session]);

  // 🔄 Spin the Wheel
  const spinWheel = (betId?: string) => {
    if (isSpinningRef.current) return;
    isSpinningRef.current = true;
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
        setTimeout(async () => {
          setResult(newResult);
          setHistory((prev) => [newResult, ...prev.slice(0, 4)]);

          const winnings = calculateWinnings(newResult);
          if (betId) {
            await updateBetResult(betId, newResult, winnings, betAmount);
          }

          if (winnings > 0) {
            setShowConfetti(true);
            setBalance((prev) => prev + winnings);
          }

          setSpinning(false);
          isSpinningRef.current = false;
        }, 300);
        return;
      }

      intervalTime = Math.min(25, intervalTime * 10);
      setTimeout(spin, intervalTime);
      currentIndex++;
    };

    spin();
  };

  const updateBetResult = async (
    betId: string | null,
    result: number,
    winnings: number,
    betAmount: number
  ) => {
    if (!betId) {
      console.error("🚨 updateBetResult: betId is missing", betId);
      return;
    }

    const outcome = winnings > 0 ? "W" : "L";

    try {
      const response = await fetch("/api/updateBet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          betId,
          result,
          outcome,
          winnings,
          betAmount,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log("✅ Bet updated:", data);
        fetchUpdatedBalance();
      } else {
        console.error("🚨 Error updating bet:", data.message);
      }
    } catch (error) {
      console.error("🚨 Error updating bet result:", error);
    }
  };

  const fetchUpdatedBalance = async () => {
    try {
      const res = await fetch("/api/balance");
      const data = await res.json();
      if (res.ok) {
        setBalance(data.balance);
      } else {
        console.error("Failed to fetch balance:", data.message);
      }
    } catch (error) {
      console.error("Error fetching updated balance:", error);
    }
  };

  // 🎰 Place Bet
  const placeBet = async () => {
    if (!session) {
      alert("You need to be logged in to place a bet!");
      return;
    }
    if (spinning || isSpinningRef.current) {
      console.log("🚨 Already spinning, bet not placed!");
      return;
    }
    if (betAmount > balance || betAmount <= 0 || betValue === null || betValue === undefined) {
      alert("Invalid bet amount or selection.");
      console.error("❌ Bet failed due to invalid data:", { betAmount, betValue });
      return;
    }

    const betChoice = typeof betValue === "number" ? betValue : betValue.toString();
    console.log("📌 Sending bet request with:", { amount: betAmount, choice: betChoice });

    // Deduct the bet amount locally
    setBalance((prev) => prev - betAmount);

    try {
      const response = await fetch("/api/bet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: betAmount, choice: betChoice }),
      });

      const data = await response.json();
      if (response.ok && data.id) {
        console.log("📌 Bet ID received:", data.id);
        spinWheel(data.id);
      } else {
        console.error("🚨 Error placing bet:", data.message);
      }
    } catch (error) {
      console.error("🚨 Failed to place bet:", error);
    }
  };

  // 💵 Calculate Winnings
  const calculateWinnings = (number: number): number => {
    let winnings = 0;
    const redNumbers = new Set([
      1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
    ]);

    if (betType === "number") {
      if (typeof betValue === "number" && betValue === number) {
        winnings = betAmount * 35;
      }
    } else if (betType === "color") {
      const isRed = redNumbers.has(number);
      if (
        (betValue === "red" && isRed) ||
        (betValue === "black" && !isRed)
      ) {
        winnings = betAmount;
      }
    } else if (betType === "parity") {
      if (number === 0) return 0;
      if (
        (betValue === "even" && number % 2 === 0) ||
        (betValue === "odd" && number % 2 !== 0)
      ) {
        winnings = betAmount;
      }
    }
    return winnings;
  };

  // 🌐 Handle screen resizing
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setTranslateY(160);
      } else if (window.innerWidth < 1024) {
        setTranslateY(170);
      } else {
        setTranslateY(220);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 🟢 Styling Helpers
  const getColor = (num: number | null, isHighlighted: boolean = false) => {
    if (num === null) return "bg-gray-700";
    if (num === 0) return "bg-green-500";
    const baseColor =
      wheelNumbers.indexOf(num) % 2 === 0 ? "bg-black" : "bg-red-500";
    return isHighlighted ? "bg-yellow-400 border-yellow-400" : baseColor;
  };

  const getBorderColor = (num: number | null) => {
    if (num === 0) return "border-green-400";
    return wheelNumbers.indexOf(num ?? -1) % 2 !== 0
      ? "border-red-400"
      : "border-gray-400";
  };

  // ⭐ Handle secret phrase
  // 1) On the frontend (same RouletteWheel component):
const handleSecretSubmit = async () => {
  if (secretInput.trim() === SECRET_PHRASE) {
    try {
      // Call your custom API route to add balance
      const response = await fetch("/api/addBalance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: 1000 }), // or whatever amount you want to add
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add balance");
      }

      // If your route returns the updated (new) balance:
      setBalance(data.newBalance);

      setSecretError("");
      setShowModal(false);
      setSecretInput("");
    } catch (error) {
      console.error("🚨 Error adding balance:", error);
      setSecretError("Error adding balance. Please try again.");
    }
  } else {
    setSecretError("Incorrect secret phrase!");
  }
};


  return (
    <div className="flex flex-col items-center justify-center text-white">
      {showConfetti && <Confetti numberOfPieces={600} recycle={false} />}
      
      {/* Sign In + Profile Picture */}
      <div className="absolute top-4 left-4 flex flex-row">
        <Sign />
        {session && (
          <Image
            src={imageUrl}
            alt="User's profile picture"
            width={25}
            height={25}
            className="rounded-full border-2 w-10 ml-4 border-white shadow-lg"
          />
        )}
      </div>

      {/* Title */}
      <motion.h1
        className="text-5xl font-extrabold mb-6 text-gold drop-shadow-md text-center absolute top-32 md:static md:top-auto"
        animate={spinning ? { rotateY: [0, 90, 0] } : { rotateY: [0, 90, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
      >
        Dejny&apos;s Roulette
      </motion.h1>

      {/* Balance & Secret Button */}
      {session && (
        <p className="absolute shadow-md hover:scale-110 transition-all duration-150 ease-in-out cursor-pointer top-16 left-4 px-4 py-2 bg-white text-black rounded-xl font-bold">
          Balance: <span className="font-mono">{balance}</span>
        </p>
      )}

      {/* SECRET BUTTON (toggles modal) */}
      {session && (
        <button
          onClick={() => {
            setShowModal(true);
            setSecretError("");
            setSecretInput("");
          }}
          className="absolute top-16 text-black font-semibold right-4 px-4 py-2 bg-white rounded-lg text-md hover:bg-gray-400 transition-colors"
        >
          CODES
        </button>
      )}

      {/* ROULETTE WHEEL */}
      <div className="relative mt-20 md:mt-0 sm:w-[300px] sm:h-[300px] md:w-[400px] md:h-[400px] lg:w-[500px] lg:h-[500px] flex items-center justify-center">
        <div className="md:absolute mt-80 md:mt-0 w-full h-full border-8 border-dotted rounded-full flex items-center justify-center text-lg sm:text-sm md:text-base lg:text-lg font-bold">
          {wheelNumbers.map((num, index) => (
            <motion.div
              key={num}
              className={`absolute p-2 sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 flex items-center justify-center text-sm sm:text-[12px] md:text-md lg:text-base font-bold rounded-full border-2
                ${getColor(num, index === highlightIndex)} ${getBorderColor(num)}`}
              style={{
                transform: `rotate(${
                  (index / wheelNumbers.length) * 360
                }deg) translateY(-${translateY}px) rotate(-${
                  (index / wheelNumbers.length) * 360
                }deg)`,
              }}
            >
              {num}
            </motion.div>
          ))}

          {/* CENTER (RESULT) */}
          <div className="relative w-full h-full flex items-center justify-center">
            <motion.div
              className={`w-20 h-20 flex items-center justify-center text-white rounded-full font-bold text-2xl 
                ${getColor(spinning ? null : result)} ${getBorderColor(spinning ? null : result)} border-4`}
              animate={
                spinning
                  ? { scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }
                  : { scale: [1.2, 1] }
              }
              transition={
                spinning
                  ? { repeat: Infinity, duration: 0.8, ease: "easeInOut" }
                  : { duration: 0.3, ease: "easeOut" }
              }
            >
              {spinning ? "" : result !== null ? result : ""}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Betting Component */}
      <div className="relative mt-40 sm:mt-64 md:absolute md:left-0">
        {session && (
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
        )}
      </div>

      {/* SPIN BUTTON */}
      <div className="relative flex flex-col items-center group">
        <Button
          onClick={() => {
            const button = document.activeElement as HTMLButtonElement;
            if (button) button.disabled = true;
            placeBet();
          }}
          className="mt-8 px-6 mb-8 md:mb-0 py-3 bg-gold text-black font-semibold rounded-xl shadow-lg hover:shadow-2xl transition duration-300 ease-in-out disabled:opacity-50 relative"
          disabled={spinning || betAmount <= 0 || betValue === null || betAmount > balance}
        >
          {spinning ? "Spinning..." : "Spin the Wheel"}
        </Button>

        {/* Tooltip if disabled */}
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

      {/* HISTORY */}
      <div className="absolute top-4 right-4 md:bottom-4 flex gap-1 sm:gap-2 flex-wrap sm:flex-nowrap">
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

      {/* SECRET MODAL */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-70">
          <div className="bg-white p-4 rounded-md w-[300px] relative">
            <h2 className="text-lg font-bold mb-2 text-black">Enter Secret Phrase</h2>
            <input
              className="w-full px-2 py-1 border border-gray-300 rounded-md mb-2 text-black"
              type="text"
              value={secretInput}
              onChange={(e) => setSecretInput(e.target.value)}
              placeholder="Type your phrase..."
            />
            {secretError && <p className="text-red-600 text-sm mb-2">{secretError}</p>}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-3 py-1 border rounded-md hover:bg-gray-200 text-black"
              >
                Cancel
              </button>
              <button
                onClick={handleSecretSubmit}
                className="px-4 py-2 bg-white border-gray-200 border text-black font-semibold rounded-md hover:bg-gray-200"
              >
                $$$$$
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
