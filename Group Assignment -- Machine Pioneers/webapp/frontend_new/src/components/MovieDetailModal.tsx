import { useState, useEffect } from "react"
// import { cn } from "@/lib/utils"
import { X, Star, Clock, Calendar, Film, User, Heart, Share2, Play, Plus } from "lucide-react"

// Movie type from App.tsx
interface Movie {
  movie_id: number
  title: string
  poster_url: string
  poster_local?: string | null
  release_year?: number
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

interface CastMember {
  name: string
  character?: string
  photo_url?: string
}

interface SimilarMovie {
  movie_id: number
  title: string
  poster_url: string
  rating: number
  year: number
}

interface MovieDetail {
  movie_id: number
  title: string
  poster_url: string
  backdrop_url?: string
  release_year: number
  rating: number
  runtime: number
  genres: string[]
  overview: string
  director?: string
  cast: CastMember[]
  tagline?: string
}

interface MovieDetailModalProps {
  movie: Movie
  onClose: () => void
  onSelectSimilar?: (movie: SimilarMovie) => void
  onAddToWatchlist?: (movieId: number) => void
  onLike?: (movieId: number) => void
  onShare?: (movieId: number) => void
}

export function MovieDetailModal({
  movie,
  onClose,
  onSelectSimilar,
  onAddToWatchlist,
  onLike,
  onShare,
}: MovieDetailModalProps) {
  const [movieDetail, setMovieDetail] = useState<MovieDetail | null>(null)
  const [similarMovies, setSimilarMovies] = useState<SimilarMovie[]>([])
  const [loading, setLoading] = useState(true)
  const [, setError] = useState<string | null>(null)

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }

