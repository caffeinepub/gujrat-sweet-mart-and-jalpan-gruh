import { useState } from "react";

interface StarRatingDisplayProps {
  rating: number;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
  count?: number;
}

export function StarRatingDisplay({
  rating,
  size = "md",
  showCount,
  count,
}: StarRatingDisplayProps) {
  const sizeClass = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl",
  }[size];

  return (
    <span className={`inline-flex items-center gap-1 ${sizeClass}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={
            star <= Math.round(rating)
              ? "text-amber-400"
              : "text-muted-foreground/30"
          }
          aria-hidden="true"
        >
          {star <= Math.round(rating) ? "★" : "☆"}
        </span>
      ))}
      {showCount !== undefined && (
        <span className="text-xs text-muted-foreground ml-1">
          {rating > 0 ? `${rating.toFixed(1)}` : ""}
          {count !== undefined && count > 0 ? ` (${count})` : ""}
        </span>
      )}
    </span>
  );
}

interface StarRatingInputProps {
  value: number;
  onChange: (rating: number) => void;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
}

export function StarRatingInput({
  value,
  onChange,
  size = "lg",
  disabled = false,
}: StarRatingInputProps) {
  const [hovered, setHovered] = useState(0);

  const sizeClass = {
    sm: "text-2xl",
    md: "text-3xl",
    lg: "text-4xl",
  }[size];

  return (
    <fieldset
      className={`inline-flex items-center gap-1 border-0 p-0 m-0 ${sizeClass}`}
      aria-label="Star rating"
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const isActive = star <= (hovered || value);
        return (
          <button
            key={star}
            type="button"
            disabled={disabled}
            onClick={() => !disabled && onChange(star)}
            onMouseEnter={() => !disabled && setHovered(star)}
            onMouseLeave={() => !disabled && setHovered(0)}
            className={`transition-all duration-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm ${
              disabled
                ? "cursor-not-allowed opacity-50"
                : "cursor-pointer hover:scale-110"
            } ${isActive ? "text-amber-400" : "text-muted-foreground/30 hover:text-amber-300"}`}
            aria-label={`Rate ${star} star${star !== 1 ? "s" : ""}`}
            data-ocid={`review.star.${star}`}
          >
            {isActive ? "★" : "☆"}
          </button>
        );
      })}
    </fieldset>
  );
}
