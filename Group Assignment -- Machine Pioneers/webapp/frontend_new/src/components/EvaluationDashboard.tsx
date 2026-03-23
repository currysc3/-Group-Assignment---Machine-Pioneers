import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  ReferenceLine,
  CartesianGrid,
} from "recharts"
import { Activity, Target, TrendingUp, AlertCircle, CheckCircle } from "lucide-react"

interface ConfusionMatrix {
  true_positives: number
  false_positives: number
  true_negatives: number
  false_negatives: number
}

interface ErrorDistribution {
  error_range: string
  count: number
}

interface ROCCurve {
  threshold: number
  tpr: number // True Positive Rate
  fpr: number // False Positive Rate
}

interface EvaluationMetrics {
  mae: number // Mean Absolute Error
  rmse: number // Root Mean Square Error
  precision: number
  recall: number
  f1_score: number
  accuracy: number
}

interface EvaluationData {
  metrics: EvaluationMetrics
  confusion_matrix: ConfusionMatrix
  error_distribution: ErrorDistribution[]
  roc_curve: ROCCurve[]
  algorithm: "user_based" | "item_based"
}

interface EvaluationDashboardProps {
  className?: string
}

export function EvaluationDashboard({
  className,
}: EvaluationDashboardProps) {
  const [data, setData] = useState<EvaluationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEvaluation = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch("/api/evaluation/interactive")
        if (!response.ok) {
          throw new Error("Failed to fetch evaluation data")
        }
        const result = await response.json()
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchEvaluation()
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
          <p className="text-white/60 text-sm">{error || "Failed to load evaluation data"}</p>
        </div>
      </div>
    )
  }

  const { metrics, confusion_matrix, error_distribution, roc_curve, algorithm } = data
  const algorithmName = algorithm === "user_based" ? "User-Based" : "Item-Based"
  const algorithmColor = algorithm === "user_based" ? "#a855f7" : "#3b82f6"

  // Calculate derived metrics
  const total = confusion_matrix.true_positives + confusion_matrix.false_positives + 
                confusion_matrix.true_negatives + confusion_matrix.false_negatives
  
  const accuracy = total > 0 
    ? (confusion_matrix.true_positives + confusion_matrix.true_negatives) / total 
    : 0

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center",
            algorithm === "user_based"
              ? "bg-purple-500/20 text-purple-400"
              : "bg-blue-500/20 text-blue-400"
          )}
        >
          <Activity size={20} />
        </div>
        <div>
          <h3 className="text-xl font-display text-white">{algorithmName} Evaluation</h3>
          <p className="text-white/50 text-sm">Performance metrics and analysis</p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard
          label="MAE"
          value={metrics.mae.toFixed(3)}
          description="Mean Absolute Error"
          icon={AlertCircle}
          color="text-yellow-400"
        />
        <MetricCard
          label="RMSE"
          value={metrics.rmse.toFixed(3)}
          description="Root Mean Square Error"
          icon={Target}
          color="text-orange-400"
        />
        <MetricCard
          label="Precision"
          value={`${(metrics.precision * 100).toFixed(1)}%`}
          description="True Positives / All Positives"
          icon={CheckCircle}
          color="text-green-400"
        />
        <MetricCard
          label="Recall"
          value={`${(metrics.recall * 100).toFixed(1)}%`}
          description="True Positives / Actual Positives"
          icon={TrendingUp}
          color="text-blue-400"
        />
        <MetricCard
          label="F1 Score"
          value={metrics.f1_score.toFixed(3)}
          description="Harmonic Mean of P & R"
          icon={Activity}
          color="text-purple-400"
        />
        <MetricCard
          label="Accuracy"
          value={`${(accuracy * 100).toFixed(1)}%`}
          description="Correct Predictions / Total"
          icon={CheckCircle}
          color="text-cyan-400"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Confusion Matrix */}
        <div className="liquid-glass rounded-2xl p-5">
          <h4 className="text-white/80 text-sm font-medium mb-4">Confusion Matrix</h4>
          <div className="grid grid-cols-2 gap-3">
            <ConfusionCell
              label="True Positives"
              value={confusion_matrix.true_positives}
              color="bg-green-500/20 text-green-400"
              description="Correctly predicted likes"
            />
            <ConfusionCell
              label="False Positives"
              value={confusion_matrix.false_positives}
              color="bg-red-500/20 text-red-400"
              description="Incorrectly predicted likes"
            />
            <ConfusionCell
              label="False Negatives"
              value={confusion_matrix.false_negatives}
              color="bg-orange-500/20 text-orange-400"
              description="Missed likes"
            />
            <ConfusionCell
              label="True Negatives"
              value={confusion_matrix.true_negatives}
              color="bg-blue-500/20 text-blue-400"
              description="Correctly predicted dislikes"
            />
          </div>
        </div>

        {/* Error Distribution */}
        <div className="liquid-glass rounded-2xl p-5">
          <h4 className="text-white/80 text-sm font-medium mb-4">Error Distribution</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={error_distribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="error_range"
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
                <Bar dataKey="count" fill={algorithmColor} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ROC Curve */}
        <div className="liquid-glass rounded-2xl p-5 lg:col-span-2">
          <h4 className="text-white/80 text-sm font-medium mb-4">ROC Curve</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={roc_curve}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="fpr"
                  name="False Positive Rate"
                  tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                  tickLine={false}
                  domain={[0, 1]}
                  tickFormatter={(v) => v.toFixed(1)}
                />
                <YAxis
                  dataKey="tpr"
                  name="True Positive Rate"
                  tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                  tickLine={false}
                  domain={[0, 1]}
                  tickFormatter={(v) => v.toFixed(1)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(201,100%,11%)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "white" }}
                  itemStyle={{ color: "white" }}
                  formatter={(value, name) => [Number(value).toFixed(3), name === "tpr" ? "TPR" : "FPR"]}
                />
                <ReferenceLine
                  x={0}
                  y={0}
                  stroke="rgba(255,255,255,0.1)"
                />
                <ReferenceLine
                  x={1}
                  y={1}
                  stroke="rgba(255,255,255,0.1)"
                />
                <ReferenceLine
                  segment={[
                    { x: 0, y: 0 },
                    { x: 1, y: 1 },
                  ]}
                  stroke="rgba(255,255,255,0.2)"
                  strokeDasharray="5 5"
                  label={{ value: "Random", fill: "rgba(255,255,255,0.4)", fontSize: 10, position: "insideBottomRight" }}
                />
                <Line
                  type="monotone"
                  dataKey="tpr"
                  stroke={algorithmColor}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: algorithmColor }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-white/40 text-xs mt-2 text-center">
            True Positive Rate vs False Positive Rate at various thresholds
          </p>
        </div>
      </div>
    </div>
  )
}

interface MetricCardProps {
  label: string
  value: string
  description: string
  icon: React.ElementType
  color: string
}

function MetricCard({ label, value, description, icon: Icon, color }: MetricCardProps) {
  return (
    <div className="liquid-glass rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} className={color} />
        <span className="text-white/50 text-xs">{label}</span>
      </div>
      <div className={cn("text-xl font-display", color)}>{value}</div>
      <div className="text-white/30 text-[10px] mt-1">{description}</div>
    </div>
  )
}

interface ConfusionCellProps {
  label: string
  value: number
  color: string
  description: string
}

function ConfusionCell({ label, value, color, description }: ConfusionCellProps) {
  return (
    <div className={cn("rounded-xl p-4 text-center", color.split(" ")[0])}>
      <div className={cn("text-2xl font-display", color.split(" ")[1])}>{value}</div>
      <div className="text-white/70 text-xs mt-1">{label}</div>
      <div className="text-white/40 text-[10px] mt-0.5">{description}</div>
    </div>
  )
}

export type {
  ConfusionMatrix,
  ErrorDistribution,
  ROCCurve,
  EvaluationMetrics,
}
