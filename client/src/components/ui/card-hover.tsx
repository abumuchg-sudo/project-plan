import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface CardHoverProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function CardHover({ children, className, onClick }: CardHoverProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer",
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
