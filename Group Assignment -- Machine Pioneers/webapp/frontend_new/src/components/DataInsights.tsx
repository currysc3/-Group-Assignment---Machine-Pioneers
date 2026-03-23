import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts"
import {
  Film,
  Users,
  Star,
  TrendingUp,
  Award,
  Calendar,
  Activity,
} from "lucide-react"

interface DataStats {
  total_movies: number
  total_users: number
  total_ratings: number
  avg_rating: number
}

interface GenreDistribution {
  genre: string
  count: number
  percentage: number
}

interface RatingDistribution {
  rating: number
  count: number
}

interface YearTrend {
  year: number
  movie_count: number
}

interface TopMovie {
  movie_id: number
  title: string
  poster_url: string
  rating: number
  rating_count: number
}

interface InsightsData {
  stats: DataStats
  genre_distribution: GenreDistribution[]
  rating_distribution: RatingDistribution[]
  year_trend: YearTrend[]
  top_movies: TopMovie[]
}

interface DataInsightsProps {
  className?: string
}

const COLORS = [
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#f43f5e", // rose
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#14b8a6", // teal
  "#06b6d4", // cyan
  "#6366f1", // indigo
]

export function DataInsights({
  className,
}: DataInsightsProps) {
  const [data, setData] = useState<InsightsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch("/api/insights")
        if (!response.ok) {
          throw new Error("Failed to fetch insights data")
        }
        const result = await response.json()
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchInsights()
  }, [])

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
          <p className="text-white/60 text-sm">{error || "Failed to load insights data"}</p>
        </div>
      </div>
    )
  }

  const { stats, genre_distribution, rating_distribution, year_trend, top_movies } = data

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400">
          <Activity size={20} />
        </div>
        <div>
          <h3 className="text-xl font-display text-white">Data Insights</h3>
          <p className="text-white/50 text-sm">Dataset statistics and visualizations</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Film}
          label="Total Movies"
          value={stats.total_movies.toLocaleString()}
          color="text-blue-400"
          bgColor="bg-blue-500/20"
        />
        <StatCard
          icon={Users}
          label="Total Users"
          value={stats.total_users.toLocaleString()}
          color="text-purple-400"
          bgColor="bg-purple-500/20"
        />
        <StatCard
          icon={Star}
          label="Total Ratings"
          value={stats.total_ratings.toLocaleString()}
          color="text-yellow-400"
          bgColor="bg-yellow-500/20"
        />
        <StatCard
          icon={TrendingUp}
          label="Average Rating"
          value={stats.avg_rating.toFixed(2)}
          color="text-green-400"
          bgColor="bg-green-500/20"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Genre Distribution */}
        <div className="liquid-glass rounded-2xl p-5">
          <h4 className="text-white/80 text-sm font-medium mb-4 flex items-center gap-2">
            <Award size={16} className="text-white/60" />
            Genre Distribution
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genre_distribution.slice(0, 8)}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="count"
                >
                  {genre_distribution.slice(0, 8).map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(201,100%,11%)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "white" }}
                  itemStyle={{ color: "white" }}
                  formatter={(value, _name, props) => [
                    `${value} (${props?.payload?.percentage?.toFixed(1)}%)`,
                    props?.payload?.genre,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="flex flex-wrap gap-2 justify-center mt-2">
            {genre_distribution.slice(0, 6).map((genre, index) => (
              <div key={genre.genre} className="flex items-center gap-1.5">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-white/60 text-xs">{genre.genre}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="liquid-glass rounded-2xl p-5">
          <h4 className="text-white/80 text-sm font-medium mb-4 flex items-center gap-2">
            <Star size={16} className="text-white/60" />
            Rating Distribution
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rating_distribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="rating"
                  tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                  tickLine={false}
                />
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
                  {rating_distribution.map((_entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Year Trend */}
        <div className="liquid-glass rounded-2xl p-5 lg:col-span-2">
          <h4 className="text-white/80 text-sm font-medium mb-4 flex items-center gap-2">
            <Calendar size={16} className="text-white/60" />
            Movies Released by Year
          </h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={year_trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="year"
                  tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                  tickLine={false}
                  tickFormatter={(value) => value.toString()}
                />
                <YAxis
                  tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(201,100%,11%)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "white" }}
                  itemStyle={{ color: "white" }}
                />
                <Line
                  type="monotone"
                  dataKey="movie_count"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: "#3b82f6" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Movies */}
      <div className="liquid-glass rounded-2xl p-5">
        <h4 className="text-white/80 text-sm font-medium mb-4 flex items-center gap-2">
          <Award size={16} className="text-yellow-400" />
          Top Rated Movies
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {top_movies.slice(0, 5).map((movie, index) => (
            <div key={movie.movie_id} className="group">
              <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-white/5 mb-3">
                <img
                  src={movie.poster_url}
                  alt={movie.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                {/* Rank Badge */}
                <div className="absolute top-2 left-2 w-7 h-7 rounded-full bg-yellow-500 flex items-center justify-center text-sm font-bold text-black">
                  {index + 1}
                </div>
                {/* Rating Badge */}
                <div className="absolute bottom-2 right-2 px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm text-xs text-white">
                  ★ {movie.rating.toFixed(1)}
                </div>
              </div>
              <h5 className="text-white text-sm font-medium line-clamp-1">
                {movie.title}
              </h5>
              <p className="text-white/40 text-xs mt-1">
                {movie.rating_count.toLocaleString()} ratings
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

interface StatCardProps {
  icon: React.ElementType
  label: string
  value: string
  color: string
  bgColor: string
}

function StatCard({ icon: Icon, label, value, color, bgColor }: StatCardProps) {
  return (
    <div className="liquid-glass rounded-xl p-4">
      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center mb-3", bgColor)}>
        <Icon size={20} className={color} />
      </div>
      <div className={cn("text-2xl font-display", color)}>{value}</div>
      <div className="text-white/40 text-xs mt-1">{label}</div>
    </div>
  )
}

// Example data for demonstration
export const exampleDataInsights = {
  stats: {
    total_movies: 9742,
    total_users: 610,
    total_ratings: 100836,
    avg_rating: 3.52,
  },
  genreDistribution: [
    { genre: "Drama", count: 4361, percentage: 18.9 },
    { genre: "Comedy", count: 3756, percentage: 16.3 },
    { genre: "Thriller", count: 1894, percentage: 8.2 },
    { genre: "Action", count: 1828, percentage: 7.9 },
    { genre: "Romance", count: 1596, percentage: 6.9 },
    { genre: "Adventure", count: 1263, percentage: 5.5 },
    { genre: "Crime", count: 1199, percentage: 5.2 },
    { genre: "Sci-Fi", count: 980, percentage: 4.2 },
  ],
  ratingDistribution: [
    { rating: 0.5, count: 1370 },
    { rating: 1.0, count: 2811 },
    { rating: 1.5, count: 1791 },
    { rating: 2.0, count: 7551 },
    { rating: 2.5, count: 5550 },
    { rating: 3.0, count: 20047 },
    { rating: 3.5, count: 13136 },
    { rating: 4.0, count: 26818 },
    { rating: 4.5, count: 8551 },
    { rating: 5.0, count: 13211 },
  ],
  yearTrend: [
    { year: 1980, movie_count: 120 },
    { year: 1985, movie_count: 180 },
    { year: 1990, movie_count: 280 },
    { year: 1995, movie_count: 450 },
    { year: 2000, movie_count: 680 },
    { year: 2005, movie_count: 820 },
    { year: 2010, movie_count: 950 },
    { year: 2015, movie_count: 1100 },
    { year: 2020, movie_count: 1250 },
  ],
  topMovies: [
    {
      movie_id: 1,
      title: "The Shawshank Redemption",
      poster_url: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&h=450&fit=crop",
      rating: 4.45,
      rating_count: 317,
    },
    {
      movie_id: 2,
      title: "The Godfather",
      poster_url: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&h=450&fit=crop",
      rating: 4.42,
      rating_count: 192,
    },
    {
      movie_id: 3,
      title: "The Dark Knight",
      poster_url: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&h=450&fit=crop",
      rating: 4.32,
      rating_count: 149,
    },
    {
      movie_id: 4,
      title: "Pulp Fiction",
      poster_url: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&h=450&fit=crop",
      rating: 4.28,
      rating_count: 307,
    },
    {
      movie_id: 5,
      title: "Schindler's List",
      poster_url: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&h=450&fit=crop",
      rating: 4.26,
      rating_count: 220,
    },
  ],
}

export type { DataStats, GenreDistribution, RatingDistribution, YearTrend, TopMovie }
