import { FormEvent, useState } from "react";

interface Props {
  onSubmit: (companyName: string) => void;
  disabled: boolean;
}

export function SearchBar({ onSubmit, disabled }: Props) {
  const [value, setValue] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed) onSubmit(trimmed);
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Enter a company name, e.g. Zomato, Tesla, Razorpay..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={disabled}
      />
      <button type="submit" disabled={disabled || !value.trim()}>
        {disabled ? "Researching..." : "Research"}
      </button>
    </form>
  );
}
