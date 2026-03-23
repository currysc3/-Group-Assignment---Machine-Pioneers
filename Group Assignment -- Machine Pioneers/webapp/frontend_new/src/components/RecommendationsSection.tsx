import { useState } from "react"
import { useRecommendations } from "@/hooks/useMovies"
import { MovieCard } from "./MovieCard"
import { cn } from "@/lib/utils"
import { Users, Film } from "lucide-react"

const algorithms = [
  { id: "user_based", name: "User-Based CF", icon: Users },
  { id: "item_based", name: "Item-Based CF", icon: Film },
]

const sampleUserIds = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]

export function RecommendationsSection() {
  const [selectedUser, setSelectedUser] = useState("0")
  const [selectedAlgorithm, setSelectedAlgorithm] = useState("user_based")
  const { recommendations, loading, error } = useRecommendations(
    selectedUser,
    selectedAlgorithm
  )

  return (
    <section id="recommendations" className="relative z-10 py-24 px-6 bg-black/20">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 
            className="text-4xl md:text-5xl tracking-tight text-foreground mb-4"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Personalized For You
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Discover films tailored to your taste using our collaborative filtering algorithms.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-12">
          {/* User Selection */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">User:</span>
            <div className="flex gap-2">
              {sampleUserIds.slice(0, 5).map((userId) => (
                <button
                  key={userId}
                  onClick={() => setSelectedUser(userId)}
                  className={cn(
                    "w-10 h-10 rounded-full text-sm font-medium transition-all duration-200",
                    selectedUser === userId
                      ? "liquid-glass text-foreground"
                      : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
                  )}
                >
                  {userId}
                </button>
              ))}
            </div>
          </div>

          {/* Algorithm Selection */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Algorithm:</span>
            <div className="flex gap-2">
              {algorithms.map((algo) => (
                <button
                  key={algo.id}
                  onClick={() => setSelectedAlgorithm(algo.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all duration-200",
                    selectedAlgorithm === algo.id
                      ? "liquid-glass text-foreground"
                      : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
                  )}
                >
                  <algo.icon size={14} />
                  {algo.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Recommendations Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-20 text-muted-foreground">
            Failed to load recommendations. Please try again.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6">
            {recommendations.map((movie, index) => (
              <MovieCard 
                key={movie.movie_id} 
                movie={movie} 
                index={index}
              />
            ))}
          </div>
        )}

        {/* Algorithm Info */}
        <div className="mt-16 grid md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl liquid-glass">
            <div className="flex items-center gap-3 mb-4">
              <Users className="text-muted-foreground" size={20} />
              <h3 className="text-foreground font-medium">User-Based CF</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Finds users with similar taste patterns and recommends movies they enjoyed. 
              Best for discovering hidden gems based on community preferences.
            </p>
          </div>
          
          <div className="p-6 rounded-2xl liquid-glass">
            <div className="flex items-center gap-3 mb-4">
              <Film className="text-muted-foreground" size={20} />
              <h3 className="text-foreground font-medium">Item-Based CF</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Analyzes movie similarities based on user ratings. Recommends films 
              similar to those you've already enjoyed. More precise for known preferences.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
