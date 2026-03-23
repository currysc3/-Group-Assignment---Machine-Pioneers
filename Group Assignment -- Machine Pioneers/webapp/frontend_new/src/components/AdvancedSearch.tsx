import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Search, SlidersHorizontal, X, Calendar, Star, Clock, Film } from "lucide-react"

interface SearchFilters {
  query: string
  yearRange: [number, number]
  ratingRange: [number, number]
  genres: string[]
  runtimeRange: [number, number]
}

// Movie type from App.tsx
interface Movie {
  movie_id: number
  title: string
  poster_url: string
  poster_local: string
  release_year: number
  rating?: number
  vote_average?: number
  predicted_rating?: number
  genres?: string | string[]
  overview?: string
  cast?: string[]
  director?: string
  tagline?: string
  runtime?: number
}

interface AdvancedSearchProps {
  onMovieSelect?: (movie: Movie) => void
  className?: string
}

const GENRES = [
  "Action", "Adventure", "Animation", "Children", "Comedy", "Crime",
  "Documentary", "Drama", "Fantasy", "Film-Noir", "Horror", "Musical",
  "Mystery", "Romance", "Sci-Fi", "Thriller", "War", "Western",
]

const CURRENT_YEAR = new Date().getFullYear()

export function AdvancedSearch({
  onMovieSelect,
  className,
}: AdvancedSearchProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    yearRange: [1900, CURRENT_YEAR],
    ratingRange: [0, 5],
    genres: [],
    runtimeRange: [0, 300],
  })
  const [results, setResults] = useState<Movie[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (filters.query) params.append("query", filters.query)
      params.append("year_from", filters.yearRange[0].toString())
      params.append("year_to", filters.yearRange[1].toString())
      params.append("rating_from", filters.ratingRange[0].toString())
      params.append("rating_to", filters.ratingRange[1].toString())
      params.append("runtime_from", filters.runtimeRange[0].toString())
      params.append("runtime_to", filters.runtimeRange[1].toString())
      filters.genres.forEach((genre) => params.append("genres", genre))

      const response = await fetch(`/api/movies/search?${params.toString()}`)
      if (!response.ok) {
        throw new Error("Failed to search movies")
      }
      const data = await response.json()
      setResults(data.movies || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  // Search when query changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (filters.query || filters.genres.length > 0) {
        handleSearch()
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [filters.query])

  const toggleGenre = (genre: string) => {
    setFilters((prev) => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter((g) => g !== genre)
        : [...prev.genres, genre],
    }))
  }

  const clearFilters = () => {
    setFilters({
      query: "",
      yearRange: [1900, CURRENT_YEAR],
      ratingRange: [0, 5],
      genres: [],
      runtimeRange: [0, 300],
    })
    setResults([])
  }

  const hasActiveFilters =
    filters.query ||
    filters.genres.length > 0 ||
    filters.yearRange[0] !== 1900 ||
    filters.yearRange[1] !== CURRENT_YEAR ||
    filters.ratingRange[0] !== 0 ||
    filters.ratingRange[1] !== 5 ||
    filters.runtimeRange[0] !== 0 ||
    filters.runtimeRange[1] !== 300

  // Helper to get movie rating
  const getMovieRating = (movie: Movie): number => {
    return movie.rating || movie.vote_average || 0
  }

  // Helper to get movie genres as array
  const getMovieGenres = (movie: Movie): string[] => {
    if (!movie.genres) return []
    if (typeof movie.genres === "string") return movie.genres.split(",").map(g => g.trim())
    return movie.genres
  }

  // Helper to get poster URL
  const getPosterUrl = (movie: Movie): string => {
    return movie.poster_url || movie.poster_local || ""
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Search Bar */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
          />
          <input
            type="text"
            placeholder="Search movies..."
            value={filters.query}
            onChange={(e) => setFilters((prev) => ({ ...prev, query: e.target.value }))}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-white/30 transition-colors"
          />
          {filters.query && (
            <button
              onClick={() => setFilters((prev) => ({ ...prev, query: "" }))}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "px-4 py-3 rounded-xl flex items-center gap-2 transition-colors",
            isExpanded
              ? "bg-white/20 text-white"
              : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
          )}
        >
          <SlidersHorizontal size={18} />
          <span className="hidden sm:inline">Filters</span>
          {hasActiveFilters && (
            <span className="w-5 h-5 rounded-full bg-blue-500 text-xs flex items-center justify-center">
              {filters.genres.length +
                (filters.query ? 1 : 0) +
                (filters.yearRange[0] !== 1900 || filters.yearRange[1] !== CURRENT_YEAR ? 1 : 0) +
                (filters.ratingRange[0] !== 0 || filters.ratingRange[1] !== 5 ? 1 : 0)}
            </span>
          )}
        </button>
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-6 py-3 rounded-xl bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition-colors font-medium disabled:opacity-50"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            "Search"
          )}
        </button>
      </div>

      {/* Filters Panel */}
      {isExpanded && (
        <div className="liquid-glass rounded-2xl p-5 space-y-5 animate-fade-rise">
          <div className="flex items-center justify-between">
            <h4 className="text-white font-medium flex items-center gap-2">
              <SlidersHorizontal size={16} className="text-white/60" />
              Advanced Filters
            </h4>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-white/50 hover:text-white/80 flex items-center gap-1"
              >
                <X size={12} />
                Clear all
              </button>
            )}
          </div>

          {/* Year Range */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <Calendar size={14} />
              <span>Year Range</span>
              <span className="text-white/40 ml-auto">
                {filters.yearRange[0]} - {filters.yearRange[1]}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1900"
                max={CURRENT_YEAR}
                value={filters.yearRange[0]}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    yearRange: [parseInt(e.target.value), prev.yearRange[1]],
                  }))
                }
                className="flex-1 accent-blue-500"
              />
              <input
                type="range"
                min="1900"
                max={CURRENT_YEAR}
                value={filters.yearRange[1]}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    yearRange: [prev.yearRange[0], parseInt(e.target.value)],
                  }))
                }
                className="flex-1 accent-blue-500"
              />
            </div>
          </div>

          {/* Rating Range */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <Star size={14} />
              <span>Rating Range</span>
              <span className="text-white/40 ml-auto">
                {filters.ratingRange[0]} - {filters.ratingRange[1]} ★
              </span>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="5"
                step="0.5"
                value={filters.ratingRange[0]}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    ratingRange: [parseFloat(e.target.value), prev.ratingRange[1]],
                  }))
                }
                className="flex-1 accent-yellow-500"
              />
              <input
                type="range"
                min="0"
                max="5"
                step="0.5"
                value={filters.ratingRange[1]}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    ratingRange: [prev.ratingRange[0], parseFloat(e.target.value)],
                  }))
                }
                className="flex-1 accent-yellow-500"
              />
            </div>
          </div>

          {/* Runtime Range */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <Clock size={14} />
              <span>Runtime</span>
              <span className="text-white/40 ml-auto">
                {filters.runtimeRange[0]} - {filters.runtimeRange[1]} min
              </span>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="300"
                step="15"
                value={filters.runtimeRange[0]}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    runtimeRange: [parseInt(e.target.value), prev.runtimeRange[1]],
                  }))
                }
                className="flex-1 accent-purple-500"
              />
              <input
                type="range"
                min="0"
                max="300"
                step="15"
                value={filters.runtimeRange[1]}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    runtimeRange: [prev.runtimeRange[0], parseInt(e.target.value)],
                  }))
                }
                className="flex-1 accent-purple-500"
              />
            </div>
          </div>

          {/* Genre Checkboxes */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <Film size={14} />
              <span>Genres</span>
              {filters.genres.length > 0 && (
                <span className="text-white/40 ml-auto">{filters.genres.length} selected</span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {GENRES.map((genre) => (
                <button
                  key={genre}
                  onClick={() => toggleGenre(genre)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs transition-all",
                    filters.genres.includes(genre)
                      ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                      : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70"
                  )}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="text-center py-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Results Count */}
      {results.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-white/50 text-sm">
            Found <span className="text-white font-medium">{results.length}</span> movies
          </p>
        </div>
      )}

      {/* Results Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {results.map((movie) => (
          <div
            key={movie.movie_id}
            className="group cursor-pointer"
            onClick={() => onMovieSelect?.(movie)}
          >
            <div className="aspect-[2/3] overflow-hidden rounded-xl bg-white/5 mb-3 relative">
              <img
                src={getPosterUrl(movie)}
                alt={movie.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                <div className="flex items-center gap-1 text-yellow-400">
                  <Star size={12} fill="currentColor" />
                  <span className="text-sm font-medium">{getMovieRating(movie).toFixed(1)}</span>
                </div>
                {movie.runtime && (
                  <p className="text-white/60 text-xs mt-1">{movie.runtime} min</p>
                )}
              </div>
            </div>

            <h4 className="text-white text-sm font-medium line-clamp-1 group-hover:text-white/80 transition-colors">
              {movie.title}
            </h4>
            <div className="flex items-center justify-between mt-1">
              <span className="text-white/40 text-xs">{movie.release_year}</span>
              <span className="text-white/30 text-xs line-clamp-1 max-w-[60%]">
                {getMovieGenres(movie).slice(0, 2).join(", ")}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {results.length === 0 && hasActiveFilters && !loading && (
        <div className="text-center py-12">
          <Film size={48} className="mx-auto text-white/20 mb-4" />
          <p className="text-white/50">No movies found matching your criteria</p>
          <button
            onClick={clearFilters}
            className="mt-4 text-blue-400 hover:text-blue-300 text-sm"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  )
}

export type { SearchFilters, Movie }
