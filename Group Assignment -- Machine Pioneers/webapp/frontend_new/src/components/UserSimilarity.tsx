import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts"
import { Users, Heart, Share2, MessageCircle, UserPlus } from "lucide-react"

interface GenreMatch {
  genre: string
  user_score: number
  similar_user_score: number
}

interface SimilarUser {
  user_id: string
  username: string
  avatar_url?: string
  similarity_percentage: number
  shared_genres: string[]
  common_movies_count: number
  genre_comparison: GenreMatch[]
}

interface SimilarityData {
  current_user: {
    user_id: string
    username: string
  }
  similar_users: SimilarUser[]
}

interface UserSimilarityProps {
  userId?: number
  className?: string
  onConnect?: (userId: string) => void
  onViewProfile?: (userId: string) => void
}

export function UserSimilarity({
  userId,
  className,
  onConnect,
  onViewProfile,
}: UserSimilarityProps) {
  const [data, setData] = useState<SimilarityData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSimilarity = async () => {
      setLoading(true)
      setError(null)
      try {
        // userId can be 0, so check for undefined/null instead of falsy
        const url = userId !== undefined && userId !== null
          ? `/api/users/similarity?user_id=${userId}`
          : "/api/users/similarity"
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error("Failed to fetch user similarity data")
        }
        const result = await response.json()
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchSimilarity()
  }, [userId])

  if (loading) {
    return (
      <div className={cn("flex items-center justify-center py-20", className)}>
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className={cn("flex items-center justify-center py-20", className)}>
        <div className="text-center">
          <p className="text-white/60 text-sm">{error || "Failed to load similarity data"}</p>
        </div>
      </div>
    )
  }

  const { current_user, similar_users } = data

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400">
          <Users size={20} />
        </div>
        <div>
          <h3 className="text-xl font-display text-white">Taste Match</h3>
          <p className="text-white/50 text-sm">
            Users with similar preferences to {current_user.username}
          </p>
        </div>
      </div>

      {/* Similar Users Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {similar_users.map((user) => (
          <SimilarUserCard
            key={user.user_id}
            user={user}
            onConnect={() => onConnect?.(user.user_id)}
            onViewProfile={() => onViewProfile?.(user.user_id)}
          />
        ))}
      </div>
    </div>
  )
}

interface SimilarUserCardProps {
  user: SimilarUser
  onConnect: () => void
  onViewProfile: () => void
}

function SimilarUserCard({ user, onConnect, onViewProfile }: SimilarUserCardProps) {
  const similarityLevel =
    user.similarity_percentage >= 80
      ? "exceptional"
      : user.similarity_percentage >= 60
      ? "high"
      : user.similarity_percentage >= 40
      ? "moderate"
      : "low"

  const similarityConfig = {
    exceptional: { color: "text-pink-400", bgColor: "bg-pink-500/20", label: "Exceptional Match" },
    high: { color: "text-purple-400", bgColor: "bg-purple-500/20", label: "High Match" },
    moderate: { color: "text-blue-400", bgColor: "bg-blue-500/20", label: "Good Match" },
    low: { color: "text-white/40", bgColor: "bg-white/10", label: "Some Similarity" },
  }

  const config = similarityConfig[similarityLevel]

  return (
    <div className="liquid-glass rounded-2xl p-5 space-y-4">
      {/* User Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center text-xl font-medium text-white">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h4 className="text-white font-medium">{user.username}</h4>
            <p className="text-white/40 text-xs">User #{user.user_id}</p>
          </div>
        </div>
        <div
          className={cn(
            "px-2.5 py-1 rounded-full text-xs font-medium",
            config.bgColor,
            config.color
          )}
        >
          {user.similarity_percentage}% match
        </div>
      </div>

      {/* Similarity Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-white/50">Taste Similarity</span>
          <span className={config.color}>{config.label}</span>
        </div>
        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              similarityLevel === "exceptional" && "bg-pink-500",
              similarityLevel === "high" && "bg-purple-500",
              similarityLevel === "moderate" && "bg-blue-500",
              similarityLevel === "low" && "bg-white/40"
            )}
            style={{ width: `${user.similarity_percentage}%` }}
          />
        </div>
      </div>

      {/* Genre Comparison Radar */}
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={user.genre_comparison}>
            <PolarGrid stroke="rgba(255,255,255,0.1)" />
            <PolarAngleAxis
              dataKey="genre"
              tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 9 }}
            />
            <Radar
              name="You"
              dataKey="user_score"
              stroke="#3b82f6"
              strokeWidth={1.5}
              fill="#3b82f6"
              fillOpacity={0.2}
            />
            <Radar
              name={user.username}
              dataKey="similar_user_score"
              stroke="#ec4899"
              strokeWidth={1.5}
              fill="#ec4899"
              fillOpacity={0.2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Shared Info */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1.5 text-white/60">
          <Heart size={14} className="text-pink-400" />
          <span>{user.shared_genres.length} shared genres</span>
        </div>
        <div className="flex items-center gap-1.5 text-white/60">
          <Share2 size={14} className="text-blue-400" />
          <span>{user.common_movies_count} movies in common</span>
        </div>
      </div>

      {/* Shared Genres Tags */}
      <div className="flex flex-wrap gap-1.5">
        {user.shared_genres.slice(0, 4).map((genre) => (
          <span
            key={genre}
            className="px-2 py-0.5 rounded-full text-[10px] bg-white/10 text-white/70"
          >
            {genre}
          </span>
        ))}
        {user.shared_genres.length > 4 && (
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/5 text-white/40">
            +{user.shared_genres.length - 4} more
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <button
          onClick={onConnect}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition-colors text-sm"
        >
          <UserPlus size={14} />
          Connect
        </button>
        <button
          onClick={onViewProfile}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-colors text-sm"
        >
          <MessageCircle size={14} />
          View
        </button>
      </div>
    </div>
  )
}

// Example data generator for demonstration
export const generateExampleSimilarUsers = (_currentUserId: string): SimilarUser[] => [
  {
    user_id: "42",
    username: "MovieBuff99",
    similarity_percentage: 87,
    shared_genres: ["Sci-Fi", "Thriller", "Drama", "Mystery"],
    common_movies_count: 23,
    genre_comparison: [
      { genre: "Action", user_score: 60, similar_user_score: 70 },
      { genre: "Comedy", user_score: 40, similar_user_score: 45 },
      { genre: "Drama", user_score: 90, similar_user_score: 85 },
      { genre: "Sci-Fi", user_score: 95, similar_user_score: 90 },
      { genre: "Thriller", user_score: 80, similar_user_score: 85 },
      { genre: "Romance", user_score: 30, similar_user_score: 35 },
    ],
  },
  {
    user_id: "128",
    username: "CinemaLover",
    similarity_percentage: 72,
    shared_genres: ["Drama", "Crime", "Film-Noir"],
    common_movies_count: 15,
    genre_comparison: [
      { genre: "Action", user_score: 50, similar_user_score: 40 },
      { genre: "Comedy", user_score: 40, similar_user_score: 50 },
      { genre: "Drama", user_score: 90, similar_user_score: 88 },
      { genre: "Crime", user_score: 75, similar_user_score: 80 },
      { genre: "Noir", user_score: 70, similar_user_score: 65 },
      { genre: "Horror", user_score: 20, similar_user_score: 25 },
    ],
  },
  {
    user_id: "256",
    username: "FilmCritic",
    similarity_percentage: 65,
    shared_genres: ["Documentary", "Drama", "Biography"],
    common_movies_count: 12,
    genre_comparison: [
      { genre: "Action", user_score: 60, similar_user_score: 30 },
      { genre: "Drama", user_score: 90, similar_user_score: 85 },
      { genre: "Doc", user_score: 80, similar_user_score: 90 },
      { genre: "Biography", user_score: 70, similar_user_score: 75 },
      { genre: "History", user_score: 65, similar_user_score: 70 },
      { genre: "War", user_score: 50, similar_user_score: 55 },
    ],
  },
  {
    user_id: "512",
    username: "ActionFan",
    similarity_percentage: 58,
    shared_genres: ["Action", "Adventure", "Thriller"],
    common_movies_count: 8,
    genre_comparison: [
      { genre: "Action", user_score: 60, similar_user_score: 95 },
      { genre: "Adventure", user_score: 70, similar_user_score: 85 },
      { genre: "Thriller", user_score: 80, similar_user_score: 75 },
      { genre: "Comedy", user_score: 40, similar_user_score: 50 },
      { genre: "Drama", user_score: 90, similar_user_score: 40 },
      { genre: "Horror", user_score: 20, similar_user_score: 30 },
    ],
  },
]

export type { SimilarUser, GenreMatch }
