"use client";

import React, { useEffect } from "react";

interface BettingProps {
  balance: number;
  betAmount: number;
  setBetAmount: React.Dispatch<React.SetStateAction<number>>;
  betType: string;
  setBetType: (type: string) => void;
  betValue: number | "red" | "black" | "even" | "odd" | null;
  setBetValue: (
    value: number | "red" | "black" | "even" | "odd" | null
  ) => void;
  numberCount: number;
  spinning: boolean;
}

const Betting: React.FC<BettingProps> = ({
  balance,
  betAmount,
  setBetAmount,
  betType,
  setBetType,
  betValue,
  setBetValue,
  numberCount,
  spinning,
}) => {
  useEffect(() => {
    if (betAmount > balance) {
      setBetAmount(balance);
    }
  }, [betAmount, balance, setBetAmount]);

  const increaseBet = () => {
    setBetAmount((prev) => Math.min(prev === 0 ? 1 : prev * 2, balance));
  };

  const decreaseBet = () => {
    setBetAmount((prev) => Math.max(1, Math.floor(prev / 2)));
  };
  const maxBet = () => {
    setBetAmount(balance);
  };

  return (
    <div className="font-mono text-white">
      <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-white/70">
        Place Your Bet
      </h3>

      {/* Amount */}
      <div className="mb-4 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
        <label className="block text-xs font-semibold text-white/60">
          Amount
        </label>
        <div className="mt-2 flex items-center gap-3">
          <input
            type="number"
            min="1"
            max={balance}
            className="w-28 rounded-lg border border-white/10 bg-neutral-800/80 px-3 py-2 text-center text-white outline-none placeholder:text-white/30 focus:border-emerald-400 disabled:opacity-50"
            value={betAmount}
            onChange={(e) => {
              let val = Number(e.target.value);
              if (val > balance) val = balance;
              if (val < 1) val = 1;
              setBetAmount(val);
            }}
            disabled={spinning}
          />

          <div className="ml-auto flex gap-2">
            <button
              onClick={decreaseBet}
              disabled={spinning}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 disabled:opacity-50"
            >
              ÷2
            </button>
            <button
              onClick={increaseBet}
              disabled={spinning}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 disabled:opacity-50"
            >
              ×2
            </button>
            <button
              onClick={maxBet}
              disabled={spinning}
              className="rounded-lg border border-emerald-400/40 bg-emerald-500/20 px-3 py-2 text-sm text-emerald-200 hover:bg-emerald-500/30 disabled:opacity-50"
            >
              Max
            </button>
          </div>
        </div>

        {/* Slider */}
        <div className="mt-3">
          <input
            type="range"
            min="1"
            max={Math.max(1, balance)}
            className="w-full cursor-pointer appearance-none bg-transparent"
            value={Math.min(Math.max(1, betAmount), Math.max(1, balance))}
            onChange={(e) => setBetAmount(Number(e.target.value))}
            disabled={spinning}
          />
          <style jsx>{`
            input[type="range"] {
              -webkit-appearance: none;
              appearance: none;
              width: 100%;
              height: 8px;
              background: linear-gradient(to right, #222222, #22c55e);
              border-radius: 10px;
              outline: none;
            }
            input[type="range"]::-webkit-slider-thumb {
              -webkit-appearance: none;
              appearance: none;
              width: 18px;
              height: 18px;
              background: white;
              border: 2px solid #22c55e;
              border-radius: 50%;
              cursor: pointer;
              transition: transform 0.2s;
            }
            input[type="range"]:hover::-webkit-slider-thumb {
              transform: scale(1.15);
            }
            input[type="range"]::-moz-range-track {
              width: 100%;
              height: 8px;
              background: linear-gradient(to right, #222222, #22c55e);
              border-radius: 10px;
            }
            input[type="range"]::-moz-range-thumb {
              width: 18px;
              height: 18px;
              background: white;
              border: 2px solid #22c55e;
              border-radius: 50%;
              cursor: pointer;
              transition: transform 0.2s;
            }
            input[type="range"]:hover::-moz-range-thumb {
              transform: scale(1.15);
            }
          `}</style>
        </div>
      </div>

      {/* Bet Type */}
      <div className="mb-4 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
        <label className="block text-xs font-semibold text-white/60">
          Bet Type
        </label>
        <select
          className="mt-2 w-full rounded-lg border border-white/10 bg-neutral-800/80 p-2 text-white outline-none focus:border-emerald-400 disabled:opacity-50"
          value={betType}
          onChange={(e) => {
            const newType = e.target.value;
            setBetType(newType);
            if (newType === "number") setBetValue(0);
            else setBetValue(null);
          }}
          disabled={spinning}
        >
          <option value="number">Number</option>
          <option value="color">Color</option>
          <option value="parity">Even/Odd</option>
        </select>
      </div>

      {/* Bet Value */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
        <label className="block text-xs font-semibold text-white/60">
          Bet Value
        </label>

        {betType === "number" ? (
          <input
            type="number"
            className="mt-2 w-full rounded-lg border border-white/10 bg-neutral-800/80 p-2 text-white outline-none placeholder:text-white/40 focus:border-emerald-400 disabled:opacity-50"
            placeholder="Choose Number"
            min="0"
            max={numberCount - 1}
            value={betValue === null ? 0 : betValue}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (!isNaN(val) && val >= 0 && val < numberCount) {
                setBetValue(val);
              }
            }}
            disabled={spinning}
          />
        ) : (
          <select
            className="mt-2 w-full rounded-lg border border-white/10 bg-neutral-800/80 p-2 text-white outline-none focus:border-emerald-400 disabled:opacity-50"
            value={betValue ? betValue.toString() : ""}
            onChange={(e) =>
              setBetValue(e.target.value as "red" | "black" | "even" | "odd")
            }
            disabled={spinning}
          >
            {betType === "color" ? (
              <>
                <option value="red">Red</option>
                <option value="black">Black</option>
              </>
            ) : (
              <>
                <option value="even">Even</option>
                <option value="odd">Odd</option>
              </>
            )}
          </select>
        )}
      </div>
    </div>
  );
};

export default Betting;
