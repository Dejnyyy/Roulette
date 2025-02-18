"use client";

import React, { useEffect } from "react";
interface BettingProps {
    balance: number;
    betAmount: number;
    setBetAmount: React.Dispatch<React.SetStateAction<number>>; 
    betType: string;
    setBetType: (type: string) => void;
    betValue: number | "red" | "black" | "even" | "odd" | null;
    setBetValue: (value: number | "red" | "black" | "even" | "odd" | null) => void;
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
        setBetAmount(balance)
      }
      

  return (
    <div className="mb-4 ml-4 md:ml-8 rounded-xl  border  p-8 flex flex-col items-center font-mono font-semibold text-white">
      <p>
        Bet - <span className="text-yellow-400 font-semibold font-mono"> {/* Bet Amount Manual Input */}
  <input
    type="number"
    min="1"
    max={balance}
    className="my-4 bg-transparent text-center disabled:opacity-50 disabled:cursor-not-allowed"
    value={betAmount}
    onChange={(e) => {
      let val = Number(e.target.value);
      if (val > balance) val = balance; // Prevent bet from exceeding balance
      if (val < 1) val = 1; // Prevent bet from going below 1
      setBetAmount(val);
    }}
    disabled={spinning}
  /></span>
      </p>
{/* Seamless Bet Input */}
<div className="flex items-center gap-2 w-full">
  {/* Bet Amount Slider */}
  <input
    type="range"
    min="1"
    max={balance}
    className="w-40 cursor-pointer appearance-none bg-transparent"
    value={betAmount}
    onChange={(e) => setBetAmount(Number(e.target.value))}
    disabled={spinning}
  />

 
</div>
      <style jsx>{`
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 8px;
          background: linear-gradient(to right, #222222, #22c55e); /* Yellow to Green */
          border-radius: 10px;
          outline: none;
          transition: opacity 0.2s;
        }
      
      
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          background: white;
          border: 2px solid #22c55e; /* Green border */
          border-radius: 50%;
          cursor: pointer;
          transition: transform 0.2s;
        }
      
        input[type="range"]:hover::-webkit-slider-thumb {
          transform: scale(1.2);
        }
      
        input[type="range"]::-moz-range-track {
          width: 100%;
          height: 8px;
          background: linear-gradient(to right, #facc15, #22c55e); /* Yellow to Green */
          border-radius: 10px;
        }
      
        input[type="range"]::-moz-range-thumb {
          width: 18px;
          height: 18px;
          background: white;
          border: 2px solid #22c55e; /* Green border */
          border-radius: 50%;
          cursor: pointer;
          transition: transform 0.2s;
        }
      
        input[type="range"]:hover::-moz-range-thumb {
          transform: scale(1.2);
        }
      `}</style>

      {/* Bet Adjustment Buttons */}
      <div className="flex gap-4 mt-2">
        <button
          onClick={decreaseBet}
          disabled={spinning}
          className="px-4 py-2 bg-gray-700 text-white font-semibold rounded-lg border border-gray-600 shadow-md hover:bg-gray-600 disabled:opacity-50"
        >
          ÷2
        </button>

        <button
          onClick={increaseBet}
          disabled={spinning}
          className="px-4 py-2 bg-gray-700 text-white font-semibold rounded-lg border border-gray-600 shadow-md hover:bg-gray-600 disabled:opacity-50"
        >
          ×2
        </button>
        <button
        onClick={maxBet}
          disabled={spinning}
          className="px-4 py-2 bg-gray-700 text-white font-semibold rounded-lg border border-gray-600 shadow-md hover:bg-gray-600 disabled:opacity-50"
        >
          Max
        </button>

      </div>

      {/* Bet Type Selection */}
      <select
        className="w-40 bg-gray-800 text-white p-2 mt-4 rounded-lg border border-gray-600 shadow-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
        value={betType}
        onChange={(e) => setBetType(e.target.value)}
        disabled={spinning}
      >
        <option value="number">Number</option>
        <option value="color">Color</option>
        <option value="parity">Even/Odd</option>
      </select>

      {/* Bet Value Input */}
      {betType === "number" ? (
        <input
          type="number"
          className="w-40 bg-gray-800 text-white p-2 my-2 rounded-lg border border-gray-600 shadow-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder="Choose Number"
          defaultValue={0}
          min="0"
          max={numberCount - 1}
          value={betValue as number}
          onChange={(e) => {
            const val = Number(e.target.value);
            if (val >= 0 && val < numberCount) {
              setBetValue(val);
            }
          }}
          disabled={spinning}
        />
      ) : (
        <select
          className="w-40 bg-gray-800 text-white p-2 my-2 rounded-lg border border-gray-600 shadow-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
          value={betValue as string}
          onChange={(e) =>
            setBetValue(e.target.value as "red" | "black" | "even" | "odd")
          }
          disabled={spinning}
        >
          {betType === "color" ? (
            <>
              <option value="red" className="text-red-500">Red</option>
              <option value="black" className="text-black">Black</option>
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
  );
};

export default Betting;
