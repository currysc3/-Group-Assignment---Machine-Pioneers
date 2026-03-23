import { useState } from "react"
import { useMovies } from "@/hooks/useMovies"
import { MovieCard } from "./MovieCard"
import { LiquidGlassButton } from "./LiquidGlassButton"
import { Search, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const genres = ["All", "Drama", "Action", "Comedy", "Thriller", "Romance", "Sci-Fi"]

export function MoviesSection() {
  const { movies, loading, error } = useMovies()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGenre, setSelectedGenre] = useState("All")
  const [showAll, setShowAll] = useState(false)

  const filteredMovies = movies.filter((movie) => {
    const matchesSearch = movie.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesGenre = selectedGenre === "All" || movie.genres.includes(selectedGenre)
    return matchesSearch && matchesGenre
  })

  const displayedMovies = showAll ? filteredMovies : filteredMovies.slice(0, 12)

  return (
    <section id="movies" className="relative z-10 py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 
            className="text-4xl md:text-5xl tracking-tight text-foreground mb-4"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Discover Cinema
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Explore our curated collection of films, from timeless classics to modern masterpieces.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
          {/* Search */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-full liquid-glass text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-white/20"
            />
          </div>

          {/* Genre Filter */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            {genres.map((genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all duration-200",
                  selectedGenre === genre
                    ? "liquid-glass text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        {/* Movies Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-20 text-muted-foreground">
            Failed to load movies. Please try again.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
              {displayedMovies.map((movie) => (
                <MovieCard key={movie.movie_id} movie={movie} />
              ))}
            </div>

            {/* Load More */}
            {filteredMovies.length > 12 && !showAll && (
              <div className="text-center mt-12">
                <LiquidGlassButton onClick={() => setShowAll(true)}>
                  View All Movies
                  <ChevronDown className="inline-block ml-2" size={16} />
                </LiquidGlassButton>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
