import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { Users, Film, GitCompare, Check, X, Shuffle } from "lucide-react"

interface MovieRecommendation {
  movie_id: number
  title: string
  poster_url: string
  predicted_rating: number
}

interface AlgorithmResult {
  algorithm: "user_based" | "item_based"
  recommendations: MovieRecommendation[]
  metrics: {
    diversity: number
    novelty: number
    coverage: number
  }
}

interface ComparisonData {
  user_based: AlgorithmResult
  item_based: AlgorithmResult
}

interface AlgorithmComparisonProps {
  userId?: number
  className?: string
}

export function AlgorithmComparison({
  userId,
  className,
}: AlgorithmComparisonProps) {
  const [data, setData] = useState<ComparisonData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeAlgorithm, setActiveAlgorithm] = useState<"both" | "user_based" | "item_based">("both")

  useEffect(() => {
    const fetchComparison = async () => {
      setLoading(true)
      setError(null)
      try {
        const url = userId 
          ? `/api/compare/algorithms?user_id=${userId}`
          : "/api/compare/algorithms"
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error("Failed to fetch algorithm comparison")
        }
        const result = await response.json()
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchComparison()
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
          <p className="text-white/60 text-sm">{error || "Failed to load comparison data"}</p>
        </div>
      </div>
    )
  }

  const userBasedResults = data.user_based
  const itemBasedResults = data.item_based

  // Calculate overlap
  const userBasedIds = new Set(userBasedResults.recommendations.map((m) => m.movie_id))
  const itemBasedIds = new Set(itemBasedResults.recommendations.map((m) => m.movie_id))
  const overlapIds = [...userBasedIds].filter((id) => itemBasedIds.has(id))
  const overlapCount = overlapIds.length

  // Prepare comparison data
  const comparisonData = [
    { metric: "Diversity", userBased: userBasedResults.metrics.diversity * 100, itemBased: itemBasedResults.metrics.diversity * 100 },
    { metric: "Novelty", userBased: userBasedResults.metrics.novelty * 100, itemBased: itemBasedResults.metrics.novelty * 100 },
    { metric: "Coverage", userBased: userBasedResults.metrics.coverage * 100, itemBased: itemBasedResults.metrics.coverage * 100 },
  ]

  // Get all unique movies
  const allMovies = [...userBasedResults.recommendations, ...itemBasedResults.recommendations]
    .filter((movie, index, self) => self.findIndex((m) => m.movie_id === movie.movie_id) === index)
    .slice(0, 10)

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitCompare size={20} className="text-blue-400" />
          <h3 className="text-xl font-display text-white">Algorithm Comparison</h3>
        </div>

        {/* Algorithm Toggle */}
        <div className="flex items-center gap-2 p-1 rounded-full bg-white/5">
          <button
            onClick={() => setActiveAlgorithm("both")}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm transition-all flex items-center gap-1.5",
              activeAlgorithm === "both"
                ? "bg-white/10 text-white"
                : "text-white/50 hover:text-white/80"
            )}
          >
            <Shuffle size={14} />
            Both
          </button>
          <button
            onClick={() => setActiveAlgorithm("user_based")}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm transition-all flex items-center gap-1.5",
              activeAlgorithm === "user_based"
                ? "bg-purple-500/20 text-purple-300"
                : "text-white/50 hover:text-white/80"
            )}
          >
            <Users size={14} />
            User-Based
          </button>
          <button
            onClick={() => setActiveAlgorithm("item_based")}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm transition-all flex items-center gap-1.5",
              activeAlgorithm === "item_based"
                ? "bg-blue-500/20 text-blue-300"
                : "text-white/50 hover:text-white/80"
            )}
          >
            <Film size={14} />
            Item-Based
          </button>
        </div>
      </div>

      {/* Metrics Comparison Chart */}
      <div className="liquid-glass rounded-2xl p-5">
        <h4 className="text-white/80 text-sm font-medium mb-4">Performance Metrics</h4>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} layout="vertical">
              <XAxis
                type="number"
                domain={[0, 100]}
                tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }}
                axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="metric"
                tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={80}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(201,100%,11%)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "white" }}
                itemStyle={{ color: "white" }}
                formatter={(value) => [`${Number(value).toFixed(1)}%`, ""]}
              />
              {(activeAlgorithm === "both" || activeAlgorithm === "user_based") && (
                <Bar dataKey="userBased" name="User-Based" radius={[0, 4, 4, 0]}>
                  {comparisonData.map((_, index) => (
                    <Cell key={`user-${index}`} fill="#a855f7" />
                  ))}
                </Bar>
              )}
              {(activeAlgorithm === "both" || activeAlgorithm === "item_based") && (
                <Bar dataKey="itemBased" name="Item-Based" radius={[0, 4, 4, 0]}>
                  {comparisonData.map((_, index) => (
                    <Cell key={`item-${index}`} fill="#3b82f6" />
                  ))}
                </Bar>
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Overlap Analysis */}
      <div className="grid grid-cols-3 gap-4">
        <div className="liquid-glass rounded-xl p-4 text-center">
          <div className="text-2xl font-display text-purple-400">
            {userBasedResults.recommendations.length}
          </div>
          <div className="text-white/40 text-xs">User-Based</div>
        </div>
        <div className="liquid-glass rounded-xl p-4 text-center">
          <div className="text-2xl font-display text-green-400">
            {overlapCount}
          </div>
          <div className="text-white/40 text-xs">Overlap</div>
        </div>
        <div className="liquid-glass rounded-xl p-4 text-center">
          <div className="text-2xl font-display text-blue-400">
            {itemBasedResults.recommendations.length}
          </div>
          <div className="text-white/40 text-xs">Item-Based</div>
        </div>
      </div>

      {/* Recommendation Grid */}
      <div>
        <h4 className="text-white/80 text-sm font-medium mb-4">Recommendation Overlap</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {allMovies.map((movie) => {
            const inUserBased = userBasedIds.has(movie.movie_id)
            const inItemBased = itemBasedIds.has(movie.movie_id)
            const inBoth = inUserBased && inItemBased

            // Filter based on active algorithm
            if (activeAlgorithm === "user_based" && !inUserBased) return null
            if (activeAlgorithm === "item_based" && !inItemBased) return null

            return (
              <div
                key={movie.movie_id}
                className={cn(
                  "group relative overflow-hidden rounded-xl bg-white/5",
                  inBoth && "ring-2 ring-green-500/50"
                )}
              >
                <div className="aspect-[2/3] relative">
                  <img
                    src={movie.poster_url}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  
                  {/* Algorithm Indicators */}
                  <div className="absolute top-2 left-2 flex gap-1">
                    {inUserBased && (
                      <div className="w-5 h-5 rounded-full bg-purple-500/80 flex items-center justify-center" title="User-Based">
                        <Users size={10} className="text-white" />
                      </div>
                    )}
                    {inItemBased && (
                      <div className="w-5 h-5 rounded-full bg-blue-500/80 flex items-center justify-center" title="Item-Based">
                        <Film size={10} className="text-white" />
                      </div>
                    )}
                  </div>

                  {/* Overlap Badge */}
                  {inBoth && (
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-green-500/80 text-[10px] text-white font-medium">
                      Both
                    </div>
                  )}
                </div>

                <div className="p-2">
                  <p className="text-white text-xs font-medium line-clamp-1">{movie.title}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-white/40 text-[10px]">
                      ★ {movie.predicted_rating.toFixed(1)}
                    </span>
                    {inBoth ? (
                      <Check size={12} className="text-green-400" />
                    ) : (
                      <X size={12} className="text-white/20" />
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export type { AlgorithmResult, MovieRecommendation }
