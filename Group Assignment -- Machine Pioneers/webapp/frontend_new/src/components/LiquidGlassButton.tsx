import { cn } from "@/lib/utils"
import { ButtonHTMLAttributes, forwardRef } from "react"

interface LiquidGlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "large"
}

const LiquidGlassButton = forwardRef<HTMLButtonElement, LiquidGlassButtonProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "liquid-glass rounded-full text-foreground transition-transform duration-200 hover:scale-[1.03] cursor-pointer",
          variant === "default" && "px-6 py-2.5 text-sm",
          variant === "large" && "px-14 py-5 text-base",
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)

LiquidGlassButton.displayName = "LiquidGlassButton"

export { LiquidGlassButton }
