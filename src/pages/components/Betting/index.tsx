"use client";

import React from "react";

interface BettingProps {
  balance: number;
  betAmount: number;
  setBetAmount: (amount: number) => void;
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
  return (
    <div className="mb-4 flex flex-col items-center text-white">
      <p>
        Balance: <span className="text-yellow-400">{balance}</span>
      </p>
      <input
        type="range"
        min="1"
        max={balance}
        className="w-64 my-2"
        value={betAmount}
        onChange={(e) => setBetAmount(Number(e.target.value))}
        disabled={spinning}
      />
      <p>
        Bet Amount: <span className="text-yellow-400">{betAmount}</span>
      </p>
      <select
        className="text-black p-2"
        value={betType}
        onChange={(e) => setBetType(e.target.value)}
        disabled={spinning}
      >
        <option value="number">Number</option>
        <option value="color">Red/Black</option>
        <option value="parity">Even/Odd</option>
      </select>
      {betType === "number" ? (
        <input
          type="number"
          className="text-black p-2 my-2"
          placeholder="Choose Number"
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
          className="text-black p-2 my-2"
          value={betValue as string}
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
  );
};

export default Betting;
