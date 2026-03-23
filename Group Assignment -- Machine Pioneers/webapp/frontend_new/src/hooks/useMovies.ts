import { useState, useEffect } from "react"

export interface Movie {
  movie_id: number
  title: string
  genres: string
  poster_url: string
  poster_local: string
  rating: number
  release_year: number
}

export function useMovies() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch("/api/movies")
        if (!response.ok) throw new Error("Failed to fetch movies")
        const data = await response.json()
        setMovies(data.movies || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }

    fetchMovies()
  }, [])

  return { movies, loading, error }
}

export function useRecommendations(userId: string, algorithm: string = "user_based") {
  const [recommendations, setRecommendations] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await fetch(
          `/api/recommendations?user_id=${userId}&algorithm=${algorithm}&n=10`
        )
        if (!response.ok) throw new Error("Failed to fetch recommendations")
        const data = await response.json()
        setRecommendations(data.recommendations || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchRecommendations()
    }
  }, [userId, algorithm])

  return { recommendations, loading, error }
}
