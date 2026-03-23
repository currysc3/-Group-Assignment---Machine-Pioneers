import { useState, useEffect, useMemo } from "react"
import { cn } from "@/lib/utils"
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts"
import { Star, Activity, TrendingUp, TrendingDown, Film, Award } from "lucide-react"

interface GenrePreference {
  genre: string
  score: number
}

interface TopRatedMovie {
  movie_id: number
  title: string
  rating: number
  poster_url: string
}

interface RatingDistribution {
  rating: number
  count: number
}

interface UserProfile {
  user_id: string
  username: string
  total_ratings: number
  avg_rating: number
  rating_bias: number // positive = generous rater, negative = strict rater
  activity_level: "low" | "medium" | "high" | "very_high"
  genre_preferences: GenrePreference[]
  top_rated_movies: TopRatedMovie[]
  rating_distribution: RatingDistribution[]
}

interface UserProfileCardProps {
  userId: number
  className?: string
}

const activityConfig = {
  low: { label: "Casual", color: "bg-yellow-500/20 text-yellow-400", icon: Activity },
  medium: { label: "Regular", color: "bg-blue-500/20 text-blue-400", icon: Activity },
  high: { label: "Active", color: "bg-green-500/20 text-green-400", icon: TrendingUp },
  very_high: { label: "Power User", color: "bg-purple-500/20 text-purple-400", icon: Award },
}

const ratingColors = [
  "#ef4444", // 0.5 - red
  "#f97316", // 1.0 - orange
  "#f59e0b", // 1.5 - amber
  "#eab308", // 2.0 - yellow
  "#84cc16", // 2.5 - lime
  "#22c55e", // 3.0 - green
  "#10b981", // 3.5 - emerald
  "#14b8a6", // 4.0 - teal
  "#06b6d4", // 4.5 - cyan
  "#3b82f6", // 5.0 - blue
]

export function UserProfileCard({ userId, className }: UserProfileCardProps) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/users/${userId}/profile`)
        if (!response.ok) {
          throw new Error("Failed to fetch user profile")
        }
        const data = await response.json()
        setUser(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [userId])

  const biasIndicator = useMemo(() => {
    if (!user) return null
    if (user.rating_bias > 0.3) {
      return {
        label: "Generous Rater",
        description: "Tends to rate movies higher than average",
        icon: TrendingUp,
        color: "text-green-400",
        bgColor: "bg-green-500/10",
      }
    } else if (user.rating_bias < -0.3) {
      return {
        label: "Critical Rater",
        description: "Tends to rate movies lower than average",
        icon: TrendingDown,
        color: "text-red-400",
        bgColor: "bg-red-500/10",
      }
    }
    return {
      label: "Balanced Rater",
      description: "Rates movies around the average",
      icon: Star,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
    }
  }, [user?.rating_bias])

  if (loading) {
    return (
      <div className={cn("liquid-glass rounded-2xl p-6 flex items-center justify-center min-h-[400px]", className)}>
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className={cn("liquid-glass rounded-2xl p-6 flex items-center justify-center min-h-[400px]", className)}>
        <div className="text-center">
          <p className="text-white/60 text-sm">{error || "Failed to load user profile"}</p>
        </div>
      </div>
    )
  }

  const ActivityIcon = activityConfig[user.activity_level].icon
  const BiasIcon = biasIndicator?.icon || Star

  return (
    <div
      className={cn(
        "liquid-glass rounded-2xl p-6 space-y-6",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-display text-white">{user.username}</h3>
          <p className="text-white/50 text-sm">User #{user.user_id}</p>
        </div>
        <div
          className={cn(
            "px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5",
            activityConfig[user.activity_level].color
          )}
        >
          <ActivityIcon size={14} />
          {activityConfig[user.activity_level].label}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-3 rounded-xl bg-white/5">
          <div className="text-2xl font-display text-white">{user.total_ratings}</div>
          <div className="text-white/40 text-xs">Ratings</div>
        </div>
        <div className="text-center p-3 rounded-xl bg-white/5">
          <div className="text-2xl font-display text-white">{user.avg_rating.toFixed(1)}</div>
          <div className="text-white/40 text-xs">Avg Rating</div>
        </div>
        <div
          className={cn(
            "text-center p-3 rounded-xl",
            biasIndicator?.bgColor
          )}
        >
          <div className={cn("text-lg font-medium flex items-center justify-center gap-1", biasIndicator?.color)}>
            <BiasIcon size={16} />
            {user.rating_bias > 0 ? "+" : ""}
            {user.rating_bias.toFixed(1)}
          </div>
          <div className="text-white/40 text-xs">{biasIndicator?.label}</div>
        </div>
      </div>

      {/* Genre Preferences Radar Chart */}
      <div>
        <h4 className="text-white/80 text-sm font-medium mb-3 flex items-center gap-2">
          <Film size={16} className="text-white/60" />
          Genre Preferences
        </h4>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={user.genre_preferences}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis
                dataKey="genre"
                tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 10 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={false}
                axisLine={false}
              />
              <Radar
                name="Preference"
                dataKey="score"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="#3b82f6"
                fillOpacity={0.3}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Rating Distribution */}
      <div>
        <h4 className="text-white/80 text-sm font-medium mb-3">Rating Distribution</h4>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={user.rating_distribution}>
              <XAxis
                dataKey="rating"
                tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }}
                axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(201,100%,11%)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "white" }}
                itemStyle={{ color: "white" }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {user.rating_distribution.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={ratingColors[index] || "#3b82f6"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Rated Movies */}
      <div>
        <h4 className="text-white/80 text-sm font-medium mb-3">Top Rated Movies</h4>
        <div className="space-y-2">
          {user.top_rated_movies.slice(0, 3).map((movie, idx) => (
            <div
              key={movie.movie_id}
              className="flex items-center gap-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <span className="text-white/30 text-sm w-4">{idx + 1}</span>
              <img
                src={movie.poster_url}
                alt={movie.title}
                className="w-8 h-12 object-cover rounded"
              />
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm truncate">{movie.title}</p>
              </div>
              <div className="flex items-center gap-1 text-yellow-400">
                <Star size={12} fill="currentColor" />
                <span className="text-sm font-medium">{movie.rating.toFixed(1)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export type { UserProfile, GenrePreference, TopRatedMovie, RatingDistribution }
