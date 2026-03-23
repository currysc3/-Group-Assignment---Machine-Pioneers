import { useState, useRef } from "react"
import { cn } from "@/lib/utils"
import { Star, Calendar, Play, Heart } from "lucide-react"

interface MovieCardProps {
  movie: any
  onClick?: (movie: any) => void
  index?: number
  className?: string
}

export function MovieCard({ movie, onClick, index = 0, className }: MovieCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 })
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    setMousePosition({ x, y })
  }

  // Calculate 3D tilt effect (subtle)
  const tiltX = (mousePosition.y - 0.5) * -8
  const tiltY = (mousePosition.x - 0.5) * 8

  // Staggered animation delay
  const animationDelay = index * 80

  // Get genres as array
  const genres = Array.isArray(movie.genres) 
    ? movie.genres 
    : movie.genres ? [movie.genres] : []

  // Rating value
  const rating = movie.vote_average || movie.rating || movie.predicted_rating

  return (
    <div
      ref={cardRef}
      className={cn(
        "group relative cursor-pointer",
        className
      )}
      style={{ 
        animationDelay: `${animationDelay}ms`,
        perspective: "1000px"
      }}
      onClick={() => onClick?.(movie)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        setMousePosition({ x: 0.5, y: 0.5 })
      }}
      onMouseMove={handleMouseMove}
    >
      {/* Card Container with 3D Transform */}
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl transition-all duration-500 ease-out",
          "bg-gradient-to-br from-slate-800/50 to-slate-900/50",
          "border border-white/5",
          isHovered && "border-cyan-500/30 shadow-2xl shadow-cyan-500/10"
        )}
        style={{
          transform: isHovered
            ? `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`
            : "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Poster Image Container */}
        <div className="aspect-[2/3] overflow-hidden relative">
          {/* Main Image */}
          <img
            src={movie.poster_url}
            alt={movie.title}
            className={cn(
              "w-full h-full object-cover transition-all duration-700 ease-out",
              isHovered ? "scale-105 brightness-90" : "scale-100 brightness-100"
            )}
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=300&h=450&fit=crop"
            }}
          />
          
          {/* Gradient Overlays */}
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent",
              "transition-opacity duration-500",
              isHovered ? "opacity-100" : "opacity-60"
            )}
          />

          {/* Shine Effect */}
          <div
            className={cn(
              "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700",
              "pointer-events-none mix-blend-overlay"
            )}
            style={{
              background: isHovered
                ? `radial-gradient(circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, rgba(255,255,255,0.2) 0%, transparent 60%)`
                : "none",
            }}
          />

          {/* Top Actions */}
          <div className="absolute top-3 left-3 right-3 flex justify-between items-start opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-y-2 group-hover:translate-y-0">
            {/* Rating Badge */}
            {rating && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
                <Star size={12} className="text-yellow-400 fill-yellow-400" />
                <span className="text-white text-xs font-semibold">{rating.toFixed(1)}</span>
              </div>
            )}

            {/* Like Button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsLiked(!isLiked)
              }}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
                "backdrop-blur-md border",
                isLiked 
                  ? "bg-red-500/80 border-red-400/50 text-white" 
                  : "bg-black/40 border-white/20 text-white/70 hover:bg-white/20"
              )}
            >
              <Heart size={14} className={cn(isLiked && "fill-current")} />
            </button>
          </div>

          {/* Center Play Button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
            <div
              className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center",
                "bg-white/20 backdrop-blur-md border border-white/30",
                "transform scale-50 group-hover:scale-100 transition-transform duration-500",
                "hover:bg-white/30 hover:scale-110"
              )}
            >
              <Play size={28} className="text-white fill-white ml-1" />
            </div>
          </div>

          {/* Bottom Content */}
          <div className="absolute inset-x-0 bottom-0 p-4 transform transition-transform duration-500">
            {/* Title */}
            <h3 className="text-white font-semibold text-sm leading-tight line-clamp-2 mb-2 drop-shadow-lg">
              {movie.title}
            </h3>

            {/* Meta Row */}
            <div className="flex items-center gap-3 text-white/70 text-xs mb-2">
              {movie.release_year && (
                <span className="flex items-center gap-1">
                  <Calendar size={11} />
                  {movie.release_year}
                </span>
              )}
            </div>

            {/* Genres */}
            {genres.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {genres.slice(0, 3).map((genre: string, i: number) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-full text-[10px] bg-white/10 text-white/80 backdrop-blur-sm border border-white/5"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Shadow */}
      <div
        className={cn(
          "absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-purple-500/0 blur-xl",
          "transition-all duration-500 -z-10",
          isHovered ? "opacity-100" : "opacity-0"
        )}
      />
    </div>
  )
}
