import type { ButtonHTMLAttributes } from "react";

type PixelButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  size?: "normal" | "large";
  variant?: "yellow" | "mint" | "pink";
};

export function PixelButton({
  label,
  size = "normal",
  variant = "yellow",
  className = "",
  ...props
}: PixelButtonProps) {
  return (
    <button className={`pixel-button ${variant} ${size} ${className}`} type="button" {...props}>
      {label}
    </button>
  );
}
