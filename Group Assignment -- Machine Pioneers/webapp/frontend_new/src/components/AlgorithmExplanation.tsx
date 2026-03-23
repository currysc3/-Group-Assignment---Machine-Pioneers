import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Users, Film, ArrowRight, Sparkles, Target } from "lucide-react"

interface ExplanationBase {
  type: "user_based" | "item_based"
  confidence: number
}

interface UserBasedExplanation extends ExplanationBase {
  type: "user_based"
  similar_users_count: number
  shared_interests: string[]
  reason: string
}

interface ItemBasedExplanation extends ExplanationBase {
  type: "item_based"
  source_movie: {
    movie_id: number
    title: string
    poster_url: string
  }
  similarity_factors: string[]
  reason: string
}

type Explanation = UserBasedExplanation | ItemBasedExplanation

interface AlgorithmExplanationProps {
  userId: number
  algorithm: string
  movieId?: number
  className?: string
}

export function AlgorithmExplanation({
  userId,
  algorithm,
  movieId,
  className,
}: AlgorithmExplanationProps) {
  const [explanation, setExplanation] = useState<Explanation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchExplanation = async () => {
      setLoading(true)
      setError(null)
      try {
        // If movieId is not provided, we'll need to fetch the first recommendation
        let targetMovieId = movieId
        if (!targetMovieId) {
          const recsResponse = await fetch(`/api/recommendations/${userId}?algorithm=${algorithm}&n=1`)
          if (recsResponse.ok) {
            const recsData = await recsResponse.json()
            if (recsData.recommendations && recsData.recommendations.length > 0) {
              targetMovieId = recsData.recommendations[0].movie_id
            }
          }
        }

        if (!targetMovieId) {
          throw new Error("No movie available for explanation")
        }

        const response = await fetch(
          `/api/explain/recommendation?user_id=${userId}&movie_id=${targetMovieId}&algorithm=${algorithm}`
        )
        if (!response.ok) {
          throw new Error("Failed to fetch explanation")
        }
        const data = await response.json()
        setExplanation(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchExplanation()
  }, [userId, algorithm, movieId])

  if (loading) {
    return (
      <div className={cn("liquid-glass rounded-2xl p-5 flex items-center justify-center min-h-[200px]", className)}>
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !explanation) {
    return (
      <div className={cn("liquid-glass rounded-2xl p-5 flex items-center justify-center min-h-[200px]", className)}>
        <div className="text-center">
          <p className="text-white/60 text-sm">{error || "Failed to load explanation"}</p>
        </div>
      </div>
    )
  }

  const isUserBased = explanation.type === "user_based"

  return (
    <div
      className={cn(
        "liquid-glass rounded-2xl p-5 space-y-4",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center",
            isUserBased
              ? "bg-purple-500/20 text-purple-400"
              : "bg-blue-500/20 text-blue-400"
          )}
        >
          {isUserBased ? <Users size={20} /> : <Film size={20} />}
        </div>
        <div>
          <h4 className="text-white font-medium">
            {isUserBased ? "User-Based Recommendation" : "Item-Based Recommendation"}
          </h4>
          <div className="flex items-center gap-2">
            <Sparkles size={12} className="text-yellow-400" />
            <span className="text-white/50 text-xs">
              {Math.round(explanation.confidence * 100)}% confidence
            </span>
          </div>
        </div>
      </div>

      {/* Explanation Content */}
      <div className="space-y-3">
        {isUserBased ? (
          <UserBasedContent explanation={explanation as UserBasedExplanation} />
        ) : (
          <ItemBasedContent explanation={explanation as ItemBasedExplanation} />
        )}
      </div>

      {/* Visual Indicator */}
      <div className="pt-2">
        <div className="flex items-center gap-2">
          <Target size={14} className="text-white/40" />
          <span className="text-white/40 text-xs">Why this recommendation?</span>
        </div>
        <p className="text-white/70 text-sm mt-1.5 leading-relaxed">
          {explanation.reason}
        </p>
      </div>
    </div>
  )
}

function UserBasedContent({ explanation }: { explanation: UserBasedExplanation }) {
  return (
    <div className="space-y-3">
      <p className="text-white/80 text-sm">
        <span className="text-purple-400 font-medium">
          {explanation.similar_users_count} users
        </span>{" "}
        with similar taste enjoyed this movie
      </p>

      {/* Shared Interests Tags */}
      <div className="flex flex-wrap gap-2">
        {explanation.shared_interests.map((interest) => (
          <span
            key={interest}
            className="px-2.5 py-1 rounded-full text-xs bg-purple-500/10 text-purple-300 border border-purple-500/20"
          >
            {interest}
          </span>
        ))}
      </div>

      {/* Visual Flow */}
      <div className="flex items-center gap-2 py-2">
        <div className="flex -space-x-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 border-2 border-[hsl(201,100%,13%)] flex items-center justify-center text-xs text-white font-medium"
            >
              {String.fromCharCode(65 + i)}
            </div>
          ))}
        </div>
        <ArrowRight size={16} className="text-white/40" />
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 border-2 border-[hsl(201,100%,13%)] flex items-center justify-center">
          <Film size={14} className="text-white" />
        </div>
      </div>
    </div>
  )
}

function ItemBasedContent({ explanation }: { explanation: ItemBasedExplanation }) {
  return (
    <div className="space-y-3">
      <p className="text-white/80 text-sm">
        Because you watched{" "}
        <span className="text-blue-400 font-medium">
          "{explanation.source_movie.title}"
        </span>
      </p>

      {/* Source Movie Thumbnail */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
        <img
          src={explanation.source_movie.poster_url}
          alt={explanation.source_movie.title}
          className="w-12 h-16 object-cover rounded-lg"
        />
        <div>
          <p className="text-white text-sm font-medium">
            {explanation.source_movie.title}
          </p>
          <p className="text-white/40 text-xs">Your rated movie</p>
        </div>
      </div>

      {/* Similarity Factors */}
      <div className="flex flex-wrap gap-2">
        {explanation.similarity_factors.map((factor) => (
          <span
            key={factor}
            className="px-2.5 py-1 rounded-full text-xs bg-blue-500/10 text-blue-300 border border-blue-500/20"
          >
            {factor}
          </span>
        ))}
      </div>

      {/* Visual Flow */}
      <div className="flex items-center justify-center gap-3 py-2">
        <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
          <Film size={18} className="text-blue-400" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <ArrowRight size={16} className="text-white/40" />
          <span className="text-white/30 text-[10px]">similar</span>
        </div>
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
          <Film size={18} className="text-white" />
        </div>
      </div>
    </div>
  )
}

export type { Explanation, UserBasedExplanation, ItemBasedExplanation }
