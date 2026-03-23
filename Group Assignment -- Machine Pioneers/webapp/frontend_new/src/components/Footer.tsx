import { Github, Twitter, Mail } from "lucide-react"

export function Footer() {
  return (
    <footer className="relative z-10 py-16 px-6 border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <a 
              href="#home" 
              className="text-2xl tracking-tight text-foreground font-display inline-block mb-4"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              MovieRec<sup className="text-xs">®</sup>
            </a>
            <p className="text-muted-foreground max-w-sm leading-relaxed">
              Intelligent film recommendations powered by collaborative filtering algorithms. 
              Discover your next favorite movie through the silence of data.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-foreground font-medium mb-4">Navigation</h4>
            <ul className="space-y-3">
              {["Home", "Movies", "Recommendations", "Evaluation"].map((item) => (
                <li key={item}>
                  <a 
                    href={`#${item.toLowerCase()}`}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-foreground font-medium mb-4">Connect</h4>
            <div className="flex gap-4">
              <a 
                href="#" 
                className="w-10 h-10 rounded-full liquid-glass flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github size={18} />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full liquid-glass flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <Twitter size={18} />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full liquid-glass flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <Mail size={18} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2026 MovieRec. Built with precision and passion.
          </p>
          <p className="text-sm text-muted-foreground">
            Powered by Collaborative Filtering
          </p>
        </div>
      </div>
    </footer>
  )
}
