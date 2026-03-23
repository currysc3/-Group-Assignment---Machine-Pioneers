import { useState } from "react"
import { cn } from "@/lib/utils"
import { LiquidGlassButton } from "./LiquidGlassButton"
import { Menu, X } from "lucide-react"

const navLinks = [
  { name: "Home", href: "#home", active: true },
  { name: "Movies", href: "#movies" },
  { name: "Recommendations", href: "#recommendations" },
  { name: "Evaluation", href: "#evaluation" },
  { name: "Admin", href: "#admin" },
]

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
      {/* Logo */}
      <a 
        href="#home" 
        className="text-3xl tracking-tight text-foreground font-display"
        style={{ fontFamily: "'Instrument Serif', serif" }}
      >
        MovieRec<sup className="text-xs">®</sup>
      </a>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-8">
        {navLinks.map((link) => (
          <a
            key={link.name}
            href={link.href}
            className={cn(
              "text-sm transition-colors duration-200",
              link.active 
                ? "text-foreground" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {link.name}
          </a>
        ))}
      </div>

      {/* CTA Button */}
      <div className="hidden md:block">
        <LiquidGlassButton>
          Begin Journey
        </LiquidGlassButton>
      </div>

      {/* Mobile Menu Button */}
      <button
        className="md:hidden text-foreground p-2"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-background/95 backdrop-blur-lg md:hidden border-t border-border">
          <div className="flex flex-col px-8 py-6 gap-4">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className={cn(
                  "text-sm transition-colors duration-200 py-2",
                  link.active 
                    ? "text-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <LiquidGlassButton className="mt-4 w-full">
              Begin Journey
            </LiquidGlassButton>
          </div>
        </div>
      )}
    </nav>
  )
}
