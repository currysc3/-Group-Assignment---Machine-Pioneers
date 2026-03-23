import { LiquidGlassButton } from "./LiquidGlassButton"
import { VideoBackground } from "./VideoBackground"

export function HeroSection() {
  return (
    <section id="home" className="relative min-h-screen flex flex-col">
      <VideoBackground />
      
      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full">
        <a 
          href="#home" 
          className="text-3xl tracking-tight text-foreground"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          MovieRec<sup className="text-xs">®</sup>
        </a>

        <div className="hidden md:flex items-center gap-8">
          {["Home", "Movies", "Recommendations", "Evaluation"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {item}
            </a>
          ))}
        </div>

        <LiquidGlassButton onClick={() => window.location.hash = "#admin"}>
          Admin
        </LiquidGlassButton>
      </nav>
      
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-32 pb-40 flex-1">
        <h1 
          className="text-5xl sm:text-7xl md:text-8xl leading-[0.95] tracking-[-2.46px] max-w-7xl font-normal animate-fade-rise"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Where <em className="not-italic text-muted-foreground">dreams</em> rise{" "}
          <em className="not-italic text-muted-foreground">through the silence.</em>
        </h1>
        
        <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mt-8 leading-relaxed animate-fade-rise-delay">
          We're designing tools for deep thinkers, bold creators, and quiet rebels. 
          Amid the chaos, we build digital spaces for sharp focus and inspired work.
        </p>
        
        <div className="animate-fade-rise-delay-2">
          <LiquidGlassButton variant="large" className="mt-12">
            Begin Journey
          </LiquidGlassButton>
        </div>
      </div>
    </section>
  )
}
