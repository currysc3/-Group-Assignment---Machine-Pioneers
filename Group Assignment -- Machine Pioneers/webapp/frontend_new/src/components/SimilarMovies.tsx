import { cn } from "@/lib/utils"
import { Link2, Film, Star } from "lucide-react"

interface SimilarMovie {
  movie_id: number
  title: string
  poster_url: string
  release_year: number
  rating: number
  similarity_score: number
  shared_genres: string[]
}

interface SimilarMoviesProps {
  movies: SimilarMovie[]
  currentMovieTitle: string
  className?: string
  onSelectMovie?: (movie: SimilarMovie) => void
}

export function SimilarMovies({
  movies,
  currentMovieTitle,
  className,
  onSelectMovie,
}: SimilarMoviesProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2">
        <Link2 size={18} className="text-blue-400" />
        <h3 className="text-lg font-display text-white">
          Similar to "{currentMovieTitle}"
        </h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        {movies.slice(0, 6).map((movie) => (
          <div
            key={movie.movie_id}
            className="group cursor-pointer"
            onClick={() => onSelectMovie?.(movie)}
          >
            {/* Poster */}
            <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-white/5 mb-3">
              <img
                src={movie.poster_url}
                alt={movie.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              
              {/* Similarity Badge */}
              <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-blue-500/80 backdrop-blur-sm text-xs text-white font-medium">
                {Math.round(movie.similarity_score * 100)}% match
              </div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                <div className="flex items-center gap-1 text-yellow-400 mb-1">
                  <Star size={12} fill="currentColor" />
                  <span className="text-sm font-medium">{movie.rating.toFixed(1)}</span>
                </div>
                <p className="text-white/60 text-xs">{movie.release_year}</p>
              </div>
            </div>

            {/* Info */}
            <h4 className="text-white text-sm font-medium line-clamp-1 group-hover:text-white/80 transition-colors">
              {movie.title}
            </h4>

            {/* Shared Genres */}
            <div className="flex items-center gap-1 mt-1.5">
              <Film size={12} className="text-white/40" />
              <p className="text-white/40 text-xs line-clamp-1">
                {movie.shared_genres.slice(0, 2).join(", ")}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export type { SimilarMovie }
