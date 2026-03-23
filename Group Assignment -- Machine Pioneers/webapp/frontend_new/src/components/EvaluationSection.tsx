import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { BarChart3, TrendingUp, Activity, Target } from "lucide-react"

interface EvaluationMetrics {
  user_based: {
    mae: number
    precision: number
    recall: number
  }
  item_based: {
    mae: number
    precision: number
    recall: number
  }
}

const chartFiles = [
  { name: "Metric Comparison", file: "Metric%20Comparison%20Bar%20Chart.png" },
  { name: "Error Distribution", file: "Error%20Distribution%20Histogram.png" },
  { name: "Score Distribution", file: "Recommendation%20Score%20Distribution.png" },
  { name: "Actual vs Predicted", file: "Actual%20vs%20Predicted%20Ratings%20Scatter%20Plot.png" },
  { name: "Z-Score Comparison", file: "zscore_comparison_chart.png" },
  { name: "MAE Improvement", file: "zscore_mae_comparison.png" },
]

export function EvaluationSection() {
  const [metrics, setMetrics] = useState<EvaluationMetrics | null>(null)
  const [selectedChart, setSelectedChart] = useState(chartFiles[0])

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch("/api/evaluation/summary")
        if (response.ok) {
          const data = await response.json()
          setMetrics(data.metrics)
        }
      } catch (error) {
        console.error("Failed to fetch metrics:", error)
      }
    }

    fetchMetrics()
  }, [])

  return (
    <section id="evaluation" className="relative z-10 py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 
            className="text-4xl md:text-5xl tracking-tight text-foreground mb-4"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Algorithm Evaluation
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Comprehensive analysis of our collaborative filtering algorithms' performance.
          </p>
        </div>

        {/* Metrics Cards */}
        {metrics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <MetricCard
              icon={Target}
              label="User-Based MAE"
              value={metrics.user_based.mae.toFixed(4)}
              trend="-24.96%"
              trendUp={true}
            />
            <MetricCard
              icon={Activity}
              label="Item-Based MAE"
              value={metrics.item_based.mae.toFixed(4)}
              trend="Baseline"
              trendUp={false}
            />
            <MetricCard
              icon={TrendingUp}
              label="Avg Precision@10"
              value={((metrics.user_based.precision + metrics.item_based.precision) / 2).toFixed(4)}
            />
            <MetricCard
              icon={BarChart3}
              label="Avg Recall@10"
              value={((metrics.user_based.recall + metrics.item_based.recall) / 2).toFixed(4)}
            />
          </div>
        )}

        {/* Chart Viewer */}
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Chart Selection */}
          <div className="lg:col-span-1 space-y-2">
            {chartFiles.map((chart) => (
              <button
                key={chart.file}
                onClick={() => setSelectedChart(chart)}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-200",
                  selectedChart.file === chart.file
                    ? "liquid-glass text-foreground"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                )}
              >
                {chart.name}
              </button>
            ))}
          </div>

          {/* Chart Display */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl overflow-hidden liquid-glass p-4">
              <img
                src={`/api/evaluation/chart/${selectedChart.file}`}
                alt={selectedChart.name}
                className="w-full h-auto rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

interface MetricCardProps {
  icon: React.ElementType
  label: string
  value: string
  trend?: string
  trendUp?: boolean
}

function MetricCard({ icon: Icon, label, value, trend, trendUp }: MetricCardProps) {
  return (
    <div className="p-6 rounded-2xl liquid-glass">
      <div className="flex items-center gap-3 mb-3">
        <Icon size={18} className="text-muted-foreground" />
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-medium text-foreground">{value}</span>
        {trend && (
          <span className={cn(
            "text-xs",
            trendUp ? "text-green-400" : "text-muted-foreground"
          )}>
            {trend}
          </span>
        )}
      </div>
    </div>
  )
}
