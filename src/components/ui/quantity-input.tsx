"use client";
import { ChangeEvent, useEffect, useState } from "react";

import { Minus, Plus } from "lucide-react";

import { cn } from "@/lib/utils";

interface QuantityInputProps {
  quantity: number;
  min?: number;
  max?: number | null;
  step?: number;
  disabled?: boolean;
  onChange: (quantity: number) => void;
  className?: string;
}

const QuantityInput = ({
  className,
  disabled = false,
  max = null,
  min = 1,
  onChange,
  quantity,
  step = 1,
}: QuantityInputProps) => {
  // Internal state to handle input field text during editing
  const [inputValue, setInputValue] = useState(quantity.toString());

  // Update internal input value when external quantity prop changes
  useEffect(() => {
    setInputValue(quantity.toString());
  }, [quantity]);

  const handleDecrease = () => {
    if (quantity - step >= min) {
      onChange(quantity - step);
    }
  };

  const handleIncrease = () => {
    if (max === null || quantity + step <= max) {
      onChange(quantity + step);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    // Allow any input including empty string during editing
    setInputValue(e.target.value);

    // If the input is a valid number, update the parent component
    const value = Number.parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= min && (max === null || value <= max)) {
      onChange(value);
    }
  };

  const handleBlur = () => {
    // When the field loses focus, ensure we have a valid value
    const value = Number.parseInt(inputValue, 10);
    if (isNaN(value) || value < min) {
      // If invalid or below min, reset to min
      setInputValue(min.toString());
      onChange(min);
    } else if (max !== null && value > max) {
      // If above max and max is defined, reset to max
      setInputValue(max.toString());
      onChange(max);
    } else {
      // Ensure the displayed value matches the actual value
      setInputValue(value.toString());
      onChange(value);
    }
  };

  return (
    <div className={cn("inline-flex cursor-pointer rounded-lg bg-card shadow-sm", className)}>
      <button
        aria-label="Decrease quantity"
        className={cn(
          "flex cursor-pointer items-center justify-center rounded-s-lg border border-gray-300 px-3 py-1 hover:bg-muted-foreground/10 focus-visible:z-10 disabled:cursor-not-allowed disabled:opacity-50",
          disabled && "pointer-events-none"
        )}
        disabled={disabled || quantity <= min}
        onClick={handleDecrease}
      >
        <Minus aria-hidden="true" size={16} strokeWidth={2} />
      </button>
      <input
        aria-label="Quantity"
        className="w-12 border-gray-300 border-y px-2 py-1 text-center font-mono outline-none"
        disabled={disabled}
        max={max !== null ? max : undefined}
        min={min}
        onBlur={handleBlur}
        onChange={handleInputChange}
        type="text"
        value={inputValue}
      />
      <button
        aria-label="Increase quantity"
        className={cn(
          "flex cursor-pointer items-center justify-center rounded-e-lg border border-gray-300 px-3 py-1 hover:bg-muted-foreground/10 focus-visible:z-10 disabled:cursor-not-allowed disabled:opacity-50",
          disabled && "pointer-events-none"
        )}
        disabled={disabled || (max !== null && quantity >= max)}
        onClick={handleIncrease}
      >
        <Plus aria-hidden="true" size={16} strokeWidth={2} />
      </button>
    </div>
  );
};

export { QuantityInput };
