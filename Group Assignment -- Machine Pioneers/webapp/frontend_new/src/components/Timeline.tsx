import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { CheckCircle2, Circle, Clock, AlertCircle, FileText, Code2, BarChart3, Rocket } from "lucide-react"

interface TimelinePhase {
  id: string
  title: string
  description: string
  status: "completed" | "in_progress" | "pending"
  start_date: string
  end_date: string
  deliverables: string[]
  icon?: React.ElementType
}

interface TimelineProps {
  className?: string
}

const statusConfig = {
  completed: {
    icon: CheckCircle2,
    color: "text-green-400",
    bgColor: "bg-green-500/20",
    borderColor: "border-green-500/50",
    label: "Completed",
  },
  in_progress: {
    icon: Clock,
    color: "text-blue-400",
    bgColor: "bg-blue-500/20",
    borderColor: "border-blue-500/50",
    label: "In Progress",
  },
  pending: {
    icon: Circle,
    color: "text-white/40",
    bgColor: "bg-white/5",
    borderColor: "border-white/10",
    label: "Pending",
  },
}

const defaultIcons = [FileText, Code2, BarChart3, Rocket]

export function Timeline({ className }: TimelineProps) {
  const [phases, setPhases] = useState<TimelinePhase[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTimeline = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch("/api/timeline")
        if (!response.ok) {
          throw new Error("Failed to fetch timeline data")
        }
        const data = await response.json()
        setPhases(data.phases || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchTimeline()
  }, [])

  if (loading) {
    return (
      <div className={cn("flex items-center justify-center py-20", className)}>
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn("flex items-center justify-center py-20", className)}>
        <div className="text-center">
          <p className="text-white/60 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  // Calculate progress
  const completedCount = phases.filter((p) => p.status === "completed").length
  const progress = phases.length > 0 ? (completedCount / phases.length) * 100 : 0

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-display text-white">Project Timeline</h3>
          <p className="text-white/50 text-sm">Development phases and milestones</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-display text-white">{Math.round(progress)}%</div>
          <div className="text-white/40 text-xs">Complete</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-6 top-0 bottom-0 w-px bg-white/10" />

        <div className="space-y-6">
          {phases.map((phase, index) => {
            const status = statusConfig[phase.status]
            const Icon = phase.icon || defaultIcons[index % defaultIcons.length]
            const StatusIcon = status.icon

            return (
              <div key={phase.id} className="relative flex gap-4">
                {/* Timeline Dot */}
                <div
                  className={cn(
                    "relative z-10 w-12 h-12 rounded-full flex items-center justify-center shrink-0",
                    status.bgColor,
                    status.borderColor,
                    "border-2"
                  )}
                >
                  <Icon size={20} className={status.color} />
                </div>

                {/* Content Card */}
                <div
                  className={cn(
                    "flex-1 liquid-glass rounded-xl p-4",
                    phase.status === "in_progress" && "ring-1 ring-blue-500/30"
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-white font-medium">{phase.title}</h4>
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1",
                            status.bgColor,
                            status.color
                          )}
                        >
                          <StatusIcon size={10} />
                          {status.label}
                        </span>
                      </div>
                      <p className="text-white/50 text-sm mt-1">{phase.description}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-white/60 text-xs">
                        {phase.start_date}
                      </div>
                      <div className="text-white/40 text-xs">to</div>
                      <div className="text-white/60 text-xs">
                        {phase.end_date}
                      </div>
                    </div>
                  </div>

                  {/* Deliverables */}
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle size={12} className="text-white/40" />
                      <span className="text-white/40 text-xs">Deliverables</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {phase.deliverables.map((deliverable, idx) => (
                        <span
                          key={idx}
                          className={cn(
                            "px-2.5 py-1 rounded-full text-xs",
                            phase.status === "completed"
                              ? "bg-green-500/10 text-green-300"
                              : phase.status === "in_progress"
                              ? "bg-blue-500/10 text-blue-300"
                              : "bg-white/5 text-white/50"
                          )}
                        >
                          {phase.status === "completed" && (
                            <CheckCircle2 size={10} className="inline mr-1" />
                          )}
                          {deliverable}
                        </span>
                      ))}
                    </div>
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

// Example phases for demonstration
export const examplePhases: TimelinePhase[] = [
  {
    id: "data-collection",
    title: "Data Collection & Preprocessing",
    description: "Gather movie datasets, clean data, and prepare for analysis",
    status: "completed",
    start_date: "2026-01-15",
    end_date: "2026-02-01",
    deliverables: ["MovieLens dataset", "Data cleaning scripts", "Preprocessed CSV files"],
    icon: FileText,
  },
  {
    id: "algorithm-dev",
    title: "Algorithm Development",
    description: "Implement collaborative filtering algorithms",
    status: "completed",
    start_date: "2026-02-01",
    end_date: "2026-02-20",
    deliverables: ["User-based CF", "Item-based CF", "Similarity metrics"],
    icon: Code2,
  },
  {
    id: "evaluation",
    title: "Model Evaluation",
    description: "Evaluate algorithm performance with various metrics",
    status: "in_progress",
    start_date: "2026-02-20",
    end_date: "2026-03-05",
    deliverables: ["MAE/RMSE metrics", "Precision/Recall analysis", "ROC curves"],
    icon: BarChart3,
  },
  {
    id: "deployment",
    title: "Deployment & Launch",
    description: "Deploy the recommendation system and launch the web interface",
    status: "pending",
    start_date: "2026-03-05",
    end_date: "2026-03-15",
    deliverables: ["Web application", "API endpoints", "Documentation"],
    icon: Rocket,
  },
]

export type { TimelinePhase }