    document.addEventListener("keydown", handleEscape)
    document.body.style.overflow = "hidden"

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "auto"
    }
  }, [onClose])

  // Fetch movie details
  useEffect(() => {
    const fetchMovieDetail = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/movies/${movie.movie_id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch movie details")
        }
        const data = await response.json()
        setMovieDetail(data)
        
        // Fetch similar movies
        const similarResponse = await fetch(`/api/movies/${movie.movie_id}/similar`)
        if (similarResponse.ok) {
          const similarData = await similarResponse.json()
          setSimilarMovies(similarData.similar_movies || [])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
        // Use the basic movie data as fallback
        setMovieDetail({
          movie_id: movie.movie_id,
          title: movie.title,
          poster_url: movie.poster_url || movie.poster_local || "",
          release_year: movie.release_year || 0,
          rating: movie.rating || movie.vote_average || 0,
          runtime: movie.runtime || 0,
          genres: typeof movie.genres === "string" ? movie.genres.split(",").map(g => g.trim()) : movie.genres || [],
          overview: movie.overview || "No description available.",
          director: movie.director,
          cast: movie.cast?.map(name => ({ name })) || [],
          tagline: movie.tagline,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchMovieDetail()
  }, [movie])

  // Helper to convert SimilarMovie to Movie for onSelectSimilar callback
  const handleSelectSimilar = (similar: SimilarMovie) => {
    onSelectSimilar?.(similar)
  }

  const displayMovie = movieDetail || {
    movie_id: movie.movie_id,
    title: movie.title,
    poster_url: movie.poster_url || movie.poster_local || "",
    backdrop_url: undefined,
    release_year: movie.release_year,
    rating: movie.rating || movie.vote_average || 0,
    runtime: movie.runtime || 0,
    genres: typeof movie.genres === "string" ? movie.genres.split(",").map(g => g.trim()) : movie.genres || [],
    overview: movie.overview || "No description available.",
    director: movie.director,
    cast: movie.cast?.map(name => ({ name })) || [],
    tagline: movie.tagline,
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />

      {/* Modal Content */}
      <div
        className="relative z-[101] w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-[hsl(201,100%,11%)] rounded-3xl border border-white/10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/70 transition-colors"
        >
          <X size={20} />
        </button>

        {loading ? (
          <div className="flex items-center justify-center h-[400px]">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Hero Section with Backdrop */}
            <div className="relative h-64 md:h-80 overflow-hidden">
              <img
                src={displayMovie.backdrop_url || displayMovie.poster_url}
                alt={displayMovie.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[hsl(201,100%,11%)] via-[hsl(201,100%,11%)]/60 to-transparent" />
              
              {/* Trailer Play Button */}
              <button className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-colors group">
                <Play size={28} className="text-white ml-1 group-hover:scale-110 transition-transform" fill="currentColor" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 md:px-10 pb-10 -mt-20 relative">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Poster */}
                <div className="w-32 md:w-48 shrink-0 mx-auto md:mx-0">
                  <div className="aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border-2 border-white/10">
                    <img
                      src={displayMovie.poster_url}
                      alt={displayMovie.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 text-center md:text-left">
                  <h2
                    className="text-2xl md:text-4xl text-white mb-2"
                    style={{ fontFamily: "'Instrument Serif', serif" }}
                  >
                    {displayMovie.title}
                  </h2>
                  
                  {displayMovie.tagline && (
                    <p className="text-white/50 italic mb-4">"{displayMovie.tagline}"</p>
                  )}

                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm text-white/60 mb-4">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {displayMovie.release_year}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-white/30" />
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {displayMovie.runtime} min
                    </span>
                    <span className="w-1 h-1 rounded-full bg-white/30" />
                    <span className="flex items-center gap-1 text-yellow-400">
                      <Star size={14} fill="currentColor" />
                      {displayMovie.rating.toFixed(1)}
                    </span>
                  </div>

                  {/* Genres */}
                  <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-6">
                    {displayMovie.genres.map((genre) => (
                      <span
                        key={genre}
                        className="px-3 py-1 rounded-full text-xs bg-white/10 text-white/80 border border-white/10"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-center md:justify-start gap-3">
                    <button
                      onClick={() => onAddToWatchlist?.(displayMovie.movie_id)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition-colors text-sm"
                    >
                      <Plus size={16} />
                      Watchlist
                    </button>
                    <button
                      onClick={() => onLike?.(displayMovie.movie_id)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-pink-500/20 text-pink-300 hover:bg-pink-500/30 transition-colors text-sm"
                    >
                      <Heart size={16} />
                      Like
                    </button>
                    <button
                      onClick={() => onShare?.(displayMovie.movie_id)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white/70 hover:bg-white/20 transition-colors text-sm"
                    >
                      <Share2 size={16} />
                      Share
                    </button>
                  </div>
                </div>
              </div>

              {/* Overview */}
              <div className="mt-8">
                <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                  <Film size={18} className="text-white/60" />
                  Overview
                </h3>
                <p className="text-white/70 leading-relaxed">{displayMovie.overview}</p>
              </div>

              {/* Cast */}
              {displayMovie.cast.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                    <User size={18} className="text-white/60" />
                    Cast
                  </h3>
                  <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                    {displayMovie.cast.slice(0, 8).map((member, index) => (
                      <div key={index} className="shrink-0 text-center w-20">
                        <div className="w-16 h-16 mx-auto rounded-full overflow-hidden bg-white/10 mb-2">
                          {(member as CastMember).photo_url ? (
                            <img
                              src={(member as CastMember).photo_url}
                              alt={member.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/40">
                              <User size={24} />
                            </div>
                          )}
                        </div>
                        <p className="text-white text-xs font-medium line-clamp-1">{member.name}</p>
                        {(member as CastMember).character && (
                          <p className="text-white/40 text-[10px] line-clamp-1">{(member as CastMember).character}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Director */}
              {displayMovie.director && (
                <div className="mt-6 p-4 rounded-xl bg-white/5">
                  <span className="text-white/40 text-sm">Director: </span>
                  <span className="text-white text-sm">{displayMovie.director}</span>
                </div>
              )}

              {/* Similar Movies */}
              {similarMovies.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-white font-medium mb-4">Similar Movies</h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {similarMovies.slice(0, 6).map((similar) => (
                      <div
                        key={similar.movie_id}
                        className="group cursor-pointer"
                        onClick={() => handleSelectSimilar(similar)}
                      >
                        <div className="aspect-[2/3] overflow-hidden rounded-lg bg-white/5 mb-2">
                          <img
                            src={similar.poster_url}
                            alt={similar.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            loading="lazy"
                          />
                        </div>
                        <p className="text-white text-xs font-medium line-clamp-1 group-hover:text-white/80 transition-colors">
                          {similar.title}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-white/40 text-[10px]">{similar.year}</span>
                          <span className="text-yellow-400 text-[10px]">★ {similar.rating.toFixed(1)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Trailer Section Placeholder */}
              <div className="mt-8">
                <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                  <Play size={18} className="text-white/60" />
                  Trailer
                </h3>
                <div className="aspect-video rounded-xl bg-white/5 flex items-center justify-center border border-white/10 border-dashed">
                  <div className="text-center">
                    <Play size={48} className="mx-auto text-white/20 mb-2" />
                    <p className="text-white/40 text-sm">Trailer placeholder</p>
                    <p className="text-white/30 text-xs mt-1">Video playback not available</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// Example movie for demonstration
export const exampleMovieDetail: MovieDetail = {
  movie_id: 1,
  title: "The Shawshank Redemption",
  poster_url: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&h=450&fit=crop",
  backdrop_url: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&h=600&fit=crop",
  release_year: 1994,
  rating: 4.45,
  runtime: 142,
  genres: ["Drama", "Crime"],
  overview:
    "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency. The Shawshank Redemption is a 1994 American drama film written and directed by Frank Darabont, based on the 1982 Stephen King novella Rita Hayworth and Shawshank Redemption.",
  director: "Frank Darabont",
  tagline: "Fear can hold you prisoner. Hope can set you free.",
  cast: [
    { name: "Tim Robbins", character: "Andy Dufresne" },
    { name: "Morgan Freeman", character: "Ellis Boyd 'Red' Redding" },
    { name: "Bob Gunton", character: "Warden Norton" },
    { name: "William Sadler", character: "Heywood" },
    { name: "Clancy Brown", character: "Captain Hadley" },
    { name: "Gil Bellows", character: "Tommy" },
  ],
}

export const exampleSimilarMovies: SimilarMovie[] = [
  {
    movie_id: 2,
    title: "The Godfather",
    poster_url: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&h=450&fit=crop",
    rating: 4.42,
    year: 1972,
  },
  {
    movie_id: 3,
    title: "The Dark Knight",
    poster_url: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&h=450&fit=crop",
    rating: 4.32,
    year: 2008,
  },
  {
    movie_id: 4,
    title: "Pulp Fiction",
    poster_url: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&h=450&fit=crop",
    rating: 4.28,
    year: 1994,
  },
  {
    movie_id: 5,
    title: "Schindler's List",
    poster_url: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&h=450&fit=crop",
    rating: 4.26,
    year: 1993,
  },
  {
    movie_id: 6,
    title: "Forrest Gump",
    poster_url: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&h=450&fit=crop",
    rating: 4.22,
    year: 1994,
  },
  {
    movie_id: 7,
    title: "Inception",
    poster_url: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&h=450&fit=crop",
    rating: 4.18,
    year: 2010,
  },
]

export type { Movie, CastMember, SimilarMovie }
