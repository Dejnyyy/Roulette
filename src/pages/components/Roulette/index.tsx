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
  16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
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
  const [betValue, setBetValue] = useState<
    number | "red" | "black" | "even" | "odd" | null
  >(null);

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

  // 🚦 Reset betValue when bet type or session changes
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

  // 🔄 Spin the Wheel (unchanged logic)
  const spinWheel = (betId?: string) => {
    if (isSpinningRef.current) return;
    isSpinningRef.current = true;
    setSpinning(true);

    setShowConfetti(false);
    setResult(null);

    const finalIndex = Math.floor(Math.random() * wheelNumbers.length);
    const newResult = wheelNumbers[finalIndex];

    let currentIndex = result !== null ? wheelNumbers.indexOf(result) : 0;
    const totalSpins =
      wheelNumbers.length * 3 + finalIndex + Math.floor(Math.random() * 10);
    let spinsCompleted = 0;
    let intervalTime = 20;

    const spin = () => {
      setHighlightIndex(currentIndex % wheelNumbers.length);
      spinsCompleted++;

      if (
        spinsCompleted >= totalSpins &&
        currentIndex % wheelNumbers.length === finalIndex
      ) {
        setTimeout(async () => {
          setResult(newResult);
          setHistory((prev) => [newResult, ...prev.slice(0, 6)]);

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

      intervalTime = Math.min(25, intervalTime * 10); // keeping your original timing behavior
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
      return;
    }
    if (
      betAmount > balance ||
      betAmount <= 0 ||
      betValue === null ||
      betValue === undefined
    ) {
      alert("Invalid bet amount or selection.");
      return;
    }

    const betChoice =
      typeof betValue === "number" ? betValue : betValue.toString();

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
        spinWheel(data.id);
      } else {
        console.error("🚨 Error placing bet:", data.message);
      }
    } catch (error) {
      console.error("🚨 Failed to place bet:", error);
    }
  };

  // 💵 Calculate Winnings (unchanged)
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
      if ((betValue === "red" && isRed) || (betValue === "black" && !isRed)) {
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

  // 🌐 Responsive translateY
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

  // 🟢 Styling Helpers (unchanged logic, nicer colors)
  const getColor = (num: number | null, isHighlighted: boolean = false) => {
    if (num === null) return "bg-neutral-700";
    if (num === 0) return "bg-emerald-500";
    const baseColor =
      wheelNumbers.indexOf(num) % 2 === 0 ? "bg-neutral-900" : "bg-red-600";
    return isHighlighted
      ? "bg-yellow-400 border-yellow-400 ring-4 ring-yellow-300/60"
      : baseColor;
  };

  const getBorderColor = (num: number | null) => {
    if (num === 0) return "border-emerald-300";
    return wheelNumbers.indexOf(num ?? -1) % 2 !== 0
      ? "border-red-300/70"
      : "border-neutral-400/60";
  };

  // ⭐ Secret phrase handler (unchanged)
  const handleSecretSubmit = async () => {
    if (secretInput.trim() === SECRET_PHRASE) {
      try {
        const response = await fetch("/api/addBalance", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ amount: 1000 }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to add balance");
        }

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
    <div className="relative w-full max-w-6xl">
      {showConfetti && <Confetti numberOfPieces={600} recycle={false} />}

      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Sign />
          {session && (
            <div className="flex items-center gap-2">
              <Image
                src={imageUrl}
                alt="User's profile picture"
                width={36}
                height={36}
                className="rounded-full border border-white/20 shadow"
              />
              <p className="hidden sm:block text-xs md:text-sm text-white/70">
                Welcome back {session.user.name}
              </p>
            </div>
          )}
        </div>

        {session && (
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-white/90 backdrop-blur border border-white/20 shadow-sm">
              Balance:{" "}
              <span className="font-mono text-amber-300">{balance}</span>
            </span>
            <button
              onClick={() => {
                setShowModal(true);
                setSecretError("");
                setSecretInput("");
              }}
              className="rounded-lg bg-amber-400/90 hover:bg-amber-300 text-black font-semibold px-4 py-1.5 transition"
            >
              CODES
            </button>
          </div>
        )}
      </div>

      {/* Title */}
      <motion.h1
        className="mt-6 text-center text-4xl md:text-5xl font-extrabold tracking-tight
        bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-300 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
        animate={spinning ? { rotateY: [0, 90, 0] } : { rotateY: [0, 90, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
      >
        Dejny&apos;s Roulette
      </motion.h1>

      {/* Main grid */}
      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-[1fr_minmax(260px,330px)] items-center">
        {/* Wheel Card */}
        <div className="relative mx-auto aspect-square w-[min(90vw,540px)] rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_0_60px_rgba(0,0,0,0.35)] backdrop-blur">
          {/* radial glow */}
          <div className="pointer-events-none absolute inset-0 rounded-3xl bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.10),transparent_55%)]" />

          <div className="relative h-full w-full flex items-center justify-center">
            <div className="relative h-[88%] w-[88%] rounded-full border-8 border-dotted border-white/15 flex items-center justify-center text-lg sm:text-sm md:text-base lg:text-lg font-bold">
              {wheelNumbers.map((num, index) => (
                <motion.div
                  key={`${num}-${index}`}
                  className={`absolute flex items-center justify-center rounded-full border-2
                    shadow-[0_4px_12px_rgba(0,0,0,0.45)] text-white
                    sm:w-7 sm:h-7 md:w-9 md:h-9 lg:w-10 lg:h-10 text-[12px] md:text-sm
                    ${getColor(num, index === highlightIndex)} ${getBorderColor(
                    num
                  )}`}
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

              {/* Center (Result) */}
              <motion.div
                className={`z-10 flex h-24 w-24 items-center justify-center rounded-full border-4 font-extrabold text-3xl
                  ${getColor(spinning ? null : result)} ${getBorderColor(
                  spinning ? null : result
                )}`}
                animate={
                  spinning
                    ? { scale: [1, 1.06, 1], opacity: [0.9, 1, 0.9] }
                    : { scale: [1.08, 1] }
                }
                transition={
                  spinning
                    ? { repeat: Infinity, duration: 0.9, ease: "easeInOut" }
                    : { duration: 0.25, ease: "easeOut" }
                }
              >
                {spinning ? "" : result !== null ? result : ""}
              </motion.div>

              {/* Pointer */}
            </div>
          </div>
        </div>

        {/* Betting Card */}
        <div className="md:sticky md:top-6">
          {session ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_0_40px_rgba(0,0,0,0.35)] backdrop-blur">
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

              {/* Spin button */}
              <div className="relative mt-4 flex flex-col items-center group">
                <Button
                  onClick={() => {
                    const button = document.activeElement as HTMLButtonElement;
                    if (button) button.disabled = true;
                    placeBet();
                  }}
                  className="w-full rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 px-6 py-3 font-semibold text-black shadow-[0_12px_30px_rgba(250,204,21,0.25)] hover:shadow-[0_16px_36px_rgba(250,204,21,0.35)] transition disabled:opacity-50"
                  disabled={
                    spinning ||
                    betAmount <= 0 ||
                    betValue === null ||
                    betAmount > balance
                  }
                >
                  {spinning ? "Spinning..." : "Spin the Wheel"}
                </Button>

                {(spinning ||
                  betAmount <= 0 ||
                  betValue === null ||
                  betAmount > balance) && (
                  <div className="pointer-events-none mt-2 w-full rounded-md border border-white/10 bg-black/70 p-2 text-center text-xs text-white/80 opacity-0 backdrop-blur transition-opacity duration-300 group-hover:opacity-100">
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
            </div>
          ) : (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center text-white/80 backdrop-blur">
              Sign in to place bets.
            </div>
          )}
        </div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {history.map((num, index) => (
            <div
              key={`${num}-${index}`}
              className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-bold shadow
                ${getColor(num)} ${getBorderColor(num)}`}
              title={`Last #${index + 1}`}
            >
              {num}
            </div>
          ))}
        </div>
      )}

      {/* SECRET MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="relative w-[min(92vw,380px)] rounded-2xl border border-white/10 bg-neutral-900 p-5 text-white shadow-2xl">
            <h2 className="mb-2 text-lg font-bold">Enter Secret Phrase</h2>
            <input
              className="mb-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none placeholder:text-white/40 focus:border-amber-400"
              type="text"
              value={secretInput}
              onChange={(e) => setSecretInput(e.target.value)}
              placeholder="Type your phrase..."
            />
            {secretError && (
              <p className="mb-2 text-sm text-red-400">{secretError}</p>
            )}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={handleSecretSubmit}
                className="rounded-lg bg-amber-400 px-4 py-1.5 text-sm font-semibold text-black hover:bg-amber-300"
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
